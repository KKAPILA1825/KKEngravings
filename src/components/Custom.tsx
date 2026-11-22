import { useState } from "react";
import type { ReactNode, FormEvent } from "react";
import { AlertTriangle, Check, Mail, RefreshCw } from "lucide-react";
import { Section } from "./Section";
import { site } from "../data/site.config";

// NOTE: Field is defined at module scope on purpose. Defining it inside
// the Custom function would re-create the component on every render, causing
// React to unmount/remount the <input>s inside and lose focus after each keystroke.
function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-[var(--color-walnut-dark)] mb-1.5">{label}</span>
      {children}
      {hint && <span className="block mt-1 text-xs text-[var(--color-charcoal-soft)]/70">{hint}</span>}
    </label>
  );
}

const inputCls =
  "w-full rounded-lg bg-[var(--color-ivory)] border border-[color-mix(in_oklab,var(--color-walnut)_20%,transparent)] px-3.5 py-2.5 text-[15px] placeholder:text-[var(--color-charcoal-soft)]/50 focus:border-[var(--color-walnut)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/50 transition-colors";

type SendState = "idle" | "sending" | "success" | "mailto-opened" | "error";

function buildMailtoHref(name: string, email: string, occasion: string, idea: string): string {
  const subject = `KK Engravings custom request from ${name || "a new customer"}`;
  const body = `Name: ${name}\nEmail: ${email}\nOccasion / date: ${occasion || "Not specified"}\n\nWhat I'd like:\n${idea}\n\nSent from the KK Engravings website.`;
  return `mailto:${site.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function Custom() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [idea, setIdea] = useState("");
  const [occasion, setOccasion] = useState("");
  const [state, setState] = useState<SendState>("idle");
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  const canSend = site.contact.email.trim().length > 0;

  const resetForm = () => {
    setName("");
    setEmail("");
    setIdea("");
    setOccasion("");
  };

  const submitToNetlify = async (): Promise<void> => {
    const params = new URLSearchParams();
    params.set("form-name", "kk-engravings-custom");
    params.set("bot-field", "");
    params.set("customer_name", name);
    params.set("email", email);
    params.set("occasion", occasion);
    params.set("idea", idea);
    const res = await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    if (!res.ok) throw new Error(`Submission failed (${res.status})`);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSend || state === "sending") return;
    setState("sending");
    setErrorDetail(null);
    try {
      await submitToNetlify();
      setState("success");
      resetForm();
    } catch (err) {
      console.warn("[KK Custom] Netlify submission failed:", err);
      setErrorDetail(err instanceof Error ? err.message : "Could not reach our server.");
      setState("error");
    }
  };

  const openMailtoLastResort = () => {
    window.location.href = buildMailtoHref(name, email, occasion, idea);
    setState("mailto-opened");
  };

  const sendAnother = () => {
    setState("idle");
    setErrorDetail(null);
  };

  return (
    <Section id="custom" eyebrow="Custom Requests" title="Have an idea? Let’s make it." tone="ivory-deep">
      <div className="grid md:grid-cols-[1fr_1.1fr] gap-10 lg:gap-14 items-start">
        <div className="max-w-md space-y-5 text-[var(--color-charcoal-soft)]">
          <p className="text-[1.05rem] leading-relaxed">
            From monogrammed coasters to personalized name puzzles, tell me about the piece you’re imagining and I’ll be in touch with next steps, timelines, and a quote.
          </p>
          <ul className="space-y-2.5 text-sm">
            <li className="flex items-start gap-2">
              <span className="mt-2 size-1 rounded-full bg-[var(--color-walnut)]" />
              <span>Great for birthdays, weddings, housewarming, and holiday gifts.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-2 size-1 rounded-full bg-[var(--color-walnut)]" />
              <span>Materials vary by design: wood, slate, acrylic, and leather.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-2 size-1 rounded-full bg-[var(--color-walnut)]" />
              <span>Each request is reviewed personally before anything is confirmed.</span>
            </li>
          </ul>
        </div>

        {state === "success" ? (
          <div className="bg-[var(--color-ivory-soft)] rounded-2xl p-8 shadow-[var(--shadow-soft)] text-center">
            <div className="mx-auto mb-4 grid place-items-center size-14 rounded-full bg-[var(--color-gold)]/40">
              <Check size={28} className="text-[var(--color-walnut-dark)]" />
            </div>
            <h3 className="font-serif text-2xl text-[var(--color-walnut-dark)]">
              Thanks — your request is on its way.
            </h3>
            <p className="mt-3 text-[var(--color-charcoal-soft)]">
              KK Engravings will get back to you by email with next steps, timeline, and a quote.
            </p>
            <button
              type="button"
              onClick={sendAnother}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--color-walnut-dark)] text-[var(--color-ivory)] text-sm hover:bg-[var(--color-walnut)]"
            >
              Send another request
            </button>
          </div>
        ) : state === "mailto-opened" ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 shadow-[var(--shadow-soft)] text-center">
            <div className="mx-auto mb-4 grid place-items-center size-14 rounded-full bg-amber-200/60">
              <Mail size={28} className="text-amber-900" />
            </div>
            <h3 className="font-serif text-2xl text-amber-900">
              We've opened your email app.
            </h3>
            <p className="mt-3 text-amber-900">
              Your details are pre-filled in a draft email. <strong>Please press Send</strong> inside
              your email app to deliver it to KK Engravings.
            </p>
            <p className="mt-2 text-sm text-amber-900/80">
              We can't confirm delivery from here — the request only reaches KK once you press
              Send in your mail app.
            </p>
            <button
              type="button"
              onClick={sendAnother}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[var(--color-walnut)]/30 text-sm text-[var(--color-walnut-dark)] hover:bg-[var(--color-ivory-soft)]"
            >
              Send another request
            </button>
          </div>
        ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-[var(--color-ivory-soft)] rounded-2xl p-6 sm:p-8 shadow-[var(--shadow-soft)] space-y-4"
          noValidate
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Your name">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                className={inputCls}
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className={inputCls}
              />
            </Field>
          </div>
          <Field label="What would you like?" hint="A short sketch of the idea: names, materials, size, mood.">
            <textarea
              required
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              rows={5}
              className={`${inputCls} resize-y min-h-28`}
            />
          </Field>
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
                  <Mail size={16} />
                  Send request
                </button>
                <p className="mt-3 text-xs text-[var(--color-charcoal-soft)] italic">
                  Contact details coming soon. Check back shortly.
                </p>
              </div>
            ) : state !== "error" ? (
              <button
                type="submit"
                disabled={state === "sending"}
                className="inline-flex items-center gap-2 bg-[var(--color-walnut)] hover:bg-[var(--color-walnut-dark)] text-[var(--color-ivory)] px-6 py-3 rounded-full text-sm font-medium tracking-wide transition-colors shadow-[0_8px_24px_-12px_rgba(107,68,35,0.5)] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Mail size={16} />
                {state === "sending" ? "Sending…" : "Send request"}
              </button>
            ) : null}
          </div>

          <p className="text-[11px] text-[var(--color-charcoal-soft)]/70 leading-relaxed pt-2">
            Your request is delivered directly to KK Engravings. We'll get back to you by email.
          </p>
        </form>
        )}
      </div>
    </Section>
  );
}
