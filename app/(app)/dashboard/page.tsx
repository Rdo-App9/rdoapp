// Dashboard - Tela principal com ações rápidas

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { BoxIcon, BoxiconsProvider } from "@/components/ui/box-icon";
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

  // Projetos mock
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

    // Obter localização GPS
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          console.log("[v0] Emergency triggered:", {
            latitude,
            longitude,
            accuracy,
          });
          // Aqui enviaria para o backend
          alert(
            `Emergência enviada!\nLat: ${latitude.toFixed(6)}\nLon: ${longitude.toFixed(6)}`,
          );
        },
        (error) => {
          console.error("[v0] GPS error:", error);
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
    <BoxiconsProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <NetworkStatusBar />

        {/* Header */}
        <header className="pt-safe">
          <div className="px-6 pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                  <BoxIcon
                    name="hard-hat"
                    type="solid"
                    size={24}
                    className="text-primary-foreground"
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">RdoApp</h1>
                  <p className="text-sm text-muted-foreground">Bom dia, João</p>
                </div>
              </div>
              <NetworkStatusIndicator showLabel={false} />
            </div>
          </div>
        </header>

        {/* Projeto selecionado */}
        <div className="px-6 pb-4">
          <button
            type="button"
            onClick={() => setShowProjectSheet(true)}
            className={cn(
              "w-full p-4 rounded-2xl bg-card",
              "flex items-center justify-between",
              "active:scale-98 transition-transform",
            )}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                <BoxIcon name="building" size={24} />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">
                  {selectedProject.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedProject.address}
                </p>
              </div>
            </div>
            <BoxIcon
              name="chevron-down"
              size={24}
              className="text-muted-foreground"
            />
          </button>
        </div>

        {/* Main content */}
        <main className="flex-1 px-6 pb-6 overflow-y-auto">
          {/* Quick actions grid */}
          <section className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Ações Rápidas
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <ActionButton
                icon="clipboard"
                iconType="solid"
                label="Novo RDO"
                variant="primary"
                size="lg"
                onClick={() => router.push("/rdo/new")}
              />
              <ActionButton
                icon="camera"
                iconType="solid"
                label="Câmera"
                size="lg"
                onClick={() => router.push("/camera")}
              />
              <ActionButton
                icon="cube"
                iconType="solid"
                label="Plantas BIM"
                size="lg"
                onClick={() => router.push("/bim")}
              />
              <ActionButton
                icon="qr-scan"
                label="Scanner"
                size="lg"
                onClick={() => router.push("/camera?mode=scan")}
              />
            </div>
          </section>

          {/* Emergency button */}
          <section className="mb-6">
            <button
              type="button"
              onClick={() => setShowEmergencyConfirm(true)}
              className={cn(
                "w-full min-h-25 rounded-3xl",
                "bg-destructive text-destructive-foreground",
                "flex items-center justify-center gap-4",
                "text-xl font-bold",
                "active:scale-98 transition-transform duration-100",
              )}
            >
              <BoxIcon name="alarm-exclamation" type="solid" size={36} />
              EMERGÊNCIA
            </button>
            <p className="text-sm text-muted-foreground text-center mt-2">
              Envia localização GPS imediata para a equipe de segurança
            </p>
          </section>

          {/* Recent RDOs */}
          <section className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                RDOs Recentes
              </h2>
              <button
                onClick={() => router.push("/rdo")}
                className="text-primary text-sm font-medium"
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
                    "w-full p-4 rounded-xl bg-card",
                    "flex items-center justify-between",
                    "active:scale-98 transition-transform",
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                      <span className="text-lg font-bold">#{rdo.number}</span>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-foreground">
                        RDO #{rdo.number}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {rdo.date}
                      </p>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium",
                      rdo.status === "draft" && "bg-warning/20 text-warning",
                      rdo.status === "signed" && "bg-primary/20 text-primary",
                      rdo.status === "approved" && "bg-success/20 text-success",
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

          {/* Weather info */}
          <section className="ios-card-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center">
                <BoxIcon
                  name="sun"
                  type="solid"
                  size={28}
                  className="text-warning"
                />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">
                  28°C - Ensolarado
                </p>
                <p className="text-sm text-muted-foreground">
                  Umidade 65% | Vento 12 km/h
                </p>
              </div>
            </div>
          </section>
        </main>

        {/* Navigation bar */}
        <nav className="nav-bar">
          <div className="flex items-center justify-around">
            <button className="nav-item-active">
              <BoxIcon name="home" type="solid" size={24} />
              <span className="text-xs">Início</span>
            </button>
            <button className="nav-item" onClick={() => router.push("/rdo")}>
              <BoxIcon name="clipboard" size={24} />
              <span className="text-xs">RDOs</span>
            </button>
            <button className="nav-item" onClick={() => router.push("/camera")}>
              <BoxIcon name="camera" size={24} />
              <span className="text-xs">Câmera</span>
            </button>
            <button
              className="nav-item"
              onClick={() => router.push("/settings")}
            >
              <BoxIcon name="cog" size={24} />
              <span className="text-xs">Config</span>
            </button>
          </div>
        </nav>

        {/* Bottom sheet - Seleção de projeto */}
        <BottomSheet
          open={showProjectSheet}
          onClose={() => setShowProjectSheet(false)}
          title="Selecionar Obra"
        >
          <div className="space-y-3">
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

        {/* Bottom sheet - Confirmação de emergência */}
        <BottomSheet
          open={showEmergencyConfirm}
          onClose={() => setShowEmergencyConfirm(false)}
          title="Confirmar Emergência"
        >
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
                <BoxIcon
                  name="alarm-exclamation"
                  type="solid"
                  size={40}
                  className="text-destructive"
                />
              </div>
              <p className="text-lg text-foreground">
                Tem certeza que deseja enviar um alerta de emergência?
              </p>
              <p className="text-muted-foreground mt-2">
                Sua localização GPS será enviada imediatamente para a equipe de
                segurança.
              </p>
            </div>
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleEmergency}
                className={cn(
                  "w-full min-h-15 rounded-xl",
                  "bg-destructive text-destructive-foreground",
                  "text-lg font-semibold",
                  "flex items-center justify-center gap-2",
                  "active:scale-98 transition-transform",
                )}
              >
                <BoxIcon name="check" size={24} />
                Sim, enviar emergência
              </button>
              <button
                type="button"
                onClick={() => setShowEmergencyConfirm(false)}
                className={cn(
                  "w-full min-h-15 rounded-xl",
                  "bg-secondary text-secondary-foreground",
                  "text-lg font-medium",
                  "active:scale-98 transition-transform",
                )}
              >
                Cancelar
              </button>
            </div>
          </div>
        </BottomSheet>
      </div>
    </BoxiconsProvider>
  );
}
