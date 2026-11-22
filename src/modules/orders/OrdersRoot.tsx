import { useEffect } from "react";
import { CartProvider } from "./cart";
import { useHashRoute, type OrdersRoute } from "./router";
import { OrdersPage } from "./pages/OrdersPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { CustomRequestPage } from "./pages/CustomRequestPage";

type Props = {
  fallback: React.ReactNode;
};

function OrdersRouter({ route }: { route: OrdersRoute }) {
  useEffect(() => {
    document.title =
      route === "cart"
        ? "Cart · KK Engravings"
        : route === "checkout"
          ? "Checkout · KK Engravings"
          : route === "custom"
            ? "Custom request · KK Engravings"
            : route === "home"
              ? "Shop · KK Engravings"
              : "KK Engravings";
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    return () => {
      document.title = "KK Engravings";
    };
  }, [route]);

  if (route === "cart") return <CartPage />;
  if (route === "checkout") return <CheckoutPage />;
  if (route === "custom") return <CustomRequestPage />;
  return <OrdersPage />;
}

export function OrdersRoot({ fallback }: Props) {
  const { route, hash } = useHashRoute();
  const inOrders = route !== "none";

  // Redirect legacy #custom anchor (section no longer exists) to the new route.
  useEffect(() => {
    if (hash === "#custom") {
      window.location.replace("#/orders/custom");
    }
  }, [hash]);

  // When leaving Orders for a #anchor section, the browser's native
  // scroll-to-anchor fires before the fallback <main> remounts, so the
  // target element doesn't exist yet. Scroll to it after render.
  useEffect(() => {
    if (inOrders) return;
    if (!hash || !hash.startsWith("#") || hash.startsWith("#/")) return;
    const id = hash.slice(1);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "instant" as ScrollBehavior, block: "start" });
  }, [inOrders, hash]);

  return (
    <CartProvider>
      {inOrders ? (
        <main className="orders-scope">
          <OrdersRouter route={route} />
        </main>
      ) : (
        fallback
      )}
    </CartProvider>
  );
}
