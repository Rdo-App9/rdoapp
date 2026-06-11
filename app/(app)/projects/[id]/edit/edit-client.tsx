"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { NetworkStatusIndicator } from "@/components/ui/network-status";
import {
  ChevronLeft,
  Building,
  LocationCheck,
  EditAlt,
  Target,
  LocationPin,
} from "@boxicons/react";

const ufMap: Record<string, string> = {
  Acre: "AC",
  Alagoas: "AL",
  Amapá: "AP",
  Amazonas: "AM",
  Bahia: "BA",
  Ceará: "CE",
  "Distrito Federal": "DF",
  "Espírito Santo": "ES",
  Goiás: "GO",
  Maranhão: "MA",
  "Mato Grosso": "MT",
  "Mato Grosso do Sul": "MS",
  "Minas Gerais": "MG",
  Pará: "PA",
  Paraíba: "PB",
  Paraná: "PR",
  Pernambuco: "PE",
  Piauí: "PI",
  "Rio de Janeiro": "RJ",
  "Rio Grande do Norte": "RN",
  "Rio Grande do Sul": "RS",
  Rondônia: "RO",
  Roraima: "RR",
  "Santa Catarina": "SC",
  "São Paulo": "SP",
  Sergipe: "SE",
  Tocantins: "TO",
};

interface EditProjectClientProps {
  project: {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    description: string;
    latitude: number | null;
    longitude: number | null;
  };
}

export default function EditProjectClient({ project }: EditProjectClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [error, setError] = useState("");

  // Inicializa os estados com os dados reais vindos do Neon
  const [name, setName] = useState(project.name);
  const [address, setAddress] = useState(project.address);
  const [city, setCity] = useState(project.city);
  const [state, setState] = useState(project.state);
  const [zipCode, setZipCode] = useState(project.zipCode);
  const [description, setDescription] = useState(project.description);
  const [latitude, setLatitude] = useState<number | null>(project.latitude);
  const [longitude, setLongitude] = useState<number | null>(project.longitude);

  // Busca CEP Automática (ViaCEP)
  useEffect(() => {
    const cleanZip = zipCode.replace(/\D/g, "");
    if (cleanZip.length === 8) {
      const fetchAddressByZip = async () => {
        setIsFetchingLocation(true);
        try {
          const res = await fetch(`https://viacep.com.br/ws/${cleanZip}/json/`);
          const data = await res.json();

          if (!data.erro) {
            const street = data.logradouro ? `${data.logradouro}` : "";
            const neighborhood = data.bairro ? `, ${data.bairro}` : "";
            if (street) setAddress(`${street}${neighborhood}`);
            setCity(data.localidade || "");
            setState(data.uf || "");
            setError("");
          } else {
            setError("CEP não encontrado.");
          }
        } catch (err) {
          setError("Erro ao buscar o CEP.");
        } finally {
          setIsFetchingLocation(false);
        }
      };
      fetchAddressByZip();
    }
  }, [zipCode]);

  // Busca GPS Automática (OpenStreetMap)
  const handleAutoFillLocation = () => {
    if (!("geolocation" in navigator)) {
      setError("Seu dispositivo não suporta GPS.");
      return;
    }

    setIsFetchingLocation(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude: lat, longitude: lng } = position.coords;
          setLatitude(lat);
          setLongitude(lng);

          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
          );
          const data = await res.json();

          if (data && data.address) {
            const {
              road,
              suburb,
              city: c,
              town,
              village,
              state: stateName,
              postcode,
            } = data.address;
            const streetName = road || "";
            const neighborhood = suburb ? `, ${suburb}` : "";
            setAddress(`${streetName}${neighborhood}`);
            setCity(c || town || village || "");
            if (postcode) setZipCode(postcode.replace("-", ""));
            if (stateName && ufMap[stateName]) setState(ufMap[stateName]);
          }
        } catch (err) {
          setError("Não foi possível buscar o endereço automaticamente.");
        } finally {
          setIsFetchingLocation(false);
        }
      },
      () => {
        setIsFetchingLocation(false);
        setError("Permissão de localização negada.");
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Faz o PATCH atualizando os dados textuais e geográficos da obra
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          address,
          city,
          state,
          zipCode,
          latitude,
          longitude,
          description,
        }),
      });

      const data = await res.json();

      if (!res.ok)
        throw new Error(
          data.error || "Ocorreu um erro ao salvar as alterações.",
        );

      router.refresh();
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Erro ao salvar. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      <header className="pt-safe sticky top-0 bg-background/80 backdrop-blur-lg border-b border-border z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl border border-input bg-transparent flex items-center justify-center active:bg-secondary/50 transition-colors"
          >
            <ChevronLeft pack="basic" width={24} height={24} />
          </button>
          <h1 className="text-base font-bold text-foreground">Editar Obra</h1>
          <NetworkStatusIndicator showLabel={false} />
        </div>
      </header>

      <main className="flex-1 px-6 py-6 pb-28">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              Modificar Projeto
            </h2>
            <p className="text-muted-foreground mt-1">
              Atualize as informações essenciais deste canteiro.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAutoFillLocation}
            disabled={isFetchingLocation}
            className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center active:scale-95 transition-all disabled:opacity-50 shrink-0"
          >
            {isFetchingLocation ? (
              <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            ) : (
              <Target pack="basic" width={24} height={24} />
            )}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground ml-1 uppercase tracking-wider">
              Nome da Obra
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                <Building pack="basic" width={20} height={20} />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-14 pl-12 pr-4 rounded-xl bg-secondary/30 border border-transparent focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary transition-all outline-none text-foreground"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground ml-1 uppercase tracking-wider">
              CEP
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                <LocationPin pack="basic" width={20} height={20} />
              </div>
              <input
                type="text"
                maxLength={9}
                value={zipCode}
                onChange={(e) => {
                  let v = e.target.value.replace(/\D/g, "");
                  if (v.length > 5) v = v.replace(/^(\d{5})(\d)/, "$1-$2");
                  setZipCode(v);
                }}
                className="w-full h-14 pl-12 pr-4 rounded-xl bg-secondary/30 border border-transparent focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary transition-all outline-none text-foreground"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground ml-1 uppercase tracking-wider">
              Endereço da Obra
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                <LocationCheck pack="basic" width={20} height={20} />
              </div>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full h-14 pl-12 pr-4 rounded-xl bg-secondary/30 border border-transparent focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary transition-all outline-none text-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground ml-1 uppercase tracking-wider">
                Cidade
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full h-14 px-4 rounded-xl bg-secondary/30 border border-transparent focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary transition-all outline-none text-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground ml-1 uppercase tracking-wider">
                Estado (UF)
              </label>
              <input
                type="text"
                required
                maxLength={2}
                value={state}
                onChange={(e) => setState(e.target.value.toUpperCase())}
                className="w-full h-14 px-4 rounded-xl bg-secondary/30 border border-transparent focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary transition-all outline-none text-foreground uppercase"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground ml-1 uppercase tracking-wider">
              Descrição (Opcional)
            </label>
            <div className="relative">
              <div className="absolute top-4 left-0 pl-4 flex items-start pointer-events-none text-muted-foreground">
                <EditAlt pack="basic" width={20} height={20} />
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full min-h-25 pl-12 pr-4 py-4 rounded-xl bg-secondary/30 border border-transparent focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary transition-all outline-none text-foreground resize-none"
              />
            </div>
          </div>

          <div className="pt-4 mt-2 pb-8">
            <button
              type="submit"
              disabled={isLoading || !name || !address || !city || !state}
              className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-bold text-base flex items-center justify-center transition-all duration-200 active:scale-[0.98] disabled:opacity-50 shadow-md shadow-primary/20"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Atualizando...
                </span>
              ) : (
                "Salvar Alterações"
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
