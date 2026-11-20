import { useMemo, useState } from "react";
import { Section } from "./Section";
import { photos } from "../data/photos";
import type { Photo, PhotoCategory } from "../types";
import { Lightbox } from "./Lightbox";

const ALL = "All" as const;
type Filter = typeof ALL | PhotoCategory;

export function Gallery() {
  const categories: Filter[] = useMemo(() => {
    const set = new Set<PhotoCategory>();
    for (const p of photos) set.add(p.category);
    return [ALL, ...Array.from(set)];
  }, []);

  const [filter, setFilter] = useState<Filter>(ALL);
  const [lightboxAt, setLightboxAt] = useState<number | null>(null);

  const visible = useMemo(
    () => (filter === ALL ? [...photos] : photos.filter((p) => p.category === filter)),
    [filter],
  );

  return (
    <Section id="gallery" eyebrow="Gallery" title="A workshop in photographs." tone="ivory-soft">
      {/* Filter pills */}
      <div
        className="flex flex-wrap gap-2 mb-8 sm:mb-10"
        role="tablist"
        aria-label="Gallery category filter"
      >
        {categories.map((c) => {
          const active = c === filter;
          return (
            <button
              key={c}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => setFilter(c)}
              className={`px-4 py-1.5 rounded-full text-sm transition-colors border ${
                active
                  ? "bg-[var(--color-walnut)] text-[var(--color-ivory)] border-[var(--color-walnut)]"
                  : "bg-transparent text-[var(--color-charcoal-soft)] border-[color-mix(in_oklab,var(--color-walnut)_25%,transparent)] hover:border-[var(--color-walnut)] hover:text-[var(--color-walnut-dark)]"
              }`}
            >
              {c}
              {c !== ALL && (
                <span className={`ml-2 text-[0.72em] ${active ? "text-[var(--color-gold-soft)]" : "text-[var(--color-walnut-soft)]"}`}>
                  {photos.filter((p) => p.category === c).length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Masonry via CSS columns (lightweight, no deps) */}
      <ul
        role="tabpanel"
        className="columns-2 sm:columns-3 lg:columns-4 gap-3 sm:gap-4 [column-fill:_balance]"
      >
        {visible.map((p, idx) => (
          <li key={p.slug} className="mb-3 sm:mb-4 break-inside-avoid">
            <PhotoCard photo={p} onOpen={() => setLightboxAt(idx)} />
          </li>
        ))}
      </ul>

      {lightboxAt !== null && (
        <Lightbox
          photos={visible}
          startIndex={lightboxAt}
          onClose={() => setLightboxAt(null)}
        />
      )}
    </Section>
  );
}

function PhotoCard({ photo, onOpen }: { photo: Photo; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative block w-full overflow-hidden rounded-xl bg-[var(--color-ivory-deep)] shadow-[var(--shadow-soft)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)]"
      aria-label={`Open ${photo.title}`}
    >
      <img
        src={photo.thumb}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        loading="lazy"
        decoding="async"
        className="w-full h-auto block transition-transform duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 p-3 pt-10 bg-gradient-to-t from-[rgba(43,42,40,0.68)] via-[rgba(43,42,40,0.18)] to-transparent opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300"
      >
        <p className="text-[var(--color-ivory)] text-xs sm:text-sm font-medium line-clamp-2">
          {photo.title}
        </p>
        <p className="text-[var(--color-gold-soft)] text-[10px] sm:text-xs uppercase tracking-[0.18em] mt-1">
          {photo.category}
        </p>
      </div>
    </button>
  );
}
