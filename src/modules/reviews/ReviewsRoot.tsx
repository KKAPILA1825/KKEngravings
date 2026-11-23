import { useEffect } from "react";
import { useHashRoute } from "./router";
import { ReviewsListPage } from "./pages/ReviewsListPage";
import { NewReviewPage } from "./pages/NewReviewPage";

type Props = {
  fallback: React.ReactNode;
};

export function ReviewsRoot({ fallback }: Props) {
  const { route, hash } = useHashRoute();
  const inReviews = route !== "none";

  useEffect(() => {
    document.title =
      route === "new"
        ? "Write a review · KK Engravings"
        : route === "list"
          ? "Reviews · KK Engravings"
          : "KK Engravings";
    if (inReviews) {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
    return () => {
      document.title = "KK Engravings";
    };
  }, [route, inReviews]);

  // Scroll to #anchor targets after leaving Reviews (same fix OrdersRoot uses).
  useEffect(() => {
    if (inReviews) return;
    if (!hash || !hash.startsWith("#") || hash.startsWith("#/")) return;
    const id = hash.slice(1);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "instant" as ScrollBehavior, block: "start" });
  }, [inReviews, hash]);

  if (!inReviews) return <>{fallback}</>;

  return (
    <main className="reviews-scope">
      {route === "new" ? <NewReviewPage /> : <ReviewsListPage />}
    </main>
  );
}
