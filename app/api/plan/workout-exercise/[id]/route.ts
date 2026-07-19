import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { prisma } from "@/lib/prisma";

// PATCH /api/plan/workout-exercise/[id]  { exerciseId?, sets?, reps? }
// Troca o exercício e/ou ajusta séries/reps de um item do treino.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const item = await prisma.workoutExercise.findUnique({
    where: { id },
    include: { workoutDay: { include: { workoutPlan: true } } },
  });
  if (!item || item.workoutDay.workoutPlan.userId !== user.id) {
    return NextResponse.json({ error: "Exercício não encontrado" }, { status: 404 });
  }

  const data: { exerciseId?: string; sets?: number; reps?: number } = {};
  if (body.exerciseId) {
    const ex = await prisma.exercise.findUnique({ where: { id: body.exerciseId } });
    if (!ex) return NextResponse.json({ error: "Exercício inválido" }, { status: 400 });
    data.exerciseId = body.exerciseId;
  }
  if (body.sets != null) data.sets = Math.max(1, Number(body.sets));
  if (body.reps != null) data.reps = Math.max(1, Number(body.reps));

  const updated = await prisma.workoutExercise.update({ where: { id }, data });
  return NextResponse.json(updated);
}
