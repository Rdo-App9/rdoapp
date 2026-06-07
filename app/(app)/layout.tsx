import { Navigation } from "@/components/navigation";
import { BoxiconsProvider } from "@/components/ui/box-icon";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <BoxiconsProvider>
      <div className="flex flex-col lg:flex-row min-h-screen bg-background overflow-hidden">
        {/* A navegação inteligente: vira Sidebar no Desktop e Bottom Nav no Mobile */}
        <Navigation />

        {/* O conteúdo das páginas (Dashboard, RDOs, etc) entra no lugar do {children} */}
        <div className="flex-1 flex flex-col min-w-0 relative">{children}</div>
      </div>
    </BoxiconsProvider>
  );
}
