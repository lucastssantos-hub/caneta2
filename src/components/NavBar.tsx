"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

export default function NavBar() {
  return (
    <nav className="nav">
      <span className="brand">💊 GLP-1 Tracker</span>
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/weight">Peso</Link>
      <Link href="/medication">Medicação</Link>
      <Link href="/checkin">Check-in</Link>
      <Link href="/plan">Plano</Link>
      <Link href="/insights">Insights</Link>
      <Link href="/onboarding">Perfil</Link>
      <button className="btn secondary" onClick={() => signOut({ callbackUrl: "/signin" })}>
        Sair
      </button>
    </nav>
  );
}
