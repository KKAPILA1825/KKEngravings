import type { CategoryId } from "../types";

export type CategoryMeta = {
  id: CategoryId;
  label: string;
  tagline: string;
};

export const categories: readonly CategoryMeta[] = [
  { id: "name-plaques", label: "Name Plaques", tagline: "Script & sports-themed signs" },
  { id: "family-plaques", label: "Family Plaques", tagline: "Puzzles and wall-ready keepsakes" },
  { id: "baby-plaques", label: "Baby Plaques", tagline: "Hello-world birth announcements" },
  { id: "keychains", label: "Keychains", tagline: "Script names, animals, and deities" },
  { id: "ornaments", label: "Ornaments", tagline: "Snowflake, sweater, and mug baubles" },
  { id: "pet-ornaments", label: "Pet Ornaments", tagline: "Paw prints and pet names" },
  { id: "coasters", label: "Coasters", tagline: "Slate, marble, and walnut" },
  { id: "wall-art", label: "Wall Art", tagline: "Layered wood and skyline cutouts" },
  { id: "luggage-tags", label: "Luggage Tags", tagline: "Leather monogram tags" },
  { id: "gift-card-holders", label: "Gift Card Holders", tagline: "Wooden card sleeves" },
] as const;

export const categoryById = (id: string): CategoryMeta | undefined =>
  categories.find((c) => c.id === id);
