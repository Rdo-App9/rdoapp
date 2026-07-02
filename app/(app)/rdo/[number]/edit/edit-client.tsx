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
  Plus,
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
  type: "MOTORIZED" | "MANUAL";
  horimeterStart: number;
  horimeterEnd: number;
  hoursUsed: number;
  quantity: number;
}

interface EquipmentCategory {
  name: string;
  type: "MOTORIZED" | "MANUAL";
}

const weatherOptions: { value: WeatherCondition; label: string; icon: any }[] =
  [
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

interface EditRdoClientProps {
  rdo: any; // Dados brutos que vieram do banco de dados (Prisma)
}

export default function EditRdoClient({ rdo }: EditRdoClientProps) {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const [showWeatherSheet, setShowWeatherSheet] = useState(false);
  const [showAddWorkerSheet, setShowAddWorkerSheet] = useState(false);
  const [showAddEquipmentSheet, setShowAddEquipmentSheet] = useState(false);

  const [workforceCategories, setWorkforceCategories] = useState<string[]>(
    defaultWorkforceCategories,
  );
  const [newCategoryName, setNewCategoryName] = useState("");

  const [equipmentCategories, setEquipmentCategories] = useState<
    EquipmentCategory[]
  >([]);
  const [newEquipmentName, setNewEquipmentName] = useState("");
  const [newEquipmentType, setNewEquipmentType] = useState<
    "MOTORIZED" | "MANUAL"
  >("MOTORIZED");

  // PREENCHIMENTO AUTOMÁTICO COM OS DADOS DO BANCO
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    rdo.latitude
      ? { lat: rdo.latitude, lng: rdo.longitude }
      : { lat: -23.55, lng: -46.63 },
  );

  const [weather, setWeather] = useState<WeatherCondition>(
    (rdo.weatherCondition?.toLowerCase() as WeatherCondition) || "sunny",
  );
  const [temperature, setTemperature] = useState(rdo.temperature || 28);
  const [humidity, setHumidity] = useState(rdo.humidity || 65);

  const [workforce, setWorkforce] = useState<WorkforceEntry[]>(
    rdo.workforce?.map((w: any) => ({
      id: w.id,
      category: w.category,
      quantity: w.quantity,
    })) || [],
  );

  const [equipment, setEquipment] = useState<EquipmentEntry[]>(
    rdo.equipmentUsage?.map((e: any) => ({
      id: e.id,
      name: e.equipment.name,
      type: e.equipment.type,
      horimeterStart: e.horimeterStart || 0,
      horimeterEnd: e.horimeterEnd || 0,
      hoursUsed: e.hoursUsed || 8,
      quantity: e.quantity || 1,
    })) || [],
  );

  const [activities, setActivities] = useState(rdo.activities || "");
  const [observations, setObservations] = useState(rdo.observations || "");
  const [issues, setIssues] = useState(rdo.issues || "");
  const [signature, setSignature] = useState<string | null>(
    rdo.authorSignature || null,
  );

  useEffect(() => {
    const savedWorkforce = localStorage.getItem("@rdo:customWorkforce");
    if (savedWorkforce) {
      try {
        const parsed = JSON.parse(savedWorkforce);
        if (Array.isArray(parsed))
          setWorkforceCategories((prev) =>
            Array.from(new Set([...prev, ...parsed])),
          );
      } catch (e) {}
    }

    const savedEquipment = localStorage.getItem("@rdo:customEquipmentV2");
    if (savedEquipment) {
      try {
        const parsed = JSON.parse(savedEquipment);
        if (Array.isArray(parsed)) setEquipmentCategories(parsed);
      } catch (e) {}
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

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;

    setWorkforceCategories((prev) => {
      const updatedList = Array.from(new Set([trimmed, ...prev]));
      const customOnly = updatedList.filter(
        (cat) => !defaultWorkforceCategories.includes(cat),
      );
      localStorage.setItem("@rdo:customWorkforce", JSON.stringify(customOnly));
      return updatedList;
    });
    addWorkforce(trimmed);
    setNewCategoryName("");
  };

  const handleCreateEquipmentCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newEquipmentName.trim();
    if (!trimmed) return;

    if (
      equipmentCategories.some(
        (e) => e.name.toLowerCase() === trimmed.toLowerCase(),
      )
    )
      return;

    const newCategory: EquipmentCategory = {
      name: trimmed,
      type: newEquipmentType,
    };
    const updatedList = [newCategory, ...equipmentCategories];

    setEquipmentCategories(updatedList);
    localStorage.setItem("@rdo:customEquipmentV2", JSON.stringify(updatedList));

    addEquipment(trimmed, newEquipmentType);
    setNewEquipmentName("");
  };

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
    field: "horimeterStart" | "horimeterEnd" | "hoursUsed" | "quantity",
    value: number,
  ) =>
    setEquipment((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    );

  const addEquipment = (name: string, type: "MOTORIZED" | "MANUAL") => {
    setEquipment((prev) => [
      ...prev,
      {
        id: uuidv4(),
        name,
        type,
        horimeterStart: 0,
        horimeterEnd: 0,
        hoursUsed: 8,
        quantity: 1,
      },
    ]);
    setShowAddEquipmentSheet(false);
  };

  const removeEquipment = (id: string) =>
    setEquipment((prev) => prev.filter((e) => e.id !== id));

  const handleSave = async () => {
    setIsSaving(true);
    setError("");

    try {
      const payload = {
        weatherCondition: weather,
        temperature,
        humidity,
        workforce,
        equipment,
        activities,
        observations,
        issues,
      };

      // Dispara o PUT para a rota do RDO que estamos editando
      const res = await fetch(`/api/rdo/${rdo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao atualizar RDO.");

      router.refresh();
      // Volta para a página de Detalhes do RDO que acabou de ser editado
      setTimeout(() => {
        router.push(
          `/rdo/${rdo.number}?projectId=${rdo.projectId}&t=${Date.now()}`,
        );
      }, 0);
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro na rede.");
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
        return true;
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
      <header className="pt-safe sticky top-0 bg-background/80 backdrop-blur-md border-b border-border z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl border border-input bg-transparent flex items-center justify-center active:bg-secondary/50 transition-colors"
          >
            <ChevronLeft pack="basic" width={24} height={24} />
          </button>
          <h1 className="text-base font-bold text-foreground">
            Editar RDO #{rdo.number}
          </h1>
          <NetworkStatusIndicator showLabel={false} />
        </div>

        <div className="px-6 pb-4">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 w-full h-px bg-border -z-10 transform -translate-y-1/2" />
            {steps.map((step, index) => (
              <button
                key={step.title}
                onClick={() => setCurrentStep(index)}
                className="flex flex-col items-center gap-2 bg-background px-1"
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold transition-all border",
                    index < currentStep
                      ? "border-primary bg-primary/10 text-primary"
                      : index === currentStep
                        ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
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
        {error && (
          <div className="mb-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
            {error}
          </div>
        )}

        <div className="flex-1">
          {currentStep === 0 && (
            <StepIdentification
              location={location}
              onUpdateLocation={setLocation}
            />
          )}
          {currentStep === 1 && (
            <StepWeather
              location={location}
              weather={weather}
              temperature={temperature}
              humidity={humidity}
              weatherOptions={weatherOptions}
              onWeatherChange={setWeather}
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
              className="flex-1 h-14 rounded-xl border border-input bg-transparent text-base font-semibold flex items-center justify-center gap-2 active:bg-secondary/50 transition-colors"
            >
              Voltar
            </button>
          )}

          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep((prev) => prev + 1)}
              disabled={!canProceed()}
              className="flex-2 h-14 rounded-xl bg-foreground text-background text-base font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50 disabled:pointer-events-none"
            >
              Avançar
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={!signature || isSaving}
              className="flex-2 h-14 rounded-xl bg-primary text-primary-foreground text-base font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50 disabled:pointer-events-none shadow-md shadow-primary/20"
            >
              {isSaving ? "Salvando..." : "Salvar Alterações"}
            </button>
          )}
        </div>
      </main>

      {/* MODAIS (Sheets) */}
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
        title="Adicionar Função"
      >
        <div className="flex flex-col pb-6 px-4 h-full">
          <form
            onSubmit={handleCreateCategory}
            className="flex gap-2 mb-6 shrink-0"
          >
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Digite uma nova função..."
              className="flex-1 h-14 px-4 rounded-xl bg-secondary/30 border border-transparent focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary transition-all outline-none text-foreground"
            />
            <button
              type="submit"
              disabled={!newCategoryName.trim()}
              className="h-14 px-5 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center disabled:opacity-50 active:scale-95 transition-transform"
            >
              <Plus pack="basic" width={24} height={24} />
            </button>
          </form>
          <div className="space-y-2 overflow-y-auto flex-1 min-h-[40vh]">
            {workforceCategories
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
        </div>
      </BottomSheet>

      <BottomSheet
        open={showAddEquipmentSheet}
        onClose={() => setShowAddEquipmentSheet(false)}
        title="Novo Equipamento / Ferramenta"
      >
        <div className="flex flex-col pb-6 px-4 h-full">
          <form
            onSubmit={handleCreateEquipmentCategory}
            className="space-y-4 mb-6 shrink-0"
          >
            <input
              type="text"
              value={newEquipmentName}
              onChange={(e) => setNewEquipmentName(e.target.value)}
              placeholder="Ex: Carrinho de Mão, Furadeira, Escavadeira..."
              className="w-full h-14 px-4 rounded-xl bg-secondary/30 border border-transparent focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary transition-all outline-none text-foreground"
            />

            <div className="flex p-1 bg-secondary/40 rounded-xl">
              <button
                type="button"
                onClick={() => setNewEquipmentType("MOTORIZED")}
                className={cn(
                  "flex-1 py-2.5 text-xs font-bold rounded-lg transition-all",
                  newEquipmentType === "MOTORIZED"
                    ? "bg-background text-primary shadow-sm"
                    : "text-muted-foreground",
                )}
              >
                Motorizado / Horímetro
              </button>
              <button
                type="button"
                onClick={() => setNewEquipmentType("MANUAL")}
                className={cn(
                  "flex-1 py-2.5 text-xs font-bold rounded-lg transition-all",
                  newEquipmentType === "MANUAL"
                    ? "bg-background text-orange-500 shadow-sm"
                    : "text-muted-foreground",
                )}
              >
                Manual / Quantidade
              </button>
            </div>

            <button
              type="submit"
              disabled={!newEquipmentName.trim()}
              className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-bold text-base flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-all"
            >
              <Plus pack="basic" width={20} height={20} /> Cadastrar e Adicionar
            </button>
          </form>

          <div className="space-y-2 overflow-y-auto flex-1 min-h-[30vh]">
            {equipmentCategories.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-secondary/10 rounded-xl border border-dashed border-border mt-2">
                <Spanner
                  pack="basic"
                  width={32}
                  height={32}
                  className="text-muted-foreground/50 mb-2"
                />
                <p className="text-sm text-muted-foreground">
                  Sua lista está vazia.
                </p>
              </div>
            ) : (
              equipmentCategories
                .filter((cat) => !equipment.some((e) => e.name === cat.name))
                .map((category) => (
                  <BottomSheetOption
                    key={category.name}
                    label={category.name}
                    icon={<Spanner pack="basic" width={24} height={24} />}
                    onClick={() => addEquipment(category.name, category.type)}
                  />
                ))
            )}
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
