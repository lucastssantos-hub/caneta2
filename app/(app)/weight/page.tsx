import { getCurrentUser } from "@/lib/getCurrentUser";
import { prisma } from "@/lib/prisma";
import WeightForm from "@/components/WeightForm";
import WeightChart from "@/components/WeightChart";

export const dynamic = "force-dynamic";

export default async function WeightPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [logs, profile] = await Promise.all([
    prisma.weightLog.findMany({ where: { userId: user.id }, orderBy: { date: "desc" }, take: 60 }),
    prisma.profile.findUnique({ where: { userId: user.id } }),
  ]);

  const chartData = [...logs]
    .reverse()
    .map((w) => ({
      date: w.date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      weight: w.weightKg,
    }));

  return (
    <>
      <h1>Peso</h1>
      <WeightForm />

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Evolução</h3>
        <WeightChart data={chartData} target={profile?.targetWeightKg} />
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Histórico</h3>
        {logs.length === 0 ? (
          <p className="muted">Nenhuma pesagem ainda.</p>
        ) : (
          <table>
            <thead>
              <tr><th>Data</th><th>Peso</th><th>Cintura</th><th>Variação</th></tr>
            </thead>
            <tbody>
              {logs.map((log, i) => {
                const prev = logs[i + 1];
                const diff = prev ? (log.weightKg - prev.weightKg).toFixed(1) : "—";
                return (
                  <tr key={log.id}>
                    <td>{log.date.toLocaleDateString("pt-BR")}</td>
                    <td>{log.weightKg} kg</td>
                    <td>{log.waistCm ? `${log.waistCm} cm` : "—"}</td>
                    <td className={prev && log.weightKg < prev.weightKg ? "" : "muted"}>
                      {diff !== "—" ? `${diff} kg` : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
