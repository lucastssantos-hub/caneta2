import Link from "next/link";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { prisma } from "@/lib/prisma";
import ExerciseEditor from "@/components/ExerciseEditor";
import GeneratePlanButton from "@/components/GeneratePlanButton";

export const dynamic = "force-dynamic";

export default async function TrainingPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const [workoutPlan, exercises] = await Promise.all([
    prisma.workoutPlan.findFirst({ where: { userId: user.id, status: "active" }, include: { days: { include: { exercises: { include: { exercise: true } } } } } }),
    prisma.exercise.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, muscleGroup: true } }),
  ]);

  return <>
    <div className="page-heading"><div><h1>Treino</h1><p>Treinos de força e movimento para acompanhar sua consistência sem pressa.</p></div><GeneratePlanButton /></div>
    {!workoutPlan ? <div className="card"><h3>Seu treino ainda não foi gerado</h3><p className="muted">Complete seu perfil e gere uma sugestão de treino para começar.</p><Link className="btn" href="/onboarding">Completar perfil</Link></div> : <div className="card">
      <div className="section-heading" style={{ marginTop: 0 }}><h3>{workoutPlan.name}</h3><span className="badge">Editável</span></div>
      {workoutPlan.days.map((day) => <details key={day.id} style={{ marginBottom: 12 }} open={day.dayOfWeek === 1}><summary style={{ cursor: "pointer", fontWeight: 700 }}>Dia {day.dayOfWeek} — {day.focus}</summary><div style={{ paddingTop: 12 }}>{day.exercises.slice().sort((a, b) => a.order - b.order).map((exercise) => <ExerciseEditor key={exercise.id} item={{ id: exercise.id, exerciseId: exercise.exerciseId, sets: exercise.sets, reps: exercise.reps }} exercises={exercises} />)}</div></details>)}
    </div>}
  </>;
}
