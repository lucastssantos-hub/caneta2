"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", sex: "female" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Falha ao cadastrar.");
      setLoading(false);
      return;
    }
    await signIn("credentials", { email: form.email, password: form.password, redirect: false });
    router.push("/dashboard");
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <Link className="auth-brand" href="/"><span className="brand-mark" aria-hidden="true">✦</span> GLP-1 Tracker</Link>
        <div className="auth-intro"><h1>Comece sua jornada</h1><p>Crie seu espaço pessoal para acompanhar hábitos, medicação e evolução.</p></div>
        <form className="card" onSubmit={onSubmit}>
        <label htmlFor="signup-name">Nome</label>
        <input id="signup-name" autoComplete="name" value={form.name} onChange={(e) => set("name", e.target.value)} required />
        <label htmlFor="signup-email">E-mail</label>
        <input id="signup-email" type="email" autoComplete="email" value={form.email} onChange={(e) => set("email", e.target.value)} required />
        <label htmlFor="signup-password">Senha (mín. 8 caracteres)</label>
        <input id="signup-password" type="password" autoComplete="new-password" value={form.password} onChange={(e) => set("password", e.target.value)} required minLength={8} />
        <label htmlFor="signup-sex">Sexo biológico (para o cálculo metabólico)</label>
        <select id="signup-sex" value={form.sex} onChange={(e) => set("sex", e.target.value)}>
          <option value="female">Feminino</option>
          <option value="male">Masculino</option>
          <option value="other">Outro</option>
        </select>
        {error && <p className="error">{error}</p>}
        <div className="form-actions"><button className="btn" disabled={loading}>{loading ? "Criando…" : "Criar minha conta"}</button></div>
        </form>
        <p className="muted">Já tem conta? <Link href="/signin">Entrar</Link></p>
      </div>
    </main>
  );
}
