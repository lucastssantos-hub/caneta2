import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { prisma } from "@/lib/prisma";

// Registra uma aplicação de GLP-1. Cria a medicação ativa na primeira vez.
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const doseMg = Number(body.doseMg);
  if (!doseMg || doseMg <= 0) {
    return NextResponse.json({ error: "Dose inválida" }, { status: 400 });
  }

  let med = await prisma.medication.findFirst({
    where: { userId: user.id, status: "active" },
  });
  if (!med) {
    med = await prisma.medication.create({
      data: {
        userId: user.id,
        drug: body.drug ?? "semaglutide",
        brandName: body.brandName ?? null,
        frequency: "weekly",
        status: "active",
        startDate: new Date(),
      },
    });
  }

  const injection = await prisma.injectionLog.create({
    data: {
      userId: user.id,
      medicationId: med.id,
      date: body.date ? new Date(body.date) : new Date(),
      doseMg,
      site: body.site ?? null,
      notes: body.notes ?? null,
    },
  });

  return NextResponse.json(injection, { status: 201 });
}
