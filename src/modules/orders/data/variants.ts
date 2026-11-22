import type { CategoryId, Variant } from "../types";

// Placeholder variant options per category. Pricing & final materials
// are confirmed by KK Engravings before the order is accepted.
const V = (categoryId: CategoryId, label: string, description: string): Variant => ({
  id: `${categoryId}:${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  categoryId,
  label,
  description,
});

const BY_CATEGORY: Record<CategoryId, readonly Variant[]> = {
  "name-plaques": [
    V("name-plaques", "Wooden plaque", "Laser-engraved on natural wood"),
    V("name-plaques", "Black acrylic plaque", "Modern acrylic with raised lettering"),
  ],
  "family-plaques": [
    V("family-plaques", "Interlocking puzzle piece", "Framed wooden puzzle with family names"),
    V("family-plaques", "Wall-ready wooden sign", "Hanging-ready rectangular sign"),
  ],
  "baby-plaques": [
    V("baby-plaques", "Round birth announcement", "Round wooden disc, birth details engraved"),
  ],
  keychains: [
    V("keychains", "Script-name keychain", "Cursive wood keychain with ring"),
    V("keychains", "Animal / deity keychain", "Themed shape with name engraved"),
  ],
  ornaments: [
    V("ornaments", "Snowflake bauble", "Round wood snowflake with name"),
    V("ornaments", "Sweater / mug ornament", "Themed cut-out shape with name"),
  ],
  "pet-ornaments": [
    V("pet-ornaments", "Paw-print ornament", "Wooden paw-print disc with pet name"),
  ],
  coasters: [
    V("coasters", "Slate coaster", "Dark slate, square or round"),
    V("coasters", "Marble + walnut coaster", "Hexagonal, marble on top, walnut below"),
  ],
  "wall-art": [
    V("wall-art", "Layered wood wall piece", "Multi-layer plywood artwork"),
    V("wall-art", "Skyline / silhouette cutout", "Wood on black backing"),
  ],
  "luggage-tags": [
    V("luggage-tags", "Leather luggage tag", "Tan leather with monogram and name"),
  ],
  "gift-card-holders": [
    V("gift-card-holders", "Wooden card holder", "Sleeve-style wooden gift-card holder"),
  ],
};

export const variantsFor = (categoryId: string): readonly Variant[] =>
  BY_CATEGORY[categoryId as CategoryId] ?? [];

export const variantById = (variantId: string): Variant | undefined => {
  for (const list of Object.values(BY_CATEGORY)) {
    const found = list.find((v) => v.id === variantId);
    if (found) return found;
  }
  return undefined;
};
