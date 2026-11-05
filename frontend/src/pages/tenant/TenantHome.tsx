import { useQuery } from "@tanstack/react-query";
import { AlertCircle, CalendarDays, FileSignature, LogOut, MapPin, Receipt, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Brand from "@/components/Brand";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { useMe } from "@/hooks/useMe";
import { apiGet } from "@/lib/api";
import { formatDate, formatRupiah, ordinal } from "@/lib/format";
import { endSession } from "@/lib/session";
import type { TenantHome as TenantHomeData } from "@/lib/types";
import { t } from "@/i18n";

function SoonTile({ icon: Icon, title, hint, testId }: { icon: LucideIcon; title: string; hint: string; testId: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border bg-white p-4" data-testid={testId}>
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-lime-soft text-forest">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="font-semibold text-forest">{title}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
    </div>
  );
}

export default function TenantHome() {
  const { data: me } = useMe();
  const { data, isPending, isError } = useQuery({
    queryKey: ["tenant-home"],
    queryFn: () => apiGet<TenantHomeData>("/me/tenant"),
  });
  const room = !isError ? data?.room : null;

  return (
    <div className="min-h-dvh bg-page">
      <header className="bg-forest-deep text-white">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <Brand tone="light" size="sm" />
          <Button
            size="sm"
            variant="ghost"
            className="gap-1.5 text-[#A7C7B5] hover:bg-white/10 hover:text-white"
            onClick={() => endSession()}
            data-testid="logout-button"
          >
            <LogOut className="size-4" /> {t.common.logout}
          </Button>
        </div>
        <div className="mx-auto max-w-3xl px-4 pb-20 pt-4">
          <h1 className="text-3xl font-bold tracking-tight" data-testid="tenant-greeting">
            {t.tenantHome.greeting}, {me?.name} 👋
          </h1>
          <p className="mt-1 text-[#BCE3CE]">{t.tenantHome.subtitle}</p>
        </div>
      </header>

      <main className="mx-auto -mt-14 flex max-w-3xl flex-col gap-5 px-4 pb-12">
        <section className="animate-rise-in overflow-hidden rounded-3xl border bg-white shadow-sm" data-testid="tenant-room-card">
          {isPending && <p className="p-6 text-sm text-muted-foreground">{t.common.loading}</p>}
          {isError && <p className="p-6 text-sm text-muted-foreground" data-testid="tenant-home-error">{t.common.unavailable}</p>}
          {data && !isError && !room && <p className="p-6 text-sm text-muted-foreground" data-testid="tenant-no-room">{t.tenantHome.noRoom}</p>}
          {room && data && (
            <>
              {room.photos.length > 0 && (
                <div className="flex snap-x gap-2 overflow-x-auto p-2">
                  {room.photos.map((p) => (
                    <img key={p} src={p} alt="" className="aspect-[4/3] w-64 shrink-0 snap-start rounded-2xl object-cover sm:w-72" />
                  ))}
                </div>
              )}
              <div className="flex flex-col gap-5 p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.tenantHome.myRoom}</p>
                    <h2 className="font-heading text-2xl font-bold text-forest" data-testid="tenant-room-number">{t.rooms.room} {room.number}</h2>
                    <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="size-3.5" /> {data.property.name}
                    </p>
                  </div>
                  <StatusBadge status={room.status} testId="tenant-room-status" />
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-forest p-4 text-white">
                    <Wallet className="mb-2 size-4 text-lime" />
                    <p className="text-xs text-[#BCE3CE]">{t.tenantHome.rent}</p>
                    <p className="font-heading text-xl font-extrabold" data-testid="tenant-room-rent">{formatRupiah(room.price)}</p>
                  </div>
                  <div className="rounded-2xl bg-page p-4">
                    <Receipt className="mb-2 size-4 text-forest" />
                    <p className="text-xs text-muted-foreground">{t.tenantHome.due}</p>
                    <p className="font-heading text-lg font-bold text-forest">{ordinal(room.due_day)} {t.tenantHome.dueValue}</p>
                  </div>
                  <div className="col-span-2 rounded-2xl bg-page p-4 sm:col-span-1">
                    <CalendarDays className="mb-2 size-4 text-forest" />
                    <p className="text-xs text-muted-foreground">{t.tenantHome.moveIn}</p>
                    <p className="font-heading text-lg font-bold text-forest">{formatDate(data.tenant.move_in_date)}</p>
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-semibold text-forest">{t.tenantHome.amenities}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {room.amenities.map((a) => (
                      <span key={a} className="rounded-full bg-lime-soft/70 px-3 py-1 text-xs font-medium text-forest">{a}</span>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </section>

        <div className="grid gap-3 sm:grid-cols-3">
          <SoonTile icon={Receipt} title={t.tenantHome.bills} hint={t.tenantHome.billsHint} testId="tenant-tile-bills" />
          <SoonTile icon={AlertCircle} title={t.tenantHome.complaints} hint={t.tenantHome.complaintsHint} testId="tenant-tile-complaints" />
          <SoonTile icon={FileSignature} title={t.tenantHome.contract} hint={t.tenantHome.contractHint} testId="tenant-tile-contract" />
        </div>
      </main>
    </div>
  );
}