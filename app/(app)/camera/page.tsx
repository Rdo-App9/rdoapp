"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { BoxIcon, BoxiconsProvider } from "@/components/ui/box-icon";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import jsQR from "jsqr"; // <--- Biblioteca que decodifica o QR

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
        <div className="fixed inset-0 bg-black flex items-center justify-center text-white">
          Carregando câmera...
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

  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [compass, setCompass] = useState<number | null>(null);
  const [flashEnabled, setFlashEnabled] = useState(false); // Flash via WebRTC é limitado, mantido apenas o toggle visual

  // Estados para o Scanner
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const scanLoopRef = useRef<number | null>(null);

  // Estados de Desenho (Markup)
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [markupColor, setMarkupColor] = useState("#ff0000");

  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Evita erro no Safari ao dar play
        videoRef.current.setAttribute("playsinline", "true");
        await videoRef.current.play();
      }
    } catch (error) {
      console.error("[Camera error]:", error);
      alert("Não foi possível acessar a câmera. Verifique as permissões.");
    }
  }, []);

  // GPS e Bússola
  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) =>
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.error(err),
        { enableHighAccuracy: true },
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha !== null) setCompass(Math.round(e.alpha));
    };
    window.addEventListener("deviceorientation", handleOrientation);
    return () =>
      window.removeEventListener("deviceorientation", handleOrientation);
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current)
        streamRef.current.getTracks().forEach((track) => track.stop());
      if (scanLoopRef.current) cancelAnimationFrame(scanLoopRef.current);
    };
  }, [startCamera]);

  // ==================== LÓGICA DO SCANNER ====================
  useEffect(() => {
    const scanTick = () => {
      if (
        mode === "scan" &&
        videoRef.current &&
        videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA
      ) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d", { willReadFrequently: true });

          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(
              0,
              0,
              canvas.width,
              canvas.height,
            );
            const code = jsQR(
              imageData.data,
              imageData.width,
              imageData.height,
              {
                inversionAttempts: "dontInvert",
              },
            );

            if (code) {
              setScannedResult(code.data);
              if (navigator.vibrate) navigator.vibrate(200); // Feedback tátil ao ler
              return; // Pausa o scanner se achar algo
            }
          }
        }
      }
      // Continua o loop apenas se estiver no modo scan e não tiver achado nada
      if (mode === "scan" && !scannedResult) {
        scanLoopRef.current = requestAnimationFrame(scanTick);
      }
    };

    if (mode === "scan" && !scannedResult) {
      scanLoopRef.current = requestAnimationFrame(scanTick);
    }

    return () => {
      if (scanLoopRef.current) cancelAnimationFrame(scanLoopRef.current);
    };
  }, [mode, scannedResult]);

  // ==================== LÓGICA DA FOTO ====================
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const now = new Date();
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, canvas.height - 80, canvas.width, 80);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText(
      `${now.toLocaleDateString("pt-BR")} ${now.toLocaleTimeString("pt-BR")}`,
      16,
      canvas.height - 50,
    );

    if (location) {
      ctx.fillText(
        `GPS: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`,
        16,
        canvas.height - 25,
      );
    }

    setCapturedPhoto({
      id: Date.now().toString(),
      dataUrl: canvas.toDataURL("image/jpeg", 0.9),
      timestamp: now,
      latitude: location?.lat,
      longitude: location?.lng,
      compass: compass ?? undefined,
      hasMarkup: false,
      category: selectedCategory,
    });
    setIsCapturing(false);
  };

  // ==================== MARKUP (DESENHO) ====================
  const getEventPoint = (e: React.TouchEvent | React.MouseEvent) => {
    const canvas = markupCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * (canvas.width / rect.width),
        y: (e.touches[0].clientY - rect.top) * (canvas.height / rect.height),
      };
    }
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const startDrawing = (e: React.TouchEvent | React.MouseEvent) => {
    if (!showMarkup || !markupCanvasRef.current) return;
    setIsDrawing(true);
    setLastPoint(getEventPoint(e));
  };

  const draw = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawing || !showMarkup || !markupCanvasRef.current || !lastPoint)
      return;
    const ctx = markupCanvasRef.current.getContext("2d");
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

  useEffect(() => {
    if (showMarkup && capturedPhoto && markupCanvasRef.current) {
      const canvas = markupCanvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
      };
      img.src = capturedPhoto.dataUrl;
    }
  }, [showMarkup, capturedPhoto]);

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

  return (
    <BoxiconsProvider>
      <div className="fixed inset-0 bg-black overflow-hidden flex flex-col">
        {/* ==================== CÂMERA AO VIVO ==================== */}
        {!capturedPhoto && (
          <div className="relative flex-1">
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              playsInline
              muted
            />

            {/* Overlay Scanner */}
            {mode === "scan" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="relative w-64 h-64 border-2 border-white/30 rounded-lg">
                  <div className="qr-corner-tl absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                  <div className="qr-corner-tr absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                  <div className="qr-corner-bl absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                  <div className="qr-corner-br absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />

                  {/* Linha animada do scanner */}
                  {!scannedResult && (
                    <div className="absolute left-0 right-0 h-0.5 bg-primary animate-[scan_2s_ease-in-out_infinite]" />
                  )}
                </div>

                {scannedResult ? (
                  <div className="mt-8 bg-success/90 p-4 rounded-xl text-center max-w-[80%] backdrop-blur-sm">
                    <p className="text-white text-sm font-medium mb-2 break-all">
                      {scannedResult}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setScannedResult(null)}
                        className="flex-1 px-4 py-2 bg-black/30 rounded-lg text-white text-xs font-semibold"
                      >
                        Ler outro
                      </button>
                      <button
                        onClick={() => {
                          alert("Vincular QR Code: " + scannedResult);
                          setScannedResult(null);
                        }}
                        className="flex-1 px-4 py-2 bg-white text-black rounded-lg text-xs font-bold"
                      >
                        Usar Código
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-white text-center text-sm bg-black/60 px-4 py-2 rounded-full mt-6 backdrop-blur-md">
                    Centralize o QR Code
                  </p>
                )}
              </div>
            )}

            {/* Info Superior (GPS/Sair) */}
            <div className="absolute top-0 left-0 right-0 pt-safe px-4 py-4 bg-linear-to-b from-black/80 to-transparent">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center"
                >
                  <BoxIcon name="x" size={24} className="text-white" />
                </button>
                <div className="flex items-center gap-2 text-white text-xs font-medium bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full">
                  {location ? (
                    <>
                      <BoxIcon name="map-pin" size={14} />
                      <span>
                        {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                      </span>
                    </>
                  ) : (
                    <span>Buscando GPS...</span>
                  )}
                </div>
                <div className="w-10 h-10" /> {/* Espaçador */}
              </div>
            </div>

            {/* Abas Foto / Scanner */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10">
              <div className="flex bg-black/50 backdrop-blur-md rounded-full p-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode("photo");
                    setScannedResult(null);
                  }}
                  className={cn(
                    "px-5 py-1.5 rounded-full text-xs font-semibold transition-all",
                    mode === "photo" ? "bg-white text-black" : "text-white",
                  )}
                >
                  Foto
                </button>
                <button
                  type="button"
                  onClick={() => setMode("scan")}
                  className={cn(
                    "px-5 py-1.5 rounded-full text-xs font-semibold transition-all",
                    mode === "scan" ? "bg-white text-black" : "text-white",
                  )}
                >
                  Scanner
                </button>
              </div>
            </div>

            {/* Controles Inferiores da Câmera */}
            <div className="absolute bottom-0 left-0 right-0 pb-safe pt-24 pb-8 bg-linear-to-t from-black via-black/80 to-transparent">
              {mode === "photo" && (
                <div className="flex items-center justify-around px-6 max-w-sm mx-auto">
                  <button
                    type="button"
                    onClick={() => setShowCategorySheet(true)}
                    className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-all"
                  >
                    <BoxIcon
                      name={
                        categoryOptions.find(
                          (c) => c.value === selectedCategory,
                        )?.icon || "images"
                      }
                      size={20}
                      className="text-white"
                    />
                  </button>

                  <button
                    type="button"
                    onClick={capturePhoto}
                    disabled={isCapturing}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white border-4 border-white/50 flex items-center justify-center active:scale-95 transition-transform"
                  >
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setFlashEnabled(!flashEnabled)}
                    className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center active:scale-95 transition-all"
                  >
                    <BoxIcon
                      name={(flashEnabled ? "sun" : "moon") as any}
                      size={20}
                      className="text-white"
                    />
                  </button>
                </div>
              )}
            </div>

            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}

        {/* ==================== PRÉ-VISUALIZAÇÃO DA FOTO ==================== */}
        {capturedPhoto && !showMarkup && (
          <div className="absolute inset-0 bg-black flex flex-col z-20">
            <div className="flex-1 flex items-center justify-center p-4">
              <img
                src={capturedPhoto.dataUrl}
                alt="Preview"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>

            <div className="px-4 py-4 pb-safe bg-black/90">
              <div className="flex justify-center mb-4">
                <span className="px-4 py-1.5 bg-white/10 rounded-full text-white text-xs font-semibold uppercase tracking-wider">
                  {
                    categoryOptions.find((c) => c.value === selectedCategory)
                      ?.label
                  }
                </span>
              </div>

              {/* Botões ajustados para telas pequenas (Grid 3 colunas) */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setCapturedPhoto(null)}
                  className="h-12 rounded-lg bg-white/10 text-white text-xs sm:text-sm font-semibold flex flex-col items-center justify-center gap-1 active:bg-white/20 transition-all"
                >
                  <BoxIcon name="trash" size={18} />
                  Descartar
                </button>
                <button
                  type="button"
                  onClick={() => setShowMarkup(true)}
                  className="h-12 rounded-lg bg-white/10 text-white text-xs sm:text-sm font-semibold flex flex-col items-center justify-center gap-1 active:bg-white/20 transition-all"
                >
                  <BoxIcon name="pencil" size={18} />
                  Marcar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCapturedPhoto(null);
                    router.push("/dashboard");
                  }}
                  className="h-12 rounded-lg bg-success text-success-foreground text-xs sm:text-sm font-semibold flex flex-col items-center justify-center gap-1 active:scale-[0.98] transition-all"
                >
                  <BoxIcon name="check" size={18} />
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== EDITOR DE DESENHO (MARKUP) ==================== */}
        {showMarkup && capturedPhoto && (
          <div className="absolute inset-0 bg-black flex flex-col z-30">
            <div className="pt-safe px-4 py-4 flex items-center justify-between bg-black/90">
              <button
                type="button"
                onClick={() => setShowMarkup(false)}
                className="px-3 py-1.5 rounded-md bg-white/10 text-white text-xs font-medium"
              >
                Cancelar
              </button>
              <div className="flex gap-2">
                {["#ff0000", "#ffff00", "#00ff00", "#ffffff"].map((color) => (
                  <button
                    key={color}
                    onClick={() => setMarkupColor(color)}
                    className={cn(
                      "w-6 h-6 rounded-full border-2",
                      markupColor === color
                        ? "border-white"
                        : "border-transparent",
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={saveMarkup}
                className="px-3 py-1.5 rounded-md bg-success text-success-foreground text-xs font-medium"
              >
                Aplicar
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center p-4">
              <canvas
                ref={markupCanvasRef}
                className="max-w-full max-h-full object-contain touch-none rounded-lg"
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
            </div>
          </div>
        )}

        <BottomSheet
          open={showCategorySheet}
          onClose={() => setShowCategorySheet(false)}
          title="Categoria da Foto"
        >
          <div className="grid grid-cols-2 gap-3 pb-6">
            {categoryOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setSelectedCategory(option.value);
                  setShowCategorySheet(false);
                }}
                className={cn(
                  "p-4 rounded-xl flex flex-col items-center gap-2 border transition-all",
                  selectedCategory === option.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-transparent text-foreground",
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
