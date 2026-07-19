"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GeneratePlanButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function generate() {
    setLoading(true);
    setMsg("");
    const res = await fetch("/api/plan/save", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setMsg(data.error ?? "Falha ao gerar.");
      return;
    }
    router.refresh();
  }

  return (
    <div style={{ textAlign: "right" }}>
      <button className="btn success" onClick={generate} disabled={loading}>
        {loading ? "Gerando..." : "Gerar plano"}
      </button>
      {msg && <p className="error" style={{ margin: "6px 0 0" }}>{msg}</p>}
    </div>
  );
}
