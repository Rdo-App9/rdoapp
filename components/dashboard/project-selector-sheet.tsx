"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import {
  Building,
  Plus,
  FolderZip,
  EditAlt,
  LayersDownRight,
  Archive,
  Trash,
  AlertCircle,
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
// COMPONENTE: MODAL DE CONFIRMAÇÃO CUSTOMIZADO
// ==========================================
interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmModal({
  isOpen,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onCancel}
            className="fixed inset-0 z-200 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            className="fixed inset-0 z-201 flex items-center justify-center p-6 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-sm bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
              <div className="p-6 flex flex-col items-center text-center gap-4">
                <div
                  className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center",
                    variant === "danger"
                      ? "bg-destructive/10"
                      : "bg-warning/10",
                  )}
                >
                  <AlertCircle
                    pack="filled"
                    width={28}
                    height={28}
                    className={
                      variant === "danger" ? "text-destructive" : "text-warning"
                    }
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-foreground">
                    {title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
              <div className="border-t border-border" />
              <div className="flex">
                <button
                  onClick={onCancel}
                  className="flex-1 py-4 text-sm font-medium text-muted-foreground hover:bg-secondary/50 active:bg-secondary transition-colors"
                >
                  {cancelLabel}
                </button>
                <div className="w-px bg-border" />
                <button
                  onClick={onConfirm}
                  className={cn(
                    "flex-1 py-4 text-sm font-semibold transition-colors",
                    variant === "danger"
                      ? "text-destructive hover:bg-destructive/5 active:bg-destructive/10"
                      : "text-warning hover:bg-warning/5 active:bg-warning/10",
                  )}
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ==========================================
// COMPONENTE: FÍSICA DO SWIPE (ESTILO TELEGRAM)
// Usa animate prop declarativo — sem useAnimation, sem controls.start()
// ==========================================
function SwipeableProjectItem({
  project,
  isSelected,
  onSelect,
  onEdit,
  onArchive,
  onDelete,
  showArchive = true,
  // ID do item atualmente aberto (controlado pelo pai)
  openItemId,
  onOpen,
  onClose: onCloseItem,
}: {
  project: Project;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onArchive: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  showArchive?: boolean;
  openItemId: string | null;
  onOpen: (id: string) => void;
  onClose: () => void;
}) {
  const isOpen = openItemId === project.id;
  const snapLeft = showArchive ? -110 : -60;

  // Posição alvo declarativa: o pai controla quem está aberto
  const targetX = isOpen ? snapLeft : 0;

  const wasDragging = useRef(false);
  // Rastreia a posição real para decidir o snap no dragEnd
  const dragOffsetX = useRef(0);

  const handleDragStart = () => {
    wasDragging.current = true;
    // Abre este e fecha todos os outros
    onOpen(project.id);
  };

  const handleDrag = (_: any, info: PanInfo) => {
    dragOffsetX.current = info.offset.x;
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset < -50 || velocity < -500) {
      onOpen(project.id); // mantém aberto à esquerda
    } else if (offset > 50 || velocity > 500) {
      // aberto à direita — fecha via pai usando id especial
      onOpen(`${project.id}:right`);
    } else {
      onCloseItem();
    }
  };

  const handleClick = () => {
    if (wasDragging.current) {
      wasDragging.current = false;
      return;
    }
    if (isOpen) {
      onCloseItem();
      return;
    }
    if (!showArchive) return;
    onSelect();
  };

  // Calcula x alvo considerando abertura à direita
  const getTargetX = () => {
    if (openItemId === `${project.id}:right`) return 65;
    if (openItemId === project.id) return snapLeft;
    return 0;
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
        {showArchive && (
          <button
            onClick={onArchive}
            className="w-10 h-10 flex items-center justify-center text-warning bg-background rounded-lg shadow-sm active:scale-95 transition-transform"
          >
            <Archive pack="basic" width={24} height={24} />
          </button>
        )}
      </div>

      {/* CAMADA DA FRENTE — animate declarativo, sem controls */}
      <motion.div
        drag="x"
        dragConstraints={{ left: snapLeft, right: 65 }}
        dragElastic={0.15}
        dragDirectionLock
        // Posição declarativa: o pai diz quem está aberto
        animate={{ x: getTargetX() }}
        transition={{ type: "spring", stiffness: 400, damping: 35 }}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        onClick={handleClick}
        className={cn(
          "relative z-10 w-full flex items-center gap-4 p-4 text-left shadow-sm touch-pan-y rounded-xl border border-transparent",
          "bg-card",
          showArchive
            ? "cursor-grab active:cursor-grabbing"
            : "cursor-default active:cursor-grabbing",
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
              !showArchive && "opacity-70",
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

  // ID do item com swipe aberto (null = todos fechados)
  // Suporta "id:right" para abertura à direita
  const [openItemId, setOpenItemId] = useState<string | null>(null);

  const handleItemOpen = useCallback((id: string) => {
    setOpenItemId(id);
  }, []);

  const handleItemClose = useCallback(() => {
    setOpenItemId(null);
  }, []);

  // Estado do modal de confirmação
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    projectId: string | null;
    title: string;
    description: string;
    confirmLabel: string;
    variant: "danger" | "warning";
    onConfirm: () => void;
  }>({
    open: false,
    projectId: null,
    title: "",
    description: "",
    confirmLabel: "Confirmar",
    variant: "danger",
    onConfirm: () => {},
  });

  const closeConfirmModal = () =>
    setConfirmModal((prev) => ({ ...prev, open: false, projectId: null }));

  const activeProjects = projects.filter((p) => p.status !== "ARCHIVED");
  const archivedProjects = projects.filter((p) => p.status === "ARCHIVED");
  const displayProjects =
    viewMode === "active" ? activeProjects : archivedProjects;

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
  const handleArchive = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setConfirmModal({
      open: true,
      projectId: project.id,
      title: "Arquivar obra?",
      description: `"${project.name}" será movida para o arquivo e não aparecerá no painel ativo.`,
      confirmLabel: "Arquivar",
      variant: "warning",
      onConfirm: async () => {
        closeConfirmModal();
        handleSmartFallback(project.id);
        try {
          await fetch(`/api/projects/${project.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "ARCHIVED" }),
          });
          router.refresh();
        } catch (error) {
          console.error("Erro ao arquivar:", error);
        }
      },
    });
  };

  // 2. CHAMA A API PARA EXCLUIR (SOFT DELETE)
  const handleDelete = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setConfirmModal({
      open: true,
      projectId: project.id,
      title: "Ocultar obra?",
      description: `"${project.name}" será ocultada do seu painel. Esta ação pode ser revertida pelo suporte.`,
      confirmLabel: "Ocultar",
      variant: "danger",
      onConfirm: async () => {
        closeConfirmModal();
        handleSmartFallback(project.id);
        try {
          await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
          router.refresh();
        } catch (error) {
          console.error("Erro ao deletar:", error);
        }
      },
    });
  };

  // 3. NAVEGA PARA A EDIÇÃO
  const handleEdit = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onClose();
    router.push(`/projects/${id}/edit`);
  };

  return (
    <>
      <ConfirmModal
        isOpen={confirmModal.open}
        title={confirmModal.title}
        description={confirmModal.description}
        confirmLabel={confirmModal.confirmLabel}
        cancelLabel="Cancelar"
        variant={confirmModal.variant}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirmModal}
      />

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
                  onArchive={(e) => handleArchive(e, project)}
                  onDelete={(e) => handleDelete(e, project)}
                  showArchive={project.status !== "ARCHIVED"}
                  openItemId={openItemId}
                  onOpen={handleItemOpen}
                  onClose={handleItemClose}
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
    </>
  );
}
