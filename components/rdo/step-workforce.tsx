import { BoxIcon } from "@/components/ui/box-icon";
import { Stepper } from "@/components/ui/stepper";

interface WorkforceEntry {
  id: string;
  category: string;
  quantity: number;
}

interface StepWorkforceProps {
  workforce: WorkforceEntry[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveWorker: (id: string) => void;
  onOpenAddSheet: () => void;
}

export function StepWorkforce({
  workforce,
  onUpdateQuantity,
  onRemoveWorker,
  onOpenAddSheet,
}: StepWorkforceProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Efetivo de Pessoal
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

      {workforce.map((worker) => (
        <div
          key={worker.id}
          className="p-4 rounded-md border border-border bg-transparent"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-foreground">
              {worker.category}
            </span>
            <button
              type="button"
              onClick={() => onRemoveWorker(worker.id)}
              className="text-muted-foreground hover:text-destructive transition-colors p-1"
            >
              <BoxIcon name="trash" size={18} />
            </button>
          </div>
          <Stepper
            value={worker.quantity}
            onChange={(qty) => onUpdateQuantity(worker.id, qty)}
            min={0}
            max={100}
          />
        </div>
      ))}

      <div className="p-3 rounded-md border border-dashed border-border bg-transparent text-center mt-6">
        <p className="text-sm text-muted-foreground">
          Total:{" "}
          <span className="font-semibold text-foreground">
            {workforce.reduce((sum, w) => sum + w.quantity, 0)}
          </span>{" "}
          trabalhadores
        </p>
      </div>
    </div>
  );
}
