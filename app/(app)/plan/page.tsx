import Link from "next/link";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { prisma } from "@/lib/prisma";
import MealItemEditor from "@/components/MealItemEditor";
import ExerciseEditor from "@/components/ExerciseEditor";

export const dynamic = "force-dynamic";

const DAY_NAMES = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const MEAL_ORDER = ["breakfast", "morning_snack", "lunch", "afternoon_snack", "dinner", "supper"];
const MEAL_LABELS: Record<string, string> = {
  breakfast: "Café da manhã",
  morning_snack: "Lanche da manhã",
  lunch: "Almoço",
  afternoon_snack: "Lanche da tarde",
  dinner: "Jantar",
  supper: "Ceia",
};

export default async function PlanPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [mealPlan, workoutPlan, foods, exercises] = await Promise.all([
    prisma.mealPlan.findFirst({
      where: { userId: user.id, status: "active" },
      include: { meals: { include: { items: { include: { foodItem: true } } } } },
    }),
    prisma.workoutPlan.findFirst({
      where: { userId: user.id, status: "active" },
      include: { days: { include: { exercises: { include: { exercise: true } } } } },
    }),
    prisma.foodItem.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, isGlp1Friendly: true },
    }),
    prisma.exercise.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, muscleGroup: true },
    }),
  ]);

  if (!mealPlan && !workoutPlan) {
    return (
      <>
        <h1>Meu plano</h1>
        <div className="card">
          <p className="muted">Você ainda não tem um plano ativo.</p>
          <Link className="btn" href="/dashboard">Ir ao dashboard gerar</Link>
        </div>
      </>
    );
  }

  // Agrupa refeições por dia.
  type MealRow = NonNullable<typeof mealPlan>["meals"][number];
  const mealsByDay = new Map<number, MealRow[]>();
  mealPlan?.meals.forEach((m) => {
    const arr = mealsByDay.get(m.dayOfWeek) ?? [];
    arr.push(m);
    mealsByDay.set(m.dayOfWeek, arr);
  });
  const dietDays = [...mealsByDay.keys()].sort((a, b) => a - b);

  return (
    <>
      <h1>Meu plano</h1>
      <p className="muted">Troque alimentos e exercícios à vontade. As alterações salvam sozinhas.</p>

      {mealPlan && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>🍽️ Dieta da semana</h3>
          {dietDays.map((day) => {
            const meals = (mealsByDay.get(day) ?? []).sort(
              (a, b) => MEAL_ORDER.indexOf(a.mealType) - MEAL_ORDER.indexOf(b.mealType)
            );
            return (
              <details key={day} style={{ marginBottom: 12 }} open={day === dietDays[0]}>
                <summary style={{ cursor: "pointer", fontWeight: 600 }}>{DAY_NAMES[day] ?? `Dia ${day}`}</summary>
                <div style={{ paddingTop: 8 }}>
                  {meals.map((meal) => (
                    <div key={meal.id} style={{ marginBottom: 12 }}>
                      <div className="muted" style={{ fontSize: 13, marginBottom: 4 }}>
                        {MEAL_LABELS[meal.mealType] ?? meal.mealType}
                      </div>
                      {meal.items.map((item) => (
                        <MealItemEditor
                          key={item.id}
                          item={{ id: item.id, foodItemId: item.foodItemId, quantityG: item.quantityG }}
                          foods={foods}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </details>
            );
          })}
          <p className="muted" style={{ fontSize: 12 }}>★ = opção com boa saciedade/proteína (GLP-1 friendly)</p>
        </div>
      )}

      {workoutPlan && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>🏋️ Treino da semana</h3>
          {workoutPlan.days.map((d) => (
            <details key={d.id} style={{ marginBottom: 12 }} open={d.dayOfWeek === 1}>
              <summary style={{ cursor: "pointer", fontWeight: 600 }}>
                Dia {d.dayOfWeek} — {d.focus}
              </summary>
              <div style={{ paddingTop: 8 }}>
                {d.exercises
                  .slice()
                  .sort((a, b) => a.order - b.order)
                  .map((ex) => (
                    <ExerciseEditor
                      key={ex.id}
                      item={{ id: ex.id, exerciseId: ex.exerciseId, sets: ex.sets, reps: ex.reps }}
                      exercises={exercises}
                    />
                  ))}
              </div>
            </details>
          ))}
        </div>
      )}
    </>
  );
}
