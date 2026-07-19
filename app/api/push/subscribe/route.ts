import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { prisma } from "@/lib/prisma";

// POST /api/push/subscribe — salva a assinatura de Web Push do navegador.
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const sub = await req.json().catch(() => null);
  const endpoint = sub?.endpoint as string | undefined;
  const p256dh = sub?.keys?.p256dh as string | undefined;
  const auth = sub?.keys?.auth as string | undefined;

  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 });
  }

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    update: { userId: user.id, p256dh, auth },
    create: { userId: user.id, endpoint, p256dh, auth },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}

// DELETE /api/push/subscribe — remove a assinatura deste navegador.
export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const endpoint = body?.endpoint as string | undefined;
  if (!endpoint) return NextResponse.json({ error: "endpoint obrigatório" }, { status: 400 });

  await prisma.pushSubscription.deleteMany({ where: { endpoint, userId: user.id } });
  return NextResponse.json({ ok: true });
}
