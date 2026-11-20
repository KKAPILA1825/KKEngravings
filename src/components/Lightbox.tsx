import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Photo } from "../types";

type Props = {
  photos: readonly Photo[];
  startIndex: number;
  onClose: () => void;
};

export function Lightbox({ photos, startIndex, onClose }: Props) {
  const [index, setIndex] = useState(startIndex);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const touchStartX = useRef<number | null>(null);

  const total = photos.length;
  const photo = photos[index];

  const prev = () => setIndex((i) => (i - 1 + total) % total);
  const next = () => setIndex((i) => (i + 1) % total);

  // Lock body scroll + remember the trigger's focus
  useEffect(() => {
    previousFocus.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      previousFocus.current?.focus?.();
    };
  }, []);

  // Keyboard: Esc close, arrows navigate, basic focus trap (Tab stays inside)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); return; }
      if (e.key === "ArrowLeft") { e.preventDefault(); prev(); return; }
      if (e.key === "ArrowRight") { e.preventDefault(); next(); return; }
      if (e.key === "Tab") {
        // Keep focus inside the dialog
        const root = dialogRef.current;
        if (!root) return;
        const focusables = root.querySelectorAll<HTMLElement>(
          'button, [href], [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) { e.preventDefault(); return; }
        const first = focusables[0]!;
        const last = focusables[focusables.length - 1]!;
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  if (!photo) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${index + 1} of ${total}: ${photo.title}`}
      tabIndex={-1}
      className="fixed inset-0 z-50 bg-[rgba(20,18,15,0.94)] backdrop-blur-sm flex flex-col"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onTouchStart={(e) => { touchStartX.current = e.touches[0]?.clientX ?? null; }}
      onTouchEnd={(e) => {
        const start = touchStartX.current;
        const end = e.changedTouches[0]?.clientX;
        if (start == null || end == null) return;
        const dx = end - start;
        if (Math.abs(dx) > 50) (dx > 0 ? prev : next)();
        touchStartX.current = null;
      }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 px-4 sm:px-6 h-14 text-[var(--color-ivory)]">
        <p className="text-xs sm:text-sm tabular-nums opacity-75">
          {index + 1} / {total}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close lightbox"
          className="inline-flex items-center justify-center size-10 rounded-full hover:bg-white/10 transition-colors"
        >
          <X size={22} />
        </button>
      </div>

      {/* Stage */}
      <div className="relative flex-1 flex items-center justify-center px-2 sm:px-6 overflow-hidden">
        <button
          type="button"
          onClick={prev}
          aria-label="Previous photo"
          className="absolute left-2 sm:left-5 top-1/2 -translate-y-1/2 size-11 sm:size-12 inline-flex items-center justify-center rounded-full bg-[rgba(247,241,231,0.08)] hover:bg-[rgba(247,241,231,0.18)] text-[var(--color-ivory)] transition-colors"
        >
          <ChevronLeft size={24} />
        </button>

        <img
          key={photo.slug}
          src={photo.full}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          className="max-h-full max-w-full object-contain rounded-md shadow-2xl animate-[fadeIn_200ms_ease-out]"
        />

        <button
          type="button"
          onClick={next}
          aria-label="Next photo"
          className="absolute right-2 sm:right-5 top-1/2 -translate-y-1/2 size-11 sm:size-12 inline-flex items-center justify-center rounded-full bg-[rgba(247,241,231,0.08)] hover:bg-[rgba(247,241,231,0.18)] text-[var(--color-ivory)] transition-colors"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Caption */}
      <div className="px-5 sm:px-10 py-4 sm:py-5 text-[var(--color-ivory)] max-w-3xl mx-auto w-full">
        <p className="text-base sm:text-lg font-serif">{photo.title}</p>
        <p className="mt-1 text-xs sm:text-sm text-[var(--color-gold-soft)] uppercase tracking-[0.2em]">
          {photo.category}
        </p>
      </div>

      <style>{`@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }`}</style>
    </div>
  );
}
