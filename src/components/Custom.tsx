import { useState } from "react";
import type { ReactNode, FormEvent } from "react";
import { Mail } from "lucide-react";
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

export function Custom() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [idea, setIdea] = useState("");
  const [occasion, setOccasion] = useState("");

  const canSend = site.contact.email.trim().length > 0;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSend) return;
    const subject = encodeURIComponent(`KK Engravings custom request from ${name || "a new customer"}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nOccasion / date: ${occasion || "Not specified"}\n\nWhat I'd like:\n${idea}\n\nSent from the KK Engravings website.`,
    );
    window.location.href = `mailto:${site.contact.email}?subject=${subject}&body=${body}`;
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

          <div className="pt-2">
            {canSend ? (
              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-[var(--color-walnut)] hover:bg-[var(--color-walnut-dark)] text-[var(--color-ivory)] px-6 py-3 rounded-full text-sm font-medium tracking-wide transition-colors shadow-[0_8px_24px_-12px_rgba(107,68,35,0.5)]"
              >
                <Mail size={16} />
                Send request
              </button>
            ) : (
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
            )}
          </div>

          <p className="text-[11px] text-[var(--color-charcoal-soft)]/70 leading-relaxed pt-2">
            Submitting opens your email client with the details pre-filled. Nothing is sent from this site directly.
          </p>
        </form>
      </div>
    </Section>
  );
}
