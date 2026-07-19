import { getCurrentUser } from "@/lib/getCurrentUser";
import { prisma } from "@/lib/prisma";
import AdherenceChart from "@/components/AdherenceChart";
import HungerChart from "@/components/HungerChart";

export const dynamic = "force-dynamic";

const DAYS = 21;

function label(d: Date): string {
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default async function InsightsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const since = new Date();
  since.setDate(since.getDate() - (DAYS - 1));
  since.setHours(0, 0, 0, 0);

  const [profile, checkins, injections] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: user.id } }),
    prisma.dailyCheckin.findMany({
      where: { userId: user.id, date: { gte: since } },
      orderBy: { date: "asc" },
    }),
    prisma.injectionLog.findMany({
      where: { userId: user.id, date: { gte: since } },
      orderBy: { date: "asc" },
    }),
  ]);

  // Constrói a série de dias (com lacunas onde não há registro).
  const days: Date[] = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    return d;
  });

  const adherence = days.map((d) => {
    const c = checkins.find((x) => sameDay(x.date, d));
    return { date: label(d), protein: c?.proteinG ?? null };
  });

  const hunger = days.map((d) => {
    const c = checkins.find((x) => sameDay(x.date, d));
    const hasInjection = injections.some((x) => sameDay(x.date, d));
    return {
      date: label(d),
      hunger: c?.hunger ?? null,
      injection: hasInjection ? 5.5 : null,
    };
  });

  return (
    <>
      <div className="page-heading"><div><h1>Insights</h1><p>Veja relações entre seus registros e sua rotina — sem transformar dados em diagnóstico.</p></div></div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Adesão de proteína (últimos {DAYS} dias)</h3>
        <AdherenceChart data={adherence} target={profile?.proteinTargetG ?? null} />
        <p className="muted" style={{ fontSize: 13 }}>
          Barras verdes = dias em que você bateu a meta de proteína.
        </p>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Fome × aplicação</h3>
        <HungerChart data={hunger} />
        <p className="muted" style={{ fontSize: 13 }}>
          Visualização observacional dos seus próprios registros. Os triângulos
          marcam os dias de aplicação. <strong>Não use para ajustar dose</strong> —
          qualquer mudança de dose é decisão do seu médico.
        </p>
      </div>
    </>
  );
}
