// Shop pricing by design slug. Kept separate from designs.generated.ts
// so re-running the image pipeline never clobbers prices.
//
// Entries omit from this map for designs where pricing isn't finalized —
// the product details panel falls back to "Price to be confirmed" copy.

export type Pricing = {
  price: string;              // human-readable, e.g. "$30" or "$5 each"
  dimensions?: string;        // optional, omit when unknown
  priceNote?: string;         // optional footnote, e.g. "engraved both sides"
};

const PRICING: Record<string, Pricing> = {
  // ---------- Family Plaques ----------
  "family-plaque-design-1": { price: "$30", dimensions: "12″ × 10″ approx" },
  "family-plaque-design-2": { price: "$35", dimensions: "12″ × 10″ approx" },
  "family-plaue-design-3":  { price: "$25", dimensions: "12″ × 10″ approx" },

  // ---------- Name Plaques ----------
  "name-plaque-1":          { price: "$30", dimensions: "6″ circle" },
  "name-plaque-2":          { price: "$20", dimensions: "6″ × 6″" },
  "name-plaque-design-3":   { price: "$30", dimensions: "6″ × 6″" },
  "name-plaque-design-4":   { price: "$30", dimensions: "6″ × 8″" },

  // ---------- Baby Plaques ----------
  "babay-plaque-design-1":  { price: "$20", dimensions: "6″ circle" },

  // ---------- Keychains ----------
  // Keychain Design 1 and Design 3 intentionally omitted — pricing not provided.
  "keychain-design-2":      { price: "$5 each", dimensions: "3–4″" },
  "keychain-design-4":      { price: "$5 each", dimensions: "3–4″" },
  "keychain-design-5":      { price: "$6(engraved both sides)", dimensions: "3–4″" },

  // ---------- Ornaments ----------
  "ornament-deisgn-1":      { price: "$8 each", dimensions: "3–4″" },
  "ornament-deisgn-2":      { price: "$8 each", dimensions: "3–4″" },
  "ornament-design-3":      { price: "$8 each", dimensions: "3–4″" },
  "ornament-desiggn-4":     { price: "$8 each", dimensions: "3–4″" },
  "ornament-deisgn-5":      { price: "$8 each", dimensions: "3–4″" },

  // ---------- Pet Ornaments ----------
  "pet-ornaments":          { price: "$8" },

  // ---------- Coasters ----------
  "coaster-design-1":       { price: "$5",  dimensions: "3.94″ standard" },
  "coaster-design-2":       { price: "$10", dimensions: "4″ × 4″ × 0.39″ thick" },
  "coaster-design-3":       { price: "$5" },

  // ---------- Wall Art ----------
  // Wall Art Design 1 and the unnumbered Design 5 intentionally omitted.
  "wall-art-design-2":      { price: "$75",  dimensions: "2½ × 1½ ft" },
  "wall-design-3":          { price: "$30",  dimensions: "12″" },
  "wall-art-design-4":      { price: "$100", dimensions: "2½ × 1½ ft" },

  // ---------- Luggage Tag ----------
  "luggage-tag":            { price: "$10", dimensions: "3″ × 1″" },

  // ---------- Gift Card Holder ----------
  "gift-crd-holder-design": { price: "$25 for set of 3", dimensions: "credit-card size" },
};

export function getPricing(slug: string): Pricing | undefined {
  return PRICING[slug];
}
