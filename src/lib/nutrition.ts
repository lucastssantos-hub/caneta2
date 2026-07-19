import { ActivityLevel, Goal, NutritionTargets, UserProfileInput } from "@/lib/types";

// ⚠️ Estes cálculos são estimativas educacionais e NÃO substituem orientação de
// médico ou nutricionista. A titulação de GLP-1 é decisão médica.

const ACTIVITY_FACTOR: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

// Déficit calórico alvo por objetivo (kcal/dia abaixo do TDEE).
const GOAL_DEFICIT: Record<Goal, number> = {
  lose_fat: 500,
  preserve_muscle: 400,
  recomposition: 250,
  maintain: 0,
  gain_muscle: -250, // superávit
};

/** Mifflin-St Jeor */
export function calcBMR(sex: UserProfileInput["sex"], weightKg: number, heightCm: number, age: number): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (sex === "male") return base + 5;
  if (sex === "female") return base - 161;
  return base - 78; // média para "other"
}

/**
 * Peso de referência para a meta de proteína.
 * Em pessoas com sobrepeso/obesidade, usar o peso atual inteiro superestima a
 * proteína; usamos o peso-alvo quando disponível (protegendo massa magra sem
 * exagerar a meta).
 */
function proteinReferenceWeight(p: UserProfileInput): number {
  if (p.targetWeightKg && p.targetWeightKg < p.weightKg) return p.targetWeightKg;
  return p.weightKg;
}

export function calcTargets(p: UserProfileInput): NutritionTargets {
  const notes: string[] = [];

  const bmr = calcBMR(p.sex, p.weightKg, p.heightCm, p.age);
  const tdee = bmr * ACTIVITY_FACTOR[p.activityLevel];

  let calorieTarget = Math.round(tdee - GOAL_DEFICIT[p.goal]);

  // Piso de segurança: não recomendar dietas muito agressivas.
  const floor = p.sex === "female" ? 1200 : 1500;
  if (calorieTarget < floor) {
    calorieTarget = floor;
    notes.push(`Meta calórica elevada ao piso mínimo (${floor} kcal) por segurança.`);
  }

  // Proteína: 1.8-2.0 g/kg (peso de referência). GLP-1 aumenta a prioridade
  // porque o apetite reduzido eleva o risco de perda de massa magra.
  const refWeight = proteinReferenceWeight(p);
  const proteinPerKg = p.onGlp1 ? 2.0 : 1.8;
  const proteinTargetG = Math.round(refWeight * proteinPerKg);
  if (p.onGlp1) {
    notes.push("Meta de proteína priorizada (2,0 g/kg) para preservar massa magra durante o uso de GLP-1.");
  }

  // Gordura: ~25% das calorias.
  const fatTargetG = Math.round((calorieTarget * 0.25) / 9);

  // Carboidrato: o restante das calorias após proteína e gordura.
  const proteinKcal = proteinTargetG * 4;
  const fatKcal = fatTargetG * 9;
  const carbTargetG = Math.max(0, Math.round((calorieTarget - proteinKcal - fatKcal) / 4));

  // Fibra: 14 g por 1000 kcal (mín. 25 g). Ajuda com a constipação comum no GLP-1.
  const fiberTargetG = Math.max(25, Math.round((calorieTarget / 1000) * 14));
  if (p.onGlp1) {
    notes.push("Meta de fibra e hidratação reforçada para reduzir constipação.");
  }

  // Água: 35 ml/kg de peso atual.
  const waterTargetMl = Math.round(p.weightKg * 35);

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    calorieTarget,
    proteinTargetG,
    carbTargetG,
    fatTargetG,
    fiberTargetG,
    waterTargetMl,
    notes,
  };
}
