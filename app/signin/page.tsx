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
    <div className="container" style={{ maxWidth: 420 }}>
      <h1>Entrar</h1>
      <form className="card" onSubmit={onSubmit}>
        <label>E-mail</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label>Senha</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="error">{error}</p>}
        <div style={{ marginTop: 16 }}>
          <button className="btn" disabled={loading}>{loading ? "..." : "Entrar"}</button>
        </div>
      </form>
      <p className="muted">
        Não tem conta? <Link href="/signup">Cadastre-se</Link>
      </p>
    </div>
  );
}
