export type PhotoCategory =
  | "Family Keepsakes"
  | "Nameplates"
  | "Coasters"
  | "Ornaments"
  | "Keychains"
  | "Devotional"
  | "Milestones"
  | "Wall Art"
  | "Home & Kitchen"
  | "Pet Keepsakes";

export type Photo = {
  slug: string;
  title: string;
  category: PhotoCategory;
  alt: string;
  thumb: string;
  full: string;
  width: number;
  height: number;
};
