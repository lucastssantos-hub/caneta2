"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) setError("E-mail ou senha inválidos.");
    else router.push("/dashboard");
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <Link className="auth-brand" href="/"><span className="brand-mark" aria-hidden="true">✦</span> GLP-1 Tracker</Link>
        <div className="auth-intro"><h1>Bem-vindo de volta</h1><p>Continue acompanhando sua jornada com mais clareza e consistência.</p></div>
        <form className="card" onSubmit={onSubmit}>
        <label htmlFor="signin-email">E-mail</label>
        <input id="signin-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label htmlFor="signin-password">Senha</label>
        <input id="signin-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="error">{error}</p>}
        <div className="form-actions"><button className="btn" disabled={loading}>{loading ? "Entrando…" : "Entrar"}</button></div>
        </form>
        <p className="muted">Não tem conta? <Link href="/signup">Criar minha conta</Link></p>
      </div>
    </main>
  );
}
