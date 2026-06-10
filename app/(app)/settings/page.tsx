"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BoxIcon } from "@/components/ui/box-icon";
import { cn } from "@/lib/utils";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { NetworkStatusIndicator } from "@/components/ui/network-status";

interface SettingItem {
  icon?: string;
  label: string;
  value?: string;
  action?: () => void;
  danger?: boolean;
}

interface SettingSection {
  title: string;
  items: SettingItem[];
}

export default function SettingsPage() {
  const router = useRouter();
  const [showLogoutSheet, setShowLogoutSheet] = useState(false);
  const [showClearCacheSheet, setShowClearCacheSheet] = useState(false);

  // Novos estados para a Gestão de Mídia
  const [showStorageSheet, setShowStorageSheet] = useState(false);
  const [storageMode, setStorageMode] = useState<"global" | "individual">(
    "global",
  );
  const [globalDays, setGlobalDays] = useState(90);

  // Mock user data
  const user = {
    name: "João Silva",
    email: "joao.silva@construtech.com.br",
    role: "Engenheiro de Obra",
  };

  // Mock projects data para a configuração individual
  const mockProjects = [
    { id: "1", name: "Edifício Aurora", days: 30 },
    { id: "2", name: "Condomínio Horizonte", days: 90 },
    { id: "3", name: "Galpão Logístico BR", days: 180 },
  ];

  const sections: SettingSection[] = [
    {
      title: "Conta",
      items: [
        { icon: "user", label: "Perfil", value: user.name, action: () => {} },
        { icon: "envelope", label: "E-mail", value: user.email },
        { icon: "id-card", label: "Função", value: user.role },
      ],
    },
    {
      title: "Sistema & Dados",
      items: [
        {
          icon: "cloud",
          label: "Armazenamento e Mídia",
          value: "90 dias",
          action: () => setShowStorageSheet(true),
        },
        {
          icon: "cloud-download",
          label: "Dados Offline",
          value: "128 MB",
          action: () => {},
        },
        {
          icon: "trash",
          label: "Limpar Cache",
          action: () => setShowClearCacheSheet(true),
          danger: true,
        },
      ],
    },
    {
      title: "Suporte",
      items: [
        { icon: "help-circle", label: "Central de Ajuda", action: () => {} },
        { icon: "bug", label: "Reportar Problema", action: () => {} },
        { icon: "info-circle", label: "Versão", value: "1.0.0" },
      ],
    },
  ];

  const retentionOptions = [
    { value: 30, label: "30 dias" },
    { value: 60, label: "60 dias" },
    { value: 90, label: "90 dias" },
    { value: 180, label: "6 meses" },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-background relative">
      <header className="pt-safe sticky top-0 bg-background border-b border-border z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-10 h-10 rounded-md border border-input bg-transparent flex items-center justify-center active:bg-secondary/50 transition-colors"
          >
            <BoxIcon name="chevron-left" size={24} />
          </button>
          <div className="text-center">
            <h1 className="text-base font-bold text-foreground">
              Configurações
            </h1>
          </div>
          <NetworkStatusIndicator showLabel={false} />
        </div>
      </header>

      <main className="flex-1 px-6 pt-6 pb-24 lg:pb-8 overflow-y-auto space-y-8">
        <div className="p-4 rounded-md border border-border bg-transparent flex items-center gap-4">
          <div className="w-12 h-12 rounded-md bg-secondary/30 flex items-center justify-center">
            <BoxIcon name="user" size={24} className="text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-foreground truncate">
              {user.name}
            </h2>
            <p className="text-sm text-muted-foreground truncate">
              {user.role}
            </p>
          </div>
          <button className="p-2 text-muted-foreground hover:text-foreground active:scale-95 transition-transform">
            <BoxIcon name="pencil" size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {sections.map((section) => (
            <section key={section.title}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {section.title}
              </h3>
              <div className="rounded-md border border-border bg-transparent divide-y divide-border">
                {section.items.map((item) => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    disabled={!item.action}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 bg-transparent transition-colors text-left",
                      item.action &&
                        "active:bg-secondary/50 hover:bg-accent/50",
                      !item.action && "cursor-default",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon && (
                        <BoxIcon
                          name={item.icon as any}
                          size={20}
                          className={
                            item.danger
                              ? "text-destructive"
                              : "text-muted-foreground"
                          }
                        />
                      )}
                      <span
                        className={cn(
                          "text-sm font-medium",
                          item.danger ? "text-destructive" : "text-foreground",
                        )}
                      >
                        {item.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.value && (
                        <span className="text-sm text-muted-foreground">
                          {item.value}
                        </span>
                      )}
                      {item.action && !item.danger && (
                        <BoxIcon
                          name="chevron-right"
                          size={20}
                          className="text-muted-foreground/50"
                        />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>

        <button
          onClick={() => setShowLogoutSheet(true)}
          className="w-full h-12 rounded-md border border-destructive/30 bg-transparent flex items-center justify-center gap-2 active:bg-destructive/10 transition-colors"
        >
          <BoxIcon name="log-out" size={20} className="text-destructive" />
          <span className="font-medium text-sm text-destructive">
            Sair da Conta
          </span>
        </button>
      </main>

      {/* ==================== BOTTOM SHEET: RETENÇÃO DE MÍDIA ==================== */}
      <BottomSheet
        open={showStorageSheet}
        onClose={() => setShowStorageSheet(false)}
        title="Limpeza de Mídia"
      >
        <div className="px-4 pb-6 space-y-6">
          <p className="text-sm text-muted-foreground text-center">
            Defina em quanto tempo as fotos e vídeos serão apagados
            automaticamente da nuvem para economizar espaço.
          </p>

          {/* Abas de Seleção */}
          <div className="flex p-1 bg-secondary/30 rounded-lg">
            <button
              onClick={() => setStorageMode("global")}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-md transition-all",
                storageMode === "global"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground",
              )}
            >
              Regra Global
            </button>
            <button
              onClick={() => setStorageMode("individual")}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-md transition-all",
                storageMode === "individual"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground",
              )}
            >
              Por Obra
            </button>
          </div>

          {/* Conteúdo: Regra Global */}
          {storageMode === "global" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-2 gap-3">
                {retentionOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setGlobalDays(opt.value)}
                    className={cn(
                      "h-12 rounded-md border text-sm font-medium transition-all active:scale-95",
                      globalDays === opt.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-transparent text-foreground",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  console.log("Salvar Global no Prisma:", globalDays);
                  setShowStorageSheet(false);
                }}
                className="w-full h-12 mt-4 rounded-md bg-primary text-primary-foreground font-bold active:scale-[0.98] transition-transform"
              >
                Aplicar a Todas as Obras
              </button>
            </div>
          )}

          {/* Conteúdo: Regra Individual */}
          {storageMode === "individual" && (
            <div className="space-y-3 animate-in fade-in slide-in-from-left-4 duration-300">
              {mockProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-3 rounded-md border border-border"
                >
                  <div className="flex items-center gap-3">
                    <BoxIcon
                      name="building"
                      size={20}
                      className="text-muted-foreground"
                    />
                    <span className="text-sm font-medium">{project.name}</span>
                  </div>
                  <select
                    className="bg-secondary/30 border-none text-sm font-medium rounded-md px-2 py-1 outline-none focus:ring-1 focus:ring-primary"
                    defaultValue={project.days}
                  >
                    <option value="30">30 dias</option>
                    <option value="60">60 dias</option>
                    <option value="90">90 dias</option>
                    <option value="180">6 meses</option>
                  </select>
                </div>
              ))}
              <button
                onClick={() => {
                  console.log("Salvar Individuais no Prisma");
                  setShowStorageSheet(false);
                }}
                className="w-full h-12 mt-4 rounded-md bg-primary text-primary-foreground font-bold active:scale-[0.98] transition-transform"
              >
                Salvar Regras
              </button>
            </div>
          )}
        </div>
      </BottomSheet>

      {/* Sheets Antigos (Logout / Cache) */}
      <BottomSheet
        open={showLogoutSheet}
        onClose={() => setShowLogoutSheet(false)}
        title="Sair da Conta"
      >
        <div className="space-y-6 pb-6 px-4">
          <p className="text-sm text-muted-foreground text-center">
            Tem certeza que deseja sair?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowLogoutSheet(false)}
              className="flex-1 h-12 rounded-md border border-input bg-transparent text-sm font-medium active:bg-secondary/50"
            >
              Cancelar
            </button>
            <button
              onClick={() => router.push("/login")}
              className="flex-1 h-12 rounded-md bg-destructive text-destructive-foreground text-sm font-medium active:scale-[0.98]"
            >
              Sair
            </button>
          </div>
        </div>
      </BottomSheet>

      <BottomSheet
        open={showClearCacheSheet}
        onClose={() => setShowClearCacheSheet(false)}
        title="Limpar Cache"
      >
        <div className="space-y-6 pb-6 px-4">
          <p className="text-sm text-muted-foreground text-center">
            Isso removerá todos os dados offline do seu aparelho.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowClearCacheSheet(false)}
              className="flex-1 h-12 rounded-md border border-input bg-transparent text-sm font-medium active:bg-secondary/50"
            >
              Cancelar
            </button>
            <button
              onClick={() => setShowClearCacheSheet(false)}
              className="flex-1 h-12 rounded-md bg-destructive text-destructive-foreground text-sm font-medium active:scale-[0.98]"
            >
              Limpar Dados
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
