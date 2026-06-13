import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(
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
    const body = await request.json();
    const { photoIds } = body;

    if (!Array.isArray(photoIds) || photoIds.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma foto selecionada." },
        { status: 400 },
      );
    }

    // Atualiza todas as fotos selecionadas para terem este rdoId
    await prisma.photo.updateMany({
      where: {
        id: { in: photoIds },
      },
      data: {
        rdoId: rdoId,
      },
    });

    return NextResponse.json({ message: "Fotos vinculadas com sucesso!" });
  } catch (error) {
    console.error("[LINK_PHOTOS_ERROR]:", error);
    return NextResponse.json(
      { error: "Erro interno ao vincular as fotos." },
      { status: 500 },
    );
  }
}
