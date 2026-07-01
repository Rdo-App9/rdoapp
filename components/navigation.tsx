"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// Importação dos ícones do pacote novo oficial
import { Home, Clipboard, Camera, Cog, HardHat } from "@boxicons/react";

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter(); // <-- ADICIONADO: Para controlarmos a navegação manualmente

  const navItems = [
    { name: "Início", href: "/dashboard", Icon: Home },
    { name: "RDOs", href: "/rdo", Icon: Clipboard },
    { name: "Câmera", href: "/camera", Icon: Camera },
    { name: "Config", href: "/settings", Icon: Cog },
  ];

  const isCamera = pathname === "/camera" || pathname?.startsWith("/camera/");

  if (isCamera) {
    return null;
  }

  // CORREÇÃO: Função que obriga o app a limpar o cache ao trocar de aba
  const handleNavigation = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    e.preventDefault(); // Impede o link padrão
    router.refresh(); // Limpa a árvore de cache do Next.js
    router.push(href); // Força a ida para a tela nova e limpa
  };

  return (
    <>
      {/* ==================== SIDEBAR (Desktop) ==================== */}
      <aside className="hidden lg:flex lg:w-72 shrink-0 lg:flex-col lg:border-r border-border bg-background h-full z-40">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shadow-sm">
              <HardHat
                pack="basic"
                width={28}
                height={28}
                color="currentColor"
                className="text-primary"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Rdo App</h1>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                Gestão de Obras
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" &&
                pathname?.startsWith(`${item.href}/`));

            const IconComponent = item.Icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={(e) => handleNavigation(e, item.href)} // <-- ADICIONADO AQUI
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 active:scale-[0.98]",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                )}
              >
                <IconComponent
                  pack={isActive ? "filled" : "basic"}
                  width={24}
                  height={24}
                  color="currentColor"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* ==================== BOTTOM NAV PREMIUM (Mobile) ==================== */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.06)] pointer-events-none" />

        <div className="relative flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" &&
                pathname?.startsWith(`${item.href}/`));

            const IconComponent = item.Icon;
            const currentSize = isActive ? 26 : 24;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={(e) => handleNavigation(e, item.href)} // <-- ADICIONADO AQUI TAMBÉM
                className="relative flex flex-col items-center justify-center w-16 h-14 gap-1 group"
              >
                <div
                  className={cn(
                    "flex items-center justify-center w-12 h-8 rounded-full transition-all duration-300 active:scale-75",
                    isActive ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <IconComponent
                    pack={isActive ? "filled" : "basic"}
                    width={currentSize}
                    height={currentSize}
                    color="currentColor"
                    className="transition-all duration-300"
                  />
                </div>

                <span
                  className={cn(
                    "text-[10px] transition-all duration-300",
                    isActive
                      ? "font-bold text-primary translate-y-0"
                      : "font-medium text-muted-foreground",
                  )}
                >
                  {item.name}
                </span>

                {isActive && (
                  <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
