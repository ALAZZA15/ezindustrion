import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Brand from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { homePathFor, useMe } from "@/hooks/useMe";
import { apiPost, errorMessage } from "@/lib/api";
import { beginSession } from "@/lib/session";
import type { LoginRequest, UserPublic } from "@/lib/types";
import { t } from "@/i18n";

const DEMO = {
  owner: { identifier: "owner@ezindustrion.com", password: "owner123" },
  tenant: { identifier: "dimas@ezindustrion.com", password: "tenant123" },
};

const SHOWCASE_IMG =
  "https://images.unsplash.com/photo-1757344454333-cc666252e596?crop=entropy&cs=srgb&fm=jpg&q=80&w=1200";

export default function Login() {
  const navigate = useNavigate();
  const me = useMe();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const login = useMutation({
    mutationFn: (body: LoginRequest) => apiPost<UserPublic>("/auth/login", body),
    onSuccess: (user) => {
      beginSession();
      navigate(homePathFor(user.role), { replace: true });
    },
    onError: (e) => setError(errorMessage(e, t.login.failed)),
  });

  if (me.data && !login.isPending) return <Navigate to={homePathFor(me.data.role)} replace />;

  const fillDemo = (kind: keyof typeof DEMO) => {
    setIdentifier(DEMO[kind].identifier);
    setPassword(DEMO[kind].password);
    setError(null);
  };

  return (
    <div className="grid min-h-dvh bg-page lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-forest-deep p-12 text-white lg:flex lg:flex-col">
        <Link to="/" data-testid="login-brand-home-link">
          <Brand tone="light" size="lg" />
        </Link>
        <div className="pointer-events-none absolute -bottom-40 -left-24 size-[30rem] rounded-full bg-lime/10 blur-3xl" />
        <div className="relative mt-auto flex flex-col gap-6">
          <div className="overflow-hidden rounded-3xl ring-1 ring-white/10">
            <img src={SHOWCASE_IMG} alt="Boarding room" className="aspect-[16/10] w-full object-cover" />
          </div>
          <h2 className="max-w-md text-4xl font-bold leading-tight tracking-tight">{t.login.showcaseTitle}</h2>
          <p className="max-w-md text-[#BCE3CE]">{t.login.showcaseBody}</p>
        </div>
      </aside>

      <main className="flex flex-col justify-center px-5 py-10 sm:px-10">
        <div className="mx-auto w-full max-w-sm">
          <Link to="/" className="mb-10 inline-block lg:hidden" data-testid="login-brand-mobile-link">
            <Brand size="lg" />
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-forest" data-testid="login-title">{t.login.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t.login.subtitle}</p>

          <form
            className="mt-8 flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              setError(null);
              login.mutate({ identifier, password });
            }}
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="login-identifier">{t.login.identifier}</Label>
              <Input
                id="login-identifier"
                required
                autoComplete="username"
                placeholder={t.login.identifierPlaceholder}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="h-11 rounded-xl bg-white"
                data-testid="login-email-input"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="login-password">{t.login.password}</Label>
              <Input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 rounded-xl bg-white"
                data-testid="login-password-input"
              />
            </div>
            {error && (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" data-testid="login-error">
                {error}
              </p>
            )}
            <Button
              type="submit"
              disabled={login.isPending}
              className="h-11 rounded-xl text-base transition-transform active:scale-[0.98]"
              data-testid="login-submit-button"
            >
              {login.isPending && <Loader2 className="size-4 animate-spin" />}
              {login.isPending ? t.login.submitting : t.login.submit}
            </Button>
          </form>

          <div className="mt-8 rounded-2xl border border-dashed border-lime-500/50 bg-lime-soft/40 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-forest">{t.login.demo}</p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="rounded-xl bg-white" onClick={() => fillDemo("owner")} data-testid="demo-login-owner-button">
                {t.login.demoOwner}
              </Button>
              <Button variant="outline" className="rounded-xl bg-white" onClick={() => fillDemo("tenant")} data-testid="demo-login-tenant-button">
                {t.login.demoTenant}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}