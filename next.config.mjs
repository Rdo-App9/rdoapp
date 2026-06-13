import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // Desativa no ambiente de dev para não atrapalhar com cache antigo
  register: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Permite carregar fotos de qualquer domínio seguro (Cloudflare R2)
      },
    ],
  },
  // CORREÇÃO DO ERRO: Silencia o aviso estrito do Next.js 16 permitindo o build com o plugin de PWA
  turbopack: {},
};

export default withPWA(nextConfig);
