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
    <div className="container" style={{ maxWidth: 420 }}>
      <h1>Criar conta</h1>
      <form className="card" onSubmit={onSubmit}>
        <label>Nome</label>
        <input value={form.name} onChange={(e) => set("name", e.target.value)} required />
        <label>E-mail</label>
        <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required />
        <label>Senha (mín. 8 caracteres)</label>
        <input type="password" value={form.password} onChange={(e) => set("password", e.target.value)} required />
        <label>Sexo biológico (para o cálculo metabólico)</label>
        <select value={form.sex} onChange={(e) => set("sex", e.target.value)}>
          <option value="female">Feminino</option>
          <option value="male">Masculino</option>
          <option value="other">Outro</option>
        </select>
        {error && <p className="error">{error}</p>}
        <div style={{ marginTop: 16 }}>
          <button className="btn" disabled={loading}>{loading ? "..." : "Cadastrar"}</button>
        </div>
      </form>
      <p className="muted">
        Já tem conta? <Link href="/signin">Entrar</Link>
      </p>
    </div>
  );
}
