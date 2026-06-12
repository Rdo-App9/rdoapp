"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash, InfoCircle } from "@boxicons/react";

interface DeleteRdoButtonProps {
  rdoId: string;
  projectId: string;
  rdoNumber: number;
}

export function DeleteRdoButton({
  rdoId,
  projectId,
  rdoNumber,
}: DeleteRdoButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/rdo/${rdoId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Falha ao excluir");
      }
      router.refresh();
      router.push(`/rdo?projectId=${projectId}`);
    } catch (error) {
      alert("Erro ao excluir o RDO. Tente novamente.");
      setIsDeleting(false);
      setShowModal(false);
    }
  };

  return (
    <>
      {/* Botão de gatilho */}
      <button
        onClick={() => setShowModal(true)}
        title="Excluir Relatório"
        className="w-10 h-10 rounded-xl border border-destructive/30 bg-destructive/5 flex items-center justify-center active:bg-destructive/20 transition-colors text-destructive hover:bg-destructive/10"
      >
        <Trash pack="basic" width={20} height={20} />
      </button>

      {/* Overlay + Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !isDeleting && setShowModal(false)}
          />

          {/* Painel do modal */}
          <div className="relative w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
            {/* Faixa de alerta no topo */}
            <div className="h-1.5 w-full bg-destructive" />

            <div className="p-6">
              {/* Ícone e título */}
              <div className="flex flex-col items-center text-center gap-3 mb-6">
                <div className="w-14 h-14 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center">
                  <Trash
                    pack="basic"
                    width={26}
                    height={26}
                    className="text-destructive"
                  />
                </div>
                <div>
                  <h2
                    id="delete-modal-title"
                    className="text-lg font-bold text-foreground"
                  >
                    Excluir RDO #{rdoNumber}?
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Esta ação é permanente e não poderá ser desfeita.
                  </p>
                </div>
              </div>

              {/* Aviso informativo */}
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-destructive/5 border border-destructive/15 mb-6">
                <InfoCircle
                  pack="basic"
                  width={16}
                  height={16}
                  className="text-destructive mt-0.5 shrink-0"
                />
                <p className="text-xs text-destructive leading-relaxed">
                  Todos os registros de efetivo, equipamentos e atividades deste
                  relatório serão apagados.
                </p>
              </div>

              {/* Ações */}
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full h-12 rounded-xl bg-destructive text-white font-semibold text-sm flex items-center justify-center gap-2 transition-opacity disabled:opacity-60 active:opacity-80"
                >
                  {isDeleting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Excluindo…
                    </>
                  ) : (
                    <>
                      <Trash pack="basic" width={16} height={16} />
                      Sim, excluir relatório
                    </>
                  )}
                </button>

                <button
                  onClick={() => setShowModal(false)}
                  disabled={isDeleting}
                  className="w-full h-12 rounded-xl border border-input bg-transparent text-foreground font-semibold text-sm transition-colors active:bg-secondary/50 disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
