"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BoxIcon, type BoxIconName } from "@/components/ui/box-icon";

export function Navigation() {
  const pathname = usePathname();

  // Array centralizado para facilitar a adição de novos menus no futuro
  const navItems: { name: string; href: string; icon: BoxIconName }[] = [
    { name: "Início", href: "/dashboard", icon: "home" },
    { name: "RDOs", href: "/rdo", icon: "clipboard" },
    { name: "Câmera", href: "/camera", icon: "camera" },
    { name: "Config", href: "/settings", icon: "cog" },
  ];

  // Se estivermos na tela da câmera, não renderizamos a navegação.
  // Isso garante tela cheia (fullscreen) absoluta para o componente da câmera.
  const isCamera = pathname === "/camera" || pathname?.startsWith("/camera/");

  if (isCamera) {
    return null;
  }

  return (
    <>
      {/* ==================== SIDEBAR (Desktop / Tablets Grandes) ==================== */}
      <aside className="hidden lg:flex lg:w-72 shrink-0 lg:flex-col lg:border-r border-border bg-card h-full z-40">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shadow-sm">
              <BoxIcon name="hard-hat" size={28} className="text-primary" />
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
            // Lógica para manter o botão ativo mesmo em sub-rotas
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" &&
                pathname?.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-md font-medium transition-all active:scale-[0.98]",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-foreground hover:bg-primary/10",
                )}
              >
                <BoxIcon name={item.icon} size={24} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* ==================== BOTTOM NAV (Mobile) ==================== */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 pb-safe">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" &&
                pathname?.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center w-16 h-14 gap-1 rounded-md transition-all",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full transition-all",
                    isActive && "bg-primary/15",
                  )}
                >
                  <BoxIcon name={item.icon} size={24} />
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium",
                    isActive && "font-bold",
                  )}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
