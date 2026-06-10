import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import RDOListClient from "./rdo-list-client";

export default async function RDOListPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Busca TODOS os RDOs que o usuário tem acesso (vinculados às obras dele)
  const rdos = await prisma.rDO.findMany({
    where: {
      project: {
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
    },
    orderBy: { date: "desc" },
    include: {
      workforce: true, // Para contar quantas pessoas trabalharam
    },
  });

  // Formata os dados para a interface
  const formattedRdos = rdos.map((rdo) => {
    // Calcula o total de pessoas na obra naquele dia
    const totalWorkforce = rdo.workforce.reduce(
      (acc, curr) => acc + curr.quantity,
      0,
    );

    return {
      id: rdo.id,
      number: rdo.number,
      date: rdo.date.toISOString(), // O frontend cuida da formatação visual
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
      syncStatus: rdo.syncedAt ? "synced" : "pending", // Lógica simples para o ícone de sincronização
    };
  });

  return <RDOListClient initialRdos={formattedRdos as any} />;
}
