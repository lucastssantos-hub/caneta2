import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const date = body.date ? new Date(body.date) : new Date();
  date.setHours(0, 0, 0, 0);

  const num = (v: unknown) => (v == null || v === "" ? null : Number(v));

  const checkin = await prisma.dailyCheckin.upsert({
    where: { userId_date: { userId: user.id, date } },
    update: {
      energy: num(body.energy),
      hunger: num(body.hunger),
      mood: num(body.mood),
      waterMl: num(body.waterMl),
      proteinG: num(body.proteinG),
      notes: body.notes ?? null,
    },
    create: {
      userId: user.id,
      date,
      energy: num(body.energy),
      hunger: num(body.hunger),
      mood: num(body.mood),
      waterMl: num(body.waterMl),
      proteinG: num(body.proteinG),
      notes: body.notes ?? null,
    },
  });

  return NextResponse.json(checkin, { status: 201 });
}
