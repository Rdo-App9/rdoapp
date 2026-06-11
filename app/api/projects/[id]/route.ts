import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// Rota para EDITAR ou ARQUIVAR o projeto
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }, // 1. O Next.js exige que params seja uma Promise
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();

    // 2. Resolve a Promise para obter o ID corretamente
    const resolvedParams = await params;
    const projectId = resolvedParams.id;

    // Atualiza o projeto no banco de dados
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...body,
      },
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error("[PROJECT_PATCH_ERROR]", error);
    return NextResponse.json(
      { error: "Erro ao atualizar a obra" },
      { status: 500 },
    );
  }
}

// Rota para EXCLUIR LOGICAMENTE o projeto (Soft Delete)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }, // 1. Promise aqui também
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // 2. Resolve a Promise
    const resolvedParams = await params;
    const projectId = resolvedParams.id;

    // Soft Delete: Apenas marcamos como inativo.
    await prisma.project.update({
      where: { id: projectId },
      data: { isActive: false },
    });

    return NextResponse.json({ message: "Obra ocultada com sucesso." });
  } catch (error) {
    console.error("[PROJECT_DELETE_ERROR]", error);
    return NextResponse.json(
      { error: "Erro ao excluir a obra" },
      { status: 500 },
    );
  }
}
