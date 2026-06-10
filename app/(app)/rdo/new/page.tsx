"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { BottomSheet, BottomSheetOption } from "@/components/ui/bottom-sheet";
import { NetworkStatusIndicator } from "@/components/ui/network-status";
import { v4 as uuidv4 } from "uuid";

// Ícones Oficiais do Boxicons
import {
  ChevronLeft,
  Check,
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  User,
  Spanner,
} from "@boxicons/react";

// Sub-componentes
import { StepIdentification } from "@/components/rdo/step-identification";
import { StepWeather } from "@/components/rdo/step-weather";
import { StepWorkforce } from "@/components/rdo/step-workforce";
import { StepEquipment } from "@/components/rdo/step-equipment";
import { StepActivities } from "@/components/rdo/step-activities";
import { StepSignature } from "@/components/rdo/step-signature";

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
  icon: any;
}[] = [
  { value: "sunny", label: "Ensolarado", icon: Sun },
  { value: "partly_cloudy", label: "Parcialmente Nublado", icon: Cloud },
  { value: "cloudy", label: "Nublado", icon: Cloud },
  { value: "rainy", label: "Chuvoso", icon: CloudRain },
  { value: "stormy", label: "Tempestade", icon: CloudLightning },
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
const defaultEquipmentCategories = [
  "Betoneira 400L",
  "Retroescavadeira",
  "Compactador de Solo",
  "Guindaste",
  "Gerador",
  "Serra Circular",
  "Andaime Móvel",
];

export default function NewRDOPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Controles dos Bottom Sheets
  const [showWeatherSheet, setShowWeatherSheet] = useState(false);
  const [showAddWorkerSheet, setShowAddWorkerSheet] = useState(false);
  const [showAddEquipmentSheet, setShowAddEquipmentSheet] = useState(false);

  // Estados Globais do RDO
  const [rdoNumber] = useState(1); // Voltamos para o 1 por enquanto (o banco decidirá)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null,
  );

  const [weather, setWeather] = useState<WeatherCondition>("sunny");
  const [temperature, setTemperature] = useState(28);
  const [humidity, setHumidity] = useState(65);

  const [workforce, setWorkforce] = useState<WorkforceEntry[]>([
    { id: uuidv4(), category: "Pedreiro", quantity: 4 },
    { id: uuidv4(), category: "Servente", quantity: 6 },
  ]);

  const [equipment, setEquipment] = useState<EquipmentEntry[]>([
    {
      id: uuidv4(),
      name: "Betoneira 400L",
      horimeterStart: 1250,
      horimeterEnd: 1258,
    },
  ]);

  const [activities, setActivities] = useState("");
  const [observations, setObservations] = useState("");
  const [issues, setIssues] = useState("");
  const [signature, setSignature] = useState<string | null>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.error("[GPS Error]:", err),
        { enableHighAccuracy: true },
      );
    }
  }, []);

  const steps = [
    { title: "Identificação" },
    { title: "Clima" },
    { title: "Mão de Obra" },
    { title: "Equipamentos" },
    { title: "Atividades" },
    { title: "Assinatura" },
  ];

  // ==================== Handlers ====================
  const updateWorkforce = (id: string, quantity: number) =>
    setWorkforce((prev) =>
      prev.map((w) => (w.id === id ? { ...w, quantity } : w)),
    );

  const addWorkforce = (category: string) => {
    setWorkforce((prev) => [...prev, { id: uuidv4(), category, quantity: 1 }]);
    setShowAddWorkerSheet(false);
  };
  const removeWorkforce = (id: string) =>
    setWorkforce((prev) => prev.filter((w) => w.id !== id));

  const updateEquipment = (
    id: string,
    field: "horimeterStart" | "horimeterEnd",
    value: number,
  ) =>
    setEquipment((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    );

  const addEquipment = (name: string) => {
    setEquipment((prev) => [
      ...prev,
      { id: uuidv4(), name, horimeterStart: 0, horimeterEnd: 0 },
    ]);
    setShowAddEquipmentSheet(false);
  };
  const removeEquipment = (id: string) =>
    setEquipment((prev) => prev.filter((e) => e.id !== id));

  // ==================== Salvar no Banco ====================
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Monta o pacote de dados exato que o Prisma precisa
      const payload = {
        location,
        weather,
        temperature,
        humidity,
        workforce,
        equipment,
        activities,
        observations,
        issues,
        signature,
      };

      console.log("RDO PRONTO PARA O BANCO:", payload);

      // TODO: Enviar o payload para /api/rdo/create
      await new Promise((res) => setTimeout(res, 1000));
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
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
    <div className="flex-1 flex flex-col h-full bg-background relative">
      <header className="pt-safe sticky top-0 bg-background border-b border-border z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-md border border-input bg-transparent flex items-center justify-center active:bg-secondary/50 transition-colors"
          >
            <ChevronLeft pack="basic" width={24} height={24} />
          </button>
          <h1 className="text-base font-bold text-foreground">Novo RDO</h1>
          <NetworkStatusIndicator showLabel={false} />
        </div>

        <div className="px-6 pb-4">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 w-full h-px bg-border -z-10 transform -translate-y-1/2"></div>
            {steps.map((step, index) => (
              <button
                key={step.title}
                onClick={() => setCurrentStep(index)}
                className="flex flex-col items-center gap-2 bg-background px-1"
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-md flex items-center justify-center text-sm font-medium transition-colors border",
                    index < currentStep
                      ? "border-primary bg-primary/10 text-primary"
                      : index === currentStep
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-transparent text-muted-foreground",
                  )}
                >
                  {index < currentStep ? (
                    <Check pack="basic" width={16} height={16} />
                  ) : (
                    index + 1
                  )}
                </div>
              </button>
            ))}
          </div>
          <div className="text-center mt-3">
            <p className="text-sm font-semibold text-foreground">
              {steps[currentStep].title}
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 pt-6 pb-28 overflow-y-auto flex flex-col">
        <div className="flex-1">
          {currentStep === 0 && (
            <StepIdentification
              location={location}
              onUpdateLocation={setLocation}
            />
          )}
          {currentStep === 1 && (
            <StepWeather
              weather={weather}
              temperature={temperature}
              humidity={humidity}
              weatherOptions={weatherOptions}
              onTemperatureChange={setTemperature}
              onHumidityChange={setHumidity}
              onOpenWeatherSheet={() => setShowWeatherSheet(true)}
            />
          )}
          {currentStep === 2 && (
            <StepWorkforce
              workforce={workforce}
              onUpdateQuantity={updateWorkforce}
              onRemoveWorker={removeWorkforce}
              onOpenAddSheet={() => setShowAddWorkerSheet(true)}
            />
          )}
          {currentStep === 3 && (
            <StepEquipment
              equipment={equipment}
              onUpdateEquipment={updateEquipment}
              onRemoveEquipment={removeEquipment}
              onOpenAddSheet={() => setShowAddEquipmentSheet(true)}
            />
          )}
          {currentStep === 4 && (
            <StepActivities
              activities={activities}
              setActivities={setActivities}
              observations={observations}
              setObservations={setObservations}
              issues={issues}
              setIssues={setIssues}
            />
          )}
          {currentStep === 5 && (
            <StepSignature
              weather={weather}
              temperature={temperature}
              workforce={workforce}
              equipment={equipment}
              weatherOptions={weatherOptions}
              signature={signature}
              setSignature={setSignature}
            />
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-border flex gap-3">
          {currentStep > 0 && (
            <button
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="flex-1 h-12 rounded-md border border-input bg-transparent text-sm font-medium flex items-center justify-center gap-2 active:bg-secondary/50 transition-colors"
            >
              Voltar
            </button>
          )}

          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep((prev) => prev + 1)}
              disabled={!canProceed()}
              className="flex-2 h-12 rounded-md bg-foreground text-background text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50 disabled:pointer-events-none"
            >
              Avançar
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={!signature || isSaving}
              className="flex-2 h-12 rounded-md bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSaving ? "A guardar..." : "Finalizar RDO"}
            </button>
          )}
        </div>
      </main>

      {/* Modais de Seleção */}
      <BottomSheet
        open={showWeatherSheet}
        onClose={() => setShowWeatherSheet(false)}
        title="Condição do Tempo"
      >
        <div className="space-y-2 pb-6 px-4">
          {weatherOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <BottomSheetOption
                key={option.value}
                label={option.label}
                icon={<IconComponent pack="basic" width={24} height={24} />}
                selected={weather === option.value}
                onClick={() => {
                  setWeather(option.value);
                  setShowWeatherSheet(false);
                }}
              />
            );
          })}
        </div>
      </BottomSheet>

      <BottomSheet
        open={showAddWorkerSheet}
        onClose={() => setShowAddWorkerSheet(false)}
        title="Adicionar Categoria"
      >
        <div className="space-y-2 pb-6 px-4">
          {defaultWorkforceCategories
            .filter((cat) => !workforce.some((w) => w.category === cat))
            .map((category) => (
              <BottomSheetOption
                key={category}
                label={category}
                icon={<User pack="basic" width={24} height={24} />}
                onClick={() => addWorkforce(category)}
              />
            ))}
        </div>
      </BottomSheet>

      <BottomSheet
        open={showAddEquipmentSheet}
        onClose={() => setShowAddEquipmentSheet(false)}
        title="Adicionar Equipamento"
      >
        <div className="space-y-2 pb-6 px-4">
          {defaultEquipmentCategories
            .filter((cat) => !equipment.some((e) => e.name === cat))
            .map((category) => (
              <BottomSheetOption
                key={category}
                label={category}
                icon={<Spanner pack="basic" width={24} height={24} />}
                onClick={() => addEquipment(category)}
              />
            ))}
        </div>
      </BottomSheet>
    </div>
  );
}
