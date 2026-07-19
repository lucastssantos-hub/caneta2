import webpush from "web-push";
import { prisma } from "@/lib/prisma";

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT || "mailto:admin@example.com";

let configured = false;

/** Configura o VAPID sob demanda; retorna false se as chaves não existem. */
export function isPushConfigured(): boolean {
  if (configured) return true;
  if (publicKey && privateKey) {
    webpush.setVapidDetails(subject, publicKey, privateKey);
    configured = true;
  }
  return configured;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

/** Envia um push para todos os dispositivos do usuário. Limpa assinaturas mortas. */
export async function sendPushToUser(userId: string, payload: PushPayload) {
  if (!isPushConfigured()) return { sent: 0, skipped: true as const };

  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  let sent = 0;

  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify(payload)
        );
        sent++;
      } catch (err: unknown) {
        const status = (err as { statusCode?: number })?.statusCode;
        // 404/410 = assinatura expirada/cancelada → remove.
        if (status === 404 || status === 410) {
          await prisma.pushSubscription.delete({ where: { endpoint: s.endpoint } }).catch(() => {});
        }
      }
    })
  );

  return { sent, skipped: false as const };
}
