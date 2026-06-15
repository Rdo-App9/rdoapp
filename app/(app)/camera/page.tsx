"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { BoxIcon, BoxiconsProvider } from "@/components/ui/box-icon";
import { BottomSheet } from "@/components/ui/bottom-sheet";
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

  const [projectId, setProjectId] = useState<string | null>(null);

  useEffect(() => {
    const urlProjectId = searchParams.get("projectId");
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
  const [isUploading, setIsUploading] = useState(false);
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

  // ==================== NOVOS ESTADOS PARA VINCULAÇÃO DE RDO ====================
  const [showRdoSheet, setShowRdoSheet] = useState(false);
  const [recentRdos, setRecentRdos] = useState<any[]>([]);
  const [isLoadingRdos, setIsLoadingRdos] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileAgent =
      /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent,
      );
    const isIPadOS =
      navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
    setIsDeviceSupported(isMobileAgent || isIPadOS);
  }, []);

  // ==================== FIX IPHONE: GESTÃO DE CÂMERA ====================
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    if (!isDeviceSupported) return;
    try {
      stopCamera(); // Garante que não há streams órfãs
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
        // O Safari do iOS precisa do play() explícito em promessa para não travar
        videoRef.current
          .play()
          .catch((e) => console.warn("Auto-play prevented", e));
      }
    } catch (error) {
      console.error("[Camera error]:", error);
    }
  }, [isDeviceSupported, stopCamera]);

  // FIX IPHONE: Desliga a câmera se o app for minimizado e liga quando voltar
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopCamera();
      } else {
        // Se voltar e não estiver com foto tirada, liga a câmera de novo
        if (!capturedPhoto) {
          startCamera();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [capturedPhoto, startCamera, stopCamera]);

  useEffect(() => {
    if (isDeviceSupported && !capturedPhoto) startCamera();
    return () => {
      stopCamera();
      if (scanLoopRef.current) cancelAnimationFrame(scanLoopRef.current);
    };
  }, [startCamera, stopCamera, isDeviceSupported, capturedPhoto]);

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

  // ==================== NOVO: BUSCAR RDOs ABERTOS E UPLOAD ====================
  const fetchRecentRdos = async () => {
    if (!projectId) return;
    setIsLoadingRdos(true);
    try {
      // Usamos a rota da API (assumindo que retorna uma lista de RDOs do projeto)
      const res = await fetch(`/api/rdo?projectId=${projectId}`);
      if (res.ok) {
        const data = await res.json();
        // Pegamos apenas os 5 RDOs mais recentes
        setRecentRdos(data.slice(0, 5));
      }
    } catch (error) {
      console.error("Erro ao buscar RDOs", error);
    } finally {
      setIsLoadingRdos(false);
    }
  };

  const handleUpload = async (rdoId?: string) => {
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

      // Se ele selecionou um RDO, envia o rdoId também!
      if (rdoId) formData.append("rdoId", rdoId);

      const res = await fetch("/api/photos", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Erro ao salvar a foto");

      alert(
        rdoId
          ? "Foto vinculada ao RDO com sucesso!"
          : "Foto salva na Galeria da Obra!",
      );

      setShowRdoSheet(false);
      setCapturedPhoto(null);
      // Reinicia a câmera para a próxima foto
      startCamera();
    } catch (error) {
      alert(
        "Erro ao enviar a imagem. Verifique sua conexão e tente novamente.",
      );
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenRdoSelection = () => {
    setShowRdoSheet(true);
    fetchRecentRdos();
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
          {!capturedPhoto && (
            <div className="relative flex-1">
              {/* FIX IPHONE: playsInline e autoPlay forçam o Safari a rodar o vídeo corretamente */}
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                playsInline
                autoPlay
                muted
              />

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

              {/* NOVA BARRA DE AÇÕES INFERIOR COM VINCULAR AO RDO */}
              <div className="px-4 py-4 pb-safe bg-black/90 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setCapturedPhoto(null);
                      startCamera();
                    }}
                    disabled={isUploading}
                    className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center active:bg-white/20 transition-all disabled:opacity-50"
                  >
                    <BoxIcon name="x" size={24} />
                  </button>

                  <span className="px-4 py-1.5 bg-white/10 rounded-full text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                    {
                      categoryOptions.find((c) => c.value === selectedCategory)
                        ?.label
                    }
                  </span>

                  <button
                    type="button"
                    onClick={() => setShowMarkup(true)}
                    disabled={isUploading}
                    className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center active:bg-white/20 transition-all disabled:opacity-50"
                  >
                    <BoxIcon name="pencil" size={24} />
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleOpenRdoSelection}
                    disabled={isUploading}
                    className="w-full h-14 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-70"
                  >
                    {isUploading ? (
                      <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <BoxIcon size={20} name={"image"} />
                        Vincular ao RDO
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpload()} // Sem rdoId, salva só na galeria
                    disabled={isUploading}
                    className="w-full h-12 rounded-xl bg-transparent text-white/70 hover:text-white text-sm font-medium flex items-center justify-center transition-all disabled:opacity-50"
                  >
                    Salvar apenas na Galeria
                  </button>
                </div>
              </div>
            </div>
          )}

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

          {/* NOVO BOTTOM SHEET PARA SELEÇÃO DE RDO */}
          <BottomSheet
            open={showRdoSheet}
            onClose={() => setShowRdoSheet(false)}
            title="Selecione o RDO"
          >
            <div className="px-4 pb-8 flex flex-col gap-2">
              <p className="text-sm text-muted-foreground mb-2 text-center">
                A qual Relatório Diário de Obra esta foto pertence?
              </p>

              {isLoadingRdos ? (
                <div className="flex justify-center py-6">
                  <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : recentRdos.length === 0 ? (
                <div className="text-center py-6 text-sm text-muted-foreground bg-secondary/20 rounded-xl">
                  Nenhum RDO encontrado. <br /> Você precisa criar um RDO
                  primeiro.
                </div>
              ) : (
                recentRdos.map((rdo) => (
                  <button
                    key={rdo.id}
                    onClick={() => handleUpload(rdo.id)} // Passa o ID do RDO para o upload!
                    className="flex flex-col items-start p-4 rounded-xl border border-border bg-card active:scale-[0.98] transition-transform"
                  >
                    <span className="font-bold text-foreground">
                      Relatório #{rdo.number}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(rdo.date).toLocaleDateString("pt-BR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </span>
                  </button>
                ))
              )}
            </div>
          </BottomSheet>

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
