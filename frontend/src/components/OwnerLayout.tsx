import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  AlertCircle,
  BedDouble,
  CalendarCheck,
  FileSignature,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  TrendingUp,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Brand from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useMe } from "@/hooks/useMe";
import { endSession } from "@/lib/session";
import { cn } from "@/lib/utils";
import { t } from "@/i18n";

interface NavItem {
  key: string;
  label: string;
  to: string;
  icon: LucideIcon;
  soon?: boolean;
}

const NAV: NavItem[] = [
  { key: "dashboard", label: t.nav.dashboard, to: "/owner/dashboard", icon: LayoutDashboard },
  { key: "rooms", label: t.nav.rooms, to: "/owner/rooms", icon: BedDouble },
  { key: "tenants", label: t.nav.tenants, to: "/owner/tenants", icon: Users },
  { key: "bills", label: t.nav.bills, to: "/owner/bills", icon: Receipt, soon: true },
  { key: "bookings", label: t.nav.bookings, to: "/owner/bookings", icon: CalendarCheck, soon: true },
  { key: "complaints", label: t.nav.complaints, to: "/owner/complaints", icon: AlertCircle, soon: true },
  { key: "finances", label: t.nav.finances, to: "/owner/finances", icon: TrendingUp, soon: true },
  { key: "contracts", label: t.nav.contracts, to: "/owner/contracts", icon: FileSignature, soon: true },
];

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => (
        <NavLink
          key={item.key}
          to={item.to}
          onClick={onNavigate}
          data-testid={`nav-link-${item.key}`}
          className={({ isActive }) =>
            cn(
              "group relative flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors duration-150",
              isActive ? "bg-sidebar-accent text-white" : "text-[#A7C7B5] hover:bg-[#123021] hover:text-white",
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive && <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-lime" />}
              <item.icon className={cn("size-[18px]", isActive ? "text-lime" : "")} />
              <span className="flex-1">{item.label}</span>
              {item.soon && (
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#D9F99D]">
                  {t.common.comingSoon}
                </span>
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function UserFooter() {
  const { data: me } = useMe();
  return (
    <div className="mt-auto flex items-center gap-3 rounded-2xl bg-white/5 p-3">
      <div className="grid size-9 place-items-center rounded-full bg-lime font-heading font-bold text-forest-deep">
        {me?.name.charAt(0) ?? "?"}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white" data-testid="sidebar-user-name">{me?.name}</p>
        <p className="truncate text-xs text-[#A7C7B5]">{me?.email ?? me?.phone}</p>
      </div>
      <Button
        size="icon-sm"
        variant="ghost"
        className="text-[#A7C7B5] hover:bg-white/10 hover:text-white"
        onClick={() => endSession()}
        aria-label={t.common.logout}
        data-testid="logout-button"
      >
        <LogOut className="size-4" />
      </Button>
    </div>
  );
}

export default function OwnerLayout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-dvh bg-page">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col gap-8 bg-forest-deep px-4 py-6 lg:flex">
        <Brand tone="light" className="px-2" />
        <NavList />
        <UserFooter />
      </aside>

      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/10 bg-forest-deep/95 px-4 backdrop-blur lg:hidden">
        <Brand tone="light" size="sm" />
        <Button
          size="icon"
          variant="ghost"
          className="text-white hover:bg-white/10"
          onClick={() => setOpen(true)}
          aria-label={t.nav.menu}
          data-testid="mobile-menu-button"
        >
          <Menu className="size-5" />
        </Button>
      </header>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="flex w-72 flex-col gap-8 border-none bg-forest-deep px-4 py-6 text-white">
          <SheetTitle className="sr-only">{t.nav.menu}</SheetTitle>
          <Brand tone="light" className="px-2" />
          <NavList onNavigate={() => setOpen(false)} />
          <UserFooter />
        </SheetContent>
      </Sheet>

      <main className="px-4 py-6 sm:px-6 lg:ml-64 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}