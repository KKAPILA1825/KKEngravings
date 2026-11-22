import { useState } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
import type { CartItem } from "../types";
import { designs } from "../data/designs.generated";
import { variantsFor, variantById } from "../data/variants";
import { categoryById } from "../data/categories";
import { useCart } from "../cart";

const inputCls =
  "w-full rounded-lg bg-[var(--color-ivory)] border border-[color-mix(in_oklab,var(--color-walnut)_20%,transparent)] px-3 py-2 text-sm focus:border-[var(--color-walnut)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/50";

const MAX_ENGRAVING = 400;

type Props = {
  item: CartItem;
  editable?: boolean;
};

export function CartLineItem({ item, editable = true }: Props) {
  const { updateItem, removeItem } = useCart();
  const design = designs.find((d) => d.id === item.designId);
  const variant = variantById(item.variantId);
  const category = categoryById(item.categoryId);

  const [editing, setEditing] = useState(false);
  const [variantId, setVariantId] = useState(item.variantId);
  const [engraving, setEngraving] = useState(item.customization.engravingText);
  const [occasion, setOccasion] = useState(item.customization.occasionNote ?? "");
  const [qty, setQty] = useState(item.quantity);
  const [error, setError] = useState<string | null>(null);

  const variants = variantsFor(item.categoryId);

  const save = () => {
    if (!variantId) {
      setError("Please choose an item option.");
      return;
    }
    if (!engraving.trim()) {
      setError("Please tell us what to engrave.");
      return;
    }
    const safeQty = Math.max(1, Math.min(99, Math.floor(Number(qty) || 1)));
    updateItem(item.id, {
      variantId,
      quantity: safeQty,
      customization: {
        engravingText: engraving.trim().slice(0, MAX_ENGRAVING),
        occasionNote: occasion.trim() || undefined,
      },
    });
    setEditing(false);
    setError(null);
  };

  const cancel = () => {
    setVariantId(item.variantId);
    setEngraving(item.customization.engravingText);
    setOccasion(item.customization.occasionNote ?? "");
    setQty(item.quantity);
    setEditing(false);
    setError(null);
  };

  return (
    <li className="flex gap-4 py-5 border-b border-[color-mix(in_oklab,var(--color-walnut)_15%,transparent)] last:border-0">
      <div className="shrink-0 w-24 sm:w-28 aspect-square rounded-lg overflow-hidden bg-[var(--color-ivory-soft)]">
        {design ? (
          <img
            src={design.imageThumb}
            alt={design.alt}
            width={design.width}
            height={design.height}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-xs text-[var(--color-charcoal-soft)]">
            Image missing
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-walnut)]/80">
              {category?.label ?? item.categoryId}
            </p>
            <p className="font-serif text-lg text-[var(--color-walnut-dark)] truncate">
              {design?.title ?? item.designId}
            </p>
          </div>

          {editable && !editing && (
            <div className="flex gap-1 shrink-0">
              <button
                type="button"
                aria-label="Edit item"
                onClick={() => setEditing(true)}
                className="p-2 rounded-md text-[var(--color-walnut-dark)] hover:bg-[var(--color-ivory-soft)]"
              >
                <Pencil size={16} />
              </button>
              <button
                type="button"
                aria-label="Remove item"
                onClick={() => removeItem(item.id)}
                className="p-2 rounded-md text-red-700 hover:bg-red-50"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>

        {!editing ? (
          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm text-[var(--color-charcoal-soft)]">
            <dt className="font-medium">Item</dt>
            <dd>{variant?.label ?? item.variantId}</dd>
            <dt className="font-medium">Qty</dt>
            <dd>{item.quantity}</dd>
            <dt className="font-medium">Engraving</dt>
            <dd className="whitespace-pre-wrap break-words">
              {item.customization.engravingText}
            </dd>
            {item.customization.occasionNote && (
              <>
                <dt className="font-medium">Occasion</dt>
                <dd>{item.customization.occasionNote}</dd>
              </>
            )}
          </dl>
        ) : (
          <div className="mt-3 space-y-3">
            <label className="block text-sm">
              <span className="block mb-1 font-medium text-[var(--color-walnut-dark)]">Item</span>
              <select
                value={variantId}
                onChange={(e) => setVariantId(e.target.value)}
                className={inputCls}
              >
                {variants.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="block mb-1 font-medium text-[var(--color-walnut-dark)]">
                Engraving instructions
              </span>
              <textarea
                value={engraving}
                onChange={(e) => setEngraving(e.target.value.slice(0, MAX_ENGRAVING))}
                rows={4}
                className={`${inputCls} resize-y`}
              />
            </label>
            <label className="block text-sm">
              <span className="block mb-1 font-medium text-[var(--color-walnut-dark)]">
                Occasion / date (optional)
              </span>
              <input
                type="text"
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className={inputCls}
              />
            </label>
            <label className="block text-sm">
              <span className="block mb-1 font-medium text-[var(--color-walnut-dark)]">
                Quantity
              </span>
              <input
                type="number"
                min={1}
                max={99}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
                className={`${inputCls} w-24 text-center`}
              />
            </label>
            {error && (
              <p role="alert" className="text-sm text-red-700">
                {error}
              </p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={save}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--color-walnut-dark)] text-[var(--color-ivory)] text-sm hover:bg-[var(--color-walnut)]"
              >
                <Check size={16} /> Save
              </button>
              <button
                type="button"
                onClick={cancel}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[var(--color-walnut)]/30 text-[var(--color-walnut-dark)] text-sm hover:bg-[var(--color-ivory-soft)]"
              >
                <X size={16} /> Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </li>
  );
}
