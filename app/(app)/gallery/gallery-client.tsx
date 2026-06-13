"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, X, Filter, Trash, InfoCircle } from "@boxicons/react";
import { cn } from "@/lib/utils";

interface Photo {
  id: string;
  url: string;
  category: string;
  createdAt: Date;
  uploadedBy: { name: string } | null;
}

const CATEGORIES = [
  { id: "ALL", label: "Todas" },
  { id: "PROGRESS", label: "Progresso" },
  { id: "ISSUE", label: "Problemas" },
  { id: "SAFETY", label: "Segurança" },
  { id: "EQUIPMENT", label: "Equipamentos" },
  { id: "MATERIAL", label: "Materiais" },
  { id: "GENERAL", label: "Geral" },
];

export default function GalleryClient({
  initialPhotos,
  projectId,
}: {
  initialPhotos: Photo[];
  projectId: string;
}) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // NOVO

  const filteredPhotos = initialPhotos.filter(
    (photo) =>
      selectedCategory === "ALL" || photo.category === selectedCategory,
  );

  const getCategoryLabel = (catId: string) => {
    return CATEGORIES.find((c) => c.id === catId)?.label || catId;
  };

  // Abre o modal em vez do window.confirm
  const handleDeletePhoto = async () => {
    if (!selectedPhoto) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/photos/${selectedPhoto.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erro ao excluir");
      setShowDeleteModal(false);
      setSelectedPhoto(null);
      router.refresh();
    } catch (error) {
      alert("Erro ao excluir a foto. Tente novamente.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background relative">
      {/* HEADER */}
      <header className="pt-safe sticky top-0 bg-background/90 backdrop-blur-md border-b border-border z-10">
        <div className="px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl bg-transparent flex items-center justify-center active:bg-secondary/50 transition-colors"
          >
            <ChevronLeft
              pack="basic"
              width={28}
              height={28}
              className="text-foreground"
            />
          </button>
          <h1 className="text-lg font-bold text-foreground">Galeria da Obra</h1>
          <div className="w-10 h-10 flex items-center justify-center">
            <Filter
              pack="basic"
              width={22}
              height={22}
              className="text-muted-foreground"
            />
          </div>
        </div>

        {/* TABS DE CATEGORIAS */}
        <div className="px-4 pb-3 overflow-x-auto hide-scrollbar">
          <div className="flex gap-2 min-w-max">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200",
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* GRID DE FOTOS */}
      <main className="flex-1 p-4 overflow-y-auto pb-24">
        {filteredPhotos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <p className="text-muted-foreground font-medium">
              Nenhuma foto encontrada.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Tire fotos usando a câmera para popular esta categoria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredPhotos.map((photo) => (
              <button
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className="relative aspect-square rounded-xl overflow-hidden bg-secondary/50 border border-border group active:scale-[0.98] transition-transform"
              >
                <img
                  src={photo.url}
                  alt="Foto da obra"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent p-2 pt-6">
                  <p className="text-[10px] text-white/90 font-medium truncate text-left">
                    {getCategoryLabel(photo.category)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* LIGHTBOX (TELA CHEIA) */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col animation-fade-in">
          {/* BARRA SUPERIOR DO LIGHTBOX */}
          <div className="pt-safe px-4 py-4 flex items-center justify-between bg-linear-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-10">
            <button
              onClick={() => setSelectedPhoto(null)}
              disabled={isDeleting}
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white active:bg-white/20 transition-colors"
            >
              <X pack="basic" width={24} height={24} />
            </button>

            <div className="text-center">
              <p className="text-white font-bold text-sm">
                {new Date(selectedPhoto.createdAt).toLocaleDateString("pt-BR")}
              </p>
              <p className="text-white/70 text-xs">
                {new Date(selectedPhoto.createdAt).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            {/* BOTÃO DE EXCLUIR — agora abre o modal */}
            <button
              onClick={() => setShowDeleteModal(true)}
              disabled={isDeleting}
              title="Excluir Foto"
              className="w-10 h-10 rounded-full bg-destructive/80 backdrop-blur-md flex items-center justify-center text-white active:bg-destructive transition-colors disabled:opacity-50"
            >
              <Trash pack="basic" width={20} height={20} />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center p-2">
            <img
              src={selectedPhoto.url}
              alt="Visualização"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>

          <div className="pb-safe p-6 bg-linear-to-t from-black/90 to-transparent absolute bottom-0 left-0 right-0">
            <div className="flex items-center justify-between mb-2">
              <span className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-xs font-bold uppercase tracking-wider">
                {getCategoryLabel(selectedPhoto.category)}
              </span>
            </div>
            <p className="text-white text-sm">
              Enviado por:{" "}
              <span className="font-bold">
                {selectedPhoto.uploadedBy?.name || "Usuário"}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* ============================
          MODAL DE CONFIRMAÇÃO DE EXCLUSÃO
          ============================ */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-60 flex items-end sm:items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-photo-modal-title"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !isDeleting && setShowDeleteModal(false)}
          />

          {/* Painel */}
          <div className="relative w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
            {/* Faixa vermelha de alerta */}
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
                    id="delete-photo-modal-title"
                    className="text-lg font-bold text-foreground"
                  >
                    Excluir esta foto?
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
                  A foto será removida permanentemente da galeria da obra e não
                  poderá ser recuperada.
                </p>
              </div>

              {/* Ações */}
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={handleDeletePhoto}
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
                      Sim, excluir foto
                    </>
                  )}
                </button>

                <button
                  onClick={() => setShowDeleteModal(false)}
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
    </div>
  );
}
