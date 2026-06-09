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

  // Mock user data
  const user = {
    name: "João Silva",
    email: "joao.silva@construtech.com.br",
    role: "Engenheiro de Obra",
  };

  const currentProject = {
    name: "Edifício Aurora",
    code: "PRJ-2024-001",
  };

  // Ícones limpos (sem o prefixo bx-) e com opção de não usar ícones em tudo
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
      title: "Projeto",
      items: [
        {
          icon: "building",
          label: "Obra Atual",
          value: currentProject.name,
          action: () => router.push("/login"),
        },
        { icon: "hash", label: "Código", value: currentProject.code },
      ],
    },
    {
      title: "Sistema & Offline",
      items: [
        { icon: "bell", label: "Notificações", action: () => {} },
        {
          icon: "cloud-download",
          label: "Dados Offline",
          value: "128 MB",
          action: () => {},
        },
        {
          icon: "sync",
          label: "Sincronização",
          value: "Automática",
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

  return (
    <div className="flex-1 flex flex-col h-full bg-background relative">
      {/* Header Fixo Sóbrio */}
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

      {/* Main Content - pb-24 garante que a navegação global não cubra o botão de Sair */}
      <main className="flex-1 px-6 pt-6 pb-24 lg:pb-8 overflow-y-auto space-y-8">
        {/* Profile Card Minimalista */}
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
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {currentProject.name}
            </p>
          </div>
          <button className="p-2 text-muted-foreground hover:text-foreground active:scale-95 transition-transform">
            <BoxIcon name="pencil" size={20} />
          </button>
        </div>

        {/* Configurações em blocos discretos */}
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
                          name={item.icon as any} // Cast simples para contornar o TS nesta iteração
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

        {/* Logout Button Clean */}
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

      {/* Sheets de Confirmação (Corrigido para "open") */}
      <BottomSheet
        open={showLogoutSheet}
        onClose={() => setShowLogoutSheet(false)}
        title="Sair da Conta"
      >
        <div className="space-y-6 pb-6">
          <p className="text-sm text-muted-foreground text-center px-4">
            Tem certeza que deseja sair? Dados não sincronizados com a nuvem
            podem ser perdidos.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowLogoutSheet(false)}
              className="flex-1 h-12 rounded-md border border-input bg-transparent text-sm font-medium active:bg-secondary/50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => router.push("/login")}
              className="flex-1 h-12 rounded-md bg-destructive text-destructive-foreground text-sm font-medium active:scale-[0.98] transition-transform"
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
        <div className="space-y-6 pb-6">
          <p className="text-sm text-muted-foreground text-center px-4">
            Isso removerá todos os dados offline do seu aparelho. Você precisará
            baixar os projetos novamente quando tiver internet.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowClearCacheSheet(false)}
              className="flex-1 h-12 rounded-md border border-input bg-transparent text-sm font-medium active:bg-secondary/50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                // Lógica de limpar cache entraria aqui
                setShowClearCacheSheet(false);
              }}
              className="flex-1 h-12 rounded-md bg-destructive text-destructive-foreground text-sm font-medium active:scale-[0.98] transition-transform"
            >
              Limpar Dados
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
