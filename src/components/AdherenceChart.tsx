"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
  Cell,
} from "recharts";

export interface AdherencePoint {
  date: string;
  protein: number | null;
}

// Barras = proteína registrada por dia; linha = meta. Verde quando bateu a meta.
export default function AdherenceChart({
  data,
  target,
}: {
  data: AdherencePoint[];
  target: number | null;
}) {
  const hasData = data.some((d) => d.protein != null);
  if (!hasData) {
    return <p className="muted">Registre a proteína no check-in diário para ver a adesão.</p>;
  }

  return (
    <div style={{ width: "100%", height: 240 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: -16 }}>
          <CartesianGrid stroke="#2a313b" strokeDasharray="3 3" />
          <XAxis dataKey="date" stroke="#93a1b3" fontSize={12} />
          <YAxis stroke="#93a1b3" fontSize={12} />
          <Tooltip
            contentStyle={{ background: "#1a1f26", border: "1px solid #2a313b", borderRadius: 8 }}
            labelStyle={{ color: "#93a1b3" }}
            formatter={(v: number) => [`${v} g`, "Proteína"]}
          />
          {target ? (
            <ReferenceLine y={target} stroke="#3ddc97" strokeDasharray="4 4" label={{ value: `meta ${target}g`, fill: "#3ddc97", fontSize: 11, position: "insideTopRight" }} />
          ) : null}
          <Bar dataKey="protein" radius={[4, 4, 0, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={target && d.protein != null && d.protein >= target ? "#3ddc97" : "#6c8cff"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
