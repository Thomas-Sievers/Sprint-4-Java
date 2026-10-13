import {
  CalendarBlank,
  Gear,
  ListChecks,
  PlusCircle,
  SignOut,
  SquaresFour,
  TreeStructure,
} from "@phosphor-icons/react";
import { useLayoutEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createTransitionClickHandler, withViewTransition } from "../lib/viewTransition";
import { Avatar } from "./Avatar";
import { FluidBackground } from "./FluidBackground";

interface NavItem {
  to: string;
  label: string;
  icon: typeof CalendarBlank;
  end?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: SquaresFour, end: true },
  { to: "/reunioes", label: "Reuniões", icon: CalendarBlank, end: true },
  { to: "/reunioes/nova", label: "Nova Reunião", icon: PlusCircle },
  { to: "/validacao", label: "Validação", icon: ListChecks },
  { to: "/cadastros", label: "Cadastros", icon: TreeStructure },
];

function isItemActive(item: NavItem, pathname: string): boolean {
  if (item.end) return pathname === item.to;
  return pathname === item.to || pathname.startsWith(`${item.to}/`);
}

function SidebarNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [pillStyle, setPillStyle] = useState<{ top: number; height: number } | null>(null);

  useLayoutEffect(() => {
    // Meeting detail pages (/reunioes/:id) highlight "Reuniões".
    const activeItem =
      NAV_ITEMS.find((item) => isItemActive(item, location.pathname)) ??
      (location.pathname.startsWith("/reunioes/") ? NAV_ITEMS[1] : undefined);
    const el = activeItem ? itemRefs.current[activeItem.to] : null;
    if (el && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const rect = el.getBoundingClientRect();
      setPillStyle({ top: rect.top - containerRect.top, height: rect.height });
    } else {
      setPillStyle(null);
    }
  }, [location.pathname]);

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1">
      {pillStyle && (
        <span
          aria-hidden="true"
          className="absolute left-0 right-0 rounded-lg bg-accent/14 transition-all duration-200 ease-out"
          style={{ top: pillStyle.top, height: pillStyle.height }}
        />
      )}
      {NAV_ITEMS.map((item) => {
        const active = isItemActive(item, location.pathname);
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={createTransitionClickHandler(navigate, item.to)}
            ref={(el) => {
              itemRefs.current[item.to] = el;
            }}
            className={`relative z-10 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors duration-150 ${
              active ? "text-ink" : "text-muted hover:text-ink"
            }`}
          >
            <Icon size={18} aria-hidden="true" />
            {item.label}
          </NavLink>
        );
      })}
    </div>
  );
}

export function AppShell() {
  const { username, logout } = useAuth();
  const navigate = useNavigate();

  const displayName = username ?? "Usuário";
  const initials = displayName.slice(0, 2).toUpperCase();

  function handleLogout() {
    logout();
    withViewTransition(() => navigate("/login", { replace: true }));
  }

  return (
    <div className="relative isolate flex min-h-dvh bg-surface">
      <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col bg-sidebar px-4 py-5">
        <div className="px-2">
          <span className="text-lg font-extrabold tracking-tight text-ink">
            Nous<span className="text-accent-text">Sight</span>
          </span>
        </div>

        <nav className="mt-8 flex-1">
          <SidebarNav />

          <div className="my-5 h-px bg-hairline/8" />

          <NavLink
            to="/configuracoes"
            onClick={createTransitionClickHandler(navigate, "/configuracoes")}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors duration-150 ${
                isActive ? "text-ink" : "text-muted hover:text-ink"
              }`
            }
          >
            <Gear size={18} aria-hidden="true" />
            Configurações
          </NavLink>

          <div className="mt-5 rounded-[13px] border border-hairline/6 bg-hairline/4 p-3.5">
            <p className="text-xs font-bold uppercase tracking-wide text-faint">Dica</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              Alertas com score abaixo de 80 vão para Validação, prontos para você revisar.
            </p>
          </div>
        </nav>

        <div className="flex items-center gap-3 border-t border-hairline/8 pt-4">
          <Avatar iniciais={initials} size={36} className="text-sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{displayName}</p>
            <p className="text-xs text-faint">Gestor de vendas</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Sair"
            className="shrink-0 rounded-md p-1.5 text-dim transition-colors duration-150 hover:bg-hairline/8 hover:text-ink"
          >
            <SignOut size={17} aria-hidden="true" />
          </button>
        </div>
      </aside>

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-y-0 left-64 right-0 z-0 overflow-hidden"
      >
        <FluidBackground intensity="subtle" />
      </div>

      <div className="relative z-10 ml-64 flex min-h-dvh flex-1 flex-col border-l border-hairline/5">
        <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8 sm:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
