import { BoxIcon } from "@/components/ui/box-icon";
import { Stepper } from "@/components/ui/stepper";

type WeatherCondition =
  | "sunny"
  | "partly_cloudy"
  | "cloudy"
  | "rainy"
  | "stormy";

interface StepWeatherProps {
  weather: WeatherCondition;
  temperature: number;
  humidity: number;
  weatherOptions: {
    value: WeatherCondition;
    label: string;
    icon: React.ComponentProps<typeof BoxIcon>["name"];
  }[];
  onTemperatureChange: (val: number) => void;
  onHumidityChange: (val: number) => void;
  onOpenWeatherSheet: () => void;
}

export function StepWeather({
  weather,
  temperature,
  humidity,
  weatherOptions,
  onTemperatureChange,
  onHumidityChange,
  onOpenWeatherSheet,
}: StepWeatherProps) {
  const currentOption = weatherOptions.find((w) => w.value === weather);

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-md border border-border bg-transparent">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Condição do Tempo
        </h2>
        <button
          type="button"
          onClick={onOpenWeatherSheet}
          className="w-full p-3 rounded-md border border-input bg-transparent flex items-center justify-between active:bg-secondary/50 transition-all"
        >
          <div className="flex items-center gap-3">
            <BoxIcon
              name={currentOption?.icon || "sun"}
              size={24}
              className="text-muted-foreground"
            />
            <span className="text-sm font-medium text-foreground">
              {currentOption?.label}
            </span>
          </div>
          <BoxIcon
            name="chevron-down"
            size={20}
            className="text-muted-foreground"
          />
        </button>
      </div>

      <div className="p-4 rounded-md border border-border bg-transparent">
        <Stepper
          label="Temperatura (°C)"
          value={temperature}
          onChange={onTemperatureChange}
          min={0}
          max={50}
          unit="°C"
        />
      </div>

      <div className="p-4 rounded-md border border-border bg-transparent">
        <Stepper
          label="Humidade (%)"
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
