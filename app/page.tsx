import { redirect } from "next/navigation"

export default function Home() {
  // Redireciona para a tela de login
  // Em produção, verificar autenticação e redirecionar para dashboard se logado
  redirect("/login")
}
