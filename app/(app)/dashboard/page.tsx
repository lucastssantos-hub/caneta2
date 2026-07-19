import Link from "next/link";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { prisma } from "@/lib/prisma";
import GeneratePlanButton from "@/components/GeneratePlanButton";
import WeightChart from "@/components/WeightChart";
import { nextInjectionDate, daysUntil, injectionStatusLabel, Frequency } from "@/lib/schedule";

export const dynamic = "force-dynamic";

const MEAL_LABELS: Record<string, string> = {
  breakfast: "Café da manhã",
  morning_snack: "Lanche da manhã",
  lunch: "Almoço",
  afternoon_snack: "Lanche da tarde",
  dinner: "Jantar",
  supper: "Ceia",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [weights, profile, mealPlan, workoutPlan, activeMed, lastInjection] =
    await Promise.all([
      prisma.weightLog.findMany({ where: { userId: user.id }, orderBy: { date: "asc" }, take: 60 }),
      prisma.profile.findUnique({ where: { userId: user.id } }),
      prisma.mealPlan.findFirst({
        where: { userId: user.id, status: "active" },
        include: { meals: { where: { dayOfWeek: 1 }, include: { items: { include: { foodItem: true } } } } },
      }),
      prisma.workoutPlan.findFirst({
        where: { userId: user.id, status: "active" },
        include: { days: { include: { exercises: { include: { exercise: true } } } } },
      }),
      prisma.medication.findFirst({ where: { userId: user.id, status: "active" } }),
      prisma.injectionLog.findFirst({ where: { userId: user.id }, orderBy: { date: "desc" } }),
    ]);

  const first = weights[0];
  const last = weights[weights.length - 1];
  const lost = first && last ? (first.weightKg - last.weightKg).toFixed(1) : "—";

  const chartData = weights.map((w) => ({
    date: w.date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
    weight: w.weightKg,
  }));

  // Próxima aplicação
  let nextInj: { label: string; overdue: boolean } | null = null;
  if (activeMed && lastInjection) {
    const next = nextInjectionDate(lastInjection.date, activeMed.frequency as Frequency);
    const d = daysUntil(next);
    nextInj = { label: injectionStatusLabel(d), overdue: d < 0 };
  }

  const needsOnboarding = !profile?.onboardedAt;

  return (
    <>
      <div className="dashboard-header">
        <div><h1>Olá, {user.name.split(" ")[0]} 👋</h1><p>Um retrato simples de como está sua jornada hoje.</p></div>
        <Link className="btn secondary" href="/checkin">Fazer check-in</Link>
      </div>

      {needsOnboarding && (
        <div className="notice">
          <span><strong>Complete seu perfil</strong> para gerar planos com as suas metas corretas.</span>
          <Link href="/onboarding">Completar agora →</Link>
        </div>
      )}

      <div className="grid">
        <div className="card stat">
          <div className="value">{last ? `${last.weightKg} kg` : "—"}</div>
          <div className="label">Peso atual</div>
        </div>
        <div className="card stat">
          <div className="value">{lost} kg</div>
          <div className="label">Perdido no total</div>
        </div>
        <div className="card stat">
          <div className="value">{profile?.proteinTargetG ?? "—"} g</div>
          <div className="label">Meta de proteína</div>
        </div>
        <div className="card stat">
          <div className="value">{profile?.calorieTarget ?? "—"}</div>
          <div className="label">Meta de calorias</div>
        </div>
      </div>

      <div className="quick-actions" aria-label="Ações rápidas">
        <Link className="quick-action" href="/weight"><span className="quick-action-icon" aria-hidden="true">◒</span><span>Registrar peso</span></Link>
        <Link className="quick-action" href="/medication"><span className="quick-action-icon" aria-hidden="true">＋</span><span>Registrar aplicação</span></Link>
        <Link className="quick-action" href="/nutrition"><span className="quick-action-icon" aria-hidden="true">◌</span><span>Ver nutrição</span></Link>
        <Link className="quick-action" href="/training"><span className="quick-action-icon" aria-hidden="true">△</span><span>Ver treino</span></Link>
      </div>

      <div className="card">
        <div className="section-heading"><h3>Evolução do peso</h3><Link href="/weight">Ver detalhes →</Link></div>
        <WeightChart data={chartData} target={profile?.targetWeightKg} />
      </div>

      <div className="card">
        <div className="section-heading"><h3>Medicação</h3><Link href="/medication">Ver histórico →</Link></div>
        {activeMed ? (
          <p>
            <span className="badge">{activeMed.drug}</span> {activeMed.brandName ?? ""}
            {nextInj && (
              <>
                {" — próxima aplicação: "}
                <strong className={nextInj.overdue ? "error" : ""}>{nextInj.label}</strong>
              </>
            )}
          </p>
        ) : (
          <p className="muted">
            Nenhuma medicação ativa. <Link href="/medication">Registrar aplicação →</Link>
          </p>
        )}
      </div>

      <div className="card">
        <div className="section-heading" style={{ marginTop: 0 }}>
          <h3>Planos da semana</h3>
          <GeneratePlanButton />
        </div>
        {mealPlan ? (
          <>
            <h4>🍽️ Dieta — dia 1</h4>
            <table>
              <tbody>
                {mealPlan.meals.map((m) => (
                  <tr key={m.id}>
                    <th style={{ width: 160 }}>{MEAL_LABELS[m.mealType] ?? m.mealType}</th>
                    <td>{m.items.map((i) => `${i.foodItem.name} (${i.quantityG}g)`).join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <p className="muted">Nenhum plano ativo. Clique em “Gerar plano”.</p>
        )}

        {workoutPlan && (
          <>
            <h4>🏋️ Treino — {workoutPlan.days.length} dias</h4>
            <table>
              <tbody>
                {workoutPlan.days.map((d) => (
                  <tr key={d.id}>
                    <th style={{ width: 160 }}>Dia {d.dayOfWeek} — {d.focus}</th>
                    <td>{d.exercises.map((e) => `${e.exercise.name} ${e.sets}x${e.reps}`).join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </>
  );
}
