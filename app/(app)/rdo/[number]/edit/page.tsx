import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import EditRdoClient from "./edit-client";

interface EditRdoPageProps {
  params: Promise<{ number: string }>;
}

export default async function EditRdoPage({ params }: EditRdoPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const resolvedParams = await params;
  const rdoNumber = parseInt(resolvedParams.number);

  if (isNaN(rdoNumber)) {
    redirect("/rdo");
  }

  // Busca o RDO completo com mão de obra e equipamentos
  const rdo = await prisma.rDO.findFirst({
    where: {
      number: rdoNumber,
      project: {
        members: {
          some: { userId: session.user.id },
        },
      },
    },
    include: {
      workforce: true,
      equipmentUsage: {
        include: { equipment: true },
      },
    },
  });

  if (!rdo) {
    redirect("/rdo");
  }

  // Manda os dados para o formulário interativo no Cliente
  return <EditRdoClient rdo={rdo} />;
}
