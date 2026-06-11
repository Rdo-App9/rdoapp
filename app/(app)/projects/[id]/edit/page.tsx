import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import EditProjectClient from "./edit-client";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>; // 1. O Next.js agora diz que params é uma Promise
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  // 2. Resolvemos a Promise para extrair o ID da URL com segurança
  const resolvedParams = await params;
  const projectId = resolvedParams.id;

  // 3. Busca a obra no banco de dados usando o ID validado
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  // Se a obra não existir ou já tiver sido excluída logicamente, joga pro painel
  if (!project || !project.isActive) {
    redirect("/dashboard");
  }

  // Converte o objeto do Prisma em um formato limpo para o cliente
  const serializableProject = {
    id: project.id,
    name: project.name,
    address: project.address,
    city: project.city,
    state: project.state,
    zipCode: project.zipCode || "",
    description: project.description || "",
    latitude: project.latitude,
    longitude: project.longitude,
  };

  return <EditProjectClient project={serializableProject} />;
}
