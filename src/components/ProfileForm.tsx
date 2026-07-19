"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  initial?: {
    age?: number;
    heightCm?: number;
    activityLevel?: string;
    goal?: string;
    startWeightKg?: number | null;
    targetWeightKg?: number | null;
  };
}

export default function ProfileForm({ initial }: Props) {
  const router = useRouter();
  const [f, setF] = useState({
    age: initial?.age?.toString() ?? "",
    heightCm: initial?.heightCm?.toString() ?? "",
    activityLevel: initial?.activityLevel ?? "light",
    goal: initial?.goal ?? "preserve_muscle",
    startWeightKg: initial?.startWeightKg?.toString() ?? "",
    targetWeightKg: initial?.targetWeightKg?.toString() ?? "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(k: string, v: string) {
    setF((s) => ({ ...s, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(f),
    });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Falha ao salvar perfil.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form className="card" onSubmit={onSubmit}>
      <div className="grid">
        <div>
          <label>Idade</label>
          <input type="number" value={f.age} onChange={(e) => set("age", e.target.value)} required />
        </div>
        <div>
          <label>Altura (cm)</label>
          <input type="number" value={f.heightCm} onChange={(e) => set("heightCm", e.target.value)} required />
        </div>
      </div>

      <label>Nível de atividade</label>
      <select value={f.activityLevel} onChange={(e) => set("activityLevel", e.target.value)}>
        <option value="sedentary">Sedentário</option>
        <option value="light">Leve (1-3x/semana)</option>
        <option value="moderate">Moderado (3-5x/semana)</option>
        <option value="active">Ativo (6-7x/semana)</option>
        <option value="very_active">Muito ativo</option>
      </select>

      <label>Objetivo</label>
      <select value={f.goal} onChange={(e) => set("goal", e.target.value)}>
        <option value="lose_fat">Perder gordura</option>
        <option value="preserve_muscle">Preservar massa magra (recomendado em GLP-1)</option>
        <option value="recomposition">Recomposição corporal</option>
        <option value="maintain">Manter</option>
        <option value="gain_muscle">Ganhar músculo</option>
      </select>

      <div className="grid">
        <div>
          <label>Peso inicial (kg) — opcional</label>
          <input type="number" step="0.1" value={f.startWeightKg} onChange={(e) => set("startWeightKg", e.target.value)} />
        </div>
        <div>
          <label>Peso-alvo (kg) — opcional</label>
          <input type="number" step="0.1" value={f.targetWeightKg} onChange={(e) => set("targetWeightKg", e.target.value)} />
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      <div style={{ marginTop: 16 }}>
        <button className="btn" disabled={loading}>{loading ? "..." : "Salvar perfil"}</button>
      </div>
    </form>
  );
}
