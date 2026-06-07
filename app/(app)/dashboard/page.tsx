"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { BoxIcon } from "@/components/ui/box-icon";
import { ActionButton } from "@/components/ui/action-button";
import {
  NetworkStatusIndicator,
  NetworkStatusBar,
} from "@/components/ui/network-status";
import { BottomSheet, BottomSheetOption } from "@/components/ui/bottom-sheet";

export default function DashboardPage() {
  const router = useRouter();
  const [showProjectSheet, setShowProjectSheet] = useState(false);
  const [showEmergencyConfirm, setShowEmergencyConfirm] = useState(false);
  const [selectedProject, setSelectedProject] = useState({
    id: "1",
    name: "Residencial Aurora",
    address: "Rua das Flores, 123 - São Paulo",
  });

  const projects = [
    {
      id: "1",
      name: "Residencial Aurora",
      address: "Rua das Flores, 123 - São Paulo",
    },
    {
      id: "2",
      name: "Comercial Plaza",
      address: "Av. Brasil, 456 - São Paulo",
    },
    { id: "3", name: "Industrial Tech", address: "Rod. Anhanguera, km 50" },
  ];

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
        () => {
          alert(
            "Não foi possível obter localização. Emergência enviada sem GPS.",
          );
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    } else {
      alert("GPS não disponível. Emergência enviada sem localização.");
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background relative">
      <NetworkStatusBar />

      {/* Header Mobile (Pode ser movido para o layout futuramente se for global) */}
      <header className="lg:hidden pt-safe bg-card border-b border-border sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BoxIcon name="hard-hat" size={22} className="text-primary" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Rdo App</h1>
          </div>
          <NetworkStatusIndicator showLabel={false} />
        </div>
      </header>

      {/* Projeto selecionado */}
      <div className="px-6 py-4 lg:pt-8 lg:pb-6">
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
              <BoxIcon name="building" size={24} />
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground">
                {selectedProject.name}
              </p>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {selectedProject.address}
              </p>
            </div>
          </div>
          <BoxIcon
            name="chevron-down"
            size={24}
            className="text-muted-foreground shrink-0"
          />
        </button>
      </div>

      {/* Main content - pb-24 garante que a bottom nav mobile não cubra conteúdo */}
      <main className="flex-1 px-6 pb-24 lg:pb-8 overflow-y-auto">
        {/* Ações Rápidas */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Ações Rápidas
          </h2>
          <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
            <ActionButton
              icon="clipboard"
              label="Novo RDO"
              variant="primary"
              size="lg"
              onClick={() => router.push("/rdo/new")}
            />

            <div className="lg:hidden">
              <ActionButton
                icon="camera"
                label="Câmera"
                size="lg"
                onClick={() => router.push("/camera")}
              />
            </div>

            <ActionButton
              icon="cube"
              label="Plantas BIM"
              size="lg"
              onClick={() => router.push("/bim")}
            />

            <div className="lg:hidden">
              <ActionButton
                icon="qr-scan"
                label="Scanner"
                size="lg"
                onClick={() => router.push("/camera?mode=scan")}
              />
            </div>
          </div>
        </section>

        {/* Botão de Emergência */}
        <section className="mb-8">
          <button
            type="button"
            onClick={() => setShowEmergencyConfirm(true)}
            className={cn(
              "w-full min-h-28 rounded-3xl bg-destructive hover:bg-destructive/90",
              "text-destructive-foreground flex flex-col items-center justify-center gap-2",
              "shadow-lg active:scale-[0.98] transition-all",
            )}
          >
            <div className="flex items-center gap-3 text-xl font-bold">
              <BoxIcon name="alarm-exclamation" size={32} />
              EMERGÊNCIA
            </div>
            <span className="text-sm font-medium opacity-90 px-4 text-center">
              Envia localização GPS para a segurança
            </span>
          </button>
        </section>

        {/* RDOs Recentes */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              RDOs Recentes
            </h2>
            <button
              onClick={() => router.push("/rdo")}
              className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
            >
              Ver todos
            </button>
          </div>
          <div className="space-y-3">
            {[
              { number: 45, date: "Hoje", status: "draft" },
              { number: 44, date: "Ontem", status: "signed" },
              { number: 43, date: "02/05/2026", status: "approved" },
            ].map((rdo) => (
              <button
                key={rdo.number}
                type="button"
                onClick={() => router.push(`/rdo/${rdo.number}`)}
                className={cn(
                  "w-full p-4 rounded-xl bg-card border border-border hover:border-primary/40",
                  "flex items-center justify-between active:scale-[0.98] transition-all shadow-sm",
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center text-foreground">
                    <span className="text-base font-bold">#{rdo.number}</span>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">
                      RDO #{rdo.number}
                    </p>
                    <p className="text-sm text-muted-foreground">{rdo.date}</p>
                  </div>
                </div>
                <div
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-semibold",
                    rdo.status === "draft" && "bg-warning/15 text-warning",
                    rdo.status === "signed" && "bg-primary/15 text-primary",
                    rdo.status === "approved" && "bg-success/15 text-success",
                  )}
                >
                  {rdo.status === "draft" && "Rascunho"}
                  {rdo.status === "signed" && "Assinado"}
                  {rdo.status === "approved" && "Aprovado"}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Clima */}
        <section className="p-4 rounded-2xl bg-card border border-border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center">
              <BoxIcon name="sun" size={26} className="text-warning" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">28°C - Ensolarado</p>
              <p className="text-sm text-muted-foreground">
                Umidade 65% • Vento 12 km/h
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Sheets */}
      <BottomSheet
        open={showProjectSheet}
        onClose={() => setShowProjectSheet(false)}
        title="Selecionar Obra"
      >
        <div className="space-y-2 pb-6">
          {projects.map((project) => (
            <BottomSheetOption
              key={project.id}
              label={project.name}
              description={project.address}
              icon={<BoxIcon name="building" size={24} />}
              selected={selectedProject.id === project.id}
              onClick={() => {
                setSelectedProject(project);
                setShowProjectSheet(false);
              }}
            />
          ))}
        </div>
      </BottomSheet>

      <BottomSheet
        open={showEmergencyConfirm}
        onClose={() => setShowEmergencyConfirm(false)}
        title="Confirmar Emergência"
      >
        <div className="space-y-6 pb-6">
          <div className="text-center px-4">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <BoxIcon
                name="alarm-exclamation"
                size={40}
                className="text-destructive"
              />
            </div>
            <p className="text-lg font-medium text-foreground">
              Deseja enviar um alerta?
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Sua localização GPS será enviada imediatamente para a equipe de
              segurança.
            </p>
          </div>
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleEmergency}
              className={cn(
                "w-full h-14 rounded-xl bg-destructive text-destructive-foreground",
                "text-base font-semibold flex items-center justify-center gap-2",
                "active:scale-[0.98] transition-transform shadow-md",
              )}
            >
              <BoxIcon name="check" size={24} />
              Sim, enviar emergência
            </button>
            <button
              type="button"
              onClick={() => setShowEmergencyConfirm(false)}
              className={cn(
                "w-full h-14 rounded-xl bg-secondary text-secondary-foreground",
                "text-base font-medium active:scale-[0.98] transition-transform",
              )}
            >
              Cancelar
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
