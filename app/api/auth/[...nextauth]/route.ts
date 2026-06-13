// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  // Como usamos Login por E-mail/Senha (Credentials), a estratégia de JWT é obrigatória e super segura
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // A sessão expira em 7 dias no celular do engenheiro
  },
  pages: {
    signIn: "/login", // Redireciona para a nossa tela de login premium caso não esteja logado
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("E-mail e senha são obrigatórios.");
        }

        // 1. Busca o usuário no Neon pelo e-mail
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        // 2. Se não achar ou a conta estiver desativada, bloqueia
        if (!user || !user.passwordHash || !user.isActive) {
          throw new Error("E-mail ou senha incorretos.");
        }

        // 3. Compara a senha digitada com o hash seguro do banco
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash,
        );

        if (!isPasswordValid) {
          throw new Error("E-mail ou senha incorretos.");
        }

        // 4. Retorna os dados que ficarão guardados no Cookie criptografado
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role, // Repassa o cargo (ADMIN ou ENGINEER) para o app saber o que ele pode ver
        };
      },
    }),
  ],
  callbacks: {
    // Injeta o ID e o Cargo do usuário dentro do Token JWT interno do NextAuth
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    // Repassa esses dados do token para a sessão do Frontend conseguir ler
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  // Chave secreta de criptografia dos cookies
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
