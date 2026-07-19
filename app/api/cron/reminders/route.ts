import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeReminders } from "@/lib/reminders";
import { sendPushToUser, isPushConfigured } from "@/lib/push";

// GET /api/cron/reminders
// Dispara os lembretes de push. Protegido por CRON_SECRET (header Authorization).
// Agende-o (ex.: Vercel Cron, 1x/dia de manhã) — ver vercel.json.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  if (!isPushConfigured()) {
    return NextResponse.json({ error: "VAPID não configurado" }, { status: 503 });
  }

  // Só usuários com pelo menos uma assinatura ativa.
  const users = await prisma.user.findMany({
    where: { pushSubscriptions: { some: {} } },
    select: { id: true },
  });

  let notified = 0;
  for (const u of users) {
    const r = await computeReminders(u.id);

    if (r.injectionDue) {
      await sendPushToUser(u.id, {
        title: "Aplicação de GLP-1",
        body: r.injection?.overdue ? "Sua aplicação está atrasada." : "Sua aplicação é hoje.",
        url: "/medication",
      });
      notified++;
    } else if (!r.weighedToday) {
      await sendPushToUser(u.id, {
        title: "Pesagem do dia",
        body: "Que tal registrar sua pesagem de hoje?",
        url: "/weight",
      });
      notified++;
    }
  }

  return NextResponse.json({ ok: true, usersChecked: users.length, notified });
}
