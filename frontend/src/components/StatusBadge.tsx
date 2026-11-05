import { cn } from "@/lib/utils";
import { t } from "@/i18n";

export type BadgeStatus = "Vacant" | "Occupied" | "Paid" | "Unpaid";

const STYLES: Record<BadgeStatus, string> = {
  Paid: "bg-[#DCFCE7] text-[#14532D] ring-[#86EFAC]",
  Unpaid: "bg-[#FEF9C3] text-[#713F12] ring-[#FDE047]",
  Vacant: "bg-[#F1F5F9] text-[#334155] ring-[#CBD5E1]",
  Occupied: "bg-[#E6F4EA] text-[#0F5132] ring-[#A7D7B8]",
};

const DOT: Record<BadgeStatus, string> = {
  Paid: "bg-green-600",
  Unpaid: "bg-yellow-500",
  Vacant: "bg-slate-400",
  Occupied: "bg-emerald-600",
};

export default function StatusBadge({ status, testId }: { status: BadgeStatus; testId?: string }) {
  return (
    <span
      data-testid={testId ?? "status-badge"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        STYLES[status],
      )}
    >
      <span className={cn("size-1.5 rounded-full", DOT[status])} />
      {t.status[status]}
    </span>
  );
}