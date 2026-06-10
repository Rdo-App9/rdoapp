"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { NetworkStatusIndicator } from "@/components/ui/network-status";

// Ícones Oficiais
import { ChevronLeft, Building, LocationCheck, EditAlt } from "@boxicons/react";

export default function NewProjectPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Estados do formulário da Obra
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Dispara os dados para a API
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, address, city, state, description }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ocorreu um erro ao criar a obra.");
      }

      // Atualiza o cache e volta pro Dashboard
      router.refresh();
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Erro ao criar a obra. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      {/* Header Fixo */}
      <header className="pt-safe sticky top-0 bg-background/80 backdrop-blur-lg border-b border-border z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl border border-input bg-transparent flex items-center justify-center active:bg-secondary/50 transition-colors"
          >
            <ChevronLeft pack="basic" width={24} height={24} />
          </button>
          <h1 className="text-base font-bold text-foreground">Nova Obra</h1>
          <NetworkStatusIndicator showLabel={false} />
        </div>
      </header>

      {/* Corpo do Formulário */}
      <main className="flex-1 px-6 py-6 pb-28">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            Cadastrar Projeto
          </h2>
          <p className="text-muted-foreground mt-1">
            Crie a pasta principal para começar a organizar os seus relatórios
            (RDOs).
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nome da Obra */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground ml-1 uppercase tracking-wider">
              Nome do Empreendimento / Obra
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                <Building pack="basic" width={20} height={20} />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-14 pl-12 pr-4 rounded-xl bg-secondary/30 border border-transparent focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary transition-all outline-none text-foreground placeholder:text-muted-foreground/60"
                placeholder="Ex: Residencial Aurora"
              />
            </div>
          </div>

          {/* Endereço Completo */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground ml-1 uppercase tracking-wider">
              Endereço da Obra
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                <LocationCheck pack="basic" width={20} height={20} />
              </div>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full h-14 pl-12 pr-4 rounded-xl bg-secondary/30 border border-transparent focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary transition-all outline-none text-foreground placeholder:text-muted-foreground/60"
                placeholder="Rua, Número, Bairro"
              />
            </div>
          </div>

          {/* Cidade e Estado (Lado a lado) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground ml-1 uppercase tracking-wider">
                Cidade
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full h-14 px-4 rounded-xl bg-secondary/30 border border-transparent focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary transition-all outline-none text-foreground placeholder:text-muted-foreground/60"
                placeholder="Ex: Aracaju"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground ml-1 uppercase tracking-wider">
                Estado (UF)
              </label>
              <input
                type="text"
                required
                maxLength={2}
                value={state}
                onChange={(e) => setState(e.target.value.toUpperCase())}
                className="w-full h-14 px-4 rounded-xl bg-secondary/30 border border-transparent focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary transition-all outline-none text-foreground placeholder:text-muted-foreground/60 uppercase"
                placeholder="SE"
              />
            </div>
          </div>

          {/* Descrição / Observação Opcional */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground ml-1 uppercase tracking-wider">
              Descrição (Opcional)
            </label>
            <div className="relative">
              <div className="absolute top-4 left-0 pl-4 flex items-start pointer-events-none text-muted-foreground">
                <EditAlt pack="basic" width={20} height={20} />
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full min-h-25 pl-12 pr-4 py-4 rounded-xl bg-secondary/30 border border-transparent focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary transition-all outline-none text-foreground placeholder:text-muted-foreground/60 resize-none"
                placeholder="Detalhes adicionais sobre o projeto..."
              />
            </div>
          </div>

          {/* Área de Botão Normalizada no Fluxo da Tela */}
          <div className="pt-4 mt-2 pb-8">
            <button
              type="submit"
              disabled={isLoading || !name || !address || !city || !state}
              className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-bold text-base flex items-center justify-center transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shadow-md shadow-primary/20"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Salvando Obra...
                </span>
              ) : (
                "Criar Obra"
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
