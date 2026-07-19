import { EXERCISES } from "@/lib/data/exercises";
import { MuscleGroup, UserProfileInput, WorkoutDayPlan, WorkoutSet } from "@/lib/types";

// Quantos dias de treino por semana, por nível de atividade (padrão se o
// usuário não escolher). Foco em resistência para preservar massa magra.
const DEFAULT_DAYS: Record<UserProfileInput["activityLevel"], number> = {
  sedentary: 3,
  light: 3,
  moderate: 4,
  active: 4,
  very_active: 5,
};

// Divisões de treino por número de dias.
const SPLITS: Record<number, { focus: string; groups: MuscleGroup[] }[]> = {
  3: [
    { focus: "Corpo inteiro A", groups: ["legs", "chest", "back", "core"] },
    { focus: "Corpo inteiro B", groups: ["glutes", "shoulders", "back", "core"] },
    { focus: "Corpo inteiro C", groups: ["legs", "chest", "arms", "core"] },
  ],
  4: [
    { focus: "Inferiores", groups: ["legs", "glutes", "core"] },
    { focus: "Superiores (empurrar)", groups: ["chest", "shoulders", "arms"] },
    { focus: "Inferiores", groups: ["legs", "glutes", "core"] },
    { focus: "Superiores (puxar)", groups: ["back", "arms", "core"] },
  ],
  5: [
    { focus: "Pernas", groups: ["legs", "glutes"] },
    { focus: "Peito e ombros", groups: ["chest", "shoulders"] },
    { focus: "Costas e braços", groups: ["back", "arms"] },
    { focus: "Glúteos e posterior", groups: ["glutes", "legs"] },
    { focus: "Corpo inteiro + core", groups: ["chest", "back", "core"] },
  ],
};

// Prescrição de séries/reps por objetivo.
function prescription(goal: UserProfileInput["goal"]): { sets: number; reps: string; restSec: number } {
  switch (goal) {
    case "gain_muscle":
      return { sets: 4, reps: "8-12", restSec: 90 };
    case "preserve_muscle":
    case "recomposition":
      return { sets: 3, reps: "8-12", restSec: 75 };
    case "lose_fat":
      return { sets: 3, reps: "10-15", restSec: 60 };
    default:
      return { sets: 3, reps: "10-12", restSec: 60 };
  }
}

function pickExercises(group: MuscleGroup, count: number, seed: number): string[] {
  // Resistência para os grupos musculares; para "core" o catálogo usa a
  // categoria "core" — aceitamos ambas para não deixar o grupo vazio.
  const pool = EXERCISES.filter(
    (e) => e.muscleGroup === group && (e.category === "resistance" || e.category === "core")
  );
  if (!pool.length) return [];
  const picked: string[] = [];
  for (let i = 0; i < count && i < pool.length; i++) {
    picked.push(pool[(seed + i) % pool.length].name);
  }
  return picked;
}

export function generateWeeklyWorkout(profile: UserProfileInput): WorkoutDayPlan[] {
  const requested = profile.daysPerWeek ?? DEFAULT_DAYS[profile.activityLevel];
  const days = Math.min(5, Math.max(3, requested));
  const split = SPLITS[days] ?? SPLITS[3];
  const rx = prescription(profile.goal);

  return split.map((day, idx) => {
    const exercises: WorkoutSet[] = [];
    // 2 exercícios por grupo principal, 1 para grupos secundários.
    day.groups.forEach((group, gi) => {
      const count = gi === 0 ? 2 : 1;
      pickExercises(group, count, idx).forEach((name) => {
        const isCore = group === "core";
        exercises.push({
          exercise: name,
          muscleGroup: group,
          sets: isCore ? 3 : rx.sets,
          reps: isCore ? "30-45s" : rx.reps,
          restSec: isCore ? 45 : rx.restSec,
        });
      });
    });

    // Finaliza com cardio leve nos dias de treino de perna (opcional).
    if (day.focus.toLowerCase().includes("inferior") || day.focus.toLowerCase().includes("perna")) {
      exercises.push({
        exercise: "Caminhada rápida",
        muscleGroup: "full_body",
        sets: 1,
        reps: "15-20 min",
        restSec: 0,
      });
    }

    return { dayOfWeek: idx + 1, focus: day.focus, exercises };
  });
}
