import { useQuery } from "@tanstack/react-query";
import { BedDouble, DoorOpen, Users, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { apiGet } from "@/lib/api";
import { formatRupiah } from "@/lib/format";
import type { DashboardSummary } from "@/lib/types";
import { cn } from "@/lib/utils";
import { t } from "@/i18n";

interface StatProps {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  testId: string;
  featured?: boolean;
}

function Stat({ label, value, hint, icon: Icon, testId, featured }: StatProps) {
  return (
    <div
      className={cn(
        "animate-rise-in rounded-2xl p-5 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md",
        featured ? "bg-forest text-white sm:col-span-2 lg:col-span-1" : "border bg-white",
      )}
    >
      <div className="flex items-center justify-between">
        <p className={cn("text-sm font-medium", featured ? "text-[#BCE3CE]" : "text-muted-foreground")}>{label}</p>
        <span className={cn("grid size-9 place-items-center rounded-xl", featured ? "bg-lime text-forest-deep" : "bg-lime-soft text-forest")}>
          <Icon className="size-[18px]" />
        </span>
      </div>
      <p className={cn("mt-3 font-heading text-3xl font-extrabold tracking-tight sm:text-4xl", featured ? "text-white" : "text-forest")} data-testid={testId}>
        {value}
      </p>
      {hint && <p className={cn("mt-1 text-xs", featured ? "text-[#A7C7B5]" : "text-muted-foreground")}>{hint}</p>}
    </div>
  );
}

export default function Dashboard() {
  const { data, isPending, isError } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => apiGet<DashboardSummary>("/dashboard/summary"),
  });
  const ok = data && !isError;
  const dash = "-";

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-forest sm:text-3xl" data-testid="dashboard-title">{t.dashboard.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base" data-testid="dashboard-property-name">
          {t.dashboard.subtitle} {ok ? `${data.property_name} · ${data.month_label}` : "..."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat featured label={t.dashboard.expectedIncome} hint={t.dashboard.expectedIncomeHint} icon={Wallet} testId="stat-total-revenue" value={ok ? formatRupiah(data.expected_income) : dash} />
        <Stat label={t.dashboard.occupancy} icon={BedDouble} testId="stat-occupancy-rate" value={ok ? `${data.occupancy_rate}%` : dash} hint={ok ? `${data.occupied_rooms}/${data.total_rooms}` : undefined} />
        <Stat label={t.dashboard.vacant} icon={DoorOpen} testId="stat-vacant-rooms" value={ok ? String(data.vacant_rooms) : dash} />
        <Stat label={t.dashboard.tenants} icon={Users} testId="stat-total-tenants" value={ok ? String(data.total_tenants) : dash} />
      </div>

      <section className="rounded-3xl border bg-white p-5 sm:p-6">
        <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-lg font-semibold text-forest sm:text-xl">{t.dashboard.roomStatus}</h2>
          <p className="text-xs text-muted-foreground">{t.dashboard.roomStatusHint}</p>
        </div>
        {isPending && <p className="text-sm text-muted-foreground">{t.common.loading}</p>}
        {isError && <p className="text-sm text-muted-foreground" data-testid="dashboard-error">{t.common.unavailable}</p>}
        {ok && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.rooms.map((r, i) => (
              <div
                key={r.id}
                className={cn(
                  "animate-rise-in flex items-center justify-between rounded-2xl border p-4",
                  r.status === "Vacant" ? "border-dashed bg-page" : "bg-white",
                )}
                style={{ animationDelay: `${i * 50}ms` }}
                data-testid={`dashboard-room-${r.number}`}
              >
                <div>
                  <p className="font-heading text-lg font-bold text-forest">{t.dashboard.room} {r.number}</p>
                  <p className="text-sm text-muted-foreground">{r.tenant_name ?? t.dashboard.noTenant}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <StatusBadge status={r.status} testId={`dashboard-room-${r.number}-status`} />
                  <p className="text-xs font-medium text-muted-foreground">{formatRupiah(r.price)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}