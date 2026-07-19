// Tipos compartilhados entre catálogo (seed), geradores e demo.
// Ficam desacoplados do Prisma Client de propósito: assim os geradores são
// funções puras, testáveis e executáveis sem banco.

export type Sex = "male" | "female" | "other";
export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";
export type Goal =
  | "lose_fat"
  | "preserve_muscle"
  | "recomposition"
  | "maintain"
  | "gain_muscle";

export type MealType =
  | "breakfast"
  | "morning_snack"
  | "lunch"
  | "afternoon_snack"
  | "dinner"
  | "supper";

export type ExerciseCategory = "resistance" | "cardio" | "mobility" | "core";
export type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "arms"
  | "legs"
  | "glutes"
  | "core"
  | "full_body";

// --- Catálogo ---

export interface FoodSeed {
  name: string;
  servingSizeG: number; // porção de referência (usada só como default de UI)
  calories: number; // por 100 g
  proteinG: number; // por 100 g
  carbsG: number; // por 100 g
  fatG: number; // por 100 g
  fiberG: number; // por 100 g
  isGlp1Friendly: boolean;
  meals: MealType[]; // refeições onde o alimento faz sentido
}

export interface ExerciseSeed {
  name: string;
  category: ExerciseCategory;
  muscleGroup: MuscleGroup;
  isBodyweight: boolean;
  instructions?: string;
}

// --- Entrada do usuário para os geradores ---

export interface UserProfileInput {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number; // peso atual
  targetWeightKg?: number;
  activityLevel: ActivityLevel;
  goal: Goal;
  onGlp1: boolean; // usa GLP-1 (ajusta metas de proteína / déficit)
  daysPerWeek?: number; // preferência de treino (2-6)
}

// --- Saída dos geradores ---

export interface NutritionTargets {
  bmr: number;
  tdee: number;
  calorieTarget: number;
  proteinTargetG: number;
  carbTargetG: number;
  fatTargetG: number;
  fiberTargetG: number;
  waterTargetMl: number;
  notes: string[];
}

export interface PlannedItem {
  food: string;
  quantityG: number;
  calories: number;
  proteinG: number;
}

export interface PlannedMeal {
  mealType: MealType;
  items: PlannedItem[];
  totalCalories: number;
  totalProteinG: number;
}

export interface DayMealPlan {
  dayOfWeek: number; // 0 = domingo
  meals: PlannedMeal[];
  totalCalories: number;
  totalProteinG: number;
}

export interface WorkoutSet {
  exercise: string;
  muscleGroup: MuscleGroup;
  sets: number;
  reps: string; // ex.: "8-12"
  restSec: number;
}

export interface WorkoutDayPlan {
  dayOfWeek: number;
  focus: string;
  exercises: WorkoutSet[];
}
