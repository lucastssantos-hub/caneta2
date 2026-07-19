import { NextResponse } from "next/server";
import { calcTargets } from "@/lib/nutrition";
import { generateWeeklyDiet } from "@/lib/generators/dietGenerator";
import { generateWeeklyWorkout } from "@/lib/generators/workoutGenerator";
import { UserProfileInput } from "@/lib/types";

// POST /api/plan/generate
// Body: UserProfileInput  →  { targets, diet, workout }
//
// Endpoint sem estado: calcula metas e gera dieta + treino a partir do perfil.
// (Persistência em MealPlan/WorkoutPlan fica a cargo de outra rota + auth.)
export async function POST(req: Request) {
  let body: Partial<UserProfileInput>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const required: (keyof UserProfileInput)[] = [
    "sex",
    "age",
    "heightCm",
    "weightKg",
    "activityLevel",
    "goal",
  ];
  const missing = required.filter((k) => body[k] === undefined || body[k] === null);
  if (missing.length) {
    return NextResponse.json(
      { error: `Campos obrigatórios ausentes: ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  const profile: UserProfileInput = {
    sex: body.sex!,
    age: Number(body.age),
    heightCm: Number(body.heightCm),
    weightKg: Number(body.weightKg),
    targetWeightKg: body.targetWeightKg != null ? Number(body.targetWeightKg) : undefined,
    activityLevel: body.activityLevel!,
    goal: body.goal!,
    onGlp1: body.onGlp1 ?? true,
    daysPerWeek: body.daysPerWeek != null ? Number(body.daysPerWeek) : undefined,
  };

  const targets = calcTargets(profile);
  const diet = generateWeeklyDiet(profile, targets);
  const workout = generateWeeklyWorkout(profile);

  return NextResponse.json({
    disclaimer:
      "Estimativas educacionais. Não substituem orientação médica/nutricional. A titulação de GLP-1 é decisão do médico.",
    targets,
    diet,
    workout,
  });
}
