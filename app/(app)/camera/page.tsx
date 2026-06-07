// Página de Câmera com marca d'água, markup e scanner QR

"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { BoxIcon, BoxiconsProvider } from "@/components/ui/box-icon";
import { BottomSheet } from "@/components/ui/bottom-sheet";

type CameraMode = "photo" | "scan";
type PhotoCategory =
  | "progress"
  | "issue"
  | "safety"
  | "material"
  | "equipment"
  | "general";

interface CapturedPhoto {
  id: string;
  dataUrl: string;
  timestamp: Date;
  latitude?: number;
  longitude?: number;
  compass?: number;
  hasMarkup: boolean;
  markupDataUrl?: string;
  category: PhotoCategory;
  description?: string;
  scannedCode?: string;
}

const categoryOptions: {
  value: PhotoCategory;
  label: string;
  icon: "image" | "error" | "shield-check" | "layer" | "wrench" | "images";
}[] = [
  { value: "progress", label: "Progresso", icon: "image" },
  { value: "issue", label: "Problema", icon: "error" },
  { value: "safety", label: "Segurança", icon: "shield-check" },
  { value: "material", label: "Material", icon: "layer" },
  { value: "equipment", label: "Equipamento", icon: "wrench" },
  { value: "general", label: "Geral", icon: "images" },
];

export default function CameraPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 bg-black flex items-center justify-center">
          <div className="text-white">Carregando câmera...</div>
        </div>
      }
    >
      <CameraContent />
    </Suspense>
  );
}

function CameraContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = (searchParams.get("mode") as CameraMode) || "photo";

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const markupCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [mode, setMode] = useState<CameraMode>(initialMode);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<CapturedPhoto | null>(
    null,
  );
  const [showMarkup, setShowMarkup] = useState(false);
  const [showCategorySheet, setShowCategorySheet] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<PhotoCategory>("general");
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment",
  );
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [compass, setCompass] = useState<number | null>(null);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [markupColor, setMarkupColor] = useState("#ff0000");
  const [scannedResult, setScannedResult] = useState<string | null>(null);

  // Iniciar câmera
  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (error) {
      console.error("[v0] Camera error:", error);
      alert("Não foi possível acessar a câmera");
    }
  }, [facingMode]);

  // Obter localização
  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => console.error("[v0] GPS error:", error),
        { enableHighAccuracy: true },
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Obter bússola
  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha !== null) {
        setCompass(Math.round(event.alpha));
      }
    };

    if (typeof DeviceOrientationEvent !== "undefined") {
      // Verificar se precisa de permissão (iOS 13+)
      const requestPermission = (
        DeviceOrientationEvent as unknown as {
          requestPermission?: () => Promise<string>;
        }
      ).requestPermission;
      if (typeof requestPermission === "function") {
        requestPermission().then((permission) => {
          if (permission === "granted") {
            window.addEventListener("deviceorientation", handleOrientation);
          }
        });
      } else {
        window.addEventListener("deviceorientation", handleOrientation);
      }
    }

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, []);

  // Iniciar câmera ao montar
  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [startCamera]);

  // Alternar câmera frontal/traseira
  const toggleCamera = async () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  useEffect(() => {
    startCamera();
  }, [facingMode, startCamera]);

  // Capturar foto
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Definir dimensões do canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Desenhar frame do vídeo
    ctx.drawImage(video, 0, 0);

    // Adicionar marca d'água
    const watermark = generateWatermark();
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, canvas.height - 80, canvas.width, 80);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText(watermark.line1, 16, canvas.height - 50);
    ctx.fillText(watermark.line2, 16, canvas.height - 25);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);

    setCapturedPhoto({
      id: Date.now().toString(),
      dataUrl,
      timestamp: new Date(),
      latitude: location?.lat,
      longitude: location?.lng,
      compass: compass ?? undefined,
      hasMarkup: false,
      category: selectedCategory,
    });

    setIsCapturing(false);
  };

  // Gerar texto da marca d'água
  const generateWatermark = () => {
    const now = new Date();
    const date = now.toLocaleDateString("pt-BR");
    const time = now.toLocaleTimeString("pt-BR");

    let line1 = `${date} ${time}`;
    let line2 = "";

    if (location) {
      line2 += `GPS: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
    }
    if (compass !== null) {
      line2 += ` | Bússola: ${compass}°`;
    }

    return { line1, line2 };
  };

  // Markup drawing
  const startDrawing = (e: React.TouchEvent | React.MouseEvent) => {
    if (!showMarkup || !markupCanvasRef.current) return;
    setIsDrawing(true);

    const point = getEventPoint(e);
    setLastPoint(point);
  };

  const draw = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawing || !showMarkup || !markupCanvasRef.current || !lastPoint)
      return;

    const canvas = markupCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const point = getEventPoint(e);

    ctx.strokeStyle = markupColor;
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();

    setLastPoint(point);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setLastPoint(null);
  };

  const getEventPoint = (e: React.TouchEvent | React.MouseEvent) => {
    const canvas = markupCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * (canvas.width / rect.width),
        y: (e.touches[0].clientY - rect.top) * (canvas.height / rect.height),
      };
    } else {
      return {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height),
      };
    }
  };

  // Inicializar canvas de markup
  useEffect(() => {
    if (showMarkup && capturedPhoto && markupCanvasRef.current) {
      const canvas = markupCanvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
      };
      img.src = capturedPhoto.dataUrl;
    }
  }, [showMarkup, capturedPhoto]);

  // Salvar markup
  const saveMarkup = () => {
    if (!markupCanvasRef.current || !capturedPhoto) return;

    const markupDataUrl = markupCanvasRef.current.toDataURL("image/jpeg", 0.9);
    setCapturedPhoto({
      ...capturedPhoto,
      hasMarkup: true,
      markupDataUrl,
      dataUrl: markupDataUrl,
    });
    setShowMarkup(false);
  };

  // Limpar markup
  const clearMarkup = () => {
    if (!markupCanvasRef.current || !capturedPhoto) return;

    const canvas = markupCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = capturedPhoto.dataUrl;
  };

  // Salvar foto
  const savePhoto = async () => {
    if (!capturedPhoto) return;

    // Aqui salvaria no IndexedDB e adicionaria à fila de sincronização
    console.log("[v0] Saving photo:", capturedPhoto);

    // Voltar para a câmera
    setCapturedPhoto(null);
    router.push("/dashboard");
  };

  // Descartar foto
  const discardPhoto = () => {
    setCapturedPhoto(null);
    setShowMarkup(false);
  };

  return (
    <BoxiconsProvider>
      <div className="fixed inset-0 bg-black">
        {/* Camera view */}
        {!capturedPhoto && (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />

            {/* Scanner overlay */}
            {mode === "scan" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-64 h-64">
                  <div className="qr-corner-tl" />
                  <div className="qr-corner-tr" />
                  <div className="qr-corner-bl" />
                  <div className="qr-corner-br" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-white text-center text-sm bg-black/50 px-4 py-2 rounded-lg">
                      Aponte para o código QR ou de barras
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Info overlay */}
            <div className="absolute top-0 left-0 right-0 pt-safe px-4 py-4 bg-linear-to-b from-black/70 to-transparent">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center"
                >
                  <BoxIcon name="x" size={24} className="text-white" />
                </button>

                <div className="flex items-center gap-2 text-white text-sm bg-black/50 px-3 py-2 rounded-full">
                  {location && (
                    <>
                      <BoxIcon name="map-pin" size={16} />
                      <span>
                        {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                      </span>
                    </>
                  )}
                  {compass !== null && (
                    <>
                      <span className="mx-1">|</span>
                      <BoxIcon name="compass" size={16} />
                      <span>{compass}°</span>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={toggleCamera}
                  className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center"
                >
                  <BoxIcon name="refresh" size={24} className="text-white" />
                </button>
              </div>
            </div>

            {/* Mode toggle */}
            <div className="absolute top-24 left-1/2 -translate-x-1/2">
              <div className="flex bg-black/50 rounded-full p-1">
                <button
                  type="button"
                  onClick={() => setMode("photo")}
                  className={cn(
                    "px-6 py-2 rounded-full text-sm font-medium transition-colors",
                    mode === "photo" ? "bg-white text-black" : "text-white",
                  )}
                >
                  Foto
                </button>
                <button
                  type="button"
                  onClick={() => setMode("scan")}
                  className={cn(
                    "px-6 py-2 rounded-full text-sm font-medium transition-colors",
                    mode === "scan" ? "bg-white text-black" : "text-white",
                  )}
                >
                  Scanner
                </button>
              </div>
            </div>

            {/* Camera controls */}
            <div className="absolute bottom-0 left-0 right-0 pb-safe px-6 py-8">
              <div className="flex items-center justify-center gap-8">
                {/* Category selector */}
                <button
                  type="button"
                  onClick={() => setShowCategorySheet(true)}
                  className="w-14 h-14 rounded-full bg-black/50 flex items-center justify-center"
                >
                  <BoxIcon
                    name={
                      categoryOptions.find((c) => c.value === selectedCategory)
                        ?.icon || "images"
                    }
                    size={24}
                    className="text-white"
                  />
                </button>

                {/* Capture button */}
                <button
                  type="button"
                  onClick={capturePhoto}
                  disabled={isCapturing}
                  className={cn(
                    "w-20 h-20 rounded-full bg-white border-4 border-white/50",
                    "flex items-center justify-center",
                    "active:scale-95 transition-transform",
                    "disabled:opacity-50",
                  )}
                >
                  {mode === "scan" ? (
                    <BoxIcon name="qr-scan" size={32} className="text-black" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-white" />
                  )}
                </button>

                {/* Flash toggle */}
                <button
                  type="button"
                  onClick={() => setFlashEnabled(!flashEnabled)}
                  className="w-14 h-14 rounded-full bg-black/50 flex items-center justify-center"
                >
                  <BoxIcon
                    name={(flashEnabled ? "sun" : "moon") as any}
                    size={24}
                    className="text-white"
                  />
                </button>
              </div>
            </div>
          </>
        )}

        {/* Photo preview */}
        {capturedPhoto && !showMarkup && (
          <div className="absolute inset-0 bg-black flex flex-col">
            <div className="flex-1 flex items-center justify-center p-4">
              <img
                src={capturedPhoto.dataUrl}
                alt="Foto capturada"
                className="max-w-full max-h-full object-contain rounded-2xl"
              />
            </div>

            <div className="px-6 py-4 pb-safe space-y-4">
              {/* Category badge */}
              <div className="flex items-center justify-center gap-2">
                <span className="px-4 py-2 bg-white/20 rounded-full text-white text-sm font-medium">
                  {
                    categoryOptions.find((c) => c.value === selectedCategory)
                      ?.label
                  }
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={discardPhoto}
                  className={cn(
                    "flex-1 min-h-14 rounded-xl",
                    "bg-white/20 text-white",
                    "font-semibold flex items-center justify-center gap-2",
                    "active:scale-98 transition-transform",
                  )}
                >
                  <BoxIcon name="trash" size={20} />
                  Descartar
                </button>
                <button
                  type="button"
                  onClick={() => setShowMarkup(true)}
                  className={cn(
                    "flex-1 min-h-14 rounded-xl",
                    "bg-white/20 text-white",
                    "font-semibold flex items-center justify-center gap-2",
                    "active:scale-98 transition-transform",
                  )}
                >
                  <BoxIcon name="pencil" size={20} />
                  Marcar
                </button>
                <button
                  type="button"
                  onClick={savePhoto}
                  className={cn(
                    "flex-1 min-h-14 rounded-xl",
                    "bg-success text-success-foreground",
                    "font-semibold flex items-center justify-center gap-2",
                    "active:scale-98 transition-transform",
                  )}
                >
                  <BoxIcon name="check" size={20} />
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Markup editor */}
        {showMarkup && capturedPhoto && (
          <div className="absolute inset-0 bg-black flex flex-col">
            {/* Markup toolbar */}
            <div className="pt-safe px-4 py-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowMarkup(false)}
                className="px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium"
              >
                Cancelar
              </button>

              <div className="flex items-center gap-2">
                {["#ff0000", "#ffff00", "#00ff00", "#ffffff"].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setMarkupColor(color)}
                    className={cn(
                      "w-8 h-8 rounded-full border-2",
                      markupColor === color
                        ? "border-white"
                        : "border-transparent",
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={clearMarkup}
                  className="px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium"
                >
                  Limpar
                </button>
                <button
                  type="button"
                  onClick={saveMarkup}
                  className="px-4 py-2 rounded-full bg-success text-success-foreground text-sm font-medium"
                >
                  Aplicar
                </button>
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 flex items-center justify-center p-4">
              <canvas
                ref={markupCanvasRef}
                className="max-w-full max-h-full object-contain touch-none rounded-2xl"
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
            </div>

            <div className="px-6 py-4 pb-safe">
              <p className="text-center text-white/60 text-sm">
                Desenhe com o dedo para marcar áreas na foto
              </p>
            </div>
          </div>
        )}

        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Category sheet */}
        <BottomSheet
          open={showCategorySheet}
          onClose={() => setShowCategorySheet(false)}
          title="Categoria da Foto"
        >
          <div className="grid grid-cols-2 gap-3">
            {categoryOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setSelectedCategory(option.value);
                  setShowCategorySheet(false);
                }}
                className={cn(
                  "p-4 rounded-xl flex flex-col items-center gap-2",
                  "transition-colors",
                  selectedCategory === option.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground",
                )}
              >
                <BoxIcon name={option.icon} size={28} />
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </BottomSheet>
      </div>
    </BoxiconsProvider>
  );
}
