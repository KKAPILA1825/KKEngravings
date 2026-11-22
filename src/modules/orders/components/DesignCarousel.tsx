import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Design } from "../types";

type Props = {
  designs: readonly Design[];
  activeId: string;
  onChange: (designId: string) => void;
};

export function DesignCarousel({ designs, activeId, onChange }: Props) {
  const activeIndex = Math.max(
    0,
    designs.findIndex((d) => d.id === activeId),
  );
  const design = designs[activeIndex] ?? designs[0];
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const liveRegionRef = useRef<HTMLDivElement>(null);

  const multi = designs.length > 1;

  const goTo = (i: number) => {
    const clamped = ((i % designs.length) + designs.length) % designs.length;
    onChange(designs[clamped].id);
  };
  const prev = () => goTo(activeIndex - 1);
  const next = () => goTo(activeIndex + 1);

  useEffect(() => {
    if (liveRegionRef.current && design) {
      liveRegionRef.current.textContent = `${design.title}, ${activeIndex + 1} of ${designs.length}`;
    }
  }, [design, activeIndex, designs.length]);

  if (!design) {
    return (
      <div className="aspect-[4/3] grid place-items-center rounded-2xl bg-[var(--color-ivory-soft)] text-[var(--color-charcoal-soft)] text-sm">
        No designs available in this category yet.
      </div>
    );
  }

  const onTouchStart = (e: React.TouchEvent) => setTouchStartX(e.touches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40 && multi) {
      if (dx < 0) next();
      else prev();
    }
    setTouchStartX(null);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!multi) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    }
  };

  return (
    <div className="relative">
      <div
        role="group"
        aria-label={`${design.categoryLabel} designs carousel`}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="relative overflow-hidden rounded-2xl bg-[var(--color-ivory-soft)] shadow-[var(--shadow-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/60"
      >
        <img
          key={design.id}
          src={design.imageFull}
          alt={design.alt}
          width={design.width}
          height={design.height}
          loading="eager"
          decoding="async"
          className="block w-full h-auto max-h-[70vh] object-contain bg-[var(--color-ivory)]"
        />
        {multi && (
          <>
            <button
              type="button"
              aria-label="Previous design"
              onClick={prev}
              className="hidden md:grid place-items-center absolute top-1/2 -translate-y-1/2 left-3 size-11 rounded-full bg-[var(--color-ivory)]/95 text-[var(--color-walnut-dark)] shadow-md hover:bg-[var(--color-ivory)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              aria-label="Next design"
              onClick={next}
              className="hidden md:grid place-items-center absolute top-1/2 -translate-y-1/2 right-3 size-11 rounded-full bg-[var(--color-ivory)]/95 text-[var(--color-walnut-dark)] shadow-md hover:bg-[var(--color-ivory)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}
      </div>

      <div ref={liveRegionRef} className="sr-only" aria-live="polite" />

      {multi && (
        <div
          className="flex flex-wrap justify-center gap-2 mt-4"
          role="group"
          aria-label="Choose design"
        >
          {designs.map((d, i) => {
            const active = i === activeIndex;
            return (
              <button
                key={d.id}
                type="button"
                aria-pressed={active}
                aria-label={`Show design ${i + 1} of ${designs.length}: ${d.title}`}
                onClick={() => goTo(i)}
                className={`h-2.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] ${
                  active
                    ? "w-6 bg-[var(--color-walnut-dark)]"
                    : "w-2.5 bg-[var(--color-walnut)]/30 hover:bg-[var(--color-walnut)]/60"
                }`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
