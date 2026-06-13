"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Camera, Check, ChevronLeft } from "@boxicons/react";
import { cn } from "@/lib/utils";

interface Photo {
  id: string;
  url: string;
  category: string;
  createdAt: Date;
}

interface AttachPhotosButtonProps {
  rdoId: string;
  unlinkedPhotos: Photo[];
}

export function AttachPhotosButton({
  rdoId,
  unlinkedPhotos,
}: AttachPhotosButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLinking, setIsLinking] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Evita erro de hidratação no Next.js ao usar Portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Trava a rolagem da página de fundo quando a sidebar está aberta
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const toggleSelection = (photoId: string) => {
    setSelectedIds((prev) =>
      prev.includes(photoId)
        ? prev.filter((id) => id !== photoId)
        : [...prev, photoId],
    );
  };

  const handleAttach = async () => {
    if (selectedIds.length === 0) return;
    setIsLinking(true);

    try {
      const res = await fetch(`/api/rdo/${rdoId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoIds: selectedIds }),
      });

      if (!res.ok) throw new Error("Erro ao vincular fotos");

      setIsOpen(false);
      setSelectedIds([]);
      router.refresh();
    } catch (error) {
      alert("Erro ao anexar as fotos. Tente novamente.");
    } finally {
      setIsLinking(false);
    }
  };

  // O CONTEÚDO DO PAINEL
  const sidebarContent = (
    <div
      className={cn(
        "fixed inset-0 z-[9999] transition-all",
        isOpen ? "pointer-events-auto" : "pointer-events-none",
      )}
    >
      {/* OVERLAY ESCURO: Fica atrás do painel para destacar ele no PC */}
      <div
        className={cn(
          "absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0",
        )}
        onClick={() => !isLinking && setIsOpen(false)}
      />

      {/* O PAINEL: Largura 100% no mobile e 450px no Desktop. Preso à direita. */}
      <div
        className={cn(
          "absolute top-0 bottom-0 right-0 w-full md:w-[450px] bg-background shadow-2xl flex flex-col transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Cabeçalho da Sidebar */}
        <div className="pt-safe px-4 py-4 flex items-center gap-4 border-b border-border bg-card shadow-sm">
          <button
            onClick={() => !isLinking && setIsOpen(false)}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center active:scale-95 transition-transform"
          >
            <ChevronLeft
              pack="basic"
              width={24}
              height={24}
              className="text-foreground"
            />
          </button>
          <div>
            <h2 className="text-lg font-bold text-foreground leading-tight">
              Anexar Fotos
            </h2>
            <p className="text-xs text-muted-foreground">
              {unlinkedPhotos.length} fotos disponíveis
            </p>
          </div>
        </div>

        {/* Área de Rolagem das Fotos */}
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-sm text-muted-foreground mb-4">
            Selecione as imagens da galeria que devem fazer parte deste RDO.
          </p>

          {unlinkedPhotos.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-6 bg-secondary/20 rounded-xl border border-dashed border-border min-h-[200px]">
              <Camera
                pack="basic"
                width={32}
                height={32}
                className="text-muted-foreground mb-2 opacity-50"
              />
              <p className="text-sm font-medium text-muted-foreground">
                Nenhuma foto disponível.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                A galeria está vazia ou as fotos já foram anexadas.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {unlinkedPhotos.map((photo) => {
                const isSelected = selectedIds.includes(photo.id);
                return (
                  <button
                    key={photo.id}
                    onClick={() => toggleSelection(photo.id)}
                    className={cn(
                      "relative aspect-square rounded-xl overflow-hidden border-2 transition-all active:scale-95",
                      isSelected
                        ? "border-primary"
                        : "border-transparent bg-secondary/50",
                    )}
                  >
                    <img
                      src={photo.url}
                      alt="Foto da Obra"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center backdrop-blur-[1px]">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg transform scale-in">
                          <Check
                            pack="basic"
                            width={24}
                            height={24}
                            className="text-primary-foreground"
                          />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Rodapé Fixo com os Botões */}
        <div className="pb-safe p-4 border-t border-border bg-card flex gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <button
            onClick={() => setIsOpen(false)}
            disabled={isLinking}
            className="flex-1 h-14 rounded-xl bg-secondary text-secondary-foreground font-semibold active:scale-[0.98] disabled:opacity-50 transition-all"
          >
            Voltar
          </button>
          <button
            onClick={handleAttach}
            disabled={isLinking || selectedIds.length === 0}
            className="flex-1 h-14 rounded-xl bg-primary text-primary-foreground font-bold active:scale-[0.98] disabled:opacity-50 transition-all"
          >
            {isLinking ? "A processar..." : `Anexar (${selectedIds.length})`}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        title="Anexar Fotos da Obra"
        className="w-10 h-10 rounded-xl border border-input bg-transparent flex items-center justify-center active:bg-secondary/50 transition-colors text-foreground hover:bg-secondary/20"
      >
        <Camera pack="basic" width={20} height={20} />
      </button>

      {/* PORTAL: Joga o sidebar para a raiz do site, escapando do Header */}
      {mounted && createPortal(sidebarContent, document.body)}
    </>
  );
}
