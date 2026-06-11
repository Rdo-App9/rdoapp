import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  // 1. Verifica quem está logado lendo o Cookie blindado do NextAuth
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userProjects = await prisma.project.findMany({
    where: {
      members: { some: { userId: session.user.id } },
      isActive: true, // Adicione esta linha para não carregar os excluídos!
    },
    select: {
      id: true,
      name: true,
      address: true,
      status: true, // Adicionado para sabermos se está arquivado
    },
  });

  // 3. Busca os últimos 3 RDOs criados por esse usuário
  const recentRdos = await prisma.rDO.findMany({
    where: { createdById: session.user.id },
    orderBy: { date: "desc" },
    take: 3,
    select: {
      number: true,
      date: true,
      status: true,
    },
  });

  // Se o usuário não tiver nenhuma obra, passamos um mock para não quebrar a tela de primeira
  const safeProjects =
    userProjects.length > 0
      ? userProjects
      : [
          {
            id: "mock-1",
            name: "Projeto Exemplo (Crie no banco)",
            address: "Seu canteiro virtual",
          },
        ];

  return (
    <DashboardClient
      user={session.user}
      projects={safeProjects}
      initialRdos={recentRdos}
    />
  );
}
