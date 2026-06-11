import { useState } from "react";
import { Stepper } from "@/components/ui/stepper";
import { ChevronDown, RefreshCwAlt, Target } from "@boxicons/react";

type WeatherCondition =
  | "sunny"
  | "partly_cloudy"
  | "cloudy"
  | "rainy"
  | "stormy";

interface StepWeatherProps {
  location: { lat: number; lng: number } | null;
  weather: WeatherCondition;
  temperature: number;
  humidity: number;
  weatherOptions: {
    value: WeatherCondition;
    label: string;
    icon: any; // Componente do ícone
  }[];
  onWeatherChange: (val: WeatherCondition) => void;
  onTemperatureChange: (val: number) => void;
  onHumidityChange: (val: number) => void;
  onOpenWeatherSheet: () => void;
}

export function StepWeather({
  location,
  weather,
  temperature,
  humidity,
  weatherOptions,
  onWeatherChange,
  onTemperatureChange,
  onHumidityChange,
  onOpenWeatherSheet,
}: StepWeatherProps) {
  const [isFetching, setIsFetching] = useState(false);
  const currentOption = weatherOptions.find((w) => w.value === weather);
  const CurrentIcon = currentOption?.icon;

  const handleAutoFetchWeather = async () => {
    if (!location) {
      alert("Volte à etapa 1 e capture sua localização primeiro.");
      return;
    }

    setIsFetching(true);
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lng}&current=temperature_2m,relative_humidity_2m,weather_code`,
      );
      const data = await res.json();

      if (data && data.current) {
        // Atualiza Temperatura e Umidade
        onTemperatureChange(Math.round(data.current.temperature_2m));
        onHumidityChange(Math.round(data.current.relative_humidity_2m));

        // Traduz o código WMO da Open-Meteo para os nossos status
        const code = data.current.weather_code;
        if (code === 0) onWeatherChange("sunny");
        else if (code === 1 || code === 2) onWeatherChange("partly_cloudy");
        else if (code === 3 || code === 45 || code === 48)
          onWeatherChange("cloudy");
        else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82))
          onWeatherChange("rainy");
        else if (code >= 95) onWeatherChange("stormy");
      }
    } catch (error) {
      console.error("Erro ao buscar clima:", error);
      alert("Não foi possível obter o clima automaticamente.");
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Botão Mágico de Sincronização */}
      <button
        type="button"
        onClick={handleAutoFetchWeather}
        disabled={isFetching || !location}
        className="w-full h-12 rounded-xl border border-primary/50 bg-primary/5 text-primary text-sm font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
      >
        <RefreshCwAlt
          pack="basic"
          width={20}
          height={20}
          className={isFetching ? "animate-spin" : ""}
        />
        {isFetching
          ? "Buscando dados na estação..."
          : "Preencher Clima Automaticamente"}
      </button>

      <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Condição do Tempo
        </h2>
        <button
          type="button"
          onClick={onOpenWeatherSheet}
          className="w-full p-3 rounded-lg border border-input bg-background flex items-center justify-between active:bg-secondary/50 transition-all hover:border-primary/50"
        >
          <div className="flex items-center gap-3">
            {CurrentIcon && (
              <CurrentIcon
                pack="basic"
                width={24}
                height={24}
                className="text-foreground"
              />
            )}
            <span className="text-sm font-medium text-foreground">
              {currentOption?.label}
            </span>
          </div>
          <ChevronDown
            pack="basic"
            width={20}
            height={20}
            className="text-muted-foreground"
          />
        </button>
      </div>

      <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
        <Stepper
          label="Temperatura (°C)"
          value={temperature}
          onChange={onTemperatureChange}
          min={-10}
          max={50}
          unit="°C"
        />
      </div>

      <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
        <Stepper
          label="Umidade (%)"
          value={humidity}
          onChange={onHumidityChange}
          min={0}
          max={100}
          step={5}
          unit="%"
        />
      </div>
    </div>
  );
}
