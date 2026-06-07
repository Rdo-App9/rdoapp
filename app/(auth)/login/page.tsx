// Página de Login - Design minimalista iOS

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { BoxIcon, BoxiconsProvider } from "@/components/ui/box-icon";
import { LargeInput } from "@/components/ui/large-input";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (mode === "register") {
        if (password !== confirmPassword) {
          setError("As senhas não coincidem");
          return;
        }
        // Simular registro
        await new Promise((resolve) => setTimeout(resolve, 1000));
        router.push("/dashboard");
      } else if (mode === "login") {
        // Simular login
        await new Promise((resolve) => setTimeout(resolve, 1000));
        router.push("/dashboard");
      } else {
        // Simular recuperação de senha
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setMode("login");
        setError("");
        alert("E-mail de recuperação enviado!");
      }
    } catch {
      setError("Erro ao processar. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BoxiconsProvider>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Safe area top */}
        <div className="pt-safe" />

        {/* Header */}
        <header className="px-6 pt-12 pb-8"></header>

        {/* Form */}
        <main className="flex-1 px-6 pb-8">
          <div className="ios-card max-w-md mx-auto">
            {/* Título dinâmico */}
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-semibold text-foreground">
                {mode === "login" && "Entrar"}
                {mode === "register" && "Criar conta"}
                {mode === "forgot" && "Recuperar senha"}
              </h2>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-destructive/20 text-destructive flex items-center gap-2">
                <BoxIcon name="error-circle" size={20} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nome (apenas no cadastro) */}
              {mode === "register" && (
                <LargeInput
                  label="Nome completo"
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  icon={<BoxIcon name="user" size={22} />}
                />
              )}

              {/* Email */}
              <LargeInput
                label="E-mail"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                icon={<BoxIcon name="envelope" size={22} />}
              />

              {/* Senha */}
              {mode !== "forgot" && (
                <LargeInput
                  label="Senha"
                  type="password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={
                    mode === "register" ? "new-password" : "current-password"
                  }
                  icon={<BoxIcon name="lock-alt" size={22} />}
                />
              )}

              {/* Confirmar senha (apenas no cadastro) */}
              {mode === "register" && (
                <LargeInput
                  label="Confirmar senha"
                  type="password"
                  placeholder="Repita a senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  icon={<BoxIcon name="lock-alt" size={22} />}
                />
              )}

              {/* Esqueci a senha */}
              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot");
                    setError("");
                  }}
                  className="text-primary text-base font-medium hover:underline"
                >
                  Esqueceu a senha?
                </button>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "w-full min-h-14 rounded-2xl bg-primary text-primary-foreground",
                  "text-lg font-semibold mt-2",
                  "flex items-center justify-center gap-3",
                  "active:scale-[0.985] transition-all duration-200",
                  "disabled:opacity-50 disabled:pointer-events-none",
                )}
              >
                {isLoading ? (
                  <>Processando...</>
                ) : mode === "login" ? (
                  "Entrar"
                ) : mode === "register" ? (
                  "Criar conta"
                ) : (
                  "Enviar link de recuperação"
                )}
              </button>

              {/* Voltar para login (modo forgot) */}
              {mode === "forgot" && (
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                  className="w-full text-center text-muted-foreground text-base mt-2 hover:underline"
                >
                  Voltar para o login
                </button>
              )}
            </form>

            {/* Alternância entre Entrar e Cadastrar - Texto limpo */}
            {mode !== "forgot" && (
              <div className="text-center mt-8 text-sm">
                {mode === "login" ? (
                  <p className="text-muted-foreground">
                    Não tem uma conta?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode("register");
                        setError("");
                      }}
                      className="text-primary font-medium hover:underline"
                    >
                      Cadastrar
                    </button>
                  </p>
                ) : (
                  <p className="text-muted-foreground">
                    Já tem uma conta?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode("login");
                        setError("");
                      }}
                      className="text-primary font-medium hover:underline"
                    >
                      Entrar
                    </button>
                  </p>
                )}
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-4 pb-safe">
          <p className="text-muted-foreground text-center text-sm">
            Ao continuar, você concorda com os Termos de Uso e Política de
            Privacidade
          </p>
        </footer>
      </div>
    </BoxiconsProvider>
  );
}
