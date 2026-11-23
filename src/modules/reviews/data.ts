import { designs as shopDesigns } from "../orders/data/designs.generated";
import { photos as galleryPhotos } from "../../data/photos";
import {
  REVIEWS_CACHE_KEY,
  REVIEWS_CACHE_TTL_MS,
  REVIEWS_ENDPOINT,
} from "./config";
import type { Review, ReviewStats, SubmitPayload } from "./types";

// ---------- Design dropdown options ----------

export type DesignOption = {
  value: string;
  label: string;
  group: "Shop" | "Gallery";
};

export const designOptions: readonly DesignOption[] = [
  ...shopDesigns.map((d) => ({
    value: d.id,
    label: d.title,
    group: "Shop" as const,
  })),
  ...galleryPhotos.map((p) => ({
    value: p.slug,
    label: p.title,
    group: "Gallery" as const,
  })),
];

// ---------- Cache helpers ----------

type CacheEntry = {
  at: number;
  reviews: Review[];
  stats: ReviewStats;
};

function loadCache(): CacheEntry | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(REVIEWS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry;
    if (!parsed || typeof parsed.at !== "number") return null;
    if (Date.now() - parsed.at > REVIEWS_CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveCache(data: { reviews: Review[]; stats: ReviewStats }): void {
  if (typeof window === "undefined") return;
  try {
    const entry: CacheEntry = { at: Date.now(), ...data };
    window.sessionStorage.setItem(REVIEWS_CACHE_KEY, JSON.stringify(entry));
  } catch {
    // ignore
  }
}

export function clearReviewsCache(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(REVIEWS_CACHE_KEY);
  } catch {
    // ignore
  }
}

// ---------- Network ----------

export class ReviewsEndpointMissingError extends Error {
  constructor() {
    super("VITE_REVIEWS_ENDPOINT is not configured");
  }
}

export async function fetchPublishedReviews(
  opts: { force?: boolean } = {},
): Promise<{ reviews: Review[]; stats: ReviewStats }> {
  if (!REVIEWS_ENDPOINT) throw new ReviewsEndpointMissingError();
  if (!opts.force) {
    const cached = loadCache();
    if (cached) return { reviews: cached.reviews, stats: cached.stats };
  }
  const url = `${REVIEWS_ENDPOINT}?type=reviews&_=${Date.now()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
  const data = (await res.json()) as {
    ok: boolean;
    reviews?: Review[];
    stats?: ReviewStats;
    reason?: string;
  };
  if (!data.ok || !data.reviews || !data.stats) {
    throw new Error(data.reason || "fetch-failed");
  }
  const result = { reviews: data.reviews, stats: data.stats };
  saveCache(result);
  return result;
}

export async function submitReview(payload: SubmitPayload): Promise<{ id: string }> {
  if (!REVIEWS_ENDPOINT) throw new ReviewsEndpointMissingError();
  // Use text/plain to avoid CORS preflight. Apps Script reads
  // e.postData.contents and JSON.parses it.
  const body = JSON.stringify({ type: "review", payload });
  const res = await fetch(REVIEWS_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body,
  });
  if (!res.ok) throw new Error(`Submit failed (${res.status})`);
  const data = (await res.json()) as {
    ok: boolean;
    id?: string;
    reason?: string;
    details?: string[];
  };
  if (!data.ok) {
    const detail = data.details && data.details.length > 0 ? ` (${data.details.join(", ")})` : "";
    throw new Error((data.reason || "submit-failed") + detail);
  }
  clearReviewsCache();
  return { id: data.id || "" };
}
