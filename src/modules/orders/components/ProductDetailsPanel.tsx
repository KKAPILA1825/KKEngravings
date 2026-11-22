import { useEffect, useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import type { Design } from "../types";
import { variantsFor } from "../data/variants";
import { useCart } from "../cart";

const inputCls =
  "w-full rounded-lg bg-[var(--color-ivory)] border border-[color-mix(in_oklab,var(--color-walnut)_20%,transparent)] px-3.5 py-2.5 text-[15px] placeholder:text-[var(--color-charcoal-soft)]/50 focus:border-[var(--color-walnut)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/50 transition-colors";

const MAX_ENGRAVING = 400;

type Props = {
  design: Design;
  onViewCart: () => void;
};

export function ProductDetailsPanel({ design, onViewCart }: Props) {
  const { addItem } = useCart();
  const variants = variantsFor(design.categoryId);

  const [variantId, setVariantId] = useState<string>(variants[0]?.id ?? "");
  const [engravingText, setEngraving] = useState<string>("");
  const [occasionNote, setOccasion] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState(false);
  const [adding, setAdding] = useState(false);

  // When the user switches designs, keep their in-progress engraving text,
  // occasion, and quantity — those are their work. Only refresh the variant
  // (which is category-scoped) and clear transient UI state.
  useEffect(() => {
    setVariantId(variants[0]?.id ?? "");
    setError(null);
    setJustAdded(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [design.id]);

  const handleQty = (v: string) => {
    const n = Math.max(1, Math.min(99, Math.floor(Number(v) || 1)));
    setQuantity(n);
  };

  const handleAdd = () => {
    if (adding) return;
    if (!engravingText.trim()) {
      setError("Please tell us what to engrave.");
      return;
    }
    if (engravingText.length > MAX_ENGRAVING) {
      setError(`Engraving instructions must be ${MAX_ENGRAVING} characters or fewer.`);
      return;
    }
    setAdding(true);
    setError(null);
    addItem({
      designId: design.id,
      categoryId: design.categoryId,
      variantId,
      customization: {
        engravingText: engravingText.trim(),
        occasionNote: occasionNote.trim() || undefined,
      },
      quantity,
    });
    setJustAdded(true);
    // Clear the form so the next add doesn't inherit the last message
    setEngraving("");
    setOccasion("");
    setQuantity(1);
    setTimeout(() => {
      setAdding(false);
      setJustAdded(false);
    }, 1800);
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-walnut)]/80">
          {design.categoryLabel}
        </p>
        <h2 className="mt-1 font-serif text-2xl sm:text-3xl text-[var(--color-walnut-dark)]">
          {design.title}
        </h2>
        <p className="mt-2 text-sm text-[var(--color-charcoal-soft)]/80">
          Price to be confirmed by KK Engravings after review.
        </p>
      </div>

      {/*
        Item/variant picker intentionally hidden for now — KK Engravings will
        confirm materials and options with the customer after the order request.
        State is kept and defaults to variants[0] so the cart still records a
        valid variantId.
      <label className="block">
        <span className="block text-sm font-medium text-[var(--color-walnut-dark)] mb-1.5">
          Item
        </span>
        <select
          value={variantId}
          onChange={(e) => setVariantId(e.target.value)}
          className={inputCls}
        >
          {variants.length === 0 && <option value="">Options to be confirmed</option>}
          {variants.map((v) => (
            <option key={v.id} value={v.id}>
              {v.label} — {v.description}
            </option>
          ))}
        </select>
      </label>
      */}

      <div>
        <span className="block text-sm font-medium text-[var(--color-walnut-dark)] mb-1.5">
          Design
        </span>
        <div
          aria-readonly="true"
          className="w-full rounded-lg bg-[var(--color-ivory-soft)]/70 border border-[color-mix(in_oklab,var(--color-walnut)_20%,transparent)] px-3.5 py-2.5 text-[15px] text-[var(--color-walnut-dark)] font-medium select-all"
          title="Select and copy this name into your instructions below"
        >
          {design.title}
        </div>
        <span className="block mt-1 text-xs text-[var(--color-charcoal-soft)]/70">
          Please copy this name into the instructions below, then describe how you'd like it engraved.
        </span>
      </div>

      <label className="block">
        <span className="flex items-center justify-between text-sm font-medium text-[var(--color-walnut-dark)] mb-1.5">
          <span>Your engraving instructions</span>
          <span className="text-xs text-[var(--color-charcoal-soft)]/70">
            {engravingText.length}/{MAX_ENGRAVING}
          </span>
        </span>
        <textarea
          value={engravingText}
          onChange={(e) => setEngraving(e.target.value.slice(0, MAX_ENGRAVING))}
          rows={5}
          placeholder={`e.g. Please engrave our family name and "Est. 2019" in a cursive font.`}
          className={`${inputCls} resize-y min-h-[120px]`}
          required
        />
      </label>

      <label className="block">
        <span className="block text-sm font-medium text-[var(--color-walnut-dark)] mb-1.5">
          Occasion / date <span className="text-[var(--color-charcoal-soft)]/60">(optional)</span>
        </span>
        <input
          type="text"
          value={occasionNote}
          onChange={(e) => setOccasion(e.target.value)}
          placeholder="e.g. Anniversary gift · needed by Dec 15"
          className={inputCls}
        />
      </label>

      <div className="flex items-end gap-4">
        <label className="block">
          <span className="block text-sm font-medium text-[var(--color-walnut-dark)] mb-1.5">
            Quantity
          </span>
          <input
            type="number"
            min={1}
            max={99}
            value={quantity}
            onChange={(e) => handleQty(e.target.value)}
            inputMode="numeric"
            className={`${inputCls} w-24 text-center`}
          />
        </label>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={handleAdd}
          disabled={adding}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[var(--color-walnut-dark)] text-[var(--color-ivory)] text-sm font-medium hover:bg-[var(--color-walnut)] transition-colors disabled:opacity-60"
        >
          {justAdded ? (
            <>
              <Check size={18} /> Added to cart
            </>
          ) : (
            <>
              <ShoppingBag size={18} /> Add to cart
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onViewCart}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-[var(--color-walnut)]/30 text-sm text-[var(--color-walnut-dark)] hover:bg-[var(--color-ivory-soft)] transition-colors"
        >
          View cart
        </button>
      </div>
    </div>
  );
}
