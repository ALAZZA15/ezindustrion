import { useQueryClient } from "@tanstack/react-query";

// Called after a successful login — clears cached "me" so it re-fetches.
export function beginSession() {
  // no-op: the login page navigates and useMe re-fetches via staleTime
}

// Called on logout — posts to the API and reloads to reset all cached state.
export async function endSession() {
  try {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
  } catch {
    // ignore network errors
  }
  window.location.href = "/login";
}