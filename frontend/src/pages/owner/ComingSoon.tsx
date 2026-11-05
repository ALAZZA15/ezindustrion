import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { t } from "@/i18n";

export default function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-3xl border border-dashed bg-white p-8 sm:p-12" data-testid="coming-soon-page">
      <span className="grid size-12 place-items-center rounded-2xl bg-lime-soft text-forest">
        <Sparkles className="size-6" />
      </span>
      <h1 className="text-2xl font-bold tracking-tight text-forest sm:text-3xl">{title}</h1>
      <p className="text-muted-foreground">{t.comingSoon.body}</p>
      <Link to="/owner/dashboard" className={buttonVariants({ variant: "outline" })} data-testid="coming-soon-back-link">
        {t.comingSoon.back}
      </Link>
    </div>
  );
}