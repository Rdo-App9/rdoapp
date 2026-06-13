import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email } = body;

    // Atualiza o usuário logado
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name || undefined,
        email: email || undefined,
      },
    });

    return NextResponse.json({
      message: "Perfil atualizado com sucesso",
      user: updatedUser,
    });
  } catch (error) {
    console.error("[USER_UPDATE_ERROR]", error);
    return NextResponse.json(
      { error: "Erro interno ao atualizar perfil" },
      { status: 500 },
    );
  }
}
