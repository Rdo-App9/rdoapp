import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import RDOListClient from "./rdo-list-client";

interface PageProps {
  searchParams: Promise<{ projectId?: string }>;
}

export default async function RDOListPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const resolvedParams = await searchParams;
  let projectId = resolvedParams.projectId;

  // 1. INTELIGÊNCIA: Se a URL não tem ID (ex: clicou no menu inferior),
  // pegamos a primeira obra em que o usuário está cadastrado como membro!
  if (!projectId) {
    const firstProject = await prisma.project.findFirst({
      where: {
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
    });

    if (!firstProject) {
      // Se não faz parte de nenhuma obra, volta pro painel.
      redirect("/dashboard");
    }

    projectId = firstProject.id;
  }

  // 2. SEGURANÇA CORRIGIDA: Verifica se ele realmente é membro da obra solicitada
  const projectAccess = await prisma.project.findFirst({
    where: {
      id: projectId,
      members: {
        some: {
          userId: session.user.id,
        },
      },
    },
  });

  if (!projectAccess) {
    // Tentou acessar obra de outro usuário
    redirect("/dashboard");
  }

  // 3. Busca SOMENTE os RDOs desta obra validada
  const rdos = await prisma.rDO.findMany({
    where: { projectId: projectId },
    orderBy: { date: "desc" },
    include: {
      workforce: true,
    },
  });

  // 4. Formata os dados para o Client
  const formattedRdos = rdos.map((rdo) => {
    const totalWorkforce = rdo.workforce.reduce(
      (acc, curr) => acc + curr.quantity,
      0,
    );

    return {
      id: rdo.id,
      number: rdo.number,
      date: rdo.date.toISOString(),
      status: rdo.status.toLowerCase() as
        | "draft"
        | "signed"
        | "approved"
        | "rejected"
        | "pending_signature",
      weather: rdo.weatherCondition
        ? rdo.weatherCondition.replace("_", " ")
        : "Não informado",
      workforce: totalWorkforce,
      syncStatus: (rdo.syncedAt ? "synced" : "pending") as
        | "synced"
        | "pending"
        | "error",
    };
  });

  return <RDOListClient initialRdos={formattedRdos} projectId={projectId} />;
}
