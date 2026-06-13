"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { BoxIcon, BoxiconsProvider } from "@/components/ui/box-icon";
import { BottomSheet, BottomSheetOption } from "@/components/ui/bottom-sheet";
import jsQR from "jsqr";

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

  // Agora lemos o ID da obra gravado pelo Dashboard no celular!
  const [projectId, setProjectId] = useState<string | null>(null);

  useEffect(() => {
    // 1. Tenta pegar da URL (se veio pelo botão Ações Rápidas)
    const urlProjectId = searchParams.get("projectId");
    // 2. Se não veio da URL, tenta pegar da memória do celular (se veio pelo menu inferior)
    const savedProjectId = localStorage.getItem("@rdo:activeProjectId");

    const activeId = urlProjectId || savedProjectId;

    if (activeId) {
      setProjectId(activeId);
    } else {
      alert(
        "Nenhuma obra selecionada! Volte ao painel e selecione uma obra primeiro.",
      );
      router.push("/dashboard");
    }
  }, [searchParams, router]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const markupCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isDeviceSupported, setIsDeviceSupported] = useState<boolean | null>(
    null,
  );
  const [mode, setMode] = useState<CameraMode>(initialMode);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isUploading, setIsUploading] = useState(false); // NOVO ESTADO
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
  const [flashEnabled, setFlashEnabled] = useState(false);

  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [isProcessingCode, setIsProcessingCode] = useState(false);
  const scanLoopRef = useRef<number | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [markupColor, setMarkupColor] = useState("#ff0000");

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileAgent =
      /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent,
      );
    const isIPadOS =
      navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
    setIsDeviceSupported(isMobileAgent || isIPadOS);
  }, [projectId, router]);

  const startCamera = useCallback(async () => {
    if (!isDeviceSupported) return;
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
        videoRef.current.setAttribute("playsinline", "true");
        await videoRef.current.play();
      }
    } catch (error) {
      console.error("[Camera error]:", error);
    }
  }, [isDeviceSupported]);

  useEffect(() => {
    if (!isDeviceSupported) return;
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) =>
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.error(err),
        { enableHighAccuracy: true },
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [isDeviceSupported]);

  useEffect(() => {
    if (!isDeviceSupported) return;
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha !== null) setCompass(Math.round(e.alpha));
    };
    window.addEventListener("deviceorientation", handleOrientation);
    return () =>
      window.removeEventListener("deviceorientation", handleOrientation);
  }, [isDeviceSupported]);

  useEffect(() => {
    if (isDeviceSupported) startCamera();
    return () => {
      if (streamRef.current)
        streamRef.current.getTracks().forEach((track) => track.stop());
      if (scanLoopRef.current) cancelAnimationFrame(scanLoopRef.current);
    };
  }, [startCamera, isDeviceSupported]);

  useEffect(() => {
    if (!isDeviceSupported) return;
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
              { inversionAttempts: "dontInvert" },
            );
            if (code) {
              setScannedResult(code.data);
              if (navigator.vibrate) navigator.vibrate(200);
              return;
            }
          }
        }
      }
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
  }, [mode, scannedResult, isDeviceSupported]);

  const handleUseCode = async () => {
    setIsProcessingCode(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    router.push("/dashboard");
  };

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

  // ==================== LÓGICA DE UPLOAD PARA O CLOUDFLARE ====================
  const dataURLtoBlob = (dataurl: string) => {
    let arr = dataurl.split(","),
      mime = arr[0].match(/:(.*?);/)![1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const handleUpload = async () => {
    if (!capturedPhoto || !projectId) return;
    setIsUploading(true);

    try {
      const blob = dataURLtoBlob(capturedPhoto.dataUrl);
      const file = new File([blob], `photo_${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("projectId", projectId);
      formData.append("category", capturedPhoto.category);
      if (capturedPhoto.latitude)
        formData.append("latitude", capturedPhoto.latitude.toString());
      if (capturedPhoto.longitude)
        formData.append("longitude", capturedPhoto.longitude.toString());

      const res = await fetch("/api/photos", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Erro ao salvar a foto");
      }

      // Sucesso! Limpa a foto da tela e avisa o usuário
      alert("Foto salva com sucesso na obra!");
      setCapturedPhoto(null);
      // Se quiser voltar pro Dashboard logo após bater 1 foto, descomente a linha abaixo:
      // router.push("/dashboard");
    } catch (error) {
      alert(
        "Erro ao enviar a imagem. Verifique sua conexão e tente novamente.",
      );
      console.error(error);
    } finally {
      setIsUploading(false);
    }
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
      {isDeviceSupported === null ? (
        <div className="fixed inset-0 bg-black flex items-center justify-center text-white">
          Iniciando câmera...
        </div>
      ) : isDeviceSupported === false ? (
        <div className="fixed inset-0 bg-background flex flex-col items-center justify-center p-6 text-center z-50">
          <div className="w-20 h-20 rounded-full bg-secondary/30 flex items-center justify-center mb-6">
            <BoxIcon name="phone" size={40} className="text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-3">
            Dispositivo Incompatível
          </h2>
          <p className="text-sm text-muted-foreground mb-8 max-w-xs mx-auto leading-relaxed">
            A funcionalidade de câmera e scanner foi otimizada exclusivamente
            para o uso em campo através de smartphones ou tablets.
          </p>
          <button
            onClick={() => router.back()}
            className="h-12 px-8 rounded-md bg-primary text-primary-foreground text-sm font-bold flex items-center gap-2 active:scale-95 transition-transform"
          >
            <BoxIcon name="chevron-left" size={20} /> Voltar ao Painel
          </button>
        </div>
      ) : (
        <div className="fixed inset-0 bg-black overflow-hidden flex flex-col">
          <style
            dangerouslySetInnerHTML={{
              __html: `@keyframes scanLine { 0% { top: 0px; opacity: 0; } 15% { opacity: 1; } 85% { opacity: 1; } 100% { top: 250px; opacity: 0; } } .animate-scan-line { animation: scanLine 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite; }`,
            }}
          />

          {!capturedPhoto && (
            <div className="relative flex-1">
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                playsInline
                muted
              />
              {mode === "scan" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {/* ... conteúdo do scanner (omitido para brevidade) ... */}
                </div>
              )}

              <div className="absolute top-0 left-0 right-0 pt-safe px-4 py-4 bg-linear-to-b from-black/80 to-transparent z-10">
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
                  <div className="w-10 h-10" />
                </div>
              </div>

              <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10">
                <div className="flex bg-black/50 backdrop-blur-md rounded-full p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("photo");
                      setScannedResult(null);
                    }}
                    className={cn(
                      "px-6 py-2 rounded-full text-sm font-semibold transition-all",
                      mode === "photo" ? "bg-white text-black" : "text-white",
                    )}
                  >
                    Foto
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("scan")}
                    className={cn(
                      "px-6 py-2 rounded-full text-sm font-semibold transition-all",
                      mode === "scan" ? "bg-white text-black" : "text-white",
                    )}
                  >
                    Scanner
                  </button>
                </div>
              </div>

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

          {capturedPhoto && !showMarkup && (
            <div className="absolute inset-0 bg-black flex flex-col z-20">
              <div className="flex-1 flex items-center justify-center p-4">
                <img
                  src={capturedPhoto.dataUrl}
                  alt="Preview"
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              </div>
              <div className="px-4 py-4 pb-safe bg-black/90 border-t border-white/10">
                <div className="flex justify-center mb-4">
                  <span className="px-4 py-1.5 bg-white/10 rounded-full text-white text-xs font-semibold uppercase tracking-wider">
                    {
                      categoryOptions.find((c) => c.value === selectedCategory)
                        ?.label
                    }
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setCapturedPhoto(null)}
                    disabled={isUploading}
                    className="h-14 rounded-xl bg-white/10 text-white text-xs sm:text-sm font-semibold flex flex-col items-center justify-center gap-1 active:bg-white/20 transition-all disabled:opacity-50"
                  >
                    <BoxIcon name="trash" size={20} /> Descartar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMarkup(true)}
                    disabled={isUploading}
                    className="h-14 rounded-xl bg-white/10 text-white text-xs sm:text-sm font-semibold flex flex-col items-center justify-center gap-1 active:bg-white/20 transition-all disabled:opacity-50"
                  >
                    <BoxIcon name="pencil" size={20} /> Marcar
                  </button>
                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="h-14 rounded-xl bg-success text-success-foreground text-xs sm:text-sm font-semibold flex flex-col items-center justify-center gap-1 active:scale-[0.98] transition-all disabled:opacity-70"
                  >
                    {isUploading ? (
                      <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <BoxIcon name="check" size={20} />
                        Guardar na Obra
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {showMarkup && capturedPhoto && (
            <div className="absolute inset-0 bg-black flex flex-col z-30">
              {/* ... editor markup mantido idêntico ... */}
              <div className="pt-safe px-4 py-4 flex items-center justify-between bg-black/90">
                <button
                  type="button"
                  onClick={() => setShowMarkup(false)}
                  className="px-3 py-1.5 rounded-md bg-white/10 text-white text-xs font-medium"
                >
                  Cancelar
                </button>
                <div className="flex gap-3">
                  {["#ff0000", "#ffff00", "#00ff00", "#ffffff"].map((color) => (
                    <button
                      key={color}
                      onClick={() => setMarkupColor(color)}
                      className={cn(
                        "w-7 h-7 rounded-full border-2",
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
            <div className="grid grid-cols-2 gap-3 pb-6 px-4">
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
      )}
    </BoxiconsProvider>
  );
}
