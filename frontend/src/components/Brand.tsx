import { cn } from "@/lib/utils";
import { t } from "@/i18n";

interface BrandProps {
  className?: string;
  tone?: "light" | "dark"; // light = on dark backgrounds
  size?: "sm" | "md" | "lg";
}

export default function Brand({ className, tone = "dark", size = "md" }: BrandProps) {
  const box = size === "lg" ? "size-11 text-xl" : size === "sm" ? "size-8 text-sm" : "size-9 text-base";
  const text = size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-lg";
  return (
    <div className={cn("flex items-center gap-2.5", className)} data-testid="brand-logo">
      <span
        className={cn(
          "grid place-items-center rounded-xl bg-lime font-heading font-black text-forest-deep shadow-[0_6px_20px_-6px_rgba(163,230,53,0.7)]",
          box,
        )}
      >
        Ez
      </span>
      <span
        className={cn(
          "font-heading font-bold tracking-tight",
          text,
          tone === "light" ? "text-white" : "text-forest",
        )}
      >
        Ez<span className={tone === "light" ? "text-lime" : "text-lime-600"}>Industrion</span>
        <span className="sr-only">{t.brand.name}</span>
      </span>
    </div>
  );
}