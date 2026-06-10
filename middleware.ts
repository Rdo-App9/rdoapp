// middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

// Configura quais rotas precisam de login obrigatório para abrir
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/rdo/:path*",
    "/camera/:path*",
    "/settings/:path*",
  ],
};
