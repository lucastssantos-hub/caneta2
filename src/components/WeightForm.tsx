"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function WeightForm() {
  const router = useRouter();
  const [weightKg, setWeightKg] = useState("");
  const [waistCm, setWaistCm] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/weight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weightKg, waistCm: waistCm || undefined }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Falha ao salvar.");
      return;
    }
    setWeightKg("");
    setWaistCm("");
    router.refresh();
  }

  return (
    <form className="card" onSubmit={onSubmit}>
      <div className="grid">
        <div>
          <label>Peso (kg)</label>
          <input type="number" step="0.1" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} required />
        </div>
        <div>
          <label>Cintura (cm) — opcional</label>
          <input type="number" step="0.1" value={waistCm} onChange={(e) => setWaistCm(e.target.value)} />
        </div>
      </div>
      {error && <p className="error">{error}</p>}
      <div style={{ marginTop: 12 }}>
        <button className="btn">Registrar pesagem</button>
      </div>
    </form>
  );
}
