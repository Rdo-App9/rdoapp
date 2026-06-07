// Input grande otimizado para canteiro de obras
// Com suporte a entrada por voz (speech-to-text)

"use client";

import { forwardRef, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { BoxIcon } from "./box-icon";

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
        onVoiceResult?.(transcript);
      };

      recognition.start();
    };

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-base font-medium text-foreground">
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
              "bg-input border border-border text-foreground",
              "placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
              "transition-colors duration-200",
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
                "absolute right-3 top-1/2 -translate-y-1/2",
                "w-10 h-10 rounded-full flex items-center justify-center",
                "transition-colors",
                isListening
                  ? "bg-destructive text-destructive-foreground animate-pulse"
                  : "bg-primary text-primary-foreground",
              )}
              aria-label={isListening ? "Ouvindo..." : "Entrada por voz"}
            >
              <BoxIcon name="microphone" size={20} />
            </button>
          )}
        </div>
        {error && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <BoxIcon name="error-circle" size={16} />
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
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        onVoiceResult?.(transcript);
      };

      recognition.start();
    };

    return (
      <div className="space-y-2">
        {label && (
          <div className="flex items-center justify-between">
            <label className="block text-base font-medium text-foreground">
              {label}
            </label>
            {showVoiceInput && (
              <button
                type="button"
                onClick={startVoiceInput}
                className={cn(
                  "px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium",
                  "transition-colors",
                  isListening
                    ? "bg-destructive text-destructive-foreground animate-pulse"
                    : "bg-primary text-primary-foreground",
                )}
              >
                <BoxIcon name="microphone" size={18} />
                {isListening ? "Ouvindo..." : "Ditar"}
              </button>
            )}
          </div>
        )}
        <textarea
          ref={setRefs}
          className={cn(
            "w-full min-h-30 px-5 py-4 text-lg rounded-xl resize-none",
            "bg-input border border-border text-foreground",
            "placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
            "transition-colors duration-200",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-destructive focus:ring-destructive",
            className,
          )}
          {...props}
        />
        {error && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <BoxIcon name="error-circle" size={16} />
            {error}
          </p>
        )}
      </div>
    );
  },
);

LargeTextarea.displayName = "LargeTextarea";
