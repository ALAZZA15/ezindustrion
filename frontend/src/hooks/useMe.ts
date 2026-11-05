import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import type { UserPublic } from "@/lib/types";

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => apiGet<UserPublic>("/auth/me"),
    retry: false,
    staleTime: 60_000,
  });
}

export function homePathFor(role: UserPublic["role"]): string {
  return role === "owner" ? "/owner/dashboard" : "/tenant";
}