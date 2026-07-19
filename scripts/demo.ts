// Demonstração da lógica de geração — roda SEM banco de dados.
//   npm run demo
//
// Prova que, dado um perfil, o app calcula metas e monta dieta + treino.

import { calcTargets } from "@/lib/nutrition";
import { generateWeeklyDiet } from "@/lib/generators/dietGenerator";
import { generateWeeklyWorkout } from "@/lib/generators/workoutGenerator";
import { UserProfileInput } from "@/lib/types";

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const perfil: UserProfileInput = {
  sex: "female",
  age: 38,
  heightCm: 165,
  weightKg: 92,
  targetWeightKg: 70,
  activityLevel: "light",
  goal: "preserve_muscle",
  onGlp1: true,
  daysPerWeek: 4,
};

console.log("========================================");
console.log(" GLP-1 TRACKER — demonstração de geração");
console.log("========================================\n");

console.log("Perfil:");
console.log(`  Mulher, ${perfil.age} anos, ${perfil.heightCm} cm, ${perfil.weightKg} kg (meta ${perfil.targetWeightKg} kg)`);
console.log(`  Atividade: ${perfil.activityLevel} | Objetivo: ${perfil.goal} | GLP-1: ${perfil.onGlp1 ? "sim" : "não"}\n`);

// --- Metas ---
const targets = calcTargets(perfil);
console.log("── METAS DIÁRIAS ──────────────────────");
console.log(`  BMR: ${targets.bmr} kcal | TDEE: ${targets.tdee} kcal`);
console.log(`  Calorias-alvo:  ${targets.calorieTarget} kcal`);
console.log(`  Proteína:       ${targets.proteinTargetG} g`);
console.log(`  Carboidrato:    ${targets.carbTargetG} g`);
console.log(`  Gordura:        ${targets.fatTargetG} g`);
console.log(`  Fibra:          ${targets.fiberTargetG} g`);
console.log(`  Água:           ${targets.waterTargetMl} ml`);
targets.notes.forEach((n) => console.log(`  • ${n}`));

// --- Dieta (mostra 1 dia como amostra) ---
const semanaDieta = generateWeeklyDiet(perfil, targets);
const diaAmostra = semanaDieta[1]; // segunda-feira
console.log(`\n── DIETA — amostra (${DIAS[diaAmostra.dayOfWeek]}) ────────────`);
for (const meal of diaAmostra.meals) {
  console.log(`  ${meal.mealType.toUpperCase()}  (${meal.totalCalories} kcal · ${meal.totalProteinG} g prot.)`);
  for (const item of meal.items) {
    console.log(`     - ${item.food}: ${item.quantityG} g  (${item.calories} kcal, ${item.proteinG} g)`);
  }
}
console.log(`  TOTAL DO DIA: ${diaAmostra.totalCalories} kcal · ${diaAmostra.totalProteinG} g de proteína`);
console.log(`  (meta: ${targets.calorieTarget} kcal · ${targets.proteinTargetG} g)`);

// --- Treino (semana completa) ---
const treino = generateWeeklyWorkout(perfil);
console.log(`\n── TREINO — ${treino.length} dias/semana ──────────────`);
for (const dia of treino) {
  console.log(`  Dia ${dia.dayOfWeek} — ${dia.focus}`);
  for (const ex of dia.exercises) {
    console.log(`     - ${ex.exercise}: ${ex.sets}x${ex.reps}  (descanso ${ex.restSec}s)`);
  }
}

console.log("\n⚠️  Estimativas educacionais. Titulação de GLP-1 e dieta exigem acompanhamento médico/nutricional.\n");
