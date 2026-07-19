import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const weightKg = Number(body.weightKg);
  if (!weightKg || weightKg <= 0) {
    return NextResponse.json({ error: "Peso inválido" }, { status: 400 });
  }
  const date = body.date ? new Date(body.date) : new Date();
  date.setHours(0, 0, 0, 0);

  // Uma pesagem por dia (upsert pela chave composta userId+date).
  const log = await prisma.weightLog.upsert({
    where: { userId_date: { userId: user.id, date } },
    update: { weightKg, waistCm: body.waistCm ? Number(body.waistCm) : null },
    create: {
      userId: user.id,
      date,
      weightKg,
      waistCm: body.waistCm ? Number(body.waistCm) : null,
    },
  });

  return NextResponse.json(log, { status: 201 });
}
