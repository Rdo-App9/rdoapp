"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { NetworkStatusIndicator } from "@/components/ui/network-status";
import { BottomSheet, BottomSheetOption } from "@/components/ui/bottom-sheet";

import {
  Filter,
  Plus,
  ArrowUpStroke,
  XCircle,
  Sun,
  User,
  ChevronRight,
  Clipboard,
  Layers,
  EditAlt,
  Pencil,
  CheckCircle,
} from "@boxicons/react";

type RDOStatus =
  | "draft"
  | "signed"
  | "approved"
  | "rejected"
  | "pending_signature";

interface RDO {
  id: string;
  number: number;
  date: string;
  status: RDOStatus;
  weather: string;
  workforce: number;
  syncStatus: "synced" | "pending" | "error";
}

const statusConfig: Record<RDOStatus, { label: string; color: string }> = {
  draft: { label: "Rascunho", color: "border-warning/50 text-warning" },
  pending_signature: {
    label: "Aguard. Assinatura",
    color: "border-info/50 text-info",
  },
  signed: { label: "Assinado", color: "border-primary/50 text-primary" },
  approved: { label: "Aprovado", color: "border-success/50 text-success" },
  rejected: {
    label: "Rejeitado",
    color: "border-destructive/50 text-destructive",
  },
};

interface RDOListClientProps {
  initialRdos: RDO[];
  projectId: string;
}

export default function RDOListClient({
  initialRdos,
  projectId,
}: RDOListClientProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<RDOStatus | "all">("all");
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  const filteredRDOs =
    filter === "all"
      ? initialRdos
      : initialRdos.filter((rdo) => rdo.status === filter);

  const stats = {
    total: initialRdos.length,
    draft: initialRdos.filter((r) => r.status === "draft").length,
    signed: initialRdos.filter((r) => r.status === "signed").length,
    approved: initialRdos.filter((r) => r.status === "approved").length,
    rejected: initialRdos.filter((r) => r.status === "rejected").length,
  };

  // CORREÇÃO: Função dedicada para navegação blindada contra cache
  const handleOpenRdo = (rdoNumber: number) => {
    // 1. Limpa o cache agressivo do Next.js que poderia ter guardado um "404"
    router.refresh();
    // 2. Passa o projectId na URL para garantir segurança entre obras e força um timestamp para burlar o cache
    router.push(`/rdo/${rdoNumber}?projectId=${projectId}&t=${Date.now()}`);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background relative">
      <header className="pt-safe sticky top-0 bg-background border-b border-border z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-foreground">
              Relatórios Diários
            </h1>
          </div>
          <NetworkStatusIndicator showLabel={false} />
        </div>
      </header>

      <div className="px-6 py-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "p-3 rounded-md border text-left transition-all active:scale-[0.98]",
              filter === "all"
                ? "border-primary bg-primary/5"
                : "border-border bg-transparent",
            )}
          >
            <p className="text-2xl font-semibold text-foreground">
              {stats.total}
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
              Total
            </p>
          </button>
          <button
            onClick={() => setFilter("draft")}
            className={cn(
              "p-3 rounded-md border text-left transition-all active:scale-[0.98]",
              filter === "draft"
                ? "border-warning/50 bg-warning/5"
                : "border-border bg-transparent",
            )}
          >
            <p className="text-2xl font-semibold text-foreground">
              {stats.draft}
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
              Rascunhos
            </p>
          </button>
          <button
            onClick={() => setFilter("signed")}
            className={cn(
              "p-3 rounded-md border text-left transition-all active:scale-[0.98]",
              filter === "signed"
                ? "border-primary/50 bg-primary/5"
                : "border-border bg-transparent",
            )}
          >
            <p className="text-2xl font-semibold text-foreground">
              {stats.signed}
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
              Assinados
            </p>
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={cn(
              "p-3 rounded-md border text-left transition-all active:scale-[0.98]",
              filter === "approved"
                ? "border-success/50 bg-success/5"
                : "border-border bg-transparent",
            )}
          >
            <p className="text-2xl font-semibold text-foreground">
              {stats.approved}
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
              Aprovados
            </p>
          </button>
        </div>
      </div>

      <div className="px-6 pb-4 flex items-center justify-between">
        <button
          onClick={() => setShowFilterSheet(true)}
          className="flex items-center gap-2 px-4 h-10 rounded-md border border-input bg-transparent text-sm font-medium active:bg-secondary/50 transition-colors"
        >
          <Filter pack="basic" width={18} height={18} />
          {filter === "all" ? "Filtrar" : statusConfig[filter].label}
        </button>
        <button
          onClick={() => router.push(`/rdo/new?projectId=${projectId}`)}
          className="flex items-center gap-2 px-4 h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 active:scale-[0.98] transition-all"
        >
          <Plus pack="basic" width={18} height={18} />
          Novo RDO
        </button>
      </div>

      <main className="flex-1 px-6 pb-24 lg:pb-8 overflow-y-auto">
        <div className="space-y-3">
          {filteredRDOs.map((rdo) => (
            <button
              key={rdo.id}
              onClick={() => handleOpenRdo(rdo.number)}
              className="w-full p-4 rounded-md border border-border bg-transparent flex items-center gap-4 transition-all active:bg-secondary/50 active:scale-[0.99]"
            >
              <div className="w-12 h-12 rounded-md bg-secondary/30 flex items-center justify-center shrink-0">
                <span className="text-base font-bold text-foreground">
                  #{rdo.number}
                </span>
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-foreground">
                    RDO #{rdo.number}
                  </p>
                  {rdo.syncStatus === "pending" && (
                    <ArrowUpStroke
                      pack="basic"
                      width={16}
                      height={16}
                      className="text-warning"
                    />
                  )}
                  {rdo.syncStatus === "error" && (
                    <XCircle
                      pack="basic"
                      width={16}
                      height={16}
                      className="text-destructive"
                    />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(rdo.date).toLocaleDateString("pt-BR")}
                </p>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Sun pack="basic" width={14} height={14} />
                    {rdo.weather}
                  </span>
                  <span className="flex items-center gap-1">
                    <User pack="basic" width={14} height={14} />
                    {rdo.workforce} pessoas
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium border",
                    statusConfig[rdo.status].color,
                  )}
                >
                  {statusConfig[rdo.status].label}
                </span>
                <ChevronRight
                  pack="basic"
                  width={20}
                  height={20}
                  className="text-muted-foreground"
                />
              </div>
            </button>
          ))}

          {filteredRDOs.length === 0 && (
            <div className="text-center py-12 border border-dashed border-border rounded-md mt-4">
              <div className="w-12 h-12 rounded-md bg-secondary/30 flex items-center justify-center mx-auto mb-4">
                <Clipboard
                  pack="basic"
                  width={24}
                  height={24}
                  className="text-muted-foreground"
                />
              </div>
              <p className="text-sm font-medium text-foreground">
                Nenhum RDO encontrado
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {filter !== "all"
                  ? `Não há RDOs com status "${statusConfig[filter].label}"`
                  : "Comece criando o primeiro relatório desta obra"}
              </p>
            </div>
          )}
        </div>
      </main>

      <BottomSheet
        open={showFilterSheet}
        onClose={() => setShowFilterSheet(false)}
        title="Filtrar por Status"
      >
        <div className="space-y-2 pb-6 px-4">
          <BottomSheetOption
            label="Todos os RDOs"
            description={`${stats.total} relatórios`}
            icon={<Layers pack="basic" width={24} height={24} />}
            selected={filter === "all"}
            onClick={() => {
              setFilter("all");
              setShowFilterSheet(false);
            }}
          />
          <BottomSheetOption
            label="Rascunhos"
            description={`${stats.draft} relatórios`}
            icon={<EditAlt pack="basic" width={24} height={24} />}
            selected={filter === "draft"}
            onClick={() => {
              setFilter("draft");
              setShowFilterSheet(false);
            }}
          />
          <BottomSheetOption
            label="Assinados"
            description={`${stats.signed} relatórios`}
            icon={<Pencil pack="basic" width={24} height={24} />}
            selected={filter === "signed"}
            onClick={() => {
              setFilter("signed");
              setShowFilterSheet(false);
            }}
          />
          <BottomSheetOption
            label="Aprovados"
            description={`${stats.approved} relatórios`}
            icon={<CheckCircle pack="basic" width={24} height={24} />}
            selected={filter === "approved"}
            onClick={() => {
              setFilter("approved");
              setShowFilterSheet(false);
            }}
          />
          <BottomSheetOption
            label="Rejeitados"
            description={`${stats.rejected} relatórios`}
            icon={<XCircle pack="basic" width={24} height={24} />}
            selected={filter === "rejected"}
            onClick={() => {
              setFilter("rejected");
              setShowFilterSheet(false);
            }}
          />
        </div>
      </BottomSheet>
    </div>
  );
}
