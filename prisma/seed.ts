import { PrismaClient } from "@prisma/client";
import { FOODS } from "../src/lib/data/foods";
import { EXERCISES } from "../src/lib/data/exercises";
import { foodId, exerciseId } from "../src/lib/slug";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Semeando catálogo...");

  // --- Alimentos ---
  for (const f of FOODS) {
    await prisma.foodItem.upsert({
      where: { id: foodId(f.name) },
      update: {
        servingSizeG: f.servingSizeG,
        calories: f.calories,
        proteinG: f.proteinG,
        carbsG: f.carbsG,
        fatG: f.fatG,
        fiberG: f.fiberG,
        isGlp1Friendly: f.isGlp1Friendly,
      },
      create: {
        id: foodId(f.name),
        name: f.name,
        servingSizeG: f.servingSizeG,
        calories: f.calories,
        proteinG: f.proteinG,
        carbsG: f.carbsG,
        fatG: f.fatG,
        fiberG: f.fiberG,
        isGlp1Friendly: f.isGlp1Friendly,
      },
    });
  }
  console.log(`  ✓ ${FOODS.length} alimentos`);

  // --- Exercícios ---
  for (const e of EXERCISES) {
    await prisma.exercise.upsert({
      where: { id: exerciseId(e.name) },
      update: {
        category: e.category,
        muscleGroup: e.muscleGroup,
        isBodyweight: e.isBodyweight,
        instructions: e.instructions ?? null,
      },
      create: {
        id: exerciseId(e.name),
        name: e.name,
        category: e.category,
        muscleGroup: e.muscleGroup,
        isBodyweight: e.isBodyweight,
        instructions: e.instructions ?? null,
      },
    });
  }
  console.log(`  ✓ ${EXERCISES.length} exercícios`);

  console.log("✅ Seed concluído.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
