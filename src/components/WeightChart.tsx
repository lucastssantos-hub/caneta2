"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

export interface WeightPoint {
  date: string; // rótulo (dd/mm)
  weight: number;
}

export default function WeightChart({
  data,
  target,
}: {
  data: WeightPoint[];
  target?: number | null;
}) {
  if (data.length < 2) {
    return <p className="muted">Registre ao menos 2 pesagens para ver o gráfico.</p>;
  }

  return (
    <div style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: -16 }}>
          <CartesianGrid stroke="#2a313b" strokeDasharray="3 3" />
          <XAxis dataKey="date" stroke="#93a1b3" fontSize={12} />
          <YAxis stroke="#93a1b3" fontSize={12} domain={["dataMin - 2", "dataMax + 2"]} />
          <Tooltip
            contentStyle={{ background: "#1a1f26", border: "1px solid #2a313b", borderRadius: 8 }}
            labelStyle={{ color: "#93a1b3" }}
            formatter={(v: number) => [`${v} kg`, "Peso"]}
          />
          {target ? (
            <ReferenceLine y={target} stroke="#3ddc97" strokeDasharray="4 4" label={{ value: "meta", fill: "#3ddc97", fontSize: 11 }} />
          ) : null}
          <Line type="monotone" dataKey="weight" stroke="#6c8cff" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
