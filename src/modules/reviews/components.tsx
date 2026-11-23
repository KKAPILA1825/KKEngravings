import { useEffect, useState } from "react";
import { Star, X } from "lucide-react";
import type { Review, ReviewStats } from "./types";
import { fetchPublishedReviews, ReviewsEndpointMissingError } from "./data";
import { MIN_REVIEWS_FOR_HERO } from "./config";

// ---------- Stars (read-only) ----------

export function StarsDisplay({
  rating,
  size = "md",
}: {
  rating: number;
  size?: "sm" | "md" | "lg";
}) {
  const sz = size === "lg" ? "text-2xl" : size === "sm" ? "text-sm" : "text-lg";
  const safe = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <span
      className={`${sz} tracking-wide select-none`}
      aria-label={`${safe} out of 5 stars`}
    >
      <span className="text-[var(--color-gold)]">{"★".repeat(safe)}</span>
      <span className="text-[var(--color-walnut)]/20">
        {"★".repeat(5 - safe)}
      </span>
    </span>
  );
}

// ---------- Stars (interactive) ----------

export function StarRating({
  value,
  onChange,
  invalid,
}: {
  value: number;
  onChange: (n: number) => void;
  invalid?: boolean;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value;
  return (
    <div
      role="radiogroup"
      aria-label="Rating"
      aria-invalid={invalid || undefined}
      className="inline-flex items-center gap-1"
      onMouseLeave={() => setHover(null)}
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const active = n <= display;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={n === value}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onClick={() => onChange(n)}
            onMouseEnter={() => setHover(n)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                e.preventDefault();
                onChange(Math.min(5, value + 1));
              } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                e.preventDefault();
                onChange(Math.max(1, value - 1));
              } else if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                onChange(n);
              }
            }}
            className={`size-10 grid place-items-center rounded-full text-3xl transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] ${
              active
                ? "text-[var(--color-gold)]"
                : "text-[var(--color-walnut)]/25 hover:text-[var(--color-gold)]/60"
            }`}
          >
            {"★"}
          </button>
        );
      })}
      <span className="ml-3 text-sm text-[var(--color-charcoal-soft)]">
        {value > 0 ? `${value} / 5` : "Pick a rating"}
      </span>
    </div>
  );
}

// ---------- Rating histogram ----------

export function RatingHistogram({
  distribution,
  total,
}: {
  distribution: Record<string, number>;
  total: number;
}) {
  return (
    <ul className="space-y-1.5" aria-label="Rating distribution">
      {[5, 4, 3, 2, 1].map((n) => {
        const count = distribution[String(n)] ?? 0;
        const pct = total > 0 ? (count / total) * 100 : 0;
        return (
          <li
            key={n}
            className="grid grid-cols-[auto_1fr_auto] items-center gap-3 text-xs text-[var(--color-charcoal-soft)]"
          >
            <span className="w-6 tabular-nums text-[var(--color-walnut-dark)]">
              {n}
              {"★"}
            </span>
            <div
              className="h-2 rounded-full bg-[color-mix(in_oklab,var(--color-walnut)_10%,transparent)] overflow-hidden"
              aria-hidden
            >
              <div
                className="h-full bg-[var(--color-gold)]"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-6 text-right tabular-nums">{count}</span>
          </li>
        );
      })}
    </ul>
  );
}

// ---------- Review card ----------

export function ReviewCard({ review }: { review: Review }) {
  const name =
    review.firstName + (review.lastInitial ? " " + review.lastInitial : "");
  const location = [review.city, review.state].filter(Boolean).join(", ");
  const nameLine = location ? `${name} · ${location}` : name;
  const date = review.publishedAt
    ? new Date(review.publishedAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "";
  return (
    <article className="rounded-2xl bg-[var(--color-ivory-soft)] p-5 sm:p-6 shadow-[var(--shadow-soft)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <StarsDisplay rating={review.rating} />
          {review.headline && (
            <h3 className="mt-2 font-serif text-xl text-[var(--color-walnut-dark)]">
              {review.headline}
            </h3>
          )}
        </div>
        {date && (
          <time className="text-xs text-[var(--color-charcoal-soft)]/70 whitespace-nowrap">
            {date}
          </time>
        )}
      </div>
      {review.body && (
        <p className="mt-3 text-[var(--color-charcoal-soft)] whitespace-pre-wrap leading-relaxed">
          {review.body}
        </p>
      )}
      <footer className="mt-4 flex items-center justify-between gap-3 text-xs text-[var(--color-charcoal-soft)]/70">
        <span className="font-medium text-[var(--color-walnut-dark)]/80">
          {nameLine}
        </span>
        {review.design && (
          <span className="italic text-right">{review.design}</span>
        )}
      </footer>
    </article>
  );
}

// ---------- Sort toggle ----------

export function SortToggle({
  value,
  onChange,
}: {
  value: "newest" | "highest";
  onChange: (v: "newest" | "highest") => void;
}) {
  const options: Array<{ v: "newest" | "highest"; label: string }> = [
    { v: "newest", label: "Newest" },
    { v: "highest", label: "Highest rated" },
  ];
  return (
    <div
      role="group"
      aria-label="Sort reviews"
      className="inline-flex items-center gap-1 rounded-full bg-[var(--color-ivory-soft)] p-1"
    >
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          aria-pressed={value === o.v}
          onClick={() => onChange(o.v)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            value === o.v
              ? "bg-[var(--color-walnut-dark)] text-[var(--color-ivory)]"
              : "text-[var(--color-charcoal-soft)] hover:text-[var(--color-walnut-dark)]"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ---------- Loading skeleton ----------

export function LoadingSkeleton() {
  return (
    <div
      aria-hidden
      className="animate-pulse space-y-4"
      role="status"
      aria-label="Loading reviews"
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="rounded-2xl bg-[var(--color-ivory-soft)] p-5 sm:p-6"
        >
          <div className="h-5 w-32 rounded bg-[color-mix(in_oklab,var(--color-walnut)_15%,transparent)]" />
          <div className="mt-3 h-6 w-2/3 rounded bg-[color-mix(in_oklab,var(--color-walnut)_15%,transparent)]" />
          <div className="mt-4 h-3 w-full rounded bg-[color-mix(in_oklab,var(--color-walnut)_10%,transparent)]" />
          <div className="mt-2 h-3 w-5/6 rounded bg-[color-mix(in_oklab,var(--color-walnut)_10%,transparent)]" />
          <div className="mt-2 h-3 w-4/6 rounded bg-[color-mix(in_oklab,var(--color-walnut)_10%,transparent)]" />
        </div>
      ))}
    </div>
  );
}

// ---------- Hero trust line ----------
// Used by Hero.tsx. Returns null if we don't have at least MIN_REVIEWS_FOR_HERO
// published reviews yet (keeps the hero clean while the shop is new).

export function HeroTrustLine() {
  const [stats, setStats] = useState<ReviewStats | null>(null);

  useEffect(() => {
    let active = true;
    fetchPublishedReviews()
      .then((d) => {
        if (active) setStats(d.stats);
      })
      .catch((err) => {
        if (err instanceof ReviewsEndpointMissingError) return;
        // Silently ignore other errors — hero is optional.
      });
    return () => {
      active = false;
    };
  }, []);

  if (!stats || stats.count < MIN_REVIEWS_FOR_HERO) return null;

  return (
    <a
      href="#/reviews"
      className="group inline-flex items-center gap-2 mt-6 text-sm text-[var(--color-charcoal-soft)] hover:text-[var(--color-walnut-dark)] transition-colors"
    >
      <StarsDisplay rating={Math.round(stats.average)} size="sm" />
      <span>
        <span className="font-medium text-[var(--color-walnut-dark)]">
          {stats.average.toFixed(1)}
        </span>{" "}
        &middot; {stats.count} review{stats.count === 1 ? "" : "s"}
      </span>
      <span
        aria-hidden
        className="transition-transform group-hover:translate-x-0.5"
      >
        &rarr;
      </span>
    </a>
  );
}

// ---------- Review prompt (post-success modal) ----------
// Shown after a customer completes an order or custom request. Non-blocking —
// Esc, clicking outside, or the close button all dismiss it. Links to the
// existing #/reviews/new form so no duplicate logic.

export function ReviewPromptDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="kk-review-prompt-title"
      className="fixed inset-0 z-50 grid place-items-center p-4 bg-[rgba(20,18,15,0.6)] backdrop-blur-sm animate-[fadeIn_200ms_ease-out]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md bg-[var(--color-ivory)] rounded-2xl p-7 sm:p-8 shadow-2xl text-center">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 inline-flex items-center justify-center size-9 rounded-full text-[var(--color-walnut-dark)] hover:bg-[var(--color-ivory-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]"
        >
          <X size={18} />
        </button>
        <div className="mx-auto mb-4 grid place-items-center size-14 rounded-full bg-[var(--color-gold)]/40">
          <Star
            size={26}
            className="text-[var(--color-walnut-dark)]"
            fill="currentColor"
          />
        </div>
        <h2
          id="kk-review-prompt-title"
          className="font-serif text-2xl text-[var(--color-walnut-dark)]"
        >
          Enjoyed working with KK?
        </h2>
        <p className="mt-3 text-[var(--color-charcoal-soft)]">
          Your review helps future customers discover KK Engravings — it only
          takes a minute.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="#/reviews/new"
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--color-walnut-dark)] text-[var(--color-ivory)] text-sm font-medium hover:bg-[var(--color-walnut)]"
          >
            <Star size={16} fill="currentColor" /> Write a review
          </a>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-[var(--color-walnut)]/30 text-sm text-[var(--color-walnut-dark)] hover:bg-[var(--color-ivory-soft)]"
          >
            Maybe later
          </button>
        </div>
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }`}</style>
    </div>
  );
}
