"use client";

import { forwardRef, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, Microphone } from "@boxicons/react";

// ==================== FUNÇÃO MÁGICA DE PONTUAÇÃO ====================
// Transforma comandos de voz ("vírgula", "ponto final") nos caracteres reais
const formatVoiceText = (text: string): string => {
  let formatted = text.toLowerCase();

  const replacements: Record<string, string> = {
    " vírgula": ",",
    "vírgula ": ", ",
    " ponto final": ".",
    "ponto final ": ". ",
    " ponto de interrogação": "?",
    "ponto de interrogação ": "? ",
    " ponto de exclamação": "!",
    "ponto de exclamação ": "! ",
    " nova linha": "\n",
    "nova linha ": "\n",
    " três pontos": "...",
    " reticências": "...",
  };

  for (const [spokenPattern, punctuation] of Object.entries(replacements)) {
    // Usamos split e join como um replaceAll case-insensitive rápido
    formatted = formatted.split(spokenPattern).join(punctuation);
  }

  // Capitaliza a primeira letra após aplicar a formatação
  if (formatted.length > 0) {
    formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

  return formatted;
};

interface LargeInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  showVoiceInput?: boolean;
  onVoiceResult?: (text: string) => void;
}

export const LargeInput = forwardRef<HTMLInputElement, LargeInputProps>(
  (
    {
      label,
      error,
      icon,
      showVoiceInput = false,
      onVoiceResult,
      className,
      ...props
    },
    ref,
  ) => {
    const [isListening, setIsListening] = useState(false);

    const startVoiceInput = () => {
      const SpeechRecognitionAPI =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (!SpeechRecognitionAPI) {
        alert("Reconhecimento de voz não suportado neste navegador");
        return;
      }

      const recognition = new SpeechRecognitionAPI();
      recognition.lang = "pt-BR";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        const formattedText = formatVoiceText(transcript); // Aplica a formatação
        onVoiceResult?.(formattedText);
      };

      recognition.start();
    };

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-base font-bold text-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full min-h-14 px-5 text-lg rounded-xl",
              "bg-input border border-border text-foreground shadow-sm",
              "placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
              "transition-all duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              icon && "pl-14",
              showVoiceInput && "pr-14",
              error && "border-destructive focus:ring-destructive",
              className,
            )}
            {...props}
          />
          {showVoiceInput && (
            <button
              type="button"
              onClick={startVoiceInput}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2",
                "w-10 h-10 rounded-lg flex items-center justify-center",
                "transition-all active:scale-95",
                isListening
                  ? "bg-destructive text-destructive-foreground animate-pulse shadow-md shadow-destructive/20"
                  : "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
              aria-label={isListening ? "Ouvindo..." : "Entrada por voz"}
            >
              <Microphone pack="basic" width={20} height={20} />
            </button>
          )}
        </div>
        {error && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle pack="basic" width={16} height={16} />
            {error}
          </p>
        )}
      </div>
    );
  },
);
LargeInput.displayName = "LargeInput";

// ==================== TEXTAREA ====================

interface LargeTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  showVoiceInput?: boolean;
  onVoiceResult?: (text: string) => void;
}

export const LargeTextarea = forwardRef<
  HTMLTextAreaElement,
  LargeTextareaProps
>(
  (
    {
      label,
      error,
      showVoiceInput = false,
      onVoiceResult,
      className,
      ...props
    },
    ref,
  ) => {
    const [isListening, setIsListening] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const setRefs = (element: HTMLTextAreaElement | null) => {
      textareaRef.current = element!;
      if (typeof ref === "function") {
        ref(element);
      } else if (ref) {
        ref.current = element;
      }
    };

    const startVoiceInput = () => {
      const SpeechRecognitionAPI =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (!SpeechRecognitionAPI) {
        alert("Reconhecimento de voz não suportado neste navegador");
        return;
      }

      const recognition = new SpeechRecognitionAPI();
      recognition.lang = "pt-BR";
      recognition.continuous = false; // Se for false, ele para quando o usuário pausa
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        const formattedText = formatVoiceText(transcript); // Aplica a formatação inteligente
        onVoiceResult?.(formattedText);
      };

      recognition.start();
    };

    return (
      <div className="space-y-2">
        {label && (
          <div className="flex items-center justify-between">
            <label className="block text-sm uppercase tracking-wider font-bold text-muted-foreground">
              {label}
            </label>
            {showVoiceInput && (
              <button
                type="button"
                onClick={startVoiceInput}
                className={cn(
                  "px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-bold uppercase tracking-wider",
                  "transition-all active:scale-95",
                  isListening
                    ? "bg-destructive text-destructive-foreground animate-pulse shadow-md shadow-destructive/20"
                    : "bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground",
                )}
              >
                <Microphone pack="basic" width={16} height={16} />
                {isListening ? "Gravando..." : "Ditar Texto"}
              </button>
            )}
          </div>
        )}
        <textarea
          ref={setRefs}
          className={cn(
            "w-full min-h-30 px-5 py-4 text-base rounded-xl resize-none",
            "bg-card border border-border text-foreground shadow-sm",
            "placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
            "transition-all duration-200",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-destructive focus:ring-destructive",
            className,
          )}
          {...props}
        />
        {error && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle pack="basic" width={16} height={16} />
            {error}
          </p>
        )}
      </div>
    );
  },
);
LargeTextarea.displayName = "LargeTextarea";
