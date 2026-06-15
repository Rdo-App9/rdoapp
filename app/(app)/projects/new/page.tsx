"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { NetworkStatusIndicator } from "@/components/ui/network-status";

// Ícones Oficiais
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

export default function NewProjectPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [error, setError] = useState("");

  // Estados do formulário da Obra
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [description, setDescription] = useState("");

  // Estados Silenciosos
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  // ==========================================
  // MÉTODO 1: Preenchimento Automático via CEP
  // ==========================================
  useEffect(() => {
    // Remove traços e espaços para validar
    const cleanZip = zipCode.replace(/\D/g, "");

    // Só dispara a busca se tiver exatamente 8 números
    if (cleanZip.length === 8) {
      const fetchAddressByZip = async () => {
        setIsFetchingLocation(true);
        try {
          const res = await fetch(`https://viacep.com.br/ws/${cleanZip}/json/`);
          const data = await res.json();

          if (!data.erro) {
            // Se encontrou o CEP, preenche os campos automaticamente
            const street = data.logradouro ? `${data.logradouro}` : "";
            const neighborhood = data.bairro ? `, ${data.bairro}` : "";

            // Só sobrescreve o endereço se a API retornar algo válido
            if (street) setAddress(`${street}${neighborhood}`);
            setCity(data.localidade || "");
            setState(data.uf || "");

            // Limpa mensagens de erro caso o usuário tenha tentado algo inválido antes
            setError("");
          } else {
            setError("CEP não encontrado.");
          }
        } catch (err) {
          console.error("[VIACEP_ERROR]:", err);
          setError("Erro ao buscar o CEP.");
        } finally {
          setIsFetchingLocation(false);
        }
      };

      fetchAddressByZip();
    }
  }, [zipCode]);

  // ==========================================
  // MÉTODO 2: Preenchimento Automático via GPS
  // ==========================================
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
              city,
              town,
              village,
              state: stateName,
              postcode,
            } = data.address;

            const streetName = road || "";
            const neighborhood = suburb ? `, ${suburb}` : "";
            setAddress(`${streetName}${neighborhood}`);
            setCity(city || town || village || "");

            // Se o GPS encontrar o CEP, ele formata com o traço
            if (postcode) {
              setZipCode(postcode.replace("-", ""));
            }

            if (stateName && ufMap[stateName]) {
              setState(ufMap[stateName]);
            }
          }
        } catch (err) {
          console.error("[GEO_ERROR]:", err);
          setError("Não foi possível buscar o endereço automaticamente.");
        } finally {
          setIsFetchingLocation(false);
        }
      },
      (err) => {
        setIsFetchingLocation(false);
        setError("Permissão de localização negada. Preencha manualmente.");
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  // ==========================================
  // SALVAR NO BANCO DE DADOS
  // ==========================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
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
        throw new Error(data.error || "Ocorreu um erro ao criar a obra.");

      router.refresh();
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Erro ao criar a obra. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // CORREÇÃO 1: Mudamos o container principal para flex-1 e h-full
    <div className="flex-1 flex flex-col h-full bg-background relative">
      <header className="pt-safe sticky top-0 bg-background/80 backdrop-blur-lg border-b border-border z-10 shrink-0">
        <div className="px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl border border-input bg-transparent flex items-center justify-center active:bg-secondary/50 transition-colors"
          >
            <ChevronLeft pack="basic" width={24} height={24} />
          </button>
          <h1 className="text-base font-bold text-foreground">Nova Obra</h1>
          <NetworkStatusIndicator showLabel={false} />
        </div>
      </header>

      {/* CORREÇÃO 2 e 3: Adicionado overflow-y-auto e pb-36 para dar muito espaço no fim */}
      <main className="flex-1 px-6 py-6 overflow-y-auto pb-36">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              Cadastrar Projeto
            </h2>
            <p className="text-muted-foreground mt-1">
              Crie a pasta principal para organizar os RDOs.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAutoFillLocation}
            disabled={isFetchingLocation}
            className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center active:scale-95 transition-all disabled:opacity-50 shrink-0"
            title="Usar localização GPS"
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
                className="w-full h-14 pl-12 pr-4 rounded-xl bg-secondary/30 border border-transparent focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary transition-all outline-none text-foreground placeholder:text-muted-foreground/60"
                placeholder="Ex: Residencial Aurora"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground ml-1 uppercase tracking-wider">
              CEP (Busca Automática)
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
                className="w-full h-14 pl-12 pr-4 rounded-xl bg-secondary/30 border border-transparent focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary transition-all outline-none text-foreground placeholder:text-muted-foreground/60"
                placeholder="00000-000"
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
                className="w-full h-14 pl-12 pr-4 rounded-xl bg-secondary/30 border border-transparent focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary transition-all outline-none text-foreground placeholder:text-muted-foreground/60"
                placeholder="Rua, Número, Bairro"
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
                className="w-full h-14 px-4 rounded-xl bg-secondary/30 border border-transparent focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary transition-all outline-none text-foreground placeholder:text-muted-foreground/60"
                placeholder="Ex: Aracaju"
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
                className="w-full h-14 px-4 rounded-xl bg-secondary/30 border border-transparent focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary transition-all outline-none text-foreground placeholder:text-muted-foreground/60 uppercase"
                placeholder="SE"
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
                className="w-full min-h-25 pl-12 pr-4 py-4 rounded-xl bg-secondary/30 border border-transparent focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary transition-all outline-none text-foreground placeholder:text-muted-foreground/60 resize-none"
                placeholder="Detalhes adicionais sobre o projeto..."
              />
            </div>
          </div>

          {/* CORREÇÃO 4: Adicionado pb-safe aqui também como dupla garantia no iOS */}
          <div className="pt-4 mt-2 pb-safe">
            <button
              type="submit"
              disabled={isLoading || !name || !address || !city || !state}
              className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-bold text-base flex items-center justify-center transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shadow-md shadow-primary/20"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Salvando Obra...
                </span>
              ) : (
                "Criar Obra"
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
