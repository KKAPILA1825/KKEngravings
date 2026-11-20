import { ArrowDown } from "lucide-react";
import { site } from "../data/site.config";
import { photos } from "../data/photos";

// Hero 4-pick, chosen for lighting, variety, and premium feel (see Phase 1 proposal).
const HERO_SLUGS = [
  "pxl-20250210-022033451-mp-2",        // Bear family puzzle - anchor
  "nardo-s-coaster",                     // Marble + walnut hexagon
  "pxl-20241220-202205469-mp-3",        // 9-piece snowflake set
  "img-20250808-wa0004",                 // Kamakshi/Kalyani rounds
];

export function Hero() {
  const picks = HERO_SLUGS
    .map((s) => photos.find((p) => p.slug === s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-[var(--color-ivory-soft)] pt-24 sm:pt-28 pb-16 sm:pb-24"
    >
      {/* soft warm vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(60% 50% at 20% 10%, rgba(201,169,97,0.12), transparent 60%), radial-gradient(50% 45% at 90% 100%, rgba(107,68,35,0.08), transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8 grid md:grid-cols-[1.05fr_1fr] gap-10 md:gap-14 items-center">
        <div className="max-w-xl">
          <p className="reveal is-visible text-xs sm:text-sm uppercase tracking-[0.28em] text-[var(--color-walnut)] font-medium mb-5">
            Handcrafted · Personalized · Made to Order
          </p>
          <h1 className="reveal is-visible text-[clamp(2.75rem,6vw,4.5rem)] leading-[1.02] font-serif tracking-tight text-[var(--color-walnut-dark)]">
            {site.name}
          </h1>
          <p className="reveal is-visible mt-5 text-lg sm:text-xl text-[var(--color-charcoal-soft)] max-w-[32ch] italic font-serif">
            {site.tagline}
          </p>

          <div className="reveal is-visible mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#gallery"
              className="group inline-flex items-center gap-2 bg-[var(--color-walnut)] hover:bg-[var(--color-walnut-dark)] text-[var(--color-ivory)] px-6 py-3 rounded-full text-sm font-medium tracking-wide transition-colors shadow-[0_8px_24px_-12px_rgba(107,68,35,0.5)]"
            >
              Explore Gallery
              <ArrowDown size={16} className="transition-transform duration-300 group-hover:translate-y-0.5" />
            </a>
            <a
              href="#custom"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium tracking-wide text-[var(--color-walnut-dark)] border border-[color-mix(in_oklab,var(--color-walnut)_30%,transparent)] hover:border-[var(--color-walnut)] hover:bg-[var(--color-ivory-deep)] transition-colors"
            >
              Request a Custom Piece
            </a>
          </div>

          <div className="reveal is-visible mt-10 flex items-center gap-3 text-xs sm:text-sm text-[var(--color-charcoal-soft)]">
            <span className="h-px w-8 bg-[color-mix(in_oklab,var(--color-walnut)_40%,transparent)]" />
            A young creator’s workshop · by Kaundinya Kapila
          </div>
        </div>

        {/* Collage */}
        <div className="relative aspect-[4/5] sm:aspect-[5/5] md:aspect-[6/7]">
          <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 gap-3 sm:gap-4">
            {picks[0] && (
              <figure className="col-span-4 row-span-4 rounded-2xl overflow-hidden shadow-[var(--shadow-lift)] animate-float-slow">
                <img
                  src={picks[0].full}
                  alt={picks[0].alt}
                  width={picks[0].width}
                  height={picks[0].height}
                  className="w-full h-full object-cover"
                  fetchPriority="high"
                  decoding="async"
                />
              </figure>
            )}
            {picks[1] && (
              <figure className="col-span-2 row-span-3 col-start-5 row-start-1 rounded-2xl overflow-hidden shadow-[var(--shadow-soft)]">
                <img
                  src={picks[1].thumb}
                  alt={picks[1].alt}
                  width={picks[1].width}
                  height={picks[1].height}
                  className="w-full h-full object-cover"
                  loading="eager"
                  decoding="async"
                />
              </figure>
            )}
            {picks[2] && (
              <figure className="col-span-2 row-span-3 col-start-5 row-start-4 rounded-2xl overflow-hidden shadow-[var(--shadow-soft)]">
                <img
                  src={picks[2].thumb}
                  alt={picks[2].alt}
                  width={picks[2].width}
                  height={picks[2].height}
                  className="w-full h-full object-cover"
                  loading="eager"
                  decoding="async"
                />
              </figure>
            )}
            {picks[3] && (
              <figure className="col-span-3 row-span-2 col-start-1 row-start-5 rounded-2xl overflow-hidden shadow-[var(--shadow-soft)]">
                <img
                  src={picks[3].thumb}
                  alt={picks[3].alt}
                  width={picks[3].width}
                  height={picks[3].height}
                  className="w-full h-full object-cover"
                  loading="eager"
                  decoding="async"
                />
              </figure>
            )}
          </div>
          {/* Gold ribbon accent */}
          <div
            aria-hidden
            className="absolute -z-10 -top-6 -right-6 w-24 h-24 rounded-full bg-[var(--color-gold-soft)]/50 blur-2xl"
          />
        </div>
      </div>
    </section>
  );
}
