import { FoodSeed } from "@/lib/types";

// Catálogo de alimentos. Macros por 100 g (valores aproximados de referência).
// isGlp1Friendly = alto em proteína e/ou fibra, boa saciedade e fácil tolerância
// (importante porque o GLP-1 reduz muito o apetite e há risco de baixa ingestão
// de proteína + constipação).

export const FOODS: FoodSeed[] = [
  // ---- Proteínas magras ----
  { name: "Peito de frango grelhado", servingSizeG: 120, calories: 165, proteinG: 31, carbsG: 0, fatG: 3.6, fiberG: 0, isGlp1Friendly: true, meals: ["lunch", "dinner"] },
  { name: "Tilápia grelhada", servingSizeG: 130, calories: 128, proteinG: 26, carbsG: 0, fatG: 2.7, fiberG: 0, isGlp1Friendly: true, meals: ["lunch", "dinner"] },
  { name: "Salmão", servingSizeG: 120, calories: 208, proteinG: 20, carbsG: 0, fatG: 13, fiberG: 0, isGlp1Friendly: true, meals: ["lunch", "dinner"] },
  { name: "Patinho moído magro", servingSizeG: 120, calories: 187, proteinG: 26, carbsG: 0, fatG: 9, fiberG: 0, isGlp1Friendly: true, meals: ["lunch", "dinner"] },
  { name: "Ovo cozido", servingSizeG: 100, calories: 155, proteinG: 13, carbsG: 1.1, fatG: 11, fiberG: 0, isGlp1Friendly: true, meals: ["breakfast", "morning_snack"] },
  { name: "Clara de ovo", servingSizeG: 100, calories: 52, proteinG: 11, carbsG: 0.7, fatG: 0.2, fiberG: 0, isGlp1Friendly: true, meals: ["breakfast"] },
  { name: "Atum em água", servingSizeG: 100, calories: 116, proteinG: 26, carbsG: 0, fatG: 1, fiberG: 0, isGlp1Friendly: true, meals: ["lunch", "afternoon_snack"] },

  // ---- Laticínios ricos em proteína ----
  { name: "Iogurte grego natural", servingSizeG: 170, calories: 59, proteinG: 10, carbsG: 3.6, fatG: 0.4, fiberG: 0, isGlp1Friendly: true, meals: ["breakfast", "morning_snack", "supper"] },
  { name: "Queijo cottage", servingSizeG: 100, calories: 98, proteinG: 11, carbsG: 3.4, fatG: 4.3, fiberG: 0, isGlp1Friendly: true, meals: ["breakfast", "afternoon_snack", "supper"] },
  { name: "Whey protein (pó)", servingSizeG: 30, calories: 400, proteinG: 80, carbsG: 8, fatG: 6, fiberG: 0, isGlp1Friendly: true, meals: ["morning_snack", "afternoon_snack", "supper"] },

  // ---- Vegetais / proteína vegetal ----
  { name: "Tofu firme", servingSizeG: 120, calories: 144, proteinG: 15, carbsG: 3, fatG: 9, fiberG: 2, isGlp1Friendly: true, meals: ["lunch", "dinner"] },
  { name: "Lentilha cozida", servingSizeG: 150, calories: 116, proteinG: 9, carbsG: 20, fatG: 0.4, fiberG: 8, isGlp1Friendly: true, meals: ["lunch", "dinner"] },
  { name: "Feijão preto cozido", servingSizeG: 150, calories: 132, proteinG: 8.9, carbsG: 24, fatG: 0.5, fiberG: 8.7, isGlp1Friendly: true, meals: ["lunch", "dinner"] },
  { name: "Grão-de-bico cozido", servingSizeG: 150, calories: 164, proteinG: 8.9, carbsG: 27, fatG: 2.6, fiberG: 7.6, isGlp1Friendly: true, meals: ["lunch", "dinner"] },

  // ---- Carboidratos / fibra ----
  { name: "Aveia em flocos", servingSizeG: 40, calories: 389, proteinG: 17, carbsG: 66, fatG: 7, fiberG: 10, isGlp1Friendly: true, meals: ["breakfast"] },
  { name: "Arroz integral cozido", servingSizeG: 120, calories: 111, proteinG: 2.6, carbsG: 23, fatG: 0.9, fiberG: 1.8, isGlp1Friendly: false, meals: ["lunch", "dinner"] },
  { name: "Batata-doce cozida", servingSizeG: 150, calories: 86, proteinG: 1.6, carbsG: 20, fatG: 0.1, fiberG: 3, isGlp1Friendly: true, meals: ["lunch", "dinner"] },
  { name: "Pão integral", servingSizeG: 50, calories: 247, proteinG: 13, carbsG: 41, fatG: 3.4, fiberG: 7, isGlp1Friendly: false, meals: ["breakfast"] },

  // ---- Vegetais / verduras (volume + fibra, saciedade) ----
  { name: "Brócolis cozido", servingSizeG: 100, calories: 35, proteinG: 2.4, carbsG: 7, fatG: 0.4, fiberG: 3.3, isGlp1Friendly: true, meals: ["lunch", "dinner"] },
  { name: "Espinafre refogado", servingSizeG: 100, calories: 23, proteinG: 2.9, carbsG: 3.6, fatG: 0.4, fiberG: 2.2, isGlp1Friendly: true, meals: ["lunch", "dinner"] },
  { name: "Salada verde (folhas)", servingSizeG: 80, calories: 15, proteinG: 1.4, carbsG: 2.9, fatG: 0.2, fiberG: 1.3, isGlp1Friendly: true, meals: ["lunch", "dinner"] },

  // ---- Gorduras boas ----
  { name: "Abacate", servingSizeG: 50, calories: 160, proteinG: 2, carbsG: 9, fatG: 15, fiberG: 7, isGlp1Friendly: true, meals: ["breakfast", "afternoon_snack"] },
  { name: "Amêndoas", servingSizeG: 20, calories: 579, proteinG: 21, carbsG: 22, fatG: 50, fiberG: 12, isGlp1Friendly: true, meals: ["morning_snack", "afternoon_snack"] },
  { name: "Azeite de oliva", servingSizeG: 10, calories: 884, proteinG: 0, carbsG: 0, fatG: 100, fiberG: 0, isGlp1Friendly: false, meals: ["lunch", "dinner"] },

  // ---- Frutas ----
  { name: "Banana", servingSizeG: 100, calories: 89, proteinG: 1.1, carbsG: 23, fatG: 0.3, fiberG: 2.6, isGlp1Friendly: false, meals: ["breakfast", "morning_snack"] },
  { name: "Maçã", servingSizeG: 130, calories: 52, proteinG: 0.3, carbsG: 14, fatG: 0.2, fiberG: 2.4, isGlp1Friendly: true, meals: ["morning_snack", "afternoon_snack"] },
  { name: "Frutas vermelhas", servingSizeG: 100, calories: 43, proteinG: 1, carbsG: 10, fatG: 0.3, fiberG: 5, isGlp1Friendly: true, meals: ["breakfast", "afternoon_snack", "supper"] },
];
