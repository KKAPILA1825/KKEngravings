import { Section } from "./Section";
import { site } from "../data/site.config";

export function About() {
  return (
    <Section id="about" eyebrow="About the Creator" title={`A young hand, a steady craft.`} tone="ivory">
      <div className="grid md:grid-cols-[1.4fr_1fr] gap-10 items-start">
        <div className="space-y-5 text-[1.075rem] sm:text-[1.15rem] leading-[1.75] text-[var(--color-charcoal-soft)]">
          {site.biography.map((para, i) => (
            <p key={i} className={i === 0 ? "first-letter:font-serif first-letter:text-[2.5em] first-letter:leading-[0.9] first-letter:float-left first-letter:mr-2 first-letter:mt-1 first-letter:text-[var(--color-walnut)]" : ""}>
              {para}
            </p>
          ))}
          <p className="pt-2 text-sm text-[var(--color-charcoal-soft)]/80">
            — {site.creator}
          </p>
        </div>

        {/* Wood-grain quote card (no portrait — minor privacy) */}
        <aside
          className="relative overflow-hidden rounded-2xl p-7 sm:p-9 shadow-[var(--shadow-soft)]"
          style={{
            background:
              "linear-gradient(135deg, var(--color-walnut) 0%, var(--color-walnut-dark) 100%)",
          }}
        >
          <div
            aria-hidden
            className="absolute inset-0 opacity-20 mix-blend-overlay"
            style={{
              backgroundImage:
                "repeating-linear-gradient(115deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 7px), repeating-linear-gradient(90deg, rgba(0,0,0,0.05) 0 1px, transparent 1px 15px)",
            }}
          />
          <p className="relative font-serif text-[var(--color-ivory)] text-xl sm:text-2xl leading-snug">
            “Every piece begins as a simple idea — and ends as something worth keeping.”
          </p>
          <p className="relative mt-5 text-xs uppercase tracking-[0.25em] text-[var(--color-gold-soft)]">
            The workshop promise
          </p>
        </aside>
      </div>
    </Section>
  );
}
