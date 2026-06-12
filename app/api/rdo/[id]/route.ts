import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const resolvedParams = await params;
    const rdoId = resolvedParams.id;

    // 1. Verifica se o RDO existe
    const rdo = await prisma.rDO.findUnique({
      where: { id: rdoId },
    });

    if (!rdo) {
      return NextResponse.json(
        { error: "RDO não encontrado." },
        { status: 404 },
      );
    }

    // 2. Apaga as tabelas filhas primeiro (Cascata Manual Segura)
    // Se não fizermos isso, o banco bloqueia a exclusão do RDO pai!
    await prisma.workforce.deleteMany({
      where: { rdoId: rdoId },
    });

    await prisma.equipmentUsage.deleteMany({
      where: { rdoId: rdoId },
    });

    // 3. Apaga o RDO pai
    await prisma.rDO.delete({
      where: { id: rdoId },
    });

    return NextResponse.json({ message: "RDO excluído com sucesso." });
  } catch (error: any) {
    console.error("[RDO_DELETE_ERROR]:", error);
    return NextResponse.json(
      { error: "Erro interno ao excluir o RDO." },
      { status: 500 },
    );
  }
}
