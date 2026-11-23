export type Review = {
  id: string;
  rating: number;
  firstName: string;
  lastInitial: string;
  city: string;
  state: string;
  headline: string;
  body: string;
  design: string;
  publishedAt: string;
};

export type ReviewStats = {
  count: number;
  average: number;
  distribution: Record<string, number>;
};

export type SubmitPayload = {
  rating: number;
  firstName: string;
  lastInitial: string;
  email: string;
  city: string;
  state: string;
  headline: string;
  body: string;
  referencedDesign: string;
  hp: string;
};

export type ReviewsRoute = "none" | "list" | "new";

export type SortKey = "newest" | "highest";
