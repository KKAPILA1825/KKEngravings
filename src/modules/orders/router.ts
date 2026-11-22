import { useEffect, useState } from "react";

export type OrdersRoute = "none" | "home" | "cart" | "checkout";

const PREFIX = "#/orders";

export function parseRoute(hash: string): OrdersRoute {
  if (!hash.startsWith(PREFIX)) return "none";
  const rest = hash.slice(PREFIX.length).split("?")[0].replace(/\/$/, "");
  if (rest === "" || rest === "/") return "home";
  if (rest === "/cart") return "cart";
  if (rest === "/checkout") return "checkout";
  return "home";
}

export function parseDesignParam(hash: string): string | null {
  const q = hash.split("?")[1];
  if (!q) return null;
  const sp = new URLSearchParams(q);
  return sp.get("design");
}

export function navigate(route: OrdersRoute, params?: Record<string, string>): void {
  let path = "#/orders";
  if (route === "cart") path = "#/orders/cart";
  else if (route === "checkout") path = "#/orders/checkout";
  if (params && Object.keys(params).length > 0) {
    const sp = new URLSearchParams(params);
    path += `?${sp.toString()}`;
  }
  window.location.hash = path;
  window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
}

export function leaveOrders(anchorId: string): void {
  window.location.hash = anchorId;
}

export function useHashRoute(): { route: OrdersRoute; hash: string } {
  const [hash, setHash] = useState<string>(() =>
    typeof window === "undefined" ? "" : window.location.hash,
  );
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return { route: parseRoute(hash), hash };
}
