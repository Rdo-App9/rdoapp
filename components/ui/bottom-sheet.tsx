// Bottom Sheet - Substitui dropdowns para melhor usabilidade mobile

"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { BoxIcon } from "./box-icon";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  className,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  // Previne scroll do body quando aberto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Fecha ao clicar no overlay
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Fecha com Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "bottom-sheet-title" : undefined}
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50",
          "bg-card rounded-t-3xl",
          "max-h-[85vh] overflow-y-auto",
          "animate-in slide-in-from-bottom duration-300",
          "pb-safe",
          className,
        )}
      >
        {/* Handle */}
        <div className="sticky top-0 bg-card pt-3 pb-2 z-10">
          <div
            className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto cursor-grab"
            aria-hidden="true"
          />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 pb-4 border-b border-border">
            <h2
              id="bottom-sheet-title"
              className="text-xl font-semibold text-foreground"
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className={cn(
                "w-10 h-10 rounded-full bg-secondary",
                "flex items-center justify-center",
                "active:scale-95 transition-transform",
              )}
              aria-label="Fechar"
            >
              <BoxIcon name="x" size={20} />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </>
  );
}

// Opção de seleção para Bottom Sheet
interface BottomSheetOptionProps {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  selected?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function BottomSheetOption({
  label,
  description,
  icon,
  selected = false,
  onClick,
  disabled = false,
}: BottomSheetOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full min-h-16 px-4 py-4 rounded-2xl",
        "flex items-center gap-4 text-left",
        "transition-colors duration-150",
        "disabled:opacity-50 disabled:pointer-events-none",
        selected
          ? "bg-primary/10 border-2 border-primary"
          : "bg-secondary border-2 border-transparent hover:bg-accent",
      )}
    >
      {icon && (
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            selected ? "bg-primary text-primary-foreground" : "bg-muted",
          )}
        >
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-lg font-medium",
            selected ? "text-primary" : "text-foreground",
          )}
        >
          {label}
        </p>
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      {selected && (
        <BoxIcon name="check-circle" size={24} className="text-primary" />
      )}
    </button>
  );
}
