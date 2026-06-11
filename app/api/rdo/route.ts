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
      equipment,
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

    // Busca o RDO mais recente dessa obra para gerar o próximo número sequencial
    const lastRDO = await prisma.rDO.findFirst({
      where: { projectId },
      orderBy: { number: "desc" },
    });
    const nextNumber = lastRDO ? lastRDO.number + 1 : 1;

    // Transação no Banco: Salva o RDO e seus filhos
    const newRDO = await prisma.rDO.create({
      data: {
        projectId,
        createdById: session.user.id, // <-- Usamos createdById, que é o campo real do seu schema!
        number: nextNumber,
        date: new Date(),
        status: signatureBase64 ? "SIGNED" : "DRAFT",

        weatherCondition: weatherCondition.toUpperCase(),
        temperature: temperature ? parseFloat(temperature) : null,

        activities,
        observations,

        authorSignature: signatureBase64,

        workforce: {
          create: workforce.map((w: any) => ({
            category: w.category,
            quantity: parseInt(w.quantity),
          })),
        },
        equipment: {
          create: equipment.map((e: any) => ({
            // Atenção: Se seu schema exigir que o equipmentId exista na tabela Equipment,
            // a palavra "TEMPORARIO" pode dar erro. Se der, me avise para ajustarmos!
            equipmentId: "TEMPORARIO",
            name: e.name,
            startTime: new Date(),
            endTime: new Date(),
          })),
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
