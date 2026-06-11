import { CheckCircle, RefreshCwAlt, Target, User } from "@boxicons/react";

interface StepIdentificationProps {
  location: { lat: number; lng: number } | null;
  onUpdateLocation: (location: { lat: number; lng: number }) => void;
}

export function StepIdentification({
  location,
  onUpdateLocation,
}: StepIdentificationProps) {
  const handleUpdateLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          onUpdateLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => console.error("GPS error:", err),
        { enableHighAccuracy: true },
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Localização GPS */}
      <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Localização GPS
        </h2>

        {location ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 border border-success/30 bg-success/5 rounded-lg">
              <CheckCircle
                pack="basic"
                width={24}
                height={24}
                className="text-success"
              />
              <div>
                <p className="font-medium text-sm text-foreground">
                  Localização capturada
                </p>
                <p className="text-xs text-muted-foreground">
                  Lat: {location.lat.toFixed(6)} | Lon:{" "}
                  {location.lng.toFixed(6)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleUpdateLocation}
              className="w-full h-12 rounded-xl border border-input bg-transparent text-sm font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-secondary/20"
            >
              <RefreshCwAlt pack="basic" width={20} height={20} />
              Atualizar coordenadas
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4 p-3 border border-warning/30 bg-warning/5 rounded-lg">
            <Target
              pack="basic"
              width={24}
              height={24}
              className="text-warning animate-pulse"
            />
            <div>
              <p className="font-medium text-sm text-foreground">
                Obtendo localização...
              </p>
              <p className="text-xs text-muted-foreground">
                Aguarde o sinal do GPS
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Responsável Técnico */}
      <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Responsável Técnico
        </h2>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-secondary/30 flex items-center justify-center">
            <User
              pack="basic"
              width={24}
              height={24}
              className="text-muted-foreground"
            />
          </div>
          <div>
            <p className="font-medium text-foreground">Registro Automático</p>
            <p className="text-sm text-muted-foreground">
              Sua assinatura e dados da conta serão anexados no final.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
