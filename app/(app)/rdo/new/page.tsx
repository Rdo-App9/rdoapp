// Página de criação de novo RDO

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { BoxIcon, BoxiconsProvider } from "@/components/ui/box-icon";
import { Stepper } from "@/components/ui/stepper";
import { LargeTextarea } from "@/components/ui/large-input";
import { SignatureCanvas } from "@/components/ui/signature-canvas";
import { BottomSheet, BottomSheetOption } from "@/components/ui/bottom-sheet";
import { NetworkStatusIndicator } from "@/components/ui/network-status";
import { v4 as uuidv4 } from "uuid";

type WeatherCondition =
  | "sunny"
  | "partly_cloudy"
  | "cloudy"
  | "rainy"
  | "stormy";

interface WorkforceEntry {
  id: string;
  category: string;
  quantity: number;
}

interface EquipmentEntry {
  id: string;
  name: string;
  horimeterStart: number;
  horimeterEnd: number;
}

const weatherOptions: {
  value: WeatherCondition;
  label: string;
  icon: "sun" | "cloud" | "cloud-rain" | "cloud-lightning";
}[] = [
  { value: "sunny", label: "Ensolarado", icon: "sun" },
  { value: "partly_cloudy", label: "Parcialmente Nublado", icon: "cloud" },
  { value: "cloudy", label: "Nublado", icon: "cloud" },
  { value: "rainy", label: "Chuvoso", icon: "cloud-rain" },
  { value: "stormy", label: "Tempestade", icon: "cloud-lightning" },
];

const defaultWorkforceCategories = [
  "Pedreiro",
  "Servente",
  "Eletricista",
  "Encanador",
  "Carpinteiro",
  "Pintor",
  "Armador",
  "Mestre de Obras",
  "Engenheiro",
];

export default function NewRDOPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [showWeatherSheet, setShowWeatherSheet] = useState(false);
  const [showAddWorkerSheet, setShowAddWorkerSheet] = useState(false);

  // RDO Data
  const [rdoNumber] = useState(46); // Simulando próximo número
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [weather, setWeather] = useState<WeatherCondition>("sunny");
  const [temperature, setTemperature] = useState(28);
  const [humidity, setHumidity] = useState(65);

  // Período de trabalho
  const [workStartTime, setWorkStartTime] = useState("07:00");
  const [workEndTime, setWorkEndTime] = useState("17:00");
  const [lunchStart, setLunchStart] = useState("12:00");
  const [lunchEnd, setLunchEnd] = useState("13:00");

  // Mão de obra
  const [workforce, setWorkforce] = useState<WorkforceEntry[]>([
    { id: "1", category: "Pedreiro", quantity: 4 },
    { id: "2", category: "Servente", quantity: 6 },
    { id: "3", category: "Eletricista", quantity: 2 },
  ]);

  // Equipamentos
  const [equipment, setEquipment] = useState<EquipmentEntry[]>([
    {
      id: "1",
      name: "Betoneira 400L",
      horimeterStart: 1250,
      horimeterEnd: 1258,
    },
    {
      id: "2",
      name: "Retroescavadeira",
      horimeterStart: 3420,
      horimeterEnd: 3428,
    },
  ]);

  // Observações
  const [activities, setActivities] = useState("");
  const [observations, setObservations] = useState("");
  const [issues, setIssues] = useState("");

  // Assinatura
  const [signature, setSignature] = useState<string | null>(null);

  // Obter localização ao montar
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => console.error("[v0] GPS error:", error),
        { enableHighAccuracy: true },
      );
    }
  }, []);

  const steps = [
    { title: "Identificação", icon: "map-pin" as const },
    { title: "Clima", icon: "sun" as const },
    { title: "Mão de Obra", icon: "user" as const },
    { title: "Equipamentos", icon: "wrench" as const },
    { title: "Atividades", icon: "edit" as const },
    { title: "Assinatura", icon: "pencil" as const },
  ];

  const updateWorkforce = (id: string, quantity: number) => {
    setWorkforce((prev) =>
      prev.map((w) => (w.id === id ? { ...w, quantity } : w)),
    );
  };

  const addWorkforce = (category: string) => {
    setWorkforce((prev) => [...prev, { id: uuidv4(), category, quantity: 1 }]);
    setShowAddWorkerSheet(false);
  };

  const removeWorkforce = (id: string) => {
    setWorkforce((prev) => prev.filter((w) => w.id !== id));
  };

  const updateEquipment = (
    id: string,
    field: "horimeterStart" | "horimeterEnd",
    value: number,
  ) => {
    setEquipment((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    );
  };

  const handleSave = async (asDraft: boolean) => {
    setIsSaving(true);
    try {
      // Simular salvamento
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.push("/dashboard");
    } catch (error) {
      console.error("[v0] Save error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return location !== null;
      case 1:
        return weather !== null;
      case 2:
        return workforce.length > 0;
      case 3:
        return true;
      case 4:
        return activities.trim().length > 0;
      case 5:
        return signature !== null;
      default:
        return true;
    }
  };

  return (
    <BoxiconsProvider>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="pt-safe sticky top-0 bg-background/95 backdrop-blur-sm z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
            >
              <BoxIcon name="chevron-left" size={24} />
            </button>
            <div className="text-center">
              <h1 className="text-lg font-bold text-foreground">
                RDO #{rdoNumber}
              </h1>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>
            </div>
            <NetworkStatusIndicator showLabel={false} />
          </div>

          {/* Progress steps */}
          <div className="px-6 pb-4">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <button
                  key={step.title}
                  onClick={() => setCurrentStep(index)}
                  className={cn(
                    "flex flex-col items-center gap-1",
                    index <= currentStep
                      ? "text-primary"
                      : "text-muted-foreground",
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      index < currentStep &&
                        "bg-primary text-primary-foreground",
                      index === currentStep &&
                        "bg-primary/20 text-primary border-2 border-primary",
                      index > currentStep && "bg-secondary",
                    )}
                  >
                    {index < currentStep ? (
                      <BoxIcon name="check" size={20} />
                    ) : (
                      <BoxIcon name={step.icon} size={18} />
                    )}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between mt-1">
              {steps.map((step, index) => (
                <span
                  key={`label-${step.title}`}
                  className={cn(
                    "text-xs text-center w-12",
                    index <= currentStep
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {step.title}
                </span>
              ))}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-6 pb-32 overflow-y-auto">
          {/* Step 0: Identificação */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="ios-card">
                <h2 className="text-xl font-semibold mb-4">Localização GPS</h2>
                {location ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-success/10 rounded-xl">
                      <BoxIcon
                        name="check-circle"
                        size={24}
                        className="text-success"
                      />
                      <div>
                        <p className="font-medium text-foreground">
                          Localização capturada
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Lat: {location.lat.toFixed(6)} | Lon:{" "}
                          {location.lng.toFixed(6)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.geolocation.getCurrentPosition((pos) =>
                          setLocation({
                            lat: pos.coords.latitude,
                            lng: pos.coords.longitude,
                          }),
                        );
                      }}
                      className="w-full min-h-14 rounded-xl bg-secondary text-secondary-foreground font-medium flex items-center justify-center gap-2"
                    >
                      <BoxIcon name="refresh" size={20} />
                      Atualizar localização
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 p-4 bg-warning/10 rounded-xl">
                    <BoxIcon
                      name="current-location"
                      size={24}
                      className="text-warning animate-pulse"
                    />
                    <div>
                      <p className="font-medium text-foreground">
                        Obtendo localização...
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Aguarde ou permita acesso ao GPS
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="ios-card">
                <h2 className="text-xl font-semibold mb-4">
                  Responsável Técnico
                </h2>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center">
                    <BoxIcon name="user-circle" size={32} />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      Eng. João Silva
                    </p>
                    <p className="text-sm text-muted-foreground">
                      CREA: 123456/SP
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ART: 987654321
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Clima */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="ios-card">
                <h2 className="text-xl font-semibold mb-4">
                  Condição do Tempo
                </h2>
                <button
                  type="button"
                  onClick={() => setShowWeatherSheet(true)}
                  className={cn(
                    "w-full p-4 rounded-xl bg-secondary",
                    "flex items-center justify-between",
                    "active:scale-98 transition-transform",
                  )}
                >
                  <div className="flex items-center gap-4">
                    <BoxIcon
                      name={
                        weatherOptions.find((w) => w.value === weather)?.icon ||
                        "sun"
                      }
                      size={32}
                      className="text-warning"
                    />
                    <span className="text-lg font-medium">
                      {weatherOptions.find((w) => w.value === weather)?.label}
                    </span>
                  </div>
                  <BoxIcon
                    name="chevron-right"
                    size={24}
                    className="text-muted-foreground"
                  />
                </button>
              </div>

              <div className="ios-card">
                <Stepper
                  label="Temperatura (°C)"
                  value={temperature}
                  onChange={setTemperature}
                  min={0}
                  max={50}
                  unit="°C"
                />
              </div>

              <div className="ios-card">
                <Stepper
                  label="Umidade (%)"
                  value={humidity}
                  onChange={setHumidity}
                  min={0}
                  max={100}
                  step={5}
                  unit="%"
                />
              </div>
            </div>
          )}

          {/* Step 2: Mão de Obra */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold">Efetivo de Pessoal</h2>
                <button
                  type="button"
                  onClick={() => setShowAddWorkerSheet(true)}
                  className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2"
                >
                  <BoxIcon name="plus" size={18} />
                  Adicionar
                </button>
              </div>

              {workforce.map((worker) => (
                <div key={worker.id} className="ios-card">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-medium">
                      {worker.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeWorkforce(worker.id)}
                      className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center"
                    >
                      <BoxIcon
                        name="trash"
                        size={18}
                        className="text-destructive"
                      />
                    </button>
                  </div>
                  <Stepper
                    value={worker.quantity}
                    onChange={(qty) => updateWorkforce(worker.id, qty)}
                    min={0}
                    max={100}
                  />
                </div>
              ))}

              <div className="p-4 rounded-xl bg-card border border-dashed border-border text-center">
                <p className="text-muted-foreground">
                  Total:{" "}
                  <span className="font-bold text-foreground text-2xl">
                    {workforce.reduce((sum, w) => sum + w.quantity, 0)}
                  </span>{" "}
                  trabalhadores
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Equipamentos */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-2">
                Horímetro de Equipamentos
              </h2>

              {equipment.map((eq) => (
                <div key={eq.id} className="ios-card">
                  <h3 className="text-lg font-medium mb-4">{eq.name}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">
                        Início
                      </label>
                      <Stepper
                        value={eq.horimeterStart}
                        onChange={(val) =>
                          updateEquipment(eq.id, "horimeterStart", val)
                        }
                        min={0}
                        max={99999}
                        step={1}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">
                        Final
                      </label>
                      <Stepper
                        value={eq.horimeterEnd}
                        onChange={(val) =>
                          updateEquipment(eq.id, "horimeterEnd", val)
                        }
                        min={eq.horimeterStart}
                        max={99999}
                        step={1}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3 text-center">
                    Horas trabalhadas:{" "}
                    <span className="font-bold text-foreground">
                      {eq.horimeterEnd - eq.horimeterStart}h
                    </span>
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Step 4: Atividades */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <LargeTextarea
                label="Atividades Executadas"
                placeholder="Descreva as atividades realizadas hoje..."
                value={activities}
                onChange={(e) => setActivities(e.target.value)}
                showVoiceInput
                onVoiceResult={(text) =>
                  setActivities((prev) => prev + (prev ? " " : "") + text)
                }
              />

              <LargeTextarea
                label="Observações Gerais"
                placeholder="Observações relevantes sobre o dia..."
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                showVoiceInput
                onVoiceResult={(text) =>
                  setObservations((prev) => prev + (prev ? " " : "") + text)
                }
              />

              <LargeTextarea
                label="Ocorrências / Problemas"
                placeholder="Registre qualquer problema ou ocorrência..."
                value={issues}
                onChange={(e) => setIssues(e.target.value)}
                showVoiceInput
                onVoiceResult={(text) =>
                  setIssues((prev) => prev + (prev ? " " : "") + text)
                }
              />
            </div>
          )}

          {/* Step 5: Assinatura */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="ios-card">
                <h2 className="text-xl font-semibold mb-4">Resumo do RDO</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data</span>
                    <span className="font-medium">
                      {new Date().toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Clima</span>
                    <span className="font-medium">
                      {weatherOptions.find((w) => w.value === weather)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Temperatura</span>
                    <span className="font-medium">{temperature}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Efetivo Total</span>
                    <span className="font-medium">
                      {workforce.reduce((sum, w) => sum + w.quantity, 0)}{" "}
                      pessoas
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Equipamentos</span>
                    <span className="font-medium">
                      {equipment.length} unidades
                    </span>
                  </div>
                </div>
              </div>

              <SignatureCanvas
                onChange={setSignature}
                initialData={signature || undefined}
              />

              <p className="text-sm text-muted-foreground text-center">
                Ao assinar, você confirma que as informações deste RDO são
                verdadeiras.
              </p>
            </div>
          )}
        </main>

        {/* Footer actions */}
        <footer className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border px-6 py-4 pb-safe">
          <div className="flex gap-4">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className={cn(
                  "flex-1 min-h-14 rounded-xl",
                  "bg-secondary text-secondary-foreground",
                  "font-semibold flex items-center justify-center gap-2",
                  "active:scale-98 transition-transform",
                )}
              >
                <BoxIcon name="chevron-left" size={20} />
                Voltar
              </button>
            )}

            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev + 1)}
                disabled={!canProceed()}
                className={cn(
                  "flex-1 min-h-14 rounded-xl",
                  "bg-primary text-primary-foreground",
                  "font-semibold flex items-center justify-center gap-2",
                  "active:scale-98 transition-transform",
                  "disabled:opacity-50 disabled:pointer-events-none",
                )}
              >
                Próximo
                <BoxIcon name="chevron-right" size={20} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSave(false)}
                disabled={!signature || isSaving}
                className={cn(
                  "flex-1 min-h-14 rounded-xl",
                  "bg-success text-success-foreground",
                  "font-semibold flex items-center justify-center gap-2",
                  "active:scale-98 transition-transform",
                  "disabled:opacity-50 disabled:pointer-events-none",
                )}
              >
                {isSaving ? (
                  <>
                    <BoxIcon
                      size={20}
                      className="animate-spin"
                      name={"map-pin"}
                    />
                    Salvando...
                  </>
                ) : (
                  <>
                    <BoxIcon name="check" size={20} />
                    Finalizar RDO
                  </>
                )}
              </button>
            )}
          </div>
        </footer>

        {/* Weather sheet */}
        <BottomSheet
          open={showWeatherSheet}
          onClose={() => setShowWeatherSheet(false)}
          title="Condição do Tempo"
        >
          <div className="space-y-3">
            {weatherOptions.map((option) => (
              <BottomSheetOption
                key={option.value}
                label={option.label}
                icon={<BoxIcon name={option.icon} size={24} />}
                selected={weather === option.value}
                onClick={() => {
                  setWeather(option.value);
                  setShowWeatherSheet(false);
                }}
              />
            ))}
          </div>
        </BottomSheet>

        {/* Add worker sheet */}
        <BottomSheet
          open={showAddWorkerSheet}
          onClose={() => setShowAddWorkerSheet(false)}
          title="Adicionar Categoria"
        >
          <div className="space-y-3">
            {defaultWorkforceCategories
              .filter((cat) => !workforce.some((w) => w.category === cat))
              .map((category) => (
                <BottomSheetOption
                  key={category}
                  label={category}
                  icon={<BoxIcon name="user" size={24} />}
                  onClick={() => addWorkforce(category)}
                />
              ))}
          </div>
        </BottomSheet>
      </div>
    </BoxiconsProvider>
  );
}
