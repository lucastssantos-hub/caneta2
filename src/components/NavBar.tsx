"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

const navItems = [
  ["/dashboard", "⌂", "Dashboard"],
  ["/weight", "◒", "Peso"],
  ["/medication", "＋", "Medicação"],
  ["/checkin", "♡", "Check-in"],
  ["/plan", "≋", "Plano"],
  ["/insights", "⌁", "Insights"],
] as const;

export default function NavBar() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const initials = "LC";

  return (
    <>
      <nav className="nav" aria-label="Navegação principal">
        <Link className="brand" href="/dashboard" aria-label="Ir para o dashboard">
          <span className="brand-mark" aria-hidden="true">✦</span>
          <span>GLP-1 Tracker</span>
        </Link>
        {navItems.map(([href, icon, label]) => (
          <Link key={href} href={href} aria-current={isActive(href) ? "page" : undefined}>
            <span aria-hidden="true">{icon}</span>{label}
          </Link>
        ))}
        <div className="user-area">
          <Link href="/onboarding" className="mobile-only" aria-label="Abrir perfil">Perfil</Link>
          <Link href="/onboarding" className="avatar" aria-label="Abrir perfil">{initials}</Link>
          <span className="user-name muted">Lucas</span>
          <button className="btn secondary" onClick={() => signOut({ callbackUrl: "/signin" })}>
            Sair
          </button>
        </div>
      </nav>
      <nav className="bottom-nav" aria-label="Navegação mobile">
        {navItems.slice(0, 5).map(([href, icon, label]) => (
          <Link key={href} href={href} aria-current={isActive(href) ? "page" : undefined}>
            <span aria-hidden="true">{icon}</span><span>{label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
