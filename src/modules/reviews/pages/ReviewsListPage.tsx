import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, PencilLine, RefreshCw } from "lucide-react";
import type { Review, ReviewStats, SortKey } from "../types";
import { fetchPublishedReviews, ReviewsEndpointMissingError } from "../data";
import {
  LoadingSkeleton,
  RatingHistogram,
  ReviewCard,
  SortToggle,
  StarsDisplay,
} from "../components";
import { leaveReviews, navigate, parseSort, useHashRoute } from "../router";

type State =
  | { kind: "loading" }
  | { kind: "missing-endpoint" }
  | { kind: "ok"; reviews: Review[]; stats: ReviewStats }
  | { kind: "error"; message: string };

export function ReviewsListPage() {
  const { hash } = useHashRoute();
  const [state, setState] = useState<State>({ kind: "loading" });
  const [sort, setSort] = useState<SortKey>(() => parseSort(hash));

  useEffect(() => {
    let active = true;
    fetchPublishedReviews()
      .then((data) => {
        if (!active) return;
        setState({ kind: "ok", reviews: data.reviews, stats: data.stats });
      })
      .catch((err) => {
        if (!active) return;
        if (err instanceof ReviewsEndpointMissingError) {
          setState({ kind: "missing-endpoint" });
        } else {
          setState({
            kind: "error",
            message: err instanceof Error ? err.message : "Unknown error",
          });
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const sortedReviews = useMemo(() => {
    if (state.kind !== "ok") return [];
    const copy = [...state.reviews];
    if (sort === "highest") {
      copy.sort((a, b) => {
        if (b.rating !== a.rating) return b.rating - a.rating;
        return (b.publishedAt || "").localeCompare(a.publishedAt || "");
      });
    }
    return copy;
  }, [state, sort]);

  const retry = () => {
    setState({ kind: "loading" });
    fetchPublishedReviews({ force: true })
      .then((data) =>
        setState({ kind: "ok", reviews: data.reviews, stats: data.stats }),
      )
      .catch((err) =>
        setState({
          kind: "error",
          message: err instanceof Error ? err.message : "Unknown error",
        }),
      );
  };

  return (
    <div className="mx-auto max-w-4xl px-5 sm:px-8 pt-24 sm:pt-28 pb-16">
      <div className="mb-6">
        <button
          type="button"
          onClick={() => leaveReviews("#home")}
          className="inline-flex items-center gap-2 text-sm text-[var(--color-walnut-dark)] hover:text-[var(--color-walnut)]"
        >
          <ArrowLeft size={16} /> Back to home
        </button>
      </div>

      <div className="flex items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-walnut)]/80">
            Reviews
          </p>
          <h1 className="mt-1 font-serif text-3xl sm:text-4xl text-[var(--color-walnut-dark)]">
            What customers are saying
          </h1>
        </div>
        <button
          type="button"
          onClick={() => navigate("new")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--color-walnut-dark)] text-[var(--color-ivory)] text-sm font-medium hover:bg-[var(--color-walnut)] shadow-[0_8px_24px_-12px_rgba(107,68,35,0.5)]"
        >
          <PencilLine size={16} /> Write a review
        </button>
      </div>

      {state.kind === "ok" && state.stats.count > 0 && (
        <section
          aria-label="Overall rating"
          className="grid gap-6 sm:grid-cols-[auto_1fr] items-center rounded-2xl bg-[var(--color-ivory-soft)] p-6 sm:p-8 mb-8 shadow-[var(--shadow-soft)]"
        >
          <div className="text-center sm:text-left">
            <div className="font-serif text-5xl text-[var(--color-walnut-dark)] tabular-nums">
              {state.stats.average.toFixed(1)}
            </div>
            <div className="mt-2">
              <StarsDisplay rating={Math.round(state.stats.average)} size="lg" />
            </div>
            <p className="mt-2 text-sm text-[var(--color-charcoal-soft)]">
              Based on {state.stats.count} review
              {state.stats.count === 1 ? "" : "s"}
            </p>
          </div>
          <RatingHistogram
            distribution={state.stats.distribution}
            total={state.stats.count}
          />
        </section>
      )}

      {state.kind === "ok" && state.reviews.length > 1 && (
        <div className="mb-5">
          <SortToggle value={sort} onChange={setSort} />
        </div>
      )}

      {state.kind === "loading" && <LoadingSkeleton />}

      {state.kind === "missing-endpoint" && (
        <EmptyNotice
          title="Reviews are being set up"
          body="The reviews service isn't configured on this environment yet. Please check back shortly."
        />
      )}

      {state.kind === "error" && (
        <div
          role="alert"
          className="rounded-2xl bg-red-50 border-2 border-red-200 p-5 text-sm text-red-800"
        >
          <p className="font-medium text-red-900">Reviews couldn't load.</p>
          <p className="mt-1">{state.message}</p>
          <button
            type="button"
            onClick={retry}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-700 text-white font-medium hover:bg-red-800"
          >
            <RefreshCw size={14} /> Try again
          </button>
        </div>
      )}

      {state.kind === "ok" && state.reviews.length === 0 && (
        <EmptyNotice
          title="Be the first to review"
          body="No approved reviews yet. Write one and help future customers decide."
          cta={
            <button
              type="button"
              onClick={() => navigate("new")}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--color-walnut-dark)] text-[var(--color-ivory)] text-sm font-medium hover:bg-[var(--color-walnut)]"
            >
              <PencilLine size={16} /> Write a review
            </button>
          }
        />
      )}

      {state.kind === "ok" && sortedReviews.length > 0 && (
        <ul className="space-y-4">
          {sortedReviews.map((r) => (
            <li key={r.id}>
              <ReviewCard review={r} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EmptyNotice({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-[var(--color-ivory-soft)] p-8 sm:p-10 text-center shadow-[var(--shadow-soft)]">
      <h2 className="font-serif text-xl text-[var(--color-walnut-dark)]">
        {title}
      </h2>
      <p className="mt-2 text-[var(--color-charcoal-soft)]">{body}</p>
      {cta}
    </div>
  );
}
