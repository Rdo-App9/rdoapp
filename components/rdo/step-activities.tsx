import { LargeTextarea } from "@/components/ui/large-input";

interface StepActivitiesProps {
  activities: string;
  setActivities: (val: string | ((prev: string) => string)) => void;
  observations: string;
  setObservations: (val: string | ((prev: string) => string)) => void;
  issues: string;
  setIssues: (val: string | ((prev: string) => string)) => void;
}

export function StepActivities({
  activities,
  setActivities,
  observations,
  setObservations,
  issues,
  setIssues,
}: StepActivitiesProps) {
  return (
    <div className="space-y-6">
      <LargeTextarea
        label="Atividades Executadas"
        placeholder="Descreva as atividades..."
        value={activities}
        onChange={(e) => setActivities(e.target.value)}
        showVoiceInput
        onVoiceResult={(text) =>
          setActivities((prev) => prev + (prev ? " " : "") + text)
        }
      />
      <LargeTextarea
        label="Observações Gerais"
        placeholder="Observações relevantes..."
        value={observations}
        onChange={(e) => setObservations(e.target.value)}
        showVoiceInput
        onVoiceResult={(text) =>
          setObservations((prev) => prev + (prev ? " " : "") + text)
        }
      />
      <LargeTextarea
        label="Ocorrências / Problemas"
        placeholder="Registe problemas ou atrasos..."
        value={issues}
        onChange={(e) => setIssues(e.target.value)}
        showVoiceInput
        onVoiceResult={(text) =>
          setIssues((prev) => prev + (prev ? " " : "") + text)
        }
      />
    </div>
  );
}
