"use client";

import {
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

export interface HungerPoint {
  date: string;
  hunger: number | null;
  injection: number | null; // marcador (posição fixa) nos dias de aplicação
}

// Observacional: mostra a fome relatada (1-5) ao longo do tempo, com marcadores
// nos dias de aplicação. Serve para o usuário PERCEBER padrões — NÃO é base para
// ajustar dose (isso é decisão do médico).
export default function HungerChart({ data }: { data: HungerPoint[] }) {
  const hasData = data.some((d) => d.hunger != null);
  if (!hasData) {
    return <p className="muted">Registre a fome no check-in diário para ver a correlação.</p>;
  }

  return (
    <div style={{ width: "100%", height: 240 }}>
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: -16 }}>
          <CartesianGrid stroke="#2a313b" strokeDasharray="3 3" />
          <XAxis dataKey="date" stroke="#93a1b3" fontSize={12} />
          <YAxis domain={[0, 6]} ticks={[1, 2, 3, 4, 5]} stroke="#93a1b3" fontSize={12} />
          <Tooltip
            contentStyle={{ background: "#1a1f26", border: "1px solid #2a313b", borderRadius: 8 }}
            labelStyle={{ color: "#93a1b3" }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line
            name="Fome (1-5)"
            type="monotone"
            dataKey="hunger"
            stroke="#6c8cff"
            strokeWidth={2}
            connectNulls
            dot={{ r: 3 }}
          />
          <Scatter name="Aplicação de GLP-1" dataKey="injection" fill="#3ddc97" shape="triangle" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
