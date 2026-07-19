import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// POST /api/auth/register
// Cria um usuário. Corrige as falhas do app de referência: valida campos,
// impede e-mail duplicado e nunca devolve o hash da senha.
export async function POST(req: Request) {
  let body: {
    name?: string;
    email?: string;
    password?: string;
    sex?: "male" | "female" | "other";
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { name, email, password, sex } = body;

  if (!name || !email || !password || !sex) {
    return NextResponse.json(
      { error: "Campos obrigatórios: name, email, password, sex" },
      { status: 400 }
    );
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "A senha deve ter ao menos 8 caracteres" },
      { status: 400 }
    );
  }

  const normalizedEmail = email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email: normalizedEmail,
      hashedPassword,
      role: "user",
      profile: {
        create: {
          sex,
          birthDate: new Date("1990-01-01"), // placeholder — completado no onboarding
          heightCm: 170,
        },
      },
    },
    select: { id: true, name: true, email: true, role: true },
  });

  return NextResponse.json(user, { status: 201 });
}
