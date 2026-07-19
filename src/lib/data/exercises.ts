import { ExerciseSeed } from "@/lib/types";

// Catálogo de exercícios. Ênfase em RESISTÊNCIA (musculação): em GLP-1, com
// perda de peso rápida, o treino de força é o principal fator para preservar
// massa magra. Cardio e mobilidade entram como complemento.

export const EXERCISES: ExerciseSeed[] = [
  // ---- Pernas / glúteos ----
  { name: "Agachamento livre", category: "resistance", muscleGroup: "legs", isBodyweight: false, instructions: "Desça controlado até coxas paralelas, joelhos alinhados aos pés." },
  { name: "Leg press", category: "resistance", muscleGroup: "legs", isBodyweight: false },
  { name: "Afundo (passada)", category: "resistance", muscleGroup: "legs", isBodyweight: false },
  { name: "Cadeira extensora", category: "resistance", muscleGroup: "legs", isBodyweight: false },
  { name: "Mesa flexora", category: "resistance", muscleGroup: "legs", isBodyweight: false },
  { name: "Levantamento terra romeno", category: "resistance", muscleGroup: "glutes", isBodyweight: false, instructions: "Quadril para trás, coluna neutra, sinta o posterior." },
  { name: "Elevação pélvica", category: "resistance", muscleGroup: "glutes", isBodyweight: false },
  { name: "Agachamento livre (peso corporal)", category: "resistance", muscleGroup: "legs", isBodyweight: true },

  // ---- Peito ----
  { name: "Supino reto", category: "resistance", muscleGroup: "chest", isBodyweight: false },
  { name: "Supino inclinado com halteres", category: "resistance", muscleGroup: "chest", isBodyweight: false },
  { name: "Flexão de braço", category: "resistance", muscleGroup: "chest", isBodyweight: true },
  { name: "Crossover / crucifixo", category: "resistance", muscleGroup: "chest", isBodyweight: false },

  // ---- Costas ----
  { name: "Puxada frontal", category: "resistance", muscleGroup: "back", isBodyweight: false },
  { name: "Remada curvada", category: "resistance", muscleGroup: "back", isBodyweight: false },
  { name: "Remada baixa (máquina)", category: "resistance", muscleGroup: "back", isBodyweight: false },
  { name: "Barra fixa assistida", category: "resistance", muscleGroup: "back", isBodyweight: true },

  // ---- Ombros ----
  { name: "Desenvolvimento com halteres", category: "resistance", muscleGroup: "shoulders", isBodyweight: false },
  { name: "Elevação lateral", category: "resistance", muscleGroup: "shoulders", isBodyweight: false },

  // ---- Braços ----
  { name: "Rosca direta", category: "resistance", muscleGroup: "arms", isBodyweight: false },
  { name: "Tríceps na polia", category: "resistance", muscleGroup: "arms", isBodyweight: false },

  // ---- Core ----
  { name: "Prancha", category: "core", muscleGroup: "core", isBodyweight: true, instructions: "Mantenha o corpo em linha reta, abdômen contraído." },
  { name: "Abdominal infra", category: "core", muscleGroup: "core", isBodyweight: true },
  { name: "Prancha lateral", category: "core", muscleGroup: "core", isBodyweight: true },

  // ---- Cardio ----
  { name: "Caminhada rápida", category: "cardio", muscleGroup: "full_body", isBodyweight: true, instructions: "20-40 min em ritmo moderado. Ótimo para dias de descanso ativo." },
  { name: "Bicicleta ergométrica", category: "cardio", muscleGroup: "full_body", isBodyweight: false },
  { name: "Elíptico", category: "cardio", muscleGroup: "full_body", isBodyweight: false },

  // ---- Mobilidade ----
  { name: "Alongamento dinâmico", category: "mobility", muscleGroup: "full_body", isBodyweight: true },
];
