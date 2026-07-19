import { FOODS } from "@/lib/data/foods";
import {
  DayMealPlan,
  FoodSeed,
  MealType,
  NutritionTargets,
  PlannedMeal,
  PlannedItem,
  UserProfileInput,
} from "@/lib/types";

// Distribuição de calorias por refeição. GLP-1 reduz apetite -> refeições
// menores e mais fracionadas, com boa dose de proteína em cada uma.
const MEAL_SPLIT: { mealType: MealType; calorieShare: number }[] = [
  { mealType: "breakfast", calorieShare: 0.25 },
  { mealType: "morning_snack", calorieShare: 0.1 },
  { mealType: "lunch", calorieShare: 0.3 },
  { mealType: "afternoon_snack", calorieShare: 0.1 },
  { mealType: "dinner", calorieShare: 0.25 },
];

function proteinDensity(f: FoodSeed): number {
  return f.proteinG / Math.max(1, f.calories); // g de proteína por kcal
}

function round5(n: number): number {
  return Math.round(n / 5) * 5;
}

/**
 * Monta UMA refeição tentando atingir a cota de calorias e de proteína.
 * Estratégia gulosa: começa por 1 fonte de proteína densa (para cumprir a meta
 * proteica), depois completa calorias com um acompanhamento e/ou vegetal.
 */
function buildMeal(
  mealType: MealType,
  calorieTarget: number,
  proteinTarget: number,
  glp1: boolean,
  rotationSeed: number
): PlannedMeal {
  const candidates = FOODS.filter((f) => f.meals.includes(mealType));
  const proteins = candidates
    .filter((f) => f.proteinG >= 8)
    .sort((a, b) => proteinDensity(b) - proteinDensity(a));

  const items: PlannedItem[] = [];
  const addFood = (f: FoodSeed, grams: number) => {
    const g = round5(Math.max(15, grams));
    items.push({
      food: f.name,
      quantityG: g,
      calories: Math.round((f.calories * g) / 100),
      proteinG: Math.round((f.proteinG * g) / 100),
    });
  };

  // 1) Fonte principal de proteína (rotaciona entre as opções pelos dias).
  if (proteins.length) {
    const primary = proteins[rotationSeed % proteins.length];
    // gramas para cobrir ~70% da proteína da refeição
    const gramsForProtein = ((proteinTarget * 0.7) / primary.proteinG) * 100;
    addFood(primary, gramsForProtein);
  }

  // 2) Acompanhamentos calóricos (carbo/gordura) para fechar a energia.
  //    Adiciona um por vez, priorizando fibra, até chegar perto da meta.
  const currentCalories = () => items.reduce((s, i) => s + i.calories, 0);
  const sides = candidates
    .filter((f) => f.proteinG < 8 || f.carbsG > 15)
    .sort((a, b) => b.fiberG - a.fiberG); // prioriza fibra (bom p/ GLP-1)
  let sideIdx = rotationSeed;
  let guard = 0;
  while (sides.length && currentCalories() < calorieTarget * 0.9 && guard < 3) {
    const side = sides[sideIdx % sides.length];
    const remaining = calorieTarget - currentCalories();
    const grams = (remaining * 100) / Math.max(1, side.calories);
    addFood(side, grams);
    sideIdx++;
    guard++;
  }

  // 3) Vegetal de volume (saciedade + fibra), quando a refeição comporta.
  if (mealType === "lunch" || mealType === "dinner") {
    const veg = candidates.find((f) => f.name.includes("Brócolis") || f.name.includes("Salada") || f.name.includes("Espinafre"));
    if (veg) addFood(veg, 100);
  }

  const totalCalories = items.reduce((s, i) => s + i.calories, 0);
  const totalProteinG = items.reduce((s, i) => s + i.proteinG, 0);

  return { mealType, items, totalCalories, totalProteinG };
}

/** Gera o plano de UM dia. */
export function generateDayPlan(
  targets: NutritionTargets,
  glp1: boolean,
  dayOfWeek: number
): DayMealPlan {
  const meals = MEAL_SPLIT.map((slot) =>
    buildMeal(
      slot.mealType,
      Math.round(targets.calorieTarget * slot.calorieShare),
      Math.round(targets.proteinTargetG * slot.calorieShare),
      glp1,
      dayOfWeek
    )
  );

  return {
    dayOfWeek,
    meals,
    totalCalories: meals.reduce((s, m) => s + m.totalCalories, 0),
    totalProteinG: meals.reduce((s, m) => s + m.totalProteinG, 0),
  };
}

/** Gera um plano semanal (7 dias, com rotação de alimentos). */
export function generateWeeklyDiet(
  profile: UserProfileInput,
  targets: NutritionTargets
): DayMealPlan[] {
  return Array.from({ length: 7 }, (_, day) => generateDayPlan(targets, profile.onGlp1, day));
}
