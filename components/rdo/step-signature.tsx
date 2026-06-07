import { SignatureCanvas } from "@/components/ui/signature-canvas";

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

interface StepSignatureProps {
  weather: WeatherCondition;
  temperature: number;
  workforce: WorkforceEntry[];
  equipment: EquipmentEntry[];
  weatherOptions: { value: WeatherCondition; label: string }[];
  signature: string | null;
  setSignature: (val: string | null) => void;
}

export function StepSignature({
  weather,
  temperature,
  workforce,
  equipment,
  weatherOptions,
  signature,
  setSignature,
}: StepSignatureProps) {
  return (
    <div className="space-y-6">
      <div className="p-4 rounded-md border border-border bg-transparent">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Resumo Geral
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between border-b border-border pb-2">
            <span className="text-muted-foreground">Data</span>
            <span className="font-medium text-foreground">
              {new Date().toLocaleDateString("pt-BR")}
            </span>
          </div>
          <div className="flex justify-between border-b border-border pb-2">
            <span className="text-muted-foreground">Clima</span>
            <span className="font-medium text-foreground">
              {weatherOptions.find((w) => w.value === weather)?.label}
            </span>
          </div>
          <div className="flex justify-between border-b border-border pb-2">
            <span className="text-muted-foreground">Efetivo Total</span>
            <span className="font-medium text-foreground">
              {workforce.reduce((sum, w) => sum + w.quantity, 0)} pessoas
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Equipamentos</span>
            <span className="font-medium text-foreground">
              {equipment.length} unidades
            </span>
          </div>
        </div>
      </div>
      <SignatureCanvas
        onChange={setSignature}
        initialData={signature || undefined}
      />
      <p className="text-xs text-muted-foreground text-center px-4">
        Ao assinar, o Engenheiro Responsável valida as informações registadas.
      </p>
    </div>
  );
}
