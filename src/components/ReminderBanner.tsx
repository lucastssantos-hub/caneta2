"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { subscribeToPush, pushSupported } from "@/lib/pushClient";

interface Reminders {
  injectionDue: boolean;
  injection: { days: number; overdue: boolean } | null;
  weighedToday: boolean;
}

// Banner de lembretes na abertura do app + botão para ativar o Web Push.
// "Ativar notificações" assina o push no servidor, permitindo lembretes mesmo
// com o app fechado (disparados pelo cron /api/cron/reminders).
export default function ReminderBanner() {
  const [rem, setRem] = useState<Reminders | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch("/api/reminders")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Reminders | null) => {
        if (!data) return;
        setRem(data);
        maybeNotify(data);
      })
      .catch(() => {});
  }, []);

  function maybeNotify(data: Reminders) {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    if (data.injectionDue) {
      new Notification("GLP-1 Tracker", { body: "Sua aplicação está prevista para hoje." });
    } else if (!data.weighedToday) {
      new Notification("GLP-1 Tracker", { body: "Que tal registrar sua pesagem de hoje?" });
    }
  }

  const [enabling, setEnabling] = useState(false);
  async function enableNotifications() {
    setEnabling(true);
    // Assina o Web Push (permite lembretes com o app fechado).
    const ok = await subscribeToPush();
    if (ok && rem) maybeNotify(rem);
    setEnabling(false);
  }

  if (!rem || dismissed) return null;
  const items: string[] = [];
  if (rem.injectionDue) {
    items.push(rem.injection?.overdue ? "Aplicação atrasada" : "Aplicação prevista para hoje");
  }
  if (!rem.weighedToday) items.push("Você ainda não registrou a pesagem de hoje");
  if (items.length === 0) return null;

  const canEnable = pushSupported() && Notification.permission !== "denied";

  return (
    <div className="card" style={{ borderColor: "var(--accent)", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
      <span>🔔 {items.join(" · ")}.</span>
      <span style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
        {rem.injectionDue && <Link className="btn" href="/medication">Registrar aplicação</Link>}
        {!rem.weighedToday && <Link className="btn secondary" href="/weight">Registrar peso</Link>}
        {canEnable && (
          <button className="btn secondary" onClick={enableNotifications} disabled={enabling}>
            {enabling ? "Ativando..." : "Ativar notificações"}
          </button>
        )}
        <button className="btn secondary" onClick={() => setDismissed(true)}>Dispensar</button>
      </span>
    </div>
  );
}
