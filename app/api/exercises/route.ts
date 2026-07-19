import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { prisma } from "@/lib/prisma";

// GET /api/exercises — catálogo de exercícios (para o seletor de troca).
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const exercises = await prisma.exercise.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, muscleGroup: true, category: true },
  });
  return NextResponse.json(exercises);
}
