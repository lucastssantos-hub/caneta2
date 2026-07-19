"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface ExerciseOption {
  id: string;
  name: string;
  muscleGroup: string;
}

export interface ExerciseItemData {
  id: string;
  exerciseId: string;
  sets: number;
  reps: number;
}

export default function ExerciseEditor({
  item,
  exercises,
}: {
  item: ExerciseItemData;
  exercises: ExerciseOption[];
}) {
  const router = useRouter();
  const [exerciseId, setExerciseId] = useState(item.exerciseId);
  const [busy, setBusy] = useState(false);

  async function save(patch: object) {
    setBusy(true);
    await fetch(`/api/plan/workout-exercise/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
      <select
        value={exerciseId}
        disabled={busy}
        onChange={(e) => {
          setExerciseId(e.target.value);
          save({ exerciseId: e.target.value });
        }}
        style={{ flex: 1 }}
      >
        {exercises.map((ex) => (
          <option key={ex.id} value={ex.id}>{ex.name}</option>
        ))}
      </select>
      <span className="muted" style={{ fontSize: 13, whiteSpace: "nowrap" }}>
        {item.sets}×{item.reps}
      </span>
    </div>
  );
}
