import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { prisma } from "@/lib/prisma";

// PATCH /api/plan/meal-item/[id]  { foodItemId?, quantityG? }
// Troca o alimento e/ou ajusta a quantidade de um item do plano.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  // Verifica que o item pertence a um plano do usuário logado.
  const item = await prisma.plannedMealItem.findUnique({
    where: { id },
    include: { plannedMeal: { include: { mealPlan: true } } },
  });
  if (!item || item.plannedMeal.mealPlan.userId !== user.id) {
    return NextResponse.json({ error: "Item não encontrado" }, { status: 404 });
  }

  const data: { foodItemId?: string; quantityG?: number } = {};
  if (body.foodItemId) {
    const food = await prisma.foodItem.findUnique({ where: { id: body.foodItemId } });
    if (!food) return NextResponse.json({ error: "Alimento inválido" }, { status: 400 });
    data.foodItemId = body.foodItemId;
  }
  if (body.quantityG != null) {
    const q = Number(body.quantityG);
    if (!q || q <= 0) return NextResponse.json({ error: "Quantidade inválida" }, { status: 400 });
    data.quantityG = q;
  }

  const updated = await prisma.plannedMealItem.update({ where: { id }, data });
  return NextResponse.json(updated);
}

// DELETE /api/plan/meal-item/[id] — remove o item do plano.
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  const item = await prisma.plannedMealItem.findUnique({
    where: { id },
    include: { plannedMeal: { include: { mealPlan: true } } },
  });
  if (!item || item.plannedMeal.mealPlan.userId !== user.id) {
    return NextResponse.json({ error: "Item não encontrado" }, { status: 404 });
  }

  await prisma.plannedMealItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
