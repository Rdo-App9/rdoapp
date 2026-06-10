import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    // 1. Segurança: Verifica se a pessoa realmente está logada
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado. Faça login para continuar." },
        { status: 401 },
      );
    }

    // 2. Extrai os dados que o formulário do Frontend enviou
    const body = await request.json();
    const { name, address, city, state, description } = body;

    // 3. Validação básica de dados
    if (!name || !address || !city || !state) {
      return NextResponse.json(
        { error: "Preencha todos os campos obrigatórios." },
        { status: 400 },
      );
    }

    // 4. Busca o usuário no banco para checar o vínculo empresarial
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { company: true },
    });

    let companyId = user?.companyId;

    // 5. A Mágica da UX: Se não tiver empresa, cria uma baseada no nome dele
    if (!companyId) {
      const newCompany = await prisma.company.create({
        data: {
          name: `Construtora - ${session.user.name || "Engenharia"}`,
          // Usamos um timestamp provisório para passar pela regra @unique do CNPJ
          cnpj: `GERADO-${Date.now()}`,
          users: {
            connect: { id: session.user.id },
          },
        },
      });
      companyId = newCompany.id;
    }

    // 6. Finalmente, cria a Obra no Prisma e já define o usuário logado como DONO (OWNER) dela
    const newProject = await prisma.project.create({
      data: {
        name,
        address,
        city,
        state,
        description,
        companyId: companyId!,
        members: {
          create: {
            userId: session.user.id,
            role: "OWNER",
          },
        },
      },
    });

    return NextResponse.json(
      { message: "Obra criada com sucesso", project: newProject },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("[PROJECT_CREATE_ERROR]:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor ao tentar criar a obra." },
      { status: 500 },
    );
  }
}
