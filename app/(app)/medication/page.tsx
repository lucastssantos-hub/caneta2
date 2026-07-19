import { getCurrentUser } from "@/lib/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { InjectionForm, SideEffectForm } from "@/components/MedicationForms";

export const dynamic = "force-dynamic";

const EFFECT_LABELS: Record<string, string> = {
  nausea: "Náusea", vomiting: "Vômito", constipation: "Constipação",
  diarrhea: "Diarreia", reflux: "Refluxo", fatigue: "Fadiga",
  headache: "Dor de cabeça", appetite_loss: "Perda de apetite",
  injection_site_reaction: "Reação no local", other: "Outro",
};
const SEVERITY_LABELS: Record<string, string> = { mild: "Leve", moderate: "Moderada", severe: "Forte" };

export default async function MedicationPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [injections, sideEffects] = await Promise.all([
    prisma.injectionLog.findMany({ where: { userId: user.id }, orderBy: { date: "desc" }, take: 10 }),
    prisma.sideEffectLog.findMany({ where: { userId: user.id }, orderBy: { date: "desc" }, take: 10 }),
  ]);

  return (
    <>
      <h1>Medicação</h1>
      <InjectionForm />
      <SideEffectForm />

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Últimas aplicações</h3>
        {injections.length === 0 ? (
          <p className="muted">Nenhuma aplicação registrada.</p>
        ) : (
          <table>
            <thead><tr><th>Data</th><th>Dose</th><th>Local</th></tr></thead>
            <tbody>
              {injections.map((inj) => (
                <tr key={inj.id}>
                  <td>{inj.date.toLocaleDateString("pt-BR")}</td>
                  <td>{inj.doseMg} mg</td>
                  <td>{inj.site ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Efeitos colaterais recentes</h3>
        {sideEffects.length === 0 ? (
          <p className="muted">Nenhum efeito registrado.</p>
        ) : (
          <table>
            <thead><tr><th>Data</th><th>Efeito</th><th>Intensidade</th></tr></thead>
            <tbody>
              {sideEffects.map((se) => (
                <tr key={se.id}>
                  <td>{se.date.toLocaleDateString("pt-BR")}</td>
                  <td>{EFFECT_LABELS[se.type] ?? se.type}</td>
                  <td>{SEVERITY_LABELS[se.severity] ?? se.severity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
