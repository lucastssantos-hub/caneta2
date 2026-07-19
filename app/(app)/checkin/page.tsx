import { getCurrentUser } from "@/lib/getCurrentUser";
import { prisma } from "@/lib/prisma";
import CheckinForm from "@/components/CheckinForm";

export const dynamic = "force-dynamic";

export default async function CheckinPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const checkins = await prisma.dailyCheckin.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
    take: 14,
  });

  return (
    <>
      <h1>Check-in diário</h1>
      <p className="muted">
        Acompanhe energia, fome e humor — a queda de fome costuma acompanhar a dose de GLP-1.
      </p>
      <CheckinForm />

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Últimos check-ins</h3>
        {checkins.length === 0 ? (
          <p className="muted">Nenhum check-in ainda.</p>
        ) : (
          <table>
            <thead>
              <tr><th>Data</th><th>Energia</th><th>Fome</th><th>Humor</th><th>Água</th><th>Proteína</th></tr>
            </thead>
            <tbody>
              {checkins.map((c) => (
                <tr key={c.id}>
                  <td>{c.date.toLocaleDateString("pt-BR")}</td>
                  <td>{c.energy ?? "—"}</td>
                  <td>{c.hunger ?? "—"}</td>
                  <td>{c.mood ?? "—"}</td>
                  <td>{c.waterMl ? `${c.waterMl} ml` : "—"}</td>
                  <td>{c.proteinG ? `${c.proteinG} g` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
