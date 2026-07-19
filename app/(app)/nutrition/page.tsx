import Link from "next/link";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { prisma } from "@/lib/prisma";
import MealItemEditor from "@/components/MealItemEditor";
import GeneratePlanButton from "@/components/GeneratePlanButton";

export const dynamic = "force-dynamic";

const DAY_NAMES = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const MEAL_ORDER = ["breakfast", "morning_snack", "lunch", "afternoon_snack", "dinner", "supper"];
const MEAL_LABELS: Record<string, string> = { breakfast: "Café da manhã", morning_snack: "Lanche da manhã", lunch: "Almoço", afternoon_snack: "Lanche da tarde", dinner: "Jantar", supper: "Ceia" };

export default async function NutritionPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const [mealPlan, foods] = await Promise.all([
    prisma.mealPlan.findFirst({ where: { userId: user.id, status: "active" }, include: { meals: { include: { items: { include: { foodItem: true } } } } } }),
    prisma.foodItem.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, isGlp1Friendly: true } }),
  ]);
  type MealRow = NonNullable<typeof mealPlan>["meals"][number];
  const mealsByDay = new Map<number, MealRow[]>();
  mealPlan?.meals.forEach((meal) => mealsByDay.set(meal.dayOfWeek, [...(mealsByDay.get(meal.dayOfWeek) ?? []), meal]));
  const days = [...mealsByDay.keys()].sort((a, b) => a - b);

  return <>
    <div className="page-heading"><div><h1>Nutrição</h1><p>Um plano alimentar simples, ajustável e alinhado às suas preferências.</p></div><GeneratePlanButton /></div>
    {!mealPlan ? <div className="card"><h3>Seu plano ainda não foi gerado</h3><p className="muted">Complete seu perfil e gere um plano personalizado para começar.</p><Link className="btn" href="/onboarding">Completar perfil</Link></div> : <div className="card">
      <div className="section-heading" style={{ marginTop: 0 }}><h3>Plano alimentar da semana</h3><span className="badge">Editável</span></div>
      {days.map((day) => <details key={day} style={{ marginBottom: 12 }} open={day === days[0]}><summary style={{ cursor: "pointer", fontWeight: 700 }}>{DAY_NAMES[day] ?? `Dia ${day}`}</summary><div style={{ paddingTop: 12 }}>{(mealsByDay.get(day) ?? []).sort((a, b) => MEAL_ORDER.indexOf(a.mealType) - MEAL_ORDER.indexOf(b.mealType)).map((meal) => <div key={meal.id} style={{ marginBottom: 16 }}><div className="muted" style={{ fontSize: 13, marginBottom: 6 }}>{MEAL_LABELS[meal.mealType] ?? meal.mealType}</div>{meal.items.map((item) => <MealItemEditor key={item.id} item={{ id: item.id, foodItemId: item.foodItemId, quantityG: item.quantityG }} foods={foods} />)}</div>)}</div></details>)}
      <p className="muted" style={{ fontSize: 12, marginBottom: 0 }}>★ = opção com boa saciedade e proteína. Este plano é educacional e não substitui acompanhamento profissional.</p>
    </div>}
  </>;
}
