import { BoxIcon } from "@/components/ui/box-icon";
import { Stepper } from "@/components/ui/stepper";

interface EquipmentEntry {
  id: string;
  name: string;
  horimeterStart: number;
  horimeterEnd: number;
}

interface StepEquipmentProps {
  equipment: EquipmentEntry[];
  onUpdateEquipment: (
    id: string,
    field: "horimeterStart" | "horimeterEnd",
    value: number,
  ) => void;
  onRemoveEquipment: (id: string) => void;
  onOpenAddSheet: () => void;
}

export function StepEquipment({
  equipment,
  onUpdateEquipment,
  onRemoveEquipment,
  onOpenAddSheet,
}: StepEquipmentProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Equipamentos
        </h2>
        <button
          type="button"
          onClick={onOpenAddSheet}
          className="flex items-center gap-2 px-3 h-8 rounded-md border border-input bg-transparent text-sm font-medium active:bg-secondary/50 transition-colors"
        >
          <BoxIcon name="plus" size={16} />
          Adicionar
        </button>
      </div>

      {equipment.map((eq) => (
        <div
          key={eq.id}
          className="p-4 rounded-md border border-border bg-transparent relative"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-foreground pr-8">
              {eq.name}
            </h3>
            <button
              onClick={() => onRemoveEquipment(eq.id)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-destructive p-1 transition-colors"
            >
              <BoxIcon name="trash" size={18} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-2 block uppercase tracking-wider">
                Início
              </label>
              <Stepper
                value={eq.horimeterStart}
                onChange={(val) =>
                  onUpdateEquipment(eq.id, "horimeterStart", val)
                }
                min={0}
                max={99999}
                step={1}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-2 block uppercase tracking-wider">
                Final
              </label>
              <Stepper
                value={eq.horimeterEnd}
                onChange={(val) =>
                  onUpdateEquipment(eq.id, "horimeterEnd", val)
                }
                min={eq.horimeterStart}
                max={99999}
                step={1}
              />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              Uso diário:{" "}
              <span className="font-semibold text-foreground text-sm">
                {eq.horimeterEnd - eq.horimeterStart}h
              </span>
            </p>
          </div>
        </div>
      ))}

      {equipment.length === 0 && (
        <div className="p-6 rounded-md border border-dashed border-border bg-transparent text-center text-sm text-muted-foreground">
          Nenhum equipamento registado hoje.
        </div>
      )}
    </div>
  );
}
