import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { computeReminders } from "@/lib/reminders";

// GET /api/reminders — o que precisa de atenção hoje (aplicação, pesagem).
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const state = await computeReminders(user.id);
  return NextResponse.json(state);
}
