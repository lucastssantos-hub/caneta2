"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const DRUGS = [
  { v: "semaglutide", l: "Semaglutida (Ozempic/Wegovy)" },
  { v: "tirzepatide", l: "Tirzepatida (Mounjaro/Zepbound)" },
  { v: "liraglutide", l: "Liraglutida (Saxenda/Victoza)" },
  { v: "dulaglutide", l: "Dulaglutida (Trulicity)" },
  { v: "other", l: "Outro" },
];

const SITES = [
  { v: "abdomen", l: "Abdômen" },
  { v: "thigh", l: "Coxa" },
  { v: "upper_arm", l: "Braço" },
];

const EFFECTS = [
  { v: "nausea", l: "Náusea" },
  { v: "vomiting", l: "Vômito" },
  { v: "constipation", l: "Constipação" },
  { v: "diarrhea", l: "Diarreia" },
  { v: "reflux", l: "Refluxo" },
  { v: "fatigue", l: "Fadiga" },
  { v: "headache", l: "Dor de cabeça" },
  { v: "appetite_loss", l: "Perda de apetite" },
  { v: "injection_site_reaction", l: "Reação no local" },
  { v: "other", l: "Outro" },
];

export function InjectionForm() {
  const router = useRouter();
  const [drug, setDrug] = useState("semaglutide");
  const [doseMg, setDoseMg] = useState("");
  const [site, setSite] = useState("abdomen");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/injection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ drug, doseMg, site }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Falha ao registrar.");
      return;
    }
    setDoseMg("");
    router.refresh();
  }

  return (
    <form className="card" onSubmit={onSubmit}>
      <h3 style={{ marginTop: 0 }}>Registrar aplicação</h3>
      <label>Medicamento</label>
      <select value={drug} onChange={(e) => setDrug(e.target.value)}>
        {DRUGS.map((d) => <option key={d.v} value={d.v}>{d.l}</option>)}
      </select>
      <div className="grid">
        <div>
          <label>Dose (mg)</label>
          <input type="number" step="0.05" value={doseMg} onChange={(e) => setDoseMg(e.target.value)} required />
        </div>
        <div>
          <label>Local</label>
          <select value={site} onChange={(e) => setSite(e.target.value)}>
            {SITES.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
          </select>
        </div>
      </div>
      {error && <p className="error">{error}</p>}
      <div style={{ marginTop: 12 }}><button className="btn">Salvar aplicação</button></div>
    </form>
  );
}

export function SideEffectForm() {
  const router = useRouter();
  const [type, setType] = useState("nausea");
  const [severity, setSeverity] = useState("mild");
  const [notes, setNotes] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/side-effect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, severity, notes: notes || undefined }),
    });
    setNotes("");
    router.refresh();
  }

  return (
    <form className="card" onSubmit={onSubmit}>
      <h3 style={{ marginTop: 0 }}>Registrar efeito colateral</h3>
      <div className="grid">
        <div>
          <label>Efeito</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            {EFFECTS.map((x) => <option key={x.v} value={x.v}>{x.l}</option>)}
          </select>
        </div>
        <div>
          <label>Intensidade</label>
          <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
            <option value="mild">Leve</option>
            <option value="moderate">Moderada</option>
            <option value="severe">Forte</option>
          </select>
        </div>
      </div>
      <label>Observações</label>
      <input value={notes} onChange={(e) => setNotes(e.target.value)} />
      <div style={{ marginTop: 12 }}><button className="btn secondary">Salvar efeito</button></div>
    </form>
  );
}
