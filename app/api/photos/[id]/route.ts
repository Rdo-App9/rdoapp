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
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const resolvedParams = await params;
    const photoId = resolvedParams.id;

    // Deleta a foto do banco de dados (o Prisma cuida de desvincular do RDO automaticamente se for o caso)
    await prisma.photo.delete({
      where: { id: photoId },
    });

    return NextResponse.json({ message: "Foto excluída com sucesso" });
  } catch (error) {
    console.error("[DELETE_PHOTO_ERROR]", error);
    return NextResponse.json(
      { error: "Erro ao excluir a foto" },
      { status: 500 },
    );
  }
}
