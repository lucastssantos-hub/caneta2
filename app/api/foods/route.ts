import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { prisma } from "@/lib/prisma";

// GET /api/foods — catálogo de alimentos (para o seletor de troca).
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const foods = await prisma.foodItem.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, proteinG: true, calories: true, isGlp1Friendly: true },
  });
  return NextResponse.json(foods);
}
