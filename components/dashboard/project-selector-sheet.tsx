"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { motion, useAnimation, PanInfo } from "framer-motion";
import {
  Building,
  Plus,
  FolderZip,
  EditAlt,
  LayersDownRight,
  Archive,
  Trash,
} from "@boxicons/react";

interface Project {
  id: string;
  name: string;
  address: string | null;
  status?: string;
}

interface ProjectSelectorSheetProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  selectedProjectId: string;
  onSelectProject: (project: Project) => void;
  onNewProject: () => void;
}

// ==========================================
// COMPONENTE: FÍSICA DO SWIPE (ESTILO TELEGRAM)
// ==========================================
function SwipeableProjectItem({
  project,
  isSelected,
  onSelect,
  onEdit,
  onArchive,
  onDelete,
}: {
  project: Project;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onArchive: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  const controls = useAnimation();

  const handleDragEnd = (event: any, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset < -50 || velocity < -500) {
      controls.start({ x: -110 });
    } else if (offset > 50 || velocity > 500) {
      controls.start({ x: 65 });
    } else {
      controls.start({ x: 0 });
    }
  };

  const handleSelectClick = () => {
    controls.start({ x: 0 });
    onSelect();
  };

  return (
    <div className="relative w-full rounded-xl bg-secondary/30 border border-border overflow-hidden">
      {/* CAMADA DE FUNDO (Botões Escondidos) */}
      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
        <button
          onClick={onDelete}
          className="w-10 h-10 flex items-center justify-center text-destructive bg-background rounded-lg shadow-sm active:scale-95 transition-transform"
        >
          <Trash pack="basic" width={24} height={24} />
        </button>
      </div>

      <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-2">
        <button
          onClick={onEdit}
          className="w-10 h-10 flex items-center justify-center text-primary bg-background rounded-lg shadow-sm active:scale-95 transition-transform"
        >
          <EditAlt pack="basic" width={24} height={24} />
        </button>
        <button
          onClick={onArchive}
          className="w-10 h-10 flex items-center justify-center text-warning bg-background rounded-lg shadow-sm active:scale-95 transition-transform"
        >
          <Archive pack="basic" width={24} height={24} />
        </button>
      </div>

      {/* CAMADA DA FRENTE (A "Tampa" Sólida que é arrastada) */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -110, right: 65 }}
        dragElastic={0.15}
        dragDirectionLock
        animate={controls}
        onDragEnd={handleDragEnd}
        onClick={handleSelectClick}
        className={cn(
          "relative z-10 w-full flex items-center gap-4 p-4 text-left shadow-sm touch-pan-y cursor-grab active:cursor-grabbing rounded-xl border border-transparent",
          "bg-card",
        )}
      >
        {isSelected && (
          <div className="absolute inset-0 bg-primary/10 border border-primary rounded-xl pointer-events-none" />
        )}

        <div className="relative z-20 w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
          <Building
            pack={isSelected ? "filled" : "basic"}
            width={24}
            height={24}
            className={isSelected ? "text-primary" : "text-muted-foreground"}
          />
        </div>

        <div className="relative z-20 flex-1 min-w-0">
          <p
            className={cn(
              "font-medium truncate",
              isSelected ? "text-primary" : "text-foreground",
            )}
          >
            {project.name}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {project.address || "Sem endereço"}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// ==========================================
// COMPONENTE PRINCIPAL (O SHEET)
// ==========================================
export function ProjectSelectorSheet({
  isOpen,
  onClose,
  projects,
  selectedProjectId,
  onSelectProject,
  onNewProject,
}: ProjectSelectorSheetProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"active" | "archived">("active");

  const activeProjects = projects.filter((p) => p.status !== "ARCHIVED");
  const archivedProjects = projects.filter((p) => p.status === "ARCHIVED");

  const displayProjects =
    viewMode === "active" ? activeProjects : archivedProjects;

  // CÉREBRO: Seleção Inteligente (Fallback)
  const handleSmartFallback = (actionTargetId: string) => {
    if (selectedProjectId === actionTargetId) {
      const remaining = activeProjects.filter((p) => p.id !== actionTargetId);

      if (remaining.length > 0) {
        onSelectProject(remaining[0]);
      } else {
        onSelectProject({
          id: "mock-empty",
          name: "Sem Obras",
          address: "Nenhum projeto ativo",
        });
      }
    }
  };

  // 1. CHAMA A API PARA ARQUIVAR
  const handleArchive = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();

    // Atualização otimista na tela (sensação de rapidez)
    handleSmartFallback(id);

    try {
      await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ARCHIVED" }),
      });
      router.refresh();
    } catch (error) {
      console.error("Erro ao arquivar:", error);
    }
  };

  // 2. CHAMA A API PARA EXCLUIR (SOFT DELETE)
  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Tem certeza? Esta ação ocultará a obra do seu painel.")) {
      handleSmartFallback(id);

      try {
        await fetch(`/api/projects/${id}`, {
          method: "DELETE",
        });
        router.refresh();
      } catch (error) {
        console.error("Erro ao deletar:", error);
      }
    }
  };

  // 3. NAVEGA PARA A EDIÇÃO
  const handleEdit = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onClose();
    router.push(`/projects/${id}/edit`);
  };

  return (
    <BottomSheet open={isOpen} onClose={onClose} title="Minhas Obras">
      <div className="flex flex-col h-full pb-6 px-4">
        {/* Abas Superiores */}
        <div className="flex p-1 bg-secondary/30 rounded-lg mb-4 shrink-0">
          <button
            onClick={() => setViewMode("active")}
            className={cn(
              "flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2",
              viewMode === "active"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground",
            )}
          >
            <Building
              pack={viewMode === "active" ? "filled" : "basic"}
              width={18}
              height={18}
            />
            Ativas ({activeProjects.length})
          </button>
          <button
            onClick={() => setViewMode("archived")}
            className={cn(
              "flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2",
              viewMode === "archived"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground",
            )}
          >
            <FolderZip
              pack={viewMode === "archived" ? "filled" : "basic"}
              width={18}
              height={18}
            />
            Arquivadas ({archivedProjects.length})
          </button>
        </div>

        {/* Lista Arrastável */}
        <div className="space-y-3 flex-1 overflow-y-auto min-h-50 overflow-x-hidden p-1 pb-4">
          {displayProjects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <LayersDownRight
                pack="basic"
                width={32}
                height={32}
                className="mx-auto mb-2 opacity-50"
              />
              <p className="text-sm">
                Nenhuma obra {viewMode === "active" ? "ativa" : "arquivada"}.
              </p>
            </div>
          ) : (
            displayProjects.map((project) => (
              <SwipeableProjectItem
                key={project.id}
                project={project}
                isSelected={selectedProjectId === project.id}
                onSelect={() => {
                  onSelectProject(project);
                  onClose();
                }}
                onEdit={(e) => handleEdit(e, project.id)}
                onArchive={(e) => handleArchive(e, project.id)}
                onDelete={(e) => handleDelete(e, project.id)}
              />
            ))
          )}
        </div>

        {/* Botão Nova Obra (Aparece só na aba de Ativas) */}
        {viewMode === "active" && (
          <div className="pt-4 mt-2 border-t border-border shrink-0">
            <button
              onClick={() => {
                onClose();
                onNewProject();
              }}
              className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-primary/50 text-primary hover:bg-primary/5 active:bg-primary/10 transition-colors font-medium"
            >
              <Plus pack="basic" width={20} height={20} />
              Cadastrar Nova Obra
            </button>
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
