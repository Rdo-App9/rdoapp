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
          className="flex items-center gap-2 px-4 h-10 rounded-md border border-input bg-transparent text-sm font-medium active:bg-secondary/50 transition-colors"
        >
          <BoxIcon name="plus" size={18} />
          Adicionar
        </button>
      </div>

      {equipment.map((eq) => (
        <div
          key={eq.id}
          className="p-4 rounded-md border border-border bg-transparent relative"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-foreground pr-10 leading-tight">
              {eq.name}
            </h3>
            {/* Aumentamos o padding (p-2) para facilitar o clique no mobile */}
            <button
              onClick={() => onRemoveEquipment(eq.id)}
              className="absolute top-2 right-2 text-muted-foreground hover:text-destructive active:bg-destructive/10 p-2 rounded-md transition-colors"
            >
              <BoxIcon name="trash" size={20} />
            </button>
          </div>

          {/* A Mágica da Responsividade: grid-cols-1 no mobile, sm:grid-cols-2 em tablets/desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 rounded-md bg-secondary/20">
              <label className="text-xs font-semibold text-muted-foreground mb-2 block uppercase tracking-wider">
                Horímetro Inicial
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
            <div className="p-3 rounded-md bg-secondary/20">
              <label className="text-xs font-semibold text-muted-foreground mb-2 block uppercase tracking-wider">
                Horímetro Final
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

          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Uso Diário
            </p>
            <p className="font-semibold text-foreground text-sm">
              {eq.horimeterEnd - eq.horimeterStart}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                horas
              </span>
            </p>
          </div>
        </div>
      ))}

      {equipment.length === 0 && (
        <div className="p-6 rounded-md border border-dashed border-border bg-transparent flex flex-col items-center justify-center gap-2">
          <BoxIcon
            name="wrench"
            size={24}
            className="text-muted-foreground opacity-50"
          />
          <p className="text-sm text-muted-foreground text-center">
            Nenhum equipamento registado hoje.
          </p>
        </div>
      )}
    </div>
  );
}
