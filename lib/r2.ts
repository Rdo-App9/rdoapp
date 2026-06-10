import { S3Client } from "@aws-sdk/client-s3";

// Resgata as variáveis de ambiente com segurança
const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

// Trava de segurança: Se esquecermos de colocar as chaves na Vercel,
// o app avisa o erro de forma clara no log em vez de falhar silenciosamente.
if (!accountId || !accessKeyId || !secretAccessKey) {
  throw new Error("Faltam as credenciais do Cloudflare R2 no arquivo .env");
}

// Instancia e exporta o cliente da AWS configurado para apontar para o Cloudflare
export const r2Client = new S3Client({
  region: "auto", // O Cloudflare R2 gerencia a região automaticamente
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME!;
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL!;
