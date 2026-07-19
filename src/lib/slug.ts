/** Gera um slug estável a partir de um nome (usado nos IDs do catálogo). */
export function slug(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove acentos combinantes
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const foodId = (name: string) => `seed-food-${slug(name)}`;
export const exerciseId = (name: string) => `seed-ex-${slug(name)}`;
