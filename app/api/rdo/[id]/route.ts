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
// ==========================================
// ROTA PUT: ATUALIZAR O RDO (OPÇÃO RÁPIDA)
// ==========================================
export async function PUT(
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

    const {
      weatherCondition,
      temperature,
      humidity,
      workforce = [],
      equipment = [],
      activities,
      observations,
      issues,
    } = body;

    // 1. Busca o RDO para pegar o projectId (necessário para checar equipamentos)
    const rdo = await prisma.rDO.findUnique({ where: { id: rdoId } });
    if (!rdo) {
      return NextResponse.json(
        { error: "RDO não encontrado." },
        { status: 404 },
      );
    }

    // 2. Processa os Equipamentos (cadastra os novos na obra, se houver)
    const equipmentUsageTransactions = await Promise.all(
      equipment.map(async (eq: any) => {
        let dbEquipment = await prisma.equipment.findFirst({
          where: { name: eq.name, projectId: rdo.projectId },
        });

        if (!dbEquipment) {
          dbEquipment = await prisma.equipment.create({
            data: {
              name: eq.name,
              type: eq.type || "MOTORIZED",
              projectId: rdo.projectId,
            },
          });
        }

        const isMotorized = eq.type === "MOTORIZED";
        return {
          equipmentId: dbEquipment.id,
          horimeterStart: isMotorized
            ? parseFloat(eq.horimeterStart || 0)
            : null,
          horimeterEnd: isMotorized ? parseFloat(eq.horimeterEnd || 0) : null,
          hoursUsed: isMotorized
            ? parseFloat(eq.horimeterEnd || 0) -
              parseFloat(eq.horimeterStart || 0)
            : parseFloat(eq.hoursUsed || 8),
          quantity: isMotorized ? 1 : parseInt(eq.quantity || 1),
          notes: isMotorized ? "Uso de Maquinário" : "Ferramenta Manual",
        };
      }),
    );

    // 3. Executa a atualização completa e segura no Banco (Transação)
    await prisma.$transaction([
      // Limpa as listas antigas
      prisma.workforce.deleteMany({ where: { rdoId } }),
      prisma.equipmentUsage.deleteMany({ where: { rdoId } }),

      // Salva os dados atualizados e recria as listas
      prisma.rDO.update({
        where: { id: rdoId },
        data: {
          weatherCondition: weatherCondition?.toUpperCase(),
          temperature: temperature ? parseFloat(temperature) : null,
          humidity: humidity ? parseFloat(humidity) : null,
          activities,
          observations,
          issues,
          workforce: {
            create: workforce.map((w: any) => ({
              category: w.category,
              quantity: parseInt(w.quantity || 1),
            })),
          },
          equipmentUsage: {
            createMany: { data: equipmentUsageTransactions },
          },
        },
      }),
    ]);

    return NextResponse.json({ message: "RDO atualizado com sucesso." });
  } catch (error: any) {
    console.error("[RDO_UPDATE_ERROR]:", error);
    return NextResponse.json(
      { error: "Erro interno ao atualizar o RDO." },
      { status: 500 },
    );
  }
}
