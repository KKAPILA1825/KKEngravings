import { useEffect, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import type { Photo } from "../types";
import { MAX_PICKS, togglePick, usePicks } from "../lib/gallery-picks";

type Props = {
  photos: readonly Photo[];
  startIndex: number;
  onClose: () => void;
};

export function Lightbox({ photos, startIndex, onClose }: Props) {
  const [index, setIndex] = useState(startIndex);
  const [limitHint, setLimitHint] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const touchStartX = useRef<number | null>(null);
  const picks = usePicks();

  const total = photos.length;
  const photo = photos[index];
  const isPicked = photo ? picks.includes(photo.slug) : false;
  const atLimit = picks.length >= MAX_PICKS;

  const onToggle = () => {
    if (!photo) return;
    const { atLimit: hitLimit } = togglePick(photo.slug);
    if (hitLimit) {
      setLimitHint(true);
      window.setTimeout(() => setLimitHint(false), 2500);
    }
  };

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
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 h-14 text-[var(--color-ivory)]">
        <p className="text-xs sm:text-sm tabular-nums opacity-75">
          {index + 1} / {total}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggle}
            disabled={!isPicked && atLimit}
            aria-pressed={isPicked}
            className={`inline-flex items-center gap-1.5 px-3 sm:px-4 h-9 rounded-full text-xs sm:text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isPicked
                ? "bg-[var(--color-gold)]/90 text-[var(--color-walnut-dark)] hover:bg-[var(--color-gold)]"
                : "bg-white/10 text-[var(--color-ivory)] hover:bg-white/20"
            }`}
          >
            {isPicked ? <Check size={16} /> : <Plus size={16} />}
            <span>{isPicked ? "Added — remove" : "Add to request"}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close lightbox"
            className="inline-flex items-center justify-center size-10 rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={22} />
          </button>
        </div>
      </div>
      {limitHint && (
        <div
          role="status"
          className="mx-4 sm:mx-6 -mt-2 mb-2 px-3 py-2 rounded-md bg-red-500/20 text-red-100 text-xs"
        >
          You can select up to {MAX_PICKS} photos in one request.
        </div>
      )}

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
