// app/api/media/upload-url/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export async function POST(request: Request) {
  try {
    // 1. Validação de autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    // 2. Coleta dos dados do FormData enviados pelo celular
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const projectId = formData.get("projectId") as string | null;
    const rdoId = formData.get("rdoId") as string | null; // Opcional, pois pode vincular depois
    const category = (
      (formData.get("category") as string) || "GENERAL"
    ).toUpperCase();
    const description = formData.get("description") as string | null;
    const latitude = formData.get("latitude") as string | null;
    const longitude = formData.get("longitude") as string | null;

    if (!file || !projectId) {
      return NextResponse.json(
        { error: "O arquivo de imagem e o ID da Obra são obrigatórios." },
        { status: 400 },
      );
    }

    // 3. Preparação do arquivo para o Cloudflare R2
    const buffer = Buffer.from(await file.arrayBuffer());

    // Organiza o caminho exato dentro do bucket usando a categoria em minúsculo
    const folder = category.toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const key = `photos/${folder}/${uniqueSuffix}-${file.name}`;

    // 4. Despacha o arquivo binário para o Cloudflare R2
    await r2Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      }),
    );

    // Monta a URL pública final
    const publicUrl = `${R2_PUBLIC_URL}/${key}`;

    // 5. Registra os metadados na tabela Photo do banco de dados Neon
    const newPhoto = await prisma.photo.create({
      data: {
        filename: file.name,
        url: publicUrl,
        mimeType: file.type,
        size: file.size,
        category: category as any, // Mapeia diretamente com o Enum PhotoCategory
        description: description || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        projectId,
        rdoId: rdoId || null, // Se não for informado no ato, fica solto para vincular depois
        uploadedById: session.user.id,
      },
    });

    return NextResponse.json(
      { message: "Foto salva com sucesso!", photo: newPhoto },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("[PHOTOS_UPLOAD_ERROR]:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar o upload da imagem." },
      { status: 500 },
    );
  }
}
