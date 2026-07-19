// Cálculo da próxima aplicação de GLP-1 a partir da última + frequência.

export type Frequency = "weekly" | "daily" | "other";

export function nextInjectionDate(lastDate: Date, frequency: Frequency): Date {
  const d = new Date(lastDate);
  d.setDate(d.getDate() + (frequency === "daily" ? 1 : 7));
  return d;
}

/** Dias até a próxima aplicação (negativo = atrasada). */
export function daysUntil(date: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (24 * 3600 * 1000));
}

export function injectionStatusLabel(days: number): string {
  if (days < 0) return `Atrasada há ${Math.abs(days)} dia(s)`;
  if (days === 0) return "É hoje";
  if (days === 1) return "Amanhã";
  return `Em ${days} dias`;
}
