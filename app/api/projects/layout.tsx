import { Navigation } from "@/components/navigation";
import { BoxiconsProvider } from "@/components/ui/box-icon";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <BoxiconsProvider>
      {/* Usando h-[100dvh] para travar a altura na tela do dispositivo (Mobile/Desktop) */}
      <div className="flex flex-col lg:flex-row h-dvh bg-background overflow-hidden">
        <Navigation />

        {/* Adicionado h-full para garantir que o contêiner de páginas ocupe tudo sem vazar */}
        <div className="flex-1 flex flex-col min-w-0 h-full relative">
          {children}
        </div>
      </div>
    </BoxiconsProvider>
  );
}
