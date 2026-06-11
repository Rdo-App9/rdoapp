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
  // Função auxiliar para juntar o texto antigo com o novo de forma elegante
  const appendVoiceText = (prev: string, newText: string) => {
    if (!prev.trim()) return newText;

    // Se o texto anterior já termina com ponto, apenas dá espaço e continua
    const hasEndingPunctuation = /[.!?]$/.test(prev.trim());
    return prev + (hasEndingPunctuation ? " " : " ") + newText;
  };

  return (
    <div className="space-y-6">
      <LargeTextarea
        label="Atividades Executadas"
        placeholder="Diga: Fizemos a laje vírgula choveu muito ponto final"
        value={activities}
        onChange={(e) => setActivities(e.target.value)}
        showVoiceInput
        onVoiceResult={(text) =>
          setActivities((prev) => appendVoiceText(prev, text))
        }
      />
      <LargeTextarea
        label="Observações Gerais"
        placeholder="O que mais o cliente precisa saber? (Dite ou digite)"
        value={observations}
        onChange={(e) => setObservations(e.target.value)}
        showVoiceInput
        onVoiceResult={(text) =>
          setObservations((prev) => appendVoiceText(prev, text))
        }
      />
      <LargeTextarea
        label="Ocorrências / Problemas"
        placeholder="Registre problemas ou atrasos..."
        value={issues}
        onChange={(e) => setIssues(e.target.value)}
        showVoiceInput
        onVoiceResult={(text) =>
          setIssues((prev) => appendVoiceText(prev, text))
        }
      />
    </div>
  );
}
