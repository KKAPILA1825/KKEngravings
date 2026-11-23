// Vite exposes any env var prefixed with VITE_ to the client bundle.
// Set in .env.local for dev, and in your host's env settings for prod.
export const REVIEWS_ENDPOINT = (
  (import.meta.env?.VITE_REVIEWS_ENDPOINT as string | undefined) ?? ""
).trim();

export const REVIEWS_CACHE_KEY = "kk_engravings.reviews.cache.v1";
export const REVIEWS_CACHE_TTL_MS = 5 * 60 * 1000;

// Hero trust line only appears once we have at least this many approved reviews.
export const MIN_REVIEWS_FOR_HERO = 3;

// Client-side limits — must stay <= the server-side limits in Config.gs.
export const REVIEW_BODY_MIN = 20;
export const REVIEW_BODY_MAX = 2000;
export const REVIEW_HEADLINE_MAX = 120;
export const FIRST_NAME_MAX = 40;
export const LAST_INITIAL_MAX = 3;
export const CITY_MAX = 60;
export const STATE_MAX = 30;
