"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { signIn } from "next-auth/react";

// Ícones corrigidos com os nomes exatos exportados pela biblioteca
import { Envelope, Lock, User, HardHat, CheckCircle } from "@boxicons/react";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Estados do Formulário
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      // ==========================================
      // FLUXO DE CADASTRO (Conectado à API Real)
      // ==========================================
      if (mode === "register") {
        if (password !== confirmPassword) {
          setError("As senhas digitadas não coincidem.");
          setIsLoading(false);
          return;
        }

        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Ocorreu um erro ao criar a conta.");
        }

        // Sucesso no cadastro!
        setSuccess("Conta criada com sucesso! Faça login para entrar.");
        setMode("login");
        setPassword("");
        setConfirmPassword("");
      }

      // ==========================================
      // FLUXO DE LOGIN (Conectado ao NextAuth)
      // ==========================================
      else if (mode === "login") {
        // Dispara o login oficial do NextAuth injetando no cookie
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false, // Impede o recarregamento bruto da página
        });

        if (result?.error) {
          throw new Error("E-mail ou senha inválidos.");
        }

        // Login com sucesso! Redireciona usando o router do Next.js
        router.push("/dashboard");
      } else {
        // Recuperação de senha
        await new Promise((resolve) => setTimeout(resolve, 800));
        setMode("login");
        setSuccess(
          "Se o e-mail existir, você receberá um link de recuperação.",
        );
      }
    } catch (err: any) {
      setError(err.message || "Erro de conexão. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center relative overflow-hidden">
      {/* Efeito visual de fundo borrado (Blob) para dar o toque Premium */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-secondary/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000" />

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 z-10">
        {/* Logo e Cabeçalho */}
        <div className="w-full max-w-md mb-8 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 shadow-sm border border-primary/20">
            <HardHat
              pack="basic"
              width={32}
              height={32}
              className="text-primary"
            />
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Rdo App
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">
            {mode === "login" && "Bem-vindo de volta ao canteiro"}
            {mode === "register" && "Crie sua conta de engenharia"}
            {mode === "forgot" && "Recupere seu acesso"}
          </p>
        </div>

        {/* Card do Formulário */}
        <div className="w-full max-w-md bg-card/80 backdrop-blur-xl border border-border/50 p-8 rounded-4xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          {/* Alertas Visuais de Erro/Sucesso */}
          {error && (
            <div className="mb-6 p-4 rounded-xl  flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <p className="text-sm font-medium text-destructive">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-xl bg-success/10 border border-success/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <CheckCircle
                pack="filled" // Corrigido de solid para filled
                width={24}
                height={24}
                className="text-success shrink-0"
              />
              <p className="text-sm font-medium text-success">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome (Apenas Cadastro) */}
            {mode === "register" && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground ml-1 uppercase tracking-wider">
                  Nome Completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                    <User pack="basic" width={20} height={20} />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-14 pl-12 pr-4 rounded-xl bg-secondary/30 border border-transparent focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary transition-all outline-none text-foreground placeholder:text-muted-foreground/60"
                    placeholder="João Engenheiro"
                  />
                </div>
              </div>
            )}

            {/* E-mail */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground ml-1 uppercase tracking-wider">
                E-mail Profissional
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                  <Envelope pack="basic" width={20} height={20} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 rounded-xl bg-secondary/30 border border-transparent focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary transition-all outline-none text-foreground placeholder:text-muted-foreground/60"
                  placeholder="seu@email.com.br"
                />
              </div>
            </div>

            {/* Senha */}
            {mode !== "forgot" && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground ml-1 uppercase tracking-wider">
                  Senha Segura
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                    <Lock pack="basic" width={20} height={20} />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-14 pl-12 pr-4 rounded-xl bg-secondary/30 border border-transparent focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary transition-all outline-none text-foreground placeholder:text-muted-foreground/60"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            {/* Confirmar Senha (Apenas Cadastro) */}
            {mode === "register" && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground ml-1 uppercase tracking-wider">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                    <Lock pack="basic" width={20} height={20} />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-14 pl-12 pr-4 rounded-xl bg-secondary/30 border border-transparent focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary transition-all outline-none text-foreground placeholder:text-muted-foreground/60"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            {/* Botão de Ação Principal */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 mt-6 rounded-xl bg-primary text-primary-foreground font-bold text-base flex items-center justify-center transition-all duration-200 active:scale-[0.98] disabled:opacity-70 shadow-md shadow-primary/20"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processando...
                </span>
              ) : mode === "login" ? (
                "Entrar no Sistema"
              ) : mode === "register" ? (
                "Criar Conta"
              ) : (
                "Enviar Link"
              )}
            </button>
          </form>

          {/* Links de Rodapé do Formulário */}
          <div className="mt-8 flex flex-col items-center gap-3 text-sm">
            {mode === "login" && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot");
                    setError("");
                    setSuccess("");
                  }}
                  className="text-muted-foreground hover:text-foreground font-medium transition-colors"
                >
                  Esqueci minha senha
                </button>
                <p className="text-muted-foreground">
                  Não tem uma conta?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("register");
                      setError("");
                      setSuccess("");
                    }}
                    className="text-primary font-bold hover:underline"
                  >
                    Cadastrar
                  </button>
                </p>
              </>
            )}

            {mode === "register" && (
              <p className="text-muted-foreground">
                Já possui acesso?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                    setSuccess("");
                  }}
                  className="text-primary font-bold hover:underline"
                >
                  Fazer Login
                </button>
              </p>
            )}

            {mode === "forgot" && (
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                  setSuccess("");
                }}
                className="text-muted-foreground hover:text-foreground font-medium transition-colors flex items-center gap-1"
              >
                Voltar para o login
              </button>
            )}
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-muted-foreground/60 z-10">
        &copy; {new Date().getFullYear()} RDO App. Gestão de Canteiro.
      </footer>
    </div>
  );
}
