import { Link } from "react-router-dom";
import { ArrowRight, BellRing, ClipboardList, FileSignature, QrCode } from "lucide-react";
import Brand from "@/components/Brand";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { t } from "@/i18n";

const HERO_IMG =
  "https://images.unsplash.com/photo-1788927775194-70e9b280dd79?crop=entropy&cs=srgb&fm=jpg&q=80&w=1200";
const FEATURE_ICONS = [QrCode, BellRing, ClipboardList, FileSignature];

export default function Home() {
  return (
    <div className="min-h-dvh bg-page">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-forest-deep/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Brand tone="light" />
          <Link to="/login" className={cn(buttonVariants({ size: "sm" }), "bg-lime text-forest-deep hover:bg-lime-400")} data-testid="header-login-link">
            {t.home.navLogin}
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden bg-forest-deep text-white">
        <div className="pointer-events-none absolute -right-32 -top-32 size-[28rem] rounded-full bg-lime/10 blur-3xl" />
        <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:pb-24 lg:pt-20">
          <div className="animate-rise-in flex flex-col items-start gap-6">
            <span className="rounded-full bg-lime/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#D9F99D]">
              {t.home.heroEyebrow}
            </span>
            <h1 className="max-w-xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl" data-testid="home-hero-title">
              {t.home.heroTitle}
            </h1>
            <p className="max-w-lg text-base text-[#BCE3CE] sm:text-lg">{t.home.heroSubtitle}</p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/login"
                className={cn(buttonVariants({ size: "lg" }), "h-12 gap-2 rounded-xl bg-lime px-6 text-forest-deep hover:bg-lime-400")}
                data-testid="hero-owner-login-link"
              >
                {t.home.ctaOwner} <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/login"
                className={cn(buttonVariants({ size: "lg", variant: "outline" }), "h-12 rounded-xl border-white/25 bg-transparent px-6 text-white hover:bg-white/10 hover:text-white")}
                data-testid="hero-tenant-login-link"
              >
                {t.home.ctaTenant}
              </Link>
            </div>
            <p className="text-sm text-[#A7C7B5]" data-testid="hero-rooms-coming-soon">{t.home.ctaRooms}</p>
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-3xl ring-1 ring-white/10 lg:rotate-1">
              <img src={HERO_IMG} alt="Furnished boarding house room" className="aspect-[4/3] w-full object-cover" />
            </div>
            <div className="animate-float-slow absolute -bottom-6 left-4 rounded-2xl bg-white p-4 text-forest shadow-xl sm:left-[-1.5rem]">
              <p className="text-xs font-medium text-muted-foreground">Room 2 · November</p>
              <p className="font-heading text-2xl font-extrabold">Rp900,000</p>
              <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-[#DCFCE7] px-2.5 py-0.5 text-xs font-semibold text-[#14532D]">
                <span className="size-1.5 rounded-full bg-green-600" /> {t.status.Paid}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="mb-8 text-2xl font-bold tracking-tight text-forest sm:text-3xl">{t.home.featuresTitle}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.home.features.map((f, i) => {
            const Icon = FEATURE_ICONS[i];
            return (
              <div
                key={f.title}
                className={cn(
                  "animate-rise-in rounded-2xl border bg-white p-5 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md",
                  i === 0 && "lg:col-span-2",
                )}
                style={{ animationDelay: `${i * 70}ms` }}
                data-testid={`home-feature-${i}`}
              >
                <span className="mb-4 grid size-10 place-items-center rounded-xl bg-lime-soft text-forest">
                  <Icon className="size-5" />
                </span>
                <h3 className="text-lg font-semibold text-forest">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      <footer className="border-t bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 px-4 py-8 sm:flex-row sm:items-center sm:px-6">
          <Brand size="sm" />
          <p className="text-sm text-muted-foreground">{t.home.footer}</p>
        </div>
      </footer>
    </div>
  );
}