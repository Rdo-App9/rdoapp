import { Stepper } from "@/components/ui/stepper";
import { Plus, Trash, Spanner } from "@boxicons/react";

interface EquipmentEntry {
  id: string;
  name: string;
  type: "MOTORIZED" | "MANUAL";
  horimeterStart: number;
  horimeterEnd: number;
  hoursUsed: number;
  quantity: number;
}

interface StepEquipmentProps {
  equipment: EquipmentEntry[];
  onUpdateEquipment: (
    id: string,
    field: "horimeterStart" | "horimeterEnd" | "hoursUsed" | "quantity",
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
          Equipamentos e Ferramentas
        </h2>
        <button
          type="button"
          onClick={onOpenAddSheet}
          className="flex items-center gap-2 px-4 h-10 rounded-xl border border-input bg-transparent text-sm font-medium active:bg-secondary/50 transition-colors"
        >
          <Plus pack="basic" width={18} height={18} />
          Adicionar
        </button>
      </div>

      {equipment.length === 0 ? (
        <div className="p-6 rounded-xl border border-dashed border-border bg-secondary/10 flex flex-col items-center justify-center gap-2">
          <Spanner
            pack="basic"
            width={24}
            height={24}
            className="text-muted-foreground opacity-50"
          />
          <p className="text-sm text-muted-foreground text-center">
            Nenhum equipamento ou ferramenta registrado hoje.
          </p>
        </div>
      ) : (
        equipment.map((eq) => (
          <div
            key={eq.id}
            className="p-4 rounded-xl border border-border bg-card shadow-sm relative"
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-bold text-foreground leading-tight pr-10">
                  {eq.name}
                </h3>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-1 inline-block border ${
                    eq.type === "MOTORIZED"
                      ? "bg-primary/5 border-primary/20 text-primary"
                      : "bg-orange-500/5 border-orange-500/20 text-orange-500"
                  }`}
                >
                  {eq.type === "MOTORIZED"
                    ? "Máquina / Motorizado"
                    : "Ferramenta Manual"}
                </span>
              </div>
              <button
                onClick={() => onRemoveEquipment(eq.id)}
                className="absolute top-2 right-2 text-muted-foreground hover:text-destructive active:bg-destructive/10 active:scale-95 p-2 rounded-lg transition-all"
              >
                <Trash pack="basic" width={20} height={20} />
              </button>
            </div>

            {/* CONDICIONAL: SE FOR MOTORIZADO (EXIBE HORÍMETROS) */}
            {eq.type === "MOTORIZED" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                <div className="p-3 rounded-lg bg-secondary/30">
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
                  />
                </div>
                <div className="p-3 rounded-lg bg-secondary/30">
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
                  />
                </div>
              </div>
            ) : (
              /* CONDICIONAL: SE FOR FERRAMENTA MANUAL (EXIBE APENAS QUANTIDADE) */
              <div className="mt-3">
                <div className="p-3 rounded-lg bg-secondary/30">
                  <label className="text-xs font-semibold text-muted-foreground mb-2 block uppercase tracking-wider">
                    Quantidade em Uso no Canteiro
                  </label>
                  <Stepper
                    value={eq.quantity}
                    onChange={(val) =>
                      onUpdateEquipment(eq.id, "quantity", val)
                    }
                    min={1}
                    max={500}
                  />
                </div>
              </div>
            )}

            {/* RESUMO DIÁRIO */}
            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                {eq.type === "MOTORIZED"
                  ? "Uso Estimado Diário"
                  : "Controle Físico"}
              </p>
              <p className="font-bold text-primary text-sm">
                {eq.type === "MOTORIZED" ? (
                  <>
                    {eq.horimeterEnd - eq.horimeterStart}{" "}
                    <span className="text-xs font-medium text-muted-foreground">
                      horas
                    </span>
                  </>
                ) : (
                  <>
                    {eq.quantity}{" "}
                    <span className="text-xs font-medium text-muted-foreground">
                      unidade(s)
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
