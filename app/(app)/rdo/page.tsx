"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { BoxIcon } from "@/components/ui/box-icon";
import { NetworkStatusIndicator } from "@/components/ui/network-status";
import { BottomSheet, BottomSheetOption } from "@/components/ui/bottom-sheet";

type RDOStatus = "draft" | "signed" | "approved" | "rejected";

interface RDO {
  id: string;
  number: number;
  date: string;
  status: RDOStatus;
  weather: string;
  workforce: number;
  syncStatus: "synced" | "pending" | "error";
}

// Configuração visual dos status atualizada para o padrão outline (profissional)
const statusConfig: Record<RDOStatus, { label: string; color: string }> = {
  draft: { label: "Rascunho", color: "border-warning/50 text-warning" },
  signed: { label: "Assinado", color: "border-primary/50 text-primary" },
  approved: { label: "Aprovado", color: "border-success/50 text-success" },
  rejected: {
    label: "Rejeitado",
    color: "border-destructive/50 text-destructive",
  },
};

export default function RDOListPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<RDOStatus | "all">("all");
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  // Mock data - em produção viria do banco
  const rdos: RDO[] = [
    {
      id: "1",
      number: 46,
      date: "Hoje",
      status: "draft",
      weather: "Ensolarado",
      workforce: 12,
      syncStatus: "pending",
    },
    {
      id: "2",
      number: 45,
      date: "Ontem",
      status: "signed",
      weather: "Nublado",
      workforce: 10,
      syncStatus: "synced",
    },
    {
      id: "3",
      number: 44,
      date: "02/05/2026",
      status: "approved",
      weather: "Ensolarado",
      workforce: 14,
      syncStatus: "synced",
    },
    {
      id: "4",
      number: 43,
      date: "01/05/2026",
      status: "approved",
      weather: "Parcialmente Nublado",
      workforce: 11,
      syncStatus: "synced",
    },
    {
      id: "5",
      number: 42,
      date: "30/04/2026",
      status: "rejected",
      weather: "Chuvoso",
      workforce: 8,
      syncStatus: "synced",
    },
    {
      id: "6",
      number: 41,
      date: "29/04/2026",
      status: "approved",
      weather: "Ensolarado",
      workforce: 15,
      syncStatus: "synced",
    },
    {
      id: "7",
      number: 40,
      date: "28/04/2026",
      status: "approved",
      weather: "Ensolarado",
      workforce: 13,
      syncStatus: "synced",
    },
  ];

  const filteredRDOs =
    filter === "all" ? rdos : rdos.filter((rdo) => rdo.status === filter);

  const stats = {
    total: rdos.length,
    draft: rdos.filter((r) => r.status === "draft").length,
    signed: rdos.filter((r) => r.status === "signed").length,
    approved: rdos.filter((r) => r.status === "approved").length,
    rejected: rdos.filter((r) => r.status === "rejected").length,
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background relative">
      {/* Header */}
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

      {/* Stats / Quick Filters */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            type="button"
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
            type="button"
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
            type="button"
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
            type="button"
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

      {/* Ações e Filtro Mobile */}
      <div className="px-6 pb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowFilterSheet(true)}
          className="flex items-center gap-2 px-4 h-10 rounded-md border border-input bg-transparent text-sm font-medium active:bg-secondary/50 transition-colors"
        >
          <BoxIcon name="filter" size={18} />
          {filter === "all" ? "Filtrar" : statusConfig[filter].label}
        </button>
        <button
          type="button"
          onClick={() => router.push("/rdo/new")}
          className="flex items-center gap-2 px-4 h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 active:scale-[0.98] transition-all"
        >
          <BoxIcon name="plus" size={18} />
          Novo RDO
        </button>
      </div>

      {/* RDO List */}
      <main className="flex-1 px-6 pb-24 lg:pb-8 overflow-y-auto">
        <div className="space-y-3">
          {filteredRDOs.map((rdo) => (
            <button
              key={rdo.id}
              type="button"
              onClick={() => router.push(`/rdo/${rdo.number}`)}
              className="w-full p-4 rounded-md border border-border bg-transparent flex items-center gap-4 transition-all active:bg-secondary/50 active:scale-[0.99]"
            >
              {/* Número do RDO */}
              <div className="w-12 h-12 rounded-md bg-secondary/30 flex items-center justify-center shrink-0">
                <span className="text-base font-bold text-foreground">
                  #{rdo.number}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-foreground">
                    RDO #{rdo.number}
                  </p>
                  {rdo.syncStatus === "pending" && (
                    <BoxIcon
                      name="cloud-upload"
                      size={16}
                      className="text-warning"
                    />
                  )}
                  {rdo.syncStatus === "error" && (
                    <BoxIcon
                      name="error-circle"
                      size={16}
                      className="text-destructive"
                    />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{rdo.date}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BoxIcon name="sun" size={14} />
                    {rdo.weather}
                  </span>
                  <span className="flex items-center gap-1">
                    <BoxIcon name="user" size={14} />
                    {rdo.workforce} pessoas
                  </span>
                </div>
              </div>

              {/* Status */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium border",
                    statusConfig[rdo.status].color,
                  )}
                >
                  {statusConfig[rdo.status].label}
                </span>
                <BoxIcon
                  name="chevron-right"
                  size={20}
                  className="text-muted-foreground"
                />
              </div>
            </button>
          ))}

          {filteredRDOs.length === 0 && (
            <div className="text-center py-12 border border-dashed border-border rounded-md mt-4">
              <div className="w-12 h-12 rounded-md bg-secondary/30 flex items-center justify-center mx-auto mb-4">
                <BoxIcon
                  name="clipboard"
                  size={24}
                  className="text-muted-foreground"
                />
              </div>
              <p className="text-sm font-medium text-foreground">
                Nenhum RDO encontrado
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {filter !== "all"
                  ? `Não há RDOs com status "${statusConfig[filter].label}"`
                  : "Comece criando um novo RDO"}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Filter Bottom Sheet */}
      <BottomSheet
        open={showFilterSheet}
        onClose={() => setShowFilterSheet(false)}
        title="Filtrar por Status"
      >
        <div className="space-y-2 pb-6">
          <BottomSheetOption
            label="Todos os RDOs"
            description={`${stats.total} relatórios`}
            icon={<BoxIcon size={24} name="error" />}
            selected={filter === "all"}
            onClick={() => {
              setFilter("all");
              setShowFilterSheet(false);
            }}
          />
          <BottomSheetOption
            label="Rascunhos"
            description={`${stats.draft} relatórios`}
            icon={<BoxIcon name="edit" size={24} />}
            selected={filter === "draft"}
            onClick={() => {
              setFilter("draft");
              setShowFilterSheet(false);
            }}
          />
          <BottomSheetOption
            label="Assinados"
            description={`${stats.signed} relatórios`}
            icon={<BoxIcon name="pencil" size={24} />}
            selected={filter === "signed"}
            onClick={() => {
              setFilter("signed");
              setShowFilterSheet(false);
            }}
          />
          <BottomSheetOption
            label="Aprovados"
            description={`${stats.approved} relatórios`}
            icon={<BoxIcon name="check-circle" size={24} />}
            selected={filter === "approved"}
            onClick={() => {
              setFilter("approved");
              setShowFilterSheet(false);
            }}
          />
          <BottomSheetOption
            label="Rejeitados"
            description={`${stats.rejected} relatórios`}
            icon={<BoxIcon name="x-circle" size={24} />}
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
