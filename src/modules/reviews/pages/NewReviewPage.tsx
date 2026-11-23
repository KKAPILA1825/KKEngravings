import { useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  PencilLine,
  RefreshCw,
  Send,
} from "lucide-react";
import {
  CITY_MAX,
  FIRST_NAME_MAX,
  LAST_INITIAL_MAX,
  REVIEW_BODY_MAX,
  REVIEW_BODY_MIN,
  REVIEW_HEADLINE_MAX,
  STATE_MAX,
} from "../config";
import {
  designOptions,
  ReviewsEndpointMissingError,
  submitReview,
  type DesignOption,
} from "../data";
import { StarRating } from "../components";
import { leaveReviews, navigate } from "../router";

const inputCls =
  "w-full rounded-lg bg-[var(--color-ivory)] border border-[color-mix(in_oklab,var(--color-walnut)_20%,transparent)] px-3.5 py-2.5 text-[15px] placeholder:text-[var(--color-charcoal-soft)]/50 focus:border-[var(--color-walnut)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/50 transition-colors";

type Status = "idle" | "sending" | "success" | "error" | "missing-endpoint";

type FieldErrors = Partial<
  Record<
    "rating" | "firstName" | "email" | "body" | "lastInitial" | "city" | "state" | "headline",
    string
  >
>;

function Field({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-[var(--color-walnut-dark)] mb-1.5">
        {label} {required && <span className="text-red-700">*</span>}
      </span>
      {children}
      {error ? (
        <span role="alert" className="block mt-1 text-xs text-red-700">
          {error}
        </span>
      ) : hint ? (
        <span className="block mt-1 text-xs text-[var(--color-charcoal-soft)]/70">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

export function NewReviewPage() {
  const [rating, setRating] = useState<number>(0);
  const [firstName, setFirstName] = useState("");
  const [lastInitial, setLastInitial] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [headline, setHeadline] = useState("");
  const [body, setBody] = useState("");
  const [design, setDesign] = useState("");
  const [hp, setHp] = useState(""); // honeypot

  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  const groupedDesigns = useMemo(() => {
    const shop: DesignOption[] = [];
    const gallery: DesignOption[] = [];
    for (const opt of designOptions) {
      (opt.group === "Shop" ? shop : gallery).push(opt);
    }
    return { shop, gallery };
  }, []);

  const resetForm = () => {
    setRating(0);
    setFirstName("");
    setLastInitial("");
    setEmail("");
    setCity("");
    setState("");
    setHeadline("");
    setBody("");
    setDesign("");
    setHp("");
    setErrors({});
    setErrorMessage(null);
  };

  const sendAnother = () => {
    resetForm();
    setStatus("idle");
  };

  const validate = (): FieldErrors => {
    const errs: FieldErrors = {};
    if (rating < 1 || rating > 5) errs.rating = "Please pick a rating.";
    if (!firstName.trim()) errs.firstName = "First name is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      errs.email = "Enter a valid email address.";
    if (body.trim().length < REVIEW_BODY_MIN)
      errs.body = `Please write at least ${REVIEW_BODY_MIN} characters.`;
    if (body.length > REVIEW_BODY_MAX)
      errs.body = `Please keep it under ${REVIEW_BODY_MAX} characters.`;
    return errs;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setStatus("sending");
    setErrorMessage(null);
    try {
      await submitReview({
        rating,
        firstName: firstName.trim(),
        lastInitial: lastInitial.trim(),
        email: email.trim(),
        city: city.trim(),
        state: state.trim(),
        headline: headline.trim(),
        body: body.trim(),
        referencedDesign: design.trim(),
        hp,
      });
      setStatus("success");
    } catch (err) {
      console.warn("[KK Reviews] submit failed:", err);
      if (err instanceof ReviewsEndpointMissingError) {
        setStatus("missing-endpoint");
      } else {
        setErrorMessage(err instanceof Error ? err.message : "Submission failed");
        setStatus("error");
      }
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-5 sm:px-8 pt-24 sm:pt-28 pb-16">
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate("list")}
          className="inline-flex items-center gap-2 text-sm text-[var(--color-walnut-dark)] hover:text-[var(--color-walnut)]"
        >
          <ArrowLeft size={16} /> Back to reviews
        </button>
      </div>

      <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-walnut)]/80">
        Reviews · Write one
      </p>
      <h1 className="mt-1 font-serif text-3xl sm:text-4xl text-[var(--color-walnut-dark)]">
        Share your experience
      </h1>
      <p className="mt-3 max-w-2xl text-[var(--color-charcoal-soft)]">
        Tell KK and future customers what you loved about your piece.
      </p>

      {status === "success" ? (
        <div className="mt-8 bg-[var(--color-ivory-soft)] rounded-2xl p-8 shadow-[var(--shadow-soft)] text-center">
          <div className="mx-auto mb-4 grid place-items-center size-14 rounded-full bg-[var(--color-gold)]/40">
            <Check size={28} className="text-[var(--color-walnut-dark)]" />
          </div>
          <h2 className="font-serif text-2xl text-[var(--color-walnut-dark)]">
            Thanks for your review!
          </h2>
          <p className="mt-3 text-[var(--color-charcoal-soft)]">
            Your review will appear on the site once KK approves it. We'll be in
            touch if we have any questions.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate("list")}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--color-walnut-dark)] text-[var(--color-ivory)] text-sm hover:bg-[var(--color-walnut)]"
            >
              Back to reviews
            </button>
            <button
              type="button"
              onClick={sendAnother}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-[var(--color-walnut)]/30 text-sm text-[var(--color-walnut-dark)] hover:bg-[var(--color-ivory-soft)]"
            >
              <PencilLine size={16} /> Write another
            </button>
            <button
              type="button"
              onClick={() => leaveReviews("#home")}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-[var(--color-walnut)]/30 text-sm text-[var(--color-walnut-dark)] hover:bg-[var(--color-ivory-soft)]"
            >
              Back to home
            </button>
          </div>
        </div>
      ) : status === "missing-endpoint" ? (
        <div className="mt-8 rounded-2xl bg-amber-50 border border-amber-200 p-6 text-sm text-amber-900">
          <p className="font-medium">Reviews aren't accepting submissions yet.</p>
          <p className="mt-1">
            The reviews service isn't configured on this environment. Please check
            back later.
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-8 bg-[var(--color-ivory-soft)] rounded-2xl p-6 sm:p-8 shadow-[var(--shadow-soft)] space-y-5"
        >
          <Field label="How many stars?" required error={errors.rating}>
            <StarRating
              value={rating}
              onChange={setRating}
              invalid={!!errors.rating}
            />
          </Field>

          <div className="grid sm:grid-cols-[2fr_1fr] gap-4">
            <Field label="First name" required error={errors.firstName}>
              <input
                type="text"
                value={firstName}
                onChange={(e) =>
                  setFirstName(e.target.value.slice(0, FIRST_NAME_MAX))
                }
                autoComplete="given-name"
                className={inputCls}
              />
            </Field>
            <Field
              label="Last initial"
              hint="Optional, e.g. S."
              error={errors.lastInitial}
            >
              <input
                type="text"
                value={lastInitial}
                onChange={(e) =>
                  setLastInitial(e.target.value.slice(0, LAST_INITIAL_MAX))
                }
                autoComplete="family-name"
                className={inputCls}
              />
            </Field>
          </div>

          <Field
            label="Email"
            required
            hint="Never shown publicly. KK may reach out if there's a question."
            error={errors.email}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              inputMode="email"
              className={inputCls}
            />
          </Field>

          <div className="grid sm:grid-cols-[2fr_1fr] gap-4">
            <Field label="City" error={errors.city} hint="Optional">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value.slice(0, CITY_MAX))}
                autoComplete="address-level2"
                className={inputCls}
              />
            </Field>
            <Field label="State" error={errors.state} hint="Optional">
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value.slice(0, STATE_MAX))}
                autoComplete="address-level1"
                className={inputCls}
                maxLength={30}
              />
            </Field>
          </div>

          <Field
            label="Which design are you reviewing?"
            hint="Optional — helps future customers find your review."
          >
            <select
              value={design}
              onChange={(e) => setDesign(e.target.value)}
              className={inputCls}
            >
              <option value="">— Choose a design (optional) —</option>
              {groupedDesigns.shop.length > 0 && (
                <optgroup label="Shop designs">
                  {groupedDesigns.shop.map((d) => (
                    <option key={`shop-${d.value}`} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </optgroup>
              )}
              {groupedDesigns.gallery.length > 0 && (
                <optgroup label="Gallery pieces">
                  {groupedDesigns.gallery.map((d) => (
                    <option key={`gal-${d.value}`} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </Field>

          <Field
            label="Headline"
            hint="Optional — one short line that captures it."
            error={errors.headline}
          >
            <input
              type="text"
              value={headline}
              onChange={(e) =>
                setHeadline(e.target.value.slice(0, REVIEW_HEADLINE_MAX))
              }
              placeholder="e.g. Beautiful work, fast turnaround"
              className={inputCls}
            />
          </Field>

          <Field
            label="Your review"
            required
            hint={`At least ${REVIEW_BODY_MIN} characters. ${body.length}/${REVIEW_BODY_MAX}`}
            error={errors.body}
          >
            <textarea
              required
              value={body}
              onChange={(e) =>
                setBody(e.target.value.slice(0, REVIEW_BODY_MAX))
              }
              rows={6}
              placeholder="What did you love? How did KK make the piece special?"
              className={`${inputCls} resize-y min-h-32`}
            />
          </Field>

          {/* Honeypot — bots fill, humans don't. Visually hidden via inline style. */}
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            value={hp}
            onChange={(e) => setHp(e.target.value)}
            style={{
              position: "absolute",
              left: "-9999px",
              width: "1px",
              height: "1px",
              opacity: 0,
            }}
          />

          {status === "error" && (
            <div
              role="alert"
              className="rounded-xl bg-red-50 border-2 border-red-300 p-4 space-y-3"
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className="shrink-0 text-red-700" size={20} />
                <div className="text-sm text-red-800">
                  <p className="font-medium text-red-900">
                    Your review wasn't submitted.
                  </p>
                  <p className="mt-1">
                    Something went wrong reaching our server. Please try again.
                  </p>
                </div>
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-700 text-white text-sm font-medium hover:bg-red-800"
              >
                <RefreshCw size={14} /> Try again
              </button>
              {errorMessage && (
                <p className="text-xs text-red-800/70">
                  Technical details: {errorMessage}
                </p>
              )}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={status === "sending"}
              className="inline-flex items-center gap-2 bg-[var(--color-walnut)] hover:bg-[var(--color-walnut-dark)] text-[var(--color-ivory)] px-6 py-3 rounded-full text-sm font-medium tracking-wide transition-colors shadow-[0_8px_24px_-12px_rgba(107,68,35,0.5)] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Send size={16} />
              {status === "sending" ? "Submitting…" : "Submit review"}
            </button>
          </div>

          <p className="text-[11px] text-[var(--color-charcoal-soft)]/70 leading-relaxed pt-1">
            Your review is reviewed by KK before it appears publicly. We never
            display your email address.
          </p>
        </form>
      )}
    </div>
  );
}
