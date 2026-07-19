import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { calcTargets } from "@/lib/nutrition";
import { generateWeeklyDiet } from "@/lib/generators/dietGenerator";
import { generateWeeklyWorkout } from "@/lib/generators/workoutGenerator";
import { saveMealPlan, saveWorkoutPlan, saveTargets } from "@/lib/persist";
import { ActivityLevel, Goal, Sex, UserProfileInput } from "@/lib/types";

function ageFrom(birthDate: Date): number {
  const diff = Date.now() - birthDate.getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
}

// POST /api/plan/save
// Gera dieta + treino a partir do perfil do usuário logado e persiste tudo.
export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  if (!user.profile) {
    return NextResponse.json(
      { error: "Complete seu perfil antes de gerar o plano." },
      { status: 400 }
    );
  }

  // Peso atual = última pesagem; senão, peso inicial do perfil.
  const lastWeight = await prisma.weightLog.findFirst({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });
  const weightKg = lastWeight?.weightKg ?? user.profile.startWeightKg;
  if (!weightKg) {
    return NextResponse.json(
      { error: "Registre pelo menos uma pesagem antes de gerar o plano." },
      { status: 400 }
    );
  }

  // Usa GLP-1? Verifica medicação ativa.
  const activeMed = await prisma.medication.findFirst({
    where: { userId: user.id, status: "active" },
  });

  const profileInput: UserProfileInput = {
    sex: user.profile.sex as Sex,
    age: ageFrom(user.profile.birthDate),
    heightCm: user.profile.heightCm,
    weightKg,
    targetWeightKg: user.profile.targetWeightKg ?? undefined,
    activityLevel: user.profile.activityLevel as ActivityLevel,
    goal: user.profile.goal as Goal,
    onGlp1: !!activeMed,
  };

  const targets = calcTargets(profileInput);
  const diet = generateWeeklyDiet(profileInput, targets);
  const workout = generateWeeklyWorkout(profileInput);

  await saveTargets(user.id, targets);
  const mealPlan = await saveMealPlan(user.id, diet);
  const workoutPlan = await saveWorkoutPlan(user.id, workout);

  return NextResponse.json({
    message: "Plano gerado e salvo.",
    targets,
    mealPlanId: mealPlan.id,
    workoutPlanId: workoutPlan.id,
  });
}
