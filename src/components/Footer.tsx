import { site } from "../data/site.config";

const LINKS = [
  { href: "#home", label: "Home" },
  { href: "#/orders", label: "Shop" },
  { href: "#about", label: "About" },
  { href: "#gallery", label: "Gallery" },
  { href: "#/reviews", label: "Reviews" },
  { href: "#contact", label: "Contact" },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-[var(--color-charcoal)] text-[var(--color-ivory)]/85">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-14 grid gap-8 sm:grid-cols-[1.4fr_1fr] items-start">
        <div>
          <p className="font-serif text-2xl text-[var(--color-ivory)]">{site.name}</p>
          <p className="mt-2 italic text-[var(--color-gold-soft)] font-serif text-base">
            {site.tagline}
          </p>
          <p className="mt-6 text-sm text-[var(--color-ivory)]/60 max-w-md">
            A small workshop for personalized engravings, wooden gifts, and handcrafted keepsakes.
          </p>
        </div>

        <nav aria-label="Footer">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-gold-soft)] mb-4">Explore</p>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="text-[var(--color-ivory)]/80 hover:text-[var(--color-ivory)] transition-colors"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-5 text-xs text-[var(--color-ivory)]/55 flex flex-wrap items-center justify-between gap-2">
          <p>© {year} {site.name}. Handmade with care.</p>
          <p>by {site.creator}</p>
        </div>
      </div>
    </footer>
  );
}
