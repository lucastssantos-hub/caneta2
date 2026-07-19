import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const email = "demo@glp1tracker.app";
const day = (offset: number) => {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - offset);
  return d;
};
const dateOnly = (offset: number) => {
  const d = day(offset);
  d.setHours(0, 0, 0, 0);
  return d;
};

async function main() {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error(`Usuário demo não encontrado: ${email}`);

  await prisma.$transaction([
    prisma.weightLog.deleteMany({ where: { userId: user.id } }),
    prisma.injectionLog.deleteMany({ where: { userId: user.id } }),
    prisma.sideEffectLog.deleteMany({ where: { userId: user.id } }),
    prisma.dailyCheckin.deleteMany({ where: { userId: user.id } }),
    prisma.foodLog.deleteMany({ where: { userId: user.id } }),
    prisma.workoutLog.deleteMany({ where: { userId: user.id } }),
    prisma.mealPlan.deleteMany({ where: { userId: user.id } }),
    prisma.workoutPlan.deleteMany({ where: { userId: user.id } }),
    prisma.medication.deleteMany({ where: { userId: user.id } }),
  ]);

  await prisma.profile.update({
    where: { userId: user.id },
    data: {
      sex: "female", birthDate: new Date("1990-04-18"), heightCm: 168,
      activityLevel: "moderate", goal: "preserve_muscle", startWeightKg: 96.4,
      targetWeightKg: 82, calorieTarget: 1850, proteinTargetG: 110,
      waterTargetMl: 2200, fiberTargetG: 25, onboardedAt: day(20),
    },
  });

  const medication = await prisma.medication.create({
    data: { userId: user.id, drug: "semaglutide", brandName: "Ozempic", frequency: "weekly", startDate: dateOnly(35) },
  });

  await prisma.titrationStep.createMany({ data: [
    { medicationId: medication.id, doseMg: 0.25, startDate: dateOnly(35), weeks: 4, order: 1 },
    { medicationId: medication.id, doseMg: 0.5, startDate: dateOnly(7), weeks: 4, order: 2 },
  ] });

  const injectionDates = [28, 21, 14, 7, 0];
  const injections = [];
  for (const offset of injectionDates) {
    injections.push(await prisma.injectionLog.create({
      data: { userId: user.id, medicationId: medication.id, date: day(offset), doseMg: offset > 7 ? 0.25 : 0.5, site: offset % 3 === 0 ? "abdomen" : offset % 3 === 1 ? "thigh" : "upper_arm" },
    }));
  }

  const weights = [96.4, 95.8, 95.3, 94.9, 94.5, 94.0, 93.8, 93.5, 93.2, 93.0, 92.8, 92.6, 92.5, 92.3];
  await prisma.weightLog.createMany({ data: weights.map((weightKg, index) => ({
    userId: user.id, date: dateOnly(13 - index), weightKg, waistCm: 101 - index * 0.35,
  })) });

  await prisma.dailyCheckin.createMany({ data: Array.from({ length: 14 }, (_, index) => ({
    userId: user.id, date: dateOnly(13 - index), energy: 3 + (index % 3 === 0 ? 1 : 0),
    hunger: 2 + (index % 4 === 0 ? 1 : 0), mood: 3 + (index % 2), waterMl: 1800 + (index % 4) * 150,
    proteinG: 92 + (index % 5) * 6, notes: index === 0 ? "Primeiro registro de demonstração." : null,
  })) });

  await prisma.sideEffectLog.createMany({ data: [
    { userId: user.id, date: day(6), type: "nausea", severity: "mild", injectionId: injections[3].id, notes: "Passou após o almoço." },
    { userId: user.id, date: day(20), type: "fatigue", severity: "mild", injectionId: injections[1].id },
  ] });

  const foodNames = ["Aveia em flocos", "Iogurte grego natural", "Peito de frango grelhado", "Arroz integral cozido", "Brócolis cozido", "Frutas vermelhas", "Ovo cozido"];
  const foods = await prisma.foodItem.findMany({ where: { name: { in: foodNames } } });
  const food = (name: string) => foods.find((item) => item.name === name)?.id ?? foods[0].id;
  const mealPlan = await prisma.mealPlan.create({ data: {
    userId: user.id, name: "Plano demonstração", fromDate: dateOnly(0), toDate: dateOnly(-6),
    meals: { create: [
      { dayOfWeek: 1, mealType: "breakfast", items: { create: [{ foodItemId: food("Aveia em flocos"), quantityG: 40 }, { foodItemId: food("Iogurte grego natural"), quantityG: 170 }] } },
      { dayOfWeek: 1, mealType: "lunch", items: { create: [{ foodItemId: food("Peito de frango grelhado"), quantityG: 120 }, { foodItemId: food("Arroz integral cozido"), quantityG: 120 }, { foodItemId: food("Brócolis cozido"), quantityG: 100 }] } },
      { dayOfWeek: 1, mealType: "afternoon_snack", items: { create: [{ foodItemId: food("Frutas vermelhas"), quantityG: 100 }, { foodItemId: food("Ovo cozido"), quantityG: 100 }] } },
      { dayOfWeek: 1, mealType: "dinner", items: { create: [{ foodItemId: food("Peito de frango grelhado"), quantityG: 120 }, { foodItemId: food("Brócolis cozido"), quantityG: 120 }] } },
    ] },
  } });

  const exerciseNames = ["Agachamento livre", "Supino reto", "Remada baixa (máquina)", "Prancha"];
  const exercises = await prisma.exercise.findMany({ where: { name: { in: exerciseNames } } });
  const exercise = (name: string) => exercises.find((item) => item.name === name)?.id ?? exercises[0].id;
  await prisma.workoutPlan.create({ data: {
    userId: user.id, name: "Força — corpo inteiro", fromDate: dateOnly(0), toDate: dateOnly(-6),
    days: { create: [{ dayOfWeek: 1, focus: "Corpo inteiro", exercises: { create: [
      { exerciseId: exercise("Agachamento livre"), order: 1, sets: 3, reps: 10, restSec: 90 },
      { exerciseId: exercise("Supino reto"), order: 2, sets: 3, reps: 10, restSec: 90 },
      { exerciseId: exercise("Remada baixa (máquina)"), order: 3, sets: 3, reps: 12, restSec: 75 },
      { exerciseId: exercise("Prancha"), order: 4, sets: 3, reps: 30, restSec: 60 },
    ] } }] },
  } });

  console.log(`Dados demo inseridos para ${email}: ${mealPlan.name}`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
