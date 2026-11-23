import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode, FormEvent } from "react";
import { AlertTriangle, ArrowLeft, Check, Mail, RefreshCw, X } from "lucide-react";
import { site } from "../../../data/site.config";
import { photos } from "../../../data/photos";
import type { Photo } from "../../../types";
import { clearPicks, getPicks, removePick, togglePick, usePicks } from "../../../lib/gallery-picks";
import { ReviewPromptDialog } from "../../reviews/components";
import { navigate, leaveOrders } from "../router";

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-[var(--color-walnut-dark)] mb-1.5">
        {label}
      </span>
      {children}
      {hint && (
        <span className="block mt-1 text-xs text-[var(--color-charcoal-soft)]/70">{hint}</span>
      )}
    </label>
  );
}

const inputCls =
  "w-full rounded-lg bg-[var(--color-ivory)] border border-[color-mix(in_oklab,var(--color-walnut)_20%,transparent)] px-3.5 py-2.5 text-[15px] placeholder:text-[var(--color-charcoal-soft)]/50 focus:border-[var(--color-walnut)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/50 transition-colors";

type SendState = "idle" | "sending" | "success" | "mailto-opened" | "error";

function buildReferencesBlock(refs: Photo[]): string {
  if (refs.length === 0) return "";
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const lines = [`References (${refs.length}):`];
  refs.forEach((p, i) => {
    lines.push(`${i + 1}. ${p.title}`);
    lines.push(`   ${origin}${p.full}`);
  });
  lines.push("");
  return lines.join("\n");
}

function buildMailtoHref(
  name: string,
  email: string,
  occasion: string,
  idea: string,
  refs: Photo[],
): string {
  const subject = `KK Engravings custom request from ${name || "a new customer"}`;
  const referencesBlock = buildReferencesBlock(refs);
  const body = `Name: ${name}\nEmail: ${email}\nOccasion / date: ${occasion || "Not specified"}\n\n${referencesBlock}What I'd like:\n${idea}\n\nSent from the KK Engravings website.`;
  return `mailto:${site.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function readRefsFromHash(): string[] {
  if (typeof window === "undefined") return [];
  const q = window.location.hash.split("?")[1];
  if (!q) return [];
  const sp = new URLSearchParams(q);
  const raw = sp.get("refs");
  if (!raw) return [];
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

export function CustomRequestPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [idea, setIdea] = useState("");
  const [occasion, setOccasion] = useState("");
  const [state, setState] = useState<SendState>("idle");
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [showReviewPrompt, setShowReviewPrompt] = useState(false);

  // When the submission succeeds, open the review prompt after a short beat
  // so the success screen lands first and the dialog feels like a follow-up.
  useEffect(() => {
    if (state !== "success") {
      setShowReviewPrompt(false);
      return;
    }
    const t = window.setTimeout(() => setShowReviewPrompt(true), 900);
    return () => window.clearTimeout(t);
  }, [state]);

  // On first mount, merge any ?refs=slug1,slug2 from the URL into the shared
  // picks store. Unknown slugs silently dropped. Dedup preserved.
  useEffect(() => {
    const urlRefs = readRefsFromHash();
    if (urlRefs.length === 0) return;
    const valid = urlRefs.filter((slug) => photos.some((p) => p.slug === slug));
    const existing = new Set(getPicks());
    valid.forEach((slug) => {
      if (!existing.has(slug)) togglePick(slug);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // One idempotency key per Custom Request mount — server dedups retries
  // silently so double-clicks or Try-again never create a second row.
  const idempotencyKeyRef = useRef<string>("");
  if (idempotencyKeyRef.current === "") {
    idempotencyKeyRef.current =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `cus_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  }

  const picks = usePicks();
  const resolvedRefs = useMemo<Photo[]>(
    () =>
      picks
        .map((slug) => photos.find((p) => p.slug === slug))
        .filter((p): p is Photo => Boolean(p)),
    [picks],
  );

  const canSend = site.contact.email.trim().length > 0;

  const resetForm = () => {
    setName("");
    setEmail("");
    setIdea("");
    setOccasion("");
    clearPicks();
  };

  const submitToAppsScript = async (): Promise<void> => {
    const endpoint = (
      (import.meta.env?.VITE_REVIEWS_ENDPOINT as string | undefined) ?? ""
    ).trim();
    if (!endpoint) throw new Error("missing-endpoint");
    const references = resolvedRefs.map((p) => ({
      title: p.title,
      imageFull:
        typeof window !== "undefined"
          ? `${window.location.origin}${p.full}`
          : p.full,
    }));
    const payload = {
      idempotencyKey: idempotencyKeyRef.current,
      fullName: name,
      email,
      occasion,
      idea,
      references,
    };
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ type: "custom", payload }),
    });
    if (!res.ok) throw new Error(`Submission failed (${res.status})`);
    const data = (await res.json()) as {
      ok: boolean;
      id?: string;
      reason?: string;
      details?: string[];
    };
    if (!data.ok) {
      const detail =
        data.details && data.details.length > 0
          ? ` (${data.details.join(", ")})`
          : "";
      throw new Error((data.reason || "submit-failed") + detail);
    }
  };

  // Netlify Forms submission is disabled while hosting on AWS Amplify.
  // Kept as a commented reference for a future return to Netlify or a
  // one-line swap to an Apps Script endpoint.
  // const submitToNetlify = async (): Promise<void> => {
  //   const referencesBlock = buildReferencesBlock(resolvedRefs);
  //   const ideaWithRefs = referencesBlock ? `${referencesBlock}${idea}` : idea;
  //   const params = new URLSearchParams();
  //   params.set("form-name", "kk-engravings-custom");
  //   params.set("bot-field", "");
  //   params.set("customer_name", name);
  //   params.set("email", email);
  //   params.set("occasion", occasion);
  //   params.set("idea", ideaWithRefs);
  //   const res = await fetch("/", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/x-www-form-urlencoded" },
  //     body: params.toString(),
  //   });
  //   if (!res.ok) throw new Error(`Submission failed (${res.status})`);
  // };

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    idea?: string;
  }>({});

  const validate = (): typeof fieldErrors => {
    const errs: typeof fieldErrors = {};
    if (!name.trim()) errs.name = "Your name is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      errs.email = "Enter a valid email.";
    if (idea.trim().length < 10)
      errs.idea = `Please write at least 10 characters so KK understands your request.`;
    return errs;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSend || state === "sending") return;
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setState("sending");
    setErrorDetail(null);
    try {
      await submitToAppsScript();
      setState("success");
      resetForm();
    } catch (err) {
      console.warn("[KK Custom] Apps Script submission failed:", err);
      setErrorDetail(
        err instanceof Error ? err.message : "Could not reach our server.",
      );
      setState("error");
    }
  };

  const openMailtoLastResort = () => {
    window.location.href = buildMailtoHref(name, email, occasion, idea, resolvedRefs);
    clearPicks();
    setState("mailto-opened");
  };

  const sendAnother = () => {
    setState("idle");
    setErrorDetail(null);
  };

  return (
    <div className="mx-auto max-w-4xl px-5 sm:px-8 pt-24 sm:pt-28 pb-16">
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate("home")}
          className="inline-flex items-center gap-2 text-sm text-[var(--color-walnut-dark)] hover:text-[var(--color-walnut)]"
        >
          <ArrowLeft size={16} /> Back to shop
        </button>
      </div>

      <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-walnut)]/80">
        Shop · Custom Requests
      </p>
      <h1 className="mt-1 font-serif text-3xl sm:text-4xl text-[var(--color-walnut-dark)]">
        Can't find what you want? Tell me about it.
      </h1>
      <p className="mt-3 max-w-2xl text-[var(--color-charcoal-soft)]">
        From monogrammed coasters to personalized name puzzles — describe the piece you're
        imagining and KK will be in touch with next steps, timeline, and a quote.
      </p>

      {state === "success" ? (
        <div className="mt-8 bg-[var(--color-ivory-soft)] rounded-2xl p-8 shadow-[var(--shadow-soft)] text-center">
          <div className="mx-auto mb-4 grid place-items-center size-14 rounded-full bg-[var(--color-gold)]/40">
            <Check size={28} className="text-[var(--color-walnut-dark)]" />
          </div>
          <h2 className="font-serif text-2xl text-[var(--color-walnut-dark)]">
            Thanks — your request is on its way.
          </h2>
          <p className="mt-3 text-[var(--color-charcoal-soft)]">
            KK Engravings will get back to you by email with next steps, timeline, and a quote.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate("home")}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--color-walnut-dark)] text-[var(--color-ivory)] text-sm hover:bg-[var(--color-walnut)]"
            >
              Continue shopping
            </button>
            <button
              type="button"
              onClick={sendAnother}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-[var(--color-walnut)]/30 text-sm text-[var(--color-walnut-dark)] hover:bg-[var(--color-ivory-soft)]"
            >
              Send another request
            </button>
            <button
              type="button"
              onClick={() => leaveOrders("#home")}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-[var(--color-walnut)]/30 text-sm text-[var(--color-walnut-dark)] hover:bg-[var(--color-ivory-soft)]"
            >
              Back to home
            </button>
          </div>
        </div>
      ) : state === "mailto-opened" ? (
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-2xl p-8 shadow-[var(--shadow-soft)] text-center">
          <div className="mx-auto mb-4 grid place-items-center size-14 rounded-full bg-amber-200/60">
            <Mail size={28} className="text-amber-900" />
          </div>
          <h2 className="font-serif text-2xl text-amber-900">We've opened your email app.</h2>
          <p className="mt-3 text-amber-900">
            Your details are pre-filled in a draft email.{" "}
            <strong>Please press Send</strong> inside your email app to deliver it to KK
            Engravings.
          </p>
          <p className="mt-2 text-sm text-amber-900/80">
            We can't confirm delivery from here — the request only reaches KK once you press
            Send in your mail app.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate("home")}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--color-walnut-dark)] text-[var(--color-ivory)] text-sm hover:bg-[var(--color-walnut)]"
            >
              Continue shopping
            </button>
            <button
              type="button"
              onClick={sendAnother}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-[var(--color-walnut)]/30 text-sm text-[var(--color-walnut-dark)] hover:bg-[var(--color-ivory-soft)]"
            >
              Send another request
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mt-8 bg-[var(--color-ivory-soft)] rounded-2xl p-6 sm:p-8 shadow-[var(--shadow-soft)] space-y-4"
          noValidate
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Your name">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name)
                    setFieldErrors((prev) => ({ ...prev, name: undefined }));
                }}
                autoComplete="name"
                className={`${inputCls} ${
                  fieldErrors.name
                    ? "border-red-400 focus:border-red-500 focus:ring-red-300/50"
                    : ""
                }`}
                aria-invalid={!!fieldErrors.name}
              />
              {fieldErrors.name && (
                <span role="alert" className="block mt-1 text-xs text-red-700">
                  {fieldErrors.name}
                </span>
              )}
            </Field>
            <Field label="Email">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email)
                    setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }}
                autoComplete="email"
                className={`${inputCls} ${
                  fieldErrors.email
                    ? "border-red-400 focus:border-red-500 focus:ring-red-300/50"
                    : ""
                }`}
                aria-invalid={!!fieldErrors.email}
              />
              {fieldErrors.email && (
                <span role="alert" className="block mt-1 text-xs text-red-700">
                  {fieldErrors.email}
                </span>
              )}
            </Field>
          </div>
          {resolvedRefs.length > 0 && (
            <div>
              <span className="block text-sm font-medium text-[var(--color-walnut-dark)] mb-2">
                Gallery references ({resolvedRefs.length})
              </span>
              <ul className="flex flex-wrap gap-2">
                {resolvedRefs.map((p) => (
                  <li
                    key={p.slug}
                    className="inline-flex items-center gap-2 pl-1.5 pr-1 py-1 rounded-full bg-[var(--color-ivory)] border border-[color-mix(in_oklab,var(--color-walnut)_25%,transparent)] text-sm text-[var(--color-walnut-dark)]"
                  >
                    <img
                      src={p.thumb}
                      alt=""
                      width={32}
                      height={32}
                      className="size-7 rounded-full object-cover"
                      loading="lazy"
                      aria-hidden
                    />
                    <span className="max-w-[16rem] truncate">{p.title}</span>
                    <button
                      type="button"
                      aria-label={`Remove ${p.title}`}
                      onClick={() => removePick(p.slug)}
                      className="inline-flex items-center justify-center size-6 rounded-full text-[var(--color-charcoal-soft)] hover:bg-[var(--color-ivory-soft)] hover:text-red-700"
                    >
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
              <span className="block mt-2 text-xs text-[var(--color-charcoal-soft)]/70">
                These photos are attached to your request as inspiration references.
              </span>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-[var(--color-walnut-dark)]">
                What would you like?
              </span>
              <span className="text-xs text-[var(--color-charcoal-soft)]/70 tabular-nums">
                {idea.trim().length} / 10 min
              </span>
            </div>
            <textarea
              required
              minLength={10}
              value={idea}
              onChange={(e) => {
                setIdea(e.target.value);
                if (fieldErrors.idea) {
                  setFieldErrors((prev) => ({ ...prev, idea: undefined }));
                }
              }}
              rows={6}
              placeholder="A short sketch of your idea: names, materials, size, mood."
              className={`${inputCls} resize-y min-h-28 ${
                fieldErrors.idea
                  ? "border-red-400 focus:border-red-500 focus:ring-red-300/50"
                  : ""
              }`}
              aria-invalid={!!fieldErrors.idea}
            />
            {fieldErrors.idea ? (
              <span
                role="alert"
                className="block mt-1 text-xs text-red-700"
              >
                {fieldErrors.idea}
              </span>
            ) : (
              <span className="block mt-1 text-xs text-[var(--color-charcoal-soft)]/70">
                A short sketch of the idea: names, materials, size, mood.
              </span>
            )}
          </div>
          <Field label="Occasion or needed-by date (optional)">
            <input
              type="text"
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              placeholder="e.g. Diwali gift, needed by Dec 10"
              className={inputCls}
            />
          </Field>

          {state === "error" && (
            <div
              role="alert"
              className="rounded-xl bg-red-50 border-2 border-red-300 p-4 space-y-3"
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className="shrink-0 text-red-700" size={20} />
                <div className="text-sm text-red-800">
                  <p className="font-medium text-red-900">Your request was not sent.</p>
                  <p className="mt-1">
                    Something went wrong reaching our server — no email has gone out yet.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-700 text-white text-sm font-medium hover:bg-red-800"
                >
                  <RefreshCw size={14} /> Try again
                </button>
                <button
                  type="button"
                  onClick={openMailtoLastResort}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 border-red-700 text-red-800 text-sm font-medium hover:bg-red-100"
                >
                  <Mail size={14} /> Email directly instead
                </button>
              </div>
              {errorDetail && (
                <p className="text-xs text-red-800/70">Technical details: {errorDetail}</p>
              )}
            </div>
          )}

          <div className="pt-2">
            {!canSend ? (
              <div>
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  className="inline-flex items-center gap-2 bg-[color-mix(in_oklab,var(--color-walnut)_25%,transparent)] text-[var(--color-ivory)] px-6 py-3 rounded-full text-sm font-medium tracking-wide cursor-not-allowed"
                >
                  <Mail size={16} /> Send request
                </button>
                <p className="mt-3 text-xs text-[var(--color-charcoal-soft)] italic">
                  Contact details coming soon. Check back shortly.
                </p>
              </div>
            ) : (
              state !== "error" && (
                <button
                  type="submit"
                  disabled={state === "sending"}
                  className="inline-flex items-center gap-2 bg-[var(--color-walnut)] hover:bg-[var(--color-walnut-dark)] text-[var(--color-ivory)] px-6 py-3 rounded-full text-sm font-medium tracking-wide transition-colors shadow-[0_8px_24px_-12px_rgba(107,68,35,0.5)] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Mail size={16} />
                  {state === "sending" ? "Sending…" : "Send request"}
                </button>
              )
            )}
          </div>

          <p className="text-[11px] text-[var(--color-charcoal-soft)]/70 leading-relaxed pt-2">
            Your request is delivered directly to KK Engravings. We'll get back to you by email.
          </p>
        </form>
      )}

      <ReviewPromptDialog
        open={showReviewPrompt}
        onClose={() => setShowReviewPrompt(false)}
      />
    </div>
  );
}
