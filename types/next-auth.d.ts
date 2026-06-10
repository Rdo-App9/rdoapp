import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  // Turbina a sessão para incluir o ID e o Cargo do usuário
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  // Turbina o objeto de Usuário
  interface User {
    id: string;
    role: string;
  }
}

declare module "next-auth/jwt" {
  // Turbina o Token JWT interno
  interface JWT {
    id: string;
    role: string;
  }
}
