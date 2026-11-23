import { useEffect, useState } from "react";
import type { ReviewsRoute } from "./types";

const PREFIX = "#/reviews";

export function parseRoute(hash: string): ReviewsRoute {
  if (!hash.startsWith(PREFIX)) return "none";
  const rest = hash.slice(PREFIX.length).split("?")[0].replace(/\/$/, "");
  if (rest === "/new") return "new";
  return "list";
}

export function parseSort(hash: string): "newest" | "highest" {
  const q = hash.split("?")[1];
  if (!q) return "newest";
  return new URLSearchParams(q).get("sort") === "highest" ? "highest" : "newest";
}

export function navigate(route: ReviewsRoute, params?: Record<string, string>): void {
  if (route === "none") return;
  let path = route === "new" ? "#/reviews/new" : "#/reviews";
  if (params && Object.keys(params).length > 0) {
    path += `?${new URLSearchParams(params).toString()}`;
  }
  window.location.hash = path;
  window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
}

export function leaveReviews(anchorId: string): void {
  window.location.hash = anchorId;
}

export function useHashRoute(): { route: ReviewsRoute; hash: string } {
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
