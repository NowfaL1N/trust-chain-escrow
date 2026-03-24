const STORAGE_KEY = "escrow_demo_auth";

export type DemoAuth = { role: "buyer" | "seller"; email: string };

export function getDemoAuth(): DemoAuth | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DemoAuth;
  } catch {
    return null;
  }
}

export function setDemoAuth(data: DemoAuth): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearDemoAuth(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem("escrow_token");
  // Clear cookie for middleware
  document.cookie = "escrow_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
}
