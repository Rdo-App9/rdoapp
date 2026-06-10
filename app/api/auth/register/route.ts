import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Nome, e-mail e senha são obrigatórios." },
        { status: 400 },
      );
    }

    // REGRA DE OURO: Bloqueio máximo de 3 contas
    const totalUsers = await prisma.user.count();

    if (totalUsers >= 3) {
      return NextResponse.json(
        { error: "Limite máximo de contas atingido. O registro está fechado." },
        { status: 403 }, // 403 = Forbidden (Proibido)
      );
    }

    // Verifica se o e-mail já existe no banco
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Este e-mail já está em uso." },
        { status: 400 },
      );
    }

    // Criptografa a senha antes de salvar no banco
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Cria o usuário definindo o primeiro como ADMIN e os próximos como ENGINEER
    const userRole = totalUsers === 0 ? "ADMIN" : "ENGINEER";

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        role: userRole,
      },
      // Retorna apenas os dados seguros (nunca a senha)
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "Conta criada com sucesso!",
        user: newUser,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[REGISTER_ERROR]:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 },
    );
  }
}
