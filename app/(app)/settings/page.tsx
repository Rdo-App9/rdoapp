import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import SettingsClient from "./settings-client";

export default async function SettingsPage() {
  // 1. Valida se o usuário está logado
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  // 2. Busca os dados reais do usuário no banco Neon
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      role: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  // 3. Busca apenas as obras que este usuário tem acesso (para exibir na aba de Limpeza de Mídia)
  const projects = await prisma.project.findMany({
    where: {
      members: {
        some: { userId: session.user.id },
      },
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return <SettingsClient user={user} projects={projects} />;
}
