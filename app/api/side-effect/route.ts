import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  if (!body.type) {
    return NextResponse.json({ error: "Tipo obrigatório" }, { status: 400 });
  }

  const log = await prisma.sideEffectLog.create({
    data: {
      userId: user.id,
      date: body.date ? new Date(body.date) : new Date(),
      type: body.type,
      severity: body.severity ?? "mild",
      notes: body.notes ?? null,
    },
  });

  return NextResponse.json(log, { status: 201 });
}
