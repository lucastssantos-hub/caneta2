import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Sessão atual (ou null). */
export async function getSession() {
  return getServerSession(authOptions);
}

/** Usuário logado com o perfil, ou null. Use em Server Components e rotas. */
export async function getCurrentUser() {
  const session = await getSession();
  const email = session?.user?.email;
  if (!email) return null;

  return prisma.user.findUnique({
    where: { email },
    include: { profile: true },
  });
}
