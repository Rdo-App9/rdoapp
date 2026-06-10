import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/lib/r2";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      filename,
      contentType,
      category = "general",
      projectId = "global",
    } = body;

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: "Nome do arquivo e tipo de conteúdo são obrigatórios." },
        { status: 400 },
      );
    }

    // Pega a extensão do arquivo (ex: .jpg, .png, .mp4)
    const extension = filename.split(".").pop();

    // Gera um nome único e seguro para o arquivo não sobrescrever outro
    const uniqueId = uuidv4();
    const safeFilename = `${uniqueId}.${extension}`;

    // Monta o caminho exato onde o arquivo vai morar no Cloudflare R2
    // Exemplo: photos/progress/prj-123/456abc.jpg
    let folder = "photos";
    if (contentType.startsWith("video/")) {
      folder = "videos";
    }

    const fileKey = `${folder}/${category}/${projectId}/${safeFilename}`;

    // Prepara o comando de upload
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: fileKey,
      ContentType: contentType,
    });

    // Gera o link assinado que expira em 60 segundos (segurança máxima)
    const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 60 });

    // A URL pública que o frontend vai salvar no banco (Neon) para exibir a foto depois
    const publicUrl = `${R2_PUBLIC_URL}/${fileKey}`;

    return NextResponse.json({
      uploadUrl: signedUrl,
      publicUrl: publicUrl,
      fileKey: fileKey,
    });
  } catch (error) {
    console.error("[Upload API Error]:", error);
    return NextResponse.json(
      { error: "Erro interno ao gerar o link de upload." },
      { status: 500 },
    );
  }
}
