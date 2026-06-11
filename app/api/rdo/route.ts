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
    const {
      projectId,
      weatherCondition,
      temperature,
      humidity,
      workforce,
      equipment, // Array vindo do front com type, quantity, etc.
      activities,
      observations,
      issues,
      signatureBase64,
    } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: "ID da Obra (projectId) é obrigatório." },
        { status: 400 },
      );
    }

    const lastRDO = await prisma.rDO.findFirst({
      where: { projectId },
      orderBy: { number: "desc" },
    });
    const nextNumber = lastRDO ? lastRDO.number + 1 : 1;

    // 1. MAPEAMENTO SEGURO DE MÁQUINAS: Garante que os registros existam na tabela Equipment antes do uso
    const equipmentUsageTransactions = await Promise.all(
      equipment.map(async (eq: any) => {
        // Tenta encontrar o equipamento pelo nome nessa obra ou cria um na hora de forma dinâmica
        let dbEquipment = await prisma.equipment.findFirst({
          where: { name: eq.name, projectId },
        });

        if (!dbEquipment) {
          dbEquipment = await prisma.equipment.create({
            data: {
              name: eq.name,
              type: eq.type, // MOTORIZED ou MANUAL
              projectId,
            },
          });
        }

        // Retorna a estrutura correta de inserção do filho baseada no tipo
        const isMotorized = eq.type === "MOTORIZED";
        return {
          equipmentId: dbEquipment.id,
          horimeterStart: isMotorized ? parseFloat(eq.horimeterStart) : null,
          horimeterEnd: isMotorized ? parseFloat(eq.horimeterEnd) : null,
          hoursUsed: isMotorized
            ? parseFloat(eq.horimeterEnd) - parseFloat(eq.horimeterStart)
            : parseFloat(eq.hoursUsed),
          quantity: isMotorized ? 1 : parseInt(eq.quantity), // Campo novo do passo 1
          notes: isMotorized
            ? "Uso de Maquinário com Horímetro"
            : "Uso de Ferramenta Manual de Efetivo",
        };
      }),
    );

    // 2. CRIAÇÃO DO RDO COM AS TRANSAÇÕES RESOLVIDAS
    const newRDO = await prisma.rDO.create({
      data: {
        projectId,
        createdById: session.user.id,
        number: nextNumber,
        date: new Date(),
        status: signatureBase64 ? "SIGNED" : "DRAFT",

        weatherCondition: weatherCondition.toUpperCase(),
        temperature: temperature ? parseFloat(temperature) : null,
        humidity: humidity ? parseFloat(humidity) : null,

        activities,
        observations,
        issues,
        authorSignature: signatureBase64,

        workforce: {
          create: workforce.map((w: any) => ({
            category: w.category,
            quantity: parseInt(w.quantity),
          })),
        },
        equipmentUsage: {
          create: equipmentUsageTransactions, // Insere a lista mapeada de forma limpa e atômica
        },
      },
    });

    return NextResponse.json(
      { message: "RDO salvo com sucesso!", rdo: newRDO },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("[RDO_CREATE_ERROR]:", error);
    return NextResponse.json(
      { error: "Erro interno ao salvar o RDO." },
      { status: 500 },
    );
  }
}
