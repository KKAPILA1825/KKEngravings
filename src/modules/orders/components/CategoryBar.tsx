import { categories } from "../data/categories";
import type { CategoryId } from "../types";

type Props = {
  active: CategoryId;
  counts: Record<string, number>;
  onPick: (id: CategoryId) => void;
};

export function CategoryBar({ active, counts, onPick }: Props) {
  return (
    <div
      role="group"
      aria-label="Product categories"
      className="flex overflow-x-auto gap-2 pb-2 -mx-1 px-1 snap-x snap-mandatory md:flex-wrap md:overflow-visible"
    >
      {categories.map((c) => {
        const isActive = c.id === active;
        const count = counts[c.id] ?? 0;
        return (
          <button
            key={c.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onPick(c.id)}
            disabled={count === 0}
            className={`shrink-0 snap-start px-4 py-2 rounded-full text-sm transition-colors border whitespace-nowrap ${
              isActive
                ? "bg-[var(--color-walnut)] text-[var(--color-ivory)] border-[var(--color-walnut)]"
                : "bg-transparent text-[var(--color-charcoal-soft)] border-[color-mix(in_oklab,var(--color-walnut)_25%,transparent)] hover:border-[var(--color-walnut)] hover:text-[var(--color-walnut-dark)] disabled:opacity-40 disabled:cursor-not-allowed"
            }`}
          >
            {c.label}
            <span
              className={`ml-2 text-[0.72em] ${
                isActive ? "text-[var(--color-gold-soft)]" : "text-[var(--color-walnut-soft)]"
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
