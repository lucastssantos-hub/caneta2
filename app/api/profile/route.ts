import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { prisma } from "@/lib/prisma";

const ACTIVITY = ["sedentary", "light", "moderate", "active", "very_active"];
const GOALS = ["lose_fat", "preserve_muscle", "recomposition", "maintain", "gain_muscle"];

// PUT /api/profile — completa/atualiza o perfil (onboarding).
export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json().catch(() => ({}));

  const heightCm = Number(body.heightCm);
  const age = Number(body.age);
  if (!heightCm || heightCm < 100 || heightCm > 250) {
    return NextResponse.json({ error: "Altura inválida (100-250 cm)" }, { status: 400 });
  }
  if (!age || age < 14 || age > 100) {
    return NextResponse.json({ error: "Idade inválida (14-100)" }, { status: 400 });
  }
  if (body.activityLevel && !ACTIVITY.includes(body.activityLevel)) {
    return NextResponse.json({ error: "Nível de atividade inválido" }, { status: 400 });
  }
  if (body.goal && !GOALS.includes(body.goal)) {
    return NextResponse.json({ error: "Objetivo inválido" }, { status: 400 });
  }

  // Deriva a data de nascimento a partir da idade (1º de janeiro do ano).
  const birthYear = new Date().getFullYear() - age;
  const birthDate = new Date(Date.UTC(birthYear, 0, 1));

  const num = (v: unknown) => (v == null || v === "" ? null : Number(v));

  const profile = await prisma.profile.update({
    where: { userId: user.id },
    data: {
      birthDate,
      heightCm,
      activityLevel: body.activityLevel ?? undefined,
      goal: body.goal ?? undefined,
      startWeightKg: num(body.startWeightKg),
      targetWeightKg: num(body.targetWeightKg),
      onboardedAt: new Date(),
    },
  });

  return NextResponse.json(profile);
}
