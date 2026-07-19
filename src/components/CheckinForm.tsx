"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const scale = [1, 2, 3, 4, 5];

export default function CheckinForm() {
  const router = useRouter();
  const [f, setF] = useState({ energy: "3", hunger: "3", mood: "3", waterMl: "", proteinG: "", notes: "" });
  const [saved, setSaved] = useState(false);

  function set(k: string, v: string) {
    setF((s) => ({ ...s, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(f),
    });
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <form className="card" onSubmit={onSubmit}>
      <div className="grid">
        <div>
          <label>Energia (1-5)</label>
          <select value={f.energy} onChange={(e) => set("energy", e.target.value)}>
            {scale.map((n) => <option key={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <label>Fome (1-5)</label>
          <select value={f.hunger} onChange={(e) => set("hunger", e.target.value)}>
            {scale.map((n) => <option key={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <label>Humor (1-5)</label>
          <select value={f.mood} onChange={(e) => set("mood", e.target.value)}>
            {scale.map((n) => <option key={n}>{n}</option>)}
          </select>
        </div>
      </div>
      <div className="grid">
        <div>
          <label>Água (ml)</label>
          <input type="number" value={f.waterMl} onChange={(e) => set("waterMl", e.target.value)} />
        </div>
        <div>
          <label>Proteína do dia (g)</label>
          <input type="number" value={f.proteinG} onChange={(e) => set("proteinG", e.target.value)} />
        </div>
      </div>
      <label>Observações</label>
      <input value={f.notes} onChange={(e) => set("notes", e.target.value)} />
      <div style={{ marginTop: 12 }}>
        <button className="btn">Salvar check-in de hoje</button>
        {saved && <span className="badge" style={{ marginLeft: 12 }}>Salvo ✓</span>}
      </div>
    </form>
  );
}
