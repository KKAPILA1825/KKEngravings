import { ArrowLeft, ArrowRight, ShoppingBag } from "lucide-react";
import { useCart } from "../cart";
import { CartLineItem } from "../components/CartLineItem";
import { navigate, leaveOrders } from "../router";

export function CartPage() {
  const { cart, count } = useCart();
  const empty = cart.items.length === 0;

  return (
    <div className="mx-auto max-w-4xl px-5 sm:px-8 pt-24 sm:pt-28 pb-16">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-walnut)]/80">
            Your Cart
          </p>
          <h1 className="mt-1 font-serif text-3xl sm:text-4xl text-[var(--color-walnut-dark)]">
            {count === 0 ? "Your cart is empty." : `${count} item${count > 1 ? "s" : ""} in cart`}
          </h1>
        </div>
      </div>

      {empty ? (
        <div className="rounded-2xl bg-[var(--color-ivory-soft)] p-10 text-center">
          <ShoppingBag className="mx-auto mb-3 text-[var(--color-walnut)]" size={36} />
          <p className="text-[var(--color-charcoal-soft)]">
            Browse the catalog and personalize a design to add it here.
          </p>
          <button
            type="button"
            onClick={() => navigate("home")}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--color-walnut-dark)] text-[var(--color-ivory)] text-sm hover:bg-[var(--color-walnut)]"
          >
            Continue shopping
          </button>
        </div>
      ) : (
        <>
          <ul className="bg-[var(--color-ivory-soft)] rounded-2xl p-5 sm:p-6 shadow-[var(--shadow-soft)]">
            {cart.items.map((it) => (
              <CartLineItem key={it.id} item={it} />
            ))}
          </ul>

          <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
            <button
              type="button"
              onClick={() => navigate("home")}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-[var(--color-walnut)]/30 text-sm text-[var(--color-walnut-dark)] hover:bg-[var(--color-ivory-soft)]"
            >
              <ArrowLeft size={16} /> Continue shopping
            </button>
            <button
              type="button"
              onClick={() => navigate("checkout")}
              disabled={empty}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[var(--color-walnut-dark)] text-[var(--color-ivory)] text-sm font-medium hover:bg-[var(--color-walnut)] disabled:opacity-50"
            >
              Proceed to checkout <ArrowRight size={16} />
            </button>
          </div>

          <p className="mt-8 text-xs text-[var(--color-charcoal-soft)]/70">
            Prices will be confirmed by KK Engravings after reviewing your request. No payment is
            collected on this site.{" "}
            <button
              type="button"
              onClick={() => leaveOrders("#home")}
              className="underline hover:text-[var(--color-walnut-dark)]"
            >
              Back to home
            </button>
          </p>
        </>
      )}
    </div>
  );
}
