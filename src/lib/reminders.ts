import { prisma } from "@/lib/prisma";
import { nextInjectionDate, daysUntil, Frequency } from "@/lib/schedule";

export interface ReminderState {
  injection: { days: number; overdue: boolean } | null;
  injectionDue: boolean;
  weighedToday: boolean;
}

/** Calcula o que precisa de atenção hoje para um usuário (aplicação, pesagem). */
export async function computeReminders(userId: string): Promise<ReminderState> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [activeMed, lastInjection, weighedToday] = await Promise.all([
    prisma.medication.findFirst({ where: { userId, status: "active" } }),
    prisma.injectionLog.findFirst({ where: { userId }, orderBy: { date: "desc" } }),
    prisma.weightLog.findFirst({ where: { userId, date: { gte: today } } }),
  ]);

  let injection: { days: number; overdue: boolean } | null = null;
  if (activeMed && lastInjection) {
    const next = nextInjectionDate(lastInjection.date, activeMed.frequency as Frequency);
    const d = daysUntil(next);
    injection = { days: d, overdue: d < 0 };
  }

  return {
    injection,
    injectionDue: injection ? injection.days <= 0 : false,
    weighedToday: !!weighedToday,
  };
}
