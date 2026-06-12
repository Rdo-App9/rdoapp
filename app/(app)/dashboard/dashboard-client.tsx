// app/(app)/dashboard/dashboard-client.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  NetworkStatusIndicator,
  NetworkStatusBar,
} from "@/components/ui/network-status";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { ProjectSelectorSheet } from "@/components/dashboard/project-selector-sheet";

// Importação dos ícones oficias
import {
  HardHat,
  Building,
  ChevronDown,
  AlarmExclamation,
  Check,
  Plus,
} from "@boxicons/react";

interface DashboardClientProps {
  user: any;
  projects: Array<{ id: string; name: string; address: string | null }>;
  initialRdos: Array<{ number: number; date: Date; status: string }>;
}

export default function DashboardClient({
  user,
  projects,
  initialRdos,
}: DashboardClientProps) {
  const router = useRouter();
  const [showProjectSheet, setShowProjectSheet] = useState(false);
  const [showEmergencyConfirm, setShowEmergencyConfirm] = useState(false);

  // Deteta se o projeto atual é o mock temporário ou se a lista está vazia
  const hasRealProjects =
    projects.length > 0 && !projects[0].id.startsWith("mock");
  const [selectedProject, setSelectedProject] = useState(projects[0]);

  const handleEmergency = async () => {
    setShowEmergencyConfirm(false);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          alert(
            `Emergência enviada!\nLat: ${latitude.toFixed(6)}\nLon: ${longitude.toFixed(6)}`,
          );
        },
        () => alert("Emergência enviada sem GPS."),
        { enableHighAccuracy: true, timeout: 10000 },
      );
    } else {
      alert("GPS não disponível. Emergência enviada.");
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background relative">
      <NetworkStatusBar />

      {/* Header Mobile */}
      <header className="lg:hidden pt-safe bg-card border-b border-border sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <HardHat
                pack="basic"
                width={22}
                height={22}
                className="text-primary"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Rdo App</h1>
              <p className="text-xs text-muted-foreground truncate max-w-37.5">
                Olá, {user?.name?.split(" ")[0] || "Engenheiro"}
              </p>
            </div>
          </div>
          <NetworkStatusIndicator showLabel={false} />
        </div>
      </header>

      {/* Seletor de Obras Inteligente */}
      <div className="px-6 py-4 lg:pt-8 lg:pb-6">
        {!hasRealProjects ? (
          // NOVO DESIGN DO CARD "NOVA OBRA": Minimalista e Elegante (Dashed Outline)
          <button
            type="button"
            onClick={() => router.push("/projects/new")}
            className="w-full p-6 rounded-2xl bg-secondary/10 border-2 border-dashed border-primary/30 flex flex-col items-center justify-center gap-3 active:scale-[0.98] active:bg-secondary/20 transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Plus pack="basic" width={28} height={28} />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">
                Criar Primeira Obra
              </p>
              <p className="text-sm text-muted-foreground">
                Cadastre um projeto para começar
              </p>
            </div>
          </button>
        ) : (
          // Card Normal de Seleção de Obra
          <button
            type="button"
            onClick={() => setShowProjectSheet(true)}
            className={cn(
              "w-full p-4 rounded-2xl bg-card border border-border hover:border-primary/40",
              "flex items-center justify-between active:scale-[0.98] transition-all shadow-sm",
            )}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-foreground">
                <Building pack="basic" width={24} height={24} />
              </div>
              <div className="text-left max-w-50">
                <p className="font-semibold text-foreground truncate">
                  {selectedProject.name}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {selectedProject.address || "Sem endereço cadastrado"}
                </p>
              </div>
            </div>
            <ChevronDown
              pack="basic"
              width={24}
              height={24}
              className="text-muted-foreground shrink-0"
            />
          </button>
        )}
      </div>

      <main className="flex-1 px-6 pb-24 lg:pb-8 overflow-y-auto">
        {/* Ações Rápidas */}
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Ações Rápidas
          </h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <button
              // O botão Novo RDO agora envia o ID da obra na URL!
              onClick={() =>
                router.push(`/rdo/new?projectId=${selectedProject.id}`)
              }
              disabled={!hasRealProjects}
              className="flex items-center justify-center h-12 px-4 rounded-md border border-input bg-transparent text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              Novo RDO
            </button>
            <button
              onClick={() => router.push("/camera")}
              disabled={!hasRealProjects}
              className="lg:hidden flex items-center justify-center h-12 px-4 rounded-md border border-input bg-transparent text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              Abrir Câmera
            </button>
            <button
              onClick={() => router.push("/bim")}
              disabled={!hasRealProjects}
              className="flex items-center justify-center h-12 px-4 rounded-md border border-input bg-transparent text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              Plantas BIM
            </button>
            <button
              onClick={() => router.push("/camera?mode=scan")}
              disabled={!hasRealProjects}
              className="lg:hidden flex items-center justify-center h-12 px-4 rounded-md border border-input bg-transparent text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              Escanear QR
            </button>
          </div>
        </section>

        {/* Emergência */}
        <section className="mb-8">
          <button
            type="button"
            onClick={() => setShowEmergencyConfirm(true)}
            disabled={!hasRealProjects}
            className="flex items-center justify-center h-12 px-4 rounded-md border border-destructive/50 bg-transparent text-sm font-medium text-destructive hover:bg-destructive/10 active:scale-[0.98] transition-all w-full disabled:opacity-50 disabled:pointer-events-none"
          >
            Acionar Emergência
          </button>
        </section>

        {/* RDOs Recentes */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              RDOs Recentes
            </h2>
            <button
              onClick={() =>
                router.push(`/rdo?projectId=${selectedProject.id}`)
              }
              disabled={!hasRealProjects}
              className="text-primary hover:underline text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              Ver todos
            </button>
          </div>
          <div className="space-y-3">
            {!hasRealProjects ? (
              <div className="text-center py-8 bg-secondary/10 rounded-xl border border-border">
                <Building
                  pack="basic"
                  width={32}
                  height={32}
                  className="text-muted-foreground mx-auto mb-2 opacity-50"
                />
                <p className="text-sm text-muted-foreground">
                  Sua lista de RDOs aparecerá aqui.
                </p>
              </div>
            ) : initialRdos.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4 bg-secondary/20 rounded-lg">
                Você ainda não criou nenhum relatório nesta obra.
              </p>
            ) : (
              initialRdos.map((rdo) => (
                <button
                  key={rdo.number}
                  onClick={() => router.push(`/rdo/${rdo.number}`)}
                  className="w-full p-4 rounded-md border border-border bg-transparent flex items-center justify-between transition-all active:bg-secondary/50 active:scale-[0.99]"
                >
                  <div className="flex items-center gap-4 text-left">
                    <p className="font-medium text-foreground">
                      RDO #{rdo.number}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(rdo.date).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium border",
                      rdo.status === "DRAFT" &&
                        "border-warning/50 text-warning",
                      rdo.status === "SIGNED" &&
                        "border-primary/50 text-primary",
                      rdo.status === "APPROVED" &&
                        "border-success/50 text-success",
                    )}
                  >
                    {rdo.status}
                  </div>
                </button>
              ))
            )}
          </div>
        </section>
      </main>

      <ProjectSelectorSheet
        isOpen={showProjectSheet}
        onClose={() => setShowProjectSheet(false)}
        projects={projects} // Passei o array de projetos
        selectedProjectId={selectedProject.id}
        onSelectProject={setSelectedProject}
        onNewProject={() => router.push("/projects/new")}
      />

      <BottomSheet
        open={showEmergencyConfirm}
        onClose={() => setShowEmergencyConfirm(false)}
        title="Confirmar Emergência"
      >
        <div className="space-y-6 pb-6 px-4">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <AlarmExclamation
                pack="basic"
                width={40}
                height={40}
                className="text-destructive"
              />
            </div>
            <p className="text-lg font-medium text-foreground">
              Deseja enviar um alerta?
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Sua localização GPS será enviada para a central.
            </p>
          </div>
          <div className="space-y-3">
            <button
              onClick={handleEmergency}
              className="w-full h-14 rounded-xl bg-destructive text-destructive-foreground font-semibold flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <Check pack="basic" width={24} height={24} /> Enviar Alerta
            </button>
            <button
              onClick={() => setShowEmergencyConfirm(false)}
              className="w-full h-14 rounded-xl bg-secondary text-secondary-foreground font-medium active:scale-[0.98]"
            >
              Cancelar
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
