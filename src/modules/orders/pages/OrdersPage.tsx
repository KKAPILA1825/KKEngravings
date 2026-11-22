import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { designs } from "../data/designs.generated";
import { categories, categoryById } from "../data/categories";
import type { CategoryId, Design } from "../types";
import { CategoryBar } from "../components/CategoryBar";
import { DesignCarousel } from "../components/DesignCarousel";
import { ProductDetailsPanel } from "../components/ProductDetailsPanel";
import { useCart } from "../cart";
import { navigate, parseDesignParam } from "../router";

const DEFAULT_CATEGORY: CategoryId = "name-plaques";

// Module-level — computed once, stable reference, safe to use as hook deps.
const DESIGNS_BY_CATEGORY: Record<string, Design[]> = (() => {
  const map: Record<string, Design[]> = {};
  for (const c of categories) map[c.id] = designs.filter((d) => d.categoryId === c.id);
  return map;
})();
const COUNTS: Record<string, number> = (() => {
  const m: Record<string, number> = {};
  for (const c of categories) m[c.id] = DESIGNS_BY_CATEGORY[c.id]?.length ?? 0;
  return m;
})();

function initialSelection(): { category: CategoryId; designId: string } {
  const paramId = parseDesignParam(window.location.hash);
  if (paramId) {
    const found = designs.find((d) => d.id === paramId);
    if (found && found.categoryId !== "uncategorized") {
      return { category: found.categoryId as CategoryId, designId: found.id };
    }
  }
  const firstPopulated = categories.find((c) => COUNTS[c.id] > 0)?.id ?? DEFAULT_CATEGORY;
  return {
    category: firstPopulated,
    designId: DESIGNS_BY_CATEGORY[firstPopulated]?.[0]?.id ?? "",
  };
}

export function OrdersPage() {
  const { count } = useCart();
  const [category, setCategory] = useState<CategoryId>(() => initialSelection().category);
  const [designId, setDesignId] = useState<string>(() => initialSelection().designId);

  const currentDesigns = DESIGNS_BY_CATEGORY[category] ?? [];
  const activeDesign = currentDesigns.find((d) => d.id === designId) ?? currentDesigns[0];

  useEffect(() => {
    if (!currentDesigns.find((d) => d.id === designId)) {
      setDesignId(currentDesigns[0]?.id ?? "");
    }
  }, [category, currentDesigns, designId]);

  const catMeta = categoryById(category);

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8 pt-24 sm:pt-28 pb-16">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-walnut)]/80">
            Shop · Custom Orders
          </p>
          <h1 className="mt-1 font-serif text-3xl sm:text-4xl text-[var(--color-walnut-dark)]">
            Pick a design, make it yours.
          </h1>
          {catMeta && (
            <p className="mt-2 text-[var(--color-charcoal-soft)]">{catMeta.tagline}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => navigate("cart")}
          className="relative inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[var(--color-walnut)]/30 text-sm text-[var(--color-walnut-dark)] hover:bg-[var(--color-ivory-soft)]"
        >
          <ShoppingBag size={18} />
          <span className="hidden sm:inline">Cart</span>
          {count > 0 && (
            <span
              aria-label={`${count} ${count === 1 ? "item" : "items"} in cart`}
              className="absolute -top-2 -right-2 min-w-[1.25rem] h-5 px-1 grid place-items-center rounded-full bg-[var(--color-walnut-dark)] text-[var(--color-ivory)] text-[11px] font-medium"
            >
              {count}
            </span>
          )}
        </button>
      </div>

      <CategoryBar active={category} counts={COUNTS} onPick={(id) => setCategory(id)} />

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
        <div>
          {activeDesign ? (
            <DesignCarousel
              designs={currentDesigns}
              activeId={activeDesign.id}
              onChange={setDesignId}
            />
          ) : (
            <div className="aspect-[4/3] grid place-items-center rounded-2xl bg-[var(--color-ivory-soft)] text-sm text-[var(--color-charcoal-soft)]">
              No designs in this category yet.
            </div>
          )}
        </div>
        {activeDesign && (
          <ProductDetailsPanel design={activeDesign} onViewCart={() => navigate("cart")} />
        )}
      </div>
    </div>
  );
}
