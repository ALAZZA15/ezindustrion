import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { homePathFor, useMe } from "@/hooks/useMe";
import type { Role } from "@/lib/types";

export default function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const { data: me, isPending, isError } = useMe();
  if (isPending) {
    return (
      <div className="grid min-h-dvh place-items-center bg-page" data-testid="auth-loading">
        <Loader2 className="size-6 animate-spin text-forest" />
      </div>
    );
  }
  if (isError || !me) return <Navigate to="/login" replace />;
  if (me.role !== role) return <Navigate to={homePathFor(me.role)} replace />;
  return <>{children}</>;
}