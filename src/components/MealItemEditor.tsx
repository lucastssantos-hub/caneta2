"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface FoodOption {
  id: string;
  name: string;
  isGlp1Friendly: boolean;
}

export interface MealItemData {
  id: string;
  foodItemId: string;
  quantityG: number;
}

export default function MealItemEditor({
  item,
  foods,
}: {
  item: MealItemData;
  foods: FoodOption[];
}) {
  const router = useRouter();
  const [foodItemId, setFoodItemId] = useState(item.foodItemId);
  const [qty, setQty] = useState(item.quantityG.toString());
  const [busy, setBusy] = useState(false);

  async function save(patch: object) {
    setBusy(true);
    await fetch(`/api/plan/meal-item/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setBusy(false);
    router.refresh();
  }

  async function remove() {
    setBusy(true);
    await fetch(`/api/plan/meal-item/${item.id}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
      <select
        value={foodItemId}
        disabled={busy}
        onChange={(e) => {
          setFoodItemId(e.target.value);
          save({ foodItemId: e.target.value });
        }}
        style={{ flex: 1 }}
      >
        {foods.map((f) => (
          <option key={f.id} value={f.id}>
            {f.isGlp1Friendly ? "★ " : ""}{f.name}
          </option>
        ))}
      </select>
      <input
        type="number"
        value={qty}
        disabled={busy}
        onChange={(e) => setQty(e.target.value)}
        onBlur={() => Number(qty) > 0 && save({ quantityG: Number(qty) })}
        style={{ width: 90 }}
      />
      <span className="muted" style={{ fontSize: 13 }}>g</span>
      <button className="btn secondary" disabled={busy} onClick={remove} title="Remover">✕</button>
    </div>
  );
}
