import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const body = await request.json();

    // LOG 1: O QUE CHEGOU DO FRONTEND?
    console.log("=========================================");
    console.log("[RDO API] Dados recebidos do formulário:");
    console.log("GPS recebido:", body.latitude, body.longitude);
    console.log("Equipamentos recebidos:", body.equipment);
    console.log("=========================================");

    const {
      projectId,
      weatherCondition,
      temperature,
      humidity,
      latitude, // <-- RECEBENDO A LATITUDE
      longitude, // <-- RECEBENDO A LONGITUDE
      workforce = [],
      equipment = [], // Array de equipamentos
      activities,
      observations,
      issues,
      signatureBase64,
    } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: "ID da Obra é obrigatório." },
        { status: 400 },
      );
    }

    const lastRDO = await prisma.rDO.findFirst({
      where: { projectId },
      orderBy: { number: "desc" },
    });
    const nextNumber = lastRDO ? lastRDO.number + 1 : 1;

    // 1. PROCESSAR OS EQUIPAMENTOS (Salvar na Tabela Mestra se for novo)
    const equipmentUsageTransactions = await Promise.all(
      equipment.map(async (eq: any) => {
        // Tenta achar a máquina no inventário da obra
        let dbEquipment = await prisma.equipment.findFirst({
          where: { name: eq.name, projectId },
        });

        // Se não achar, cria ela no banco agora mesmo
        if (!dbEquipment) {
          dbEquipment = await prisma.equipment.create({
            data: {
              name: eq.name,
              type: eq.type || "MOTORIZED",
              projectId,
            },
          });
          console.log(
            `[RDO API] Novo equipamento criado no inventário: ${dbEquipment.name}`,
          );
        }

        const isMotorized = eq.type === "MOTORIZED";

        // Monta o objeto exato que vai pra tabela EquipmentUsage
        return {
          equipmentId: dbEquipment.id, // Forçando o ID da máquina
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

    // LOG 2: O QUE VAI PRO BANCO?
    console.log("[RDO API] Lista processada para salvar no RDO:");
    console.log(equipmentUsageTransactions);

    // 2. SALVAR O RDO COM TUDO DENTRO
    const rdoData: any = {
      projectId,
      createdById: session.user.id,
      number: nextNumber,
      date: new Date(),
      status: signatureBase64 ? "SIGNED" : "DRAFT",
      weatherCondition: weatherCondition?.toUpperCase() || "SUNNY",
      temperature: temperature ? parseFloat(temperature) : null,
      humidity: humidity ? parseFloat(humidity) : null,
      latitude: latitude ? parseFloat(latitude) : null, // <-- SALVANDO NO BANCO
      longitude: longitude ? parseFloat(longitude) : null, // <-- SALVANDO NO BANCO
      activities,
      observations,
      issues,
      authorSignature: signatureBase64,
    };

    if (workforce.length > 0) {
      rdoData.workforce = {
        create: workforce.map((w: any) => ({
          category: w.category,
          quantity: parseInt(w.quantity || 1),
        })),
      };
    }

    if (equipmentUsageTransactions.length > 0) {
      rdoData.equipmentUsage = {
        createMany: {
          data: equipmentUsageTransactions,
        },
      };
    }

    const newRDO = await prisma.rDO.create({
      data: rdoData,
    });

    console.log(`[RDO API] RDO #${newRDO.number} criado com sucesso!`);

    return NextResponse.json(
      { message: "RDO salvo com sucesso!", rdo: newRDO },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("=========================================");
    console.error("[RDO_CREATE_ERROR] FALHA AO SALVAR O RDO:");
    console.error(error);
    console.error("=========================================");
    return NextResponse.json(
      { error: "Erro interno ao salvar o RDO." },
      { status: 500 },
    );
  }
}
// ==========================================
// ROTA GET: BUSCAR RDOs DE UMA OBRA
// ==========================================
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    // Pega o projectId da URL (ex: /api/rdo?projectId=123)
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "ID da Obra não informado." },
        { status: 400 },
      );
    }

    // Busca os RDOs mais recentes desta obra para listar no app
    const rdos = await prisma.rDO.findMany({
      where: { projectId },
      orderBy: { number: "desc" }, // Do mais novo para o mais velho
      take: 10, // Traz os últimos 10 por segurança
      select: {
        id: true,
        number: true,
        date: true,
      },
    });

    return NextResponse.json(rdos, { status: 200 });
  } catch (error: any) {
    console.error("[RDO_GET_ERROR]:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar a lista de RDOs." },
      { status: 500 },
    );
  }
}
