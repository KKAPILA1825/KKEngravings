import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, Mail, RefreshCw, Send, ShoppingBag } from "lucide-react";
import type { CheckoutStep, ShippingAddress } from "../types";
import { useCart } from "../cart";
import { CartLineItem } from "../components/CartLineItem";
import {
  emptyShipping,
  validateShipping,
  ShippingForm,
  type ShippingErrors,
} from "../components/ShippingForm";
import { openOrderMailto, submitOrderToNetlify } from "../mailto";
import { navigate, leaveOrders } from "../router";
import { site } from "../../../data/site.config";

const STEPS: readonly { id: CheckoutStep; label: string }[] = [
  { id: "review", label: "Order Review" },
  { id: "shipping", label: "Shipping" },
  { id: "payment", label: "Send Request" },
];

function Stepper({ current }: { current: CheckoutStep }) {
  const currentIndex = STEPS.findIndex((s) => s.id === current);
  return (
    <ol className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm mb-8" aria-label="Checkout steps">
      {STEPS.map((s, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <li key={s.id} className="flex items-center gap-2">
            <span
              aria-current={active ? "step" : undefined}
              className={`grid place-items-center size-7 rounded-full text-xs font-medium ${
                active
                  ? "bg-[var(--color-walnut-dark)] text-[var(--color-ivory)]"
                  : done
                    ? "bg-[var(--color-gold)] text-[var(--color-walnut-dark)]"
                    : "bg-[var(--color-ivory-soft)] text-[var(--color-charcoal-soft)]"
              }`}
            >
              {done ? <Check size={14} /> : i + 1}
            </span>
            <span
              className={`${
                active ? "text-[var(--color-walnut-dark)] font-medium" : "text-[var(--color-charcoal-soft)]"
              }`}
            >
              {s.label}
            </span>
            {i < STEPS.length - 1 && (
              <span className="hidden sm:inline-block w-8 h-px bg-[var(--color-walnut)]/20" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const [step, setStep] = useState<CheckoutStep>("review");
  const [shipping, setShipping] = useState<ShippingAddress>(emptyShipping);
  const [errors, setErrors] = useState<ShippingErrors>({});
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  useEffect(
    () => () => {
      mountedRef.current = false;
    },
    [],
  );

  if (cart.items.length === 0 && step !== "success") {
    return (
      <div className="mx-auto max-w-4xl px-5 sm:px-8 pt-24 sm:pt-28 pb-16 text-center">
        <ShoppingBag className="mx-auto mb-3 text-[var(--color-walnut)]" size={36} />
        <p className="text-[var(--color-charcoal-soft)]">Your cart is empty.</p>
        <button
          type="button"
          onClick={() => navigate("home")}
          className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--color-walnut-dark)] text-[var(--color-ivory)] text-sm hover:bg-[var(--color-walnut)]"
        >
          Continue shopping
        </button>
      </div>
    );
  }

  const continueToShipping = () => setStep("shipping");
  const continueToPayment = () => {
    const errs = validateShipping(shipping);
    setErrors(errs);
    if (Object.keys(errs).length === 0) setStep("payment");
  };
  const sendOrder = async () => {
    if (sending) return;
    setSending(true);
    setSendError(null);
    try {
      await submitOrderToNetlify(cart.items, shipping);
      if (!mountedRef.current) return;
      clearCart();
      setStep("success");
    } catch (err) {
      console.warn("[KK Orders] Netlify Forms submission failed:", err);
      if (!mountedRef.current) return;
      setSendError(
        err instanceof Error ? err.message : "Could not reach our server.",
      );
    } finally {
      if (mountedRef.current) setSending(false);
    }
  };

  const openMailtoLastResort = () => {
    openOrderMailto(site.contact.email, cart.items, shipping);
    clearCart();
    setStep("mailto-opened");
  };

  return (
    <div className="mx-auto max-w-4xl px-5 sm:px-8 pt-24 sm:pt-28 pb-16">
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-walnut)]/80">
        Checkout
      </p>
      <h1 className="mt-1 mb-6 font-serif text-3xl sm:text-4xl text-[var(--color-walnut-dark)]">
        {step === "success"
          ? "Order received"
          : step === "mailto-opened"
            ? "Almost there"
            : "Review your order"}
      </h1>

      {step !== "success" && step !== "mailto-opened" && <Stepper current={step} />}

      {step === "review" && (
        <>
          <ul className="bg-[var(--color-ivory-soft)] rounded-2xl p-5 sm:p-6 shadow-[var(--shadow-soft)]">
            {cart.items.map((it) => (
              <CartLineItem key={it.id} item={it} />
            ))}
          </ul>
          <p className="mt-4 text-sm text-[var(--color-charcoal-soft)]/80">
            Prices, shipping, and final materials will be confirmed by KK Engravings after
            reviewing your request.
          </p>
          <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
            <button
              type="button"
              onClick={() => navigate("cart")}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-[var(--color-walnut)]/30 text-sm text-[var(--color-walnut-dark)] hover:bg-[var(--color-ivory-soft)]"
            >
              <ArrowLeft size={16} /> Back to cart
            </button>
            <button
              type="button"
              onClick={continueToShipping}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[var(--color-walnut-dark)] text-[var(--color-ivory)] text-sm font-medium hover:bg-[var(--color-walnut)]"
            >
              Continue to shipping <ArrowRight size={16} />
            </button>
          </div>
        </>
      )}

      {step === "shipping" && (
        <>
          <div className="bg-[var(--color-ivory-soft)] rounded-2xl p-5 sm:p-7 shadow-[var(--shadow-soft)]">
            <ShippingForm value={shipping} errors={errors} onChange={setShipping} />
          </div>
          <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep("review")}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-[var(--color-walnut)]/30 text-sm text-[var(--color-walnut-dark)] hover:bg-[var(--color-ivory-soft)]"
            >
              <ArrowLeft size={16} /> Back to review
            </button>
            <button
              type="button"
              onClick={continueToPayment}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[var(--color-walnut-dark)] text-[var(--color-ivory)] text-sm font-medium hover:bg-[var(--color-walnut)]"
            >
              Continue to final step <ArrowRight size={16} />
            </button>
          </div>
        </>
      )}

      {step === "payment" && (
        <>
          {sendError && (
            <div
              role="alert"
              className="mb-6 rounded-2xl bg-red-50 border-2 border-red-300 p-5 sm:p-6 shadow-[var(--shadow-soft)]"
            >
              <div className="flex items-start gap-3 mb-3">
                <AlertTriangle className="shrink-0 text-red-700" size={22} />
                <div>
                  <h3 className="font-serif text-lg text-red-900">
                    Your order was not sent.
                  </h3>
                  <p className="mt-1 text-sm text-red-800">
                    Something went wrong reaching our server. Your cart is unchanged —
                    no email has gone out yet. Please try again.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={sendOrder}
                  disabled={sending}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-red-700 text-white text-sm font-medium hover:bg-red-800 disabled:opacity-60"
                >
                  <RefreshCw size={16} /> {sending ? "Trying…" : "Try again"}
                </button>
                <button
                  type="button"
                  onClick={openMailtoLastResort}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg border-2 border-red-700 text-red-800 text-sm font-medium hover:bg-red-100"
                >
                  <Mail size={16} /> Email directly instead
                </button>
              </div>
              <p className="mt-3 text-xs text-red-800/70">
                Technical details: {sendError}
              </p>
            </div>
          )}

          <div className="bg-[var(--color-ivory-soft)] rounded-2xl p-6 sm:p-8 shadow-[var(--shadow-soft)] space-y-4">
            <h2 className="font-serif text-xl text-[var(--color-walnut-dark)]">
              Send order request
            </h2>
            <p className="text-sm text-[var(--color-charcoal-soft)]">
              Online payment is coming soon. Clicking <strong>Send Order Request</strong>{" "}
              delivers your order details and shipping address directly to KK Engravings.
              KK will reply with confirmation, final pricing, and payment instructions.
            </p>
            <div className="rounded-lg bg-[var(--color-ivory)] p-4 text-sm">
              <p className="font-medium text-[var(--color-walnut-dark)] mb-1">
                Request will be sent to
              </p>
              <p className="text-[var(--color-charcoal-soft)]">{site.contact.email}</p>
            </div>
            <div className="rounded-lg bg-[var(--color-ivory)] p-4 text-sm">
              <p className="font-medium text-[var(--color-walnut-dark)] mb-1">Shipping to</p>
              <p className="text-[var(--color-charcoal-soft)] whitespace-pre-line">
                {shipping.fullName}
                {"\n"}
                {shipping.line1}
                {shipping.line2 ? `\n${shipping.line2}` : ""}
                {"\n"}
                {shipping.city}, {shipping.state} {shipping.postalCode}
                {"\n"}
                {shipping.country}
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep("shipping")}
              disabled={sending}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-[var(--color-walnut)]/30 text-sm text-[var(--color-walnut-dark)] hover:bg-[var(--color-ivory-soft)] disabled:opacity-60"
            >
              <ArrowLeft size={16} /> Back to shipping
            </button>
            <button
              type="button"
              onClick={sendOrder}
              disabled={sending}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[var(--color-walnut-dark)] text-[var(--color-ivory)] text-sm font-medium hover:bg-[var(--color-walnut)] disabled:opacity-60"
            >
              <Send size={16} /> {sending ? "Sending…" : "Send order request"}
            </button>
          </div>
        </>
      )}

      {step === "success" && (
        <div className="bg-[var(--color-ivory-soft)] rounded-2xl p-8 sm:p-10 shadow-[var(--shadow-soft)] text-center">
          <div className="mx-auto mb-4 grid place-items-center size-14 rounded-full bg-[var(--color-gold)]/40">
            <Check size={28} className="text-[var(--color-walnut-dark)]" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[var(--color-walnut-dark)]">
            Your order has been received.
          </h2>
          <p className="mt-3 text-[var(--color-charcoal-soft)]">
            Thank you! KK Engravings will contact you shortly at the email address you
            provided with final pricing, timeline, and payment instructions.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate("home")}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--color-walnut-dark)] text-[var(--color-ivory)] text-sm hover:bg-[var(--color-walnut)]"
            >
              Continue shopping
            </button>
            <button
              type="button"
              onClick={() => leaveOrders("#home")}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-[var(--color-walnut)]/30 text-sm text-[var(--color-walnut-dark)] hover:bg-[var(--color-ivory-soft)]"
            >
              Back to home
            </button>
          </div>
        </div>
      )}

      {step === "mailto-opened" && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 sm:p-10 shadow-[var(--shadow-soft)] text-center">
          <div className="mx-auto mb-4 grid place-items-center size-14 rounded-full bg-amber-200/60">
            <Mail size={28} className="text-amber-900" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-amber-900">
            We've opened your email app.
          </h2>
          <p className="mt-3 text-amber-900">
            Your order details are pre-filled in a draft email. <strong>Please press
            Send</strong> inside your email app to deliver it to KK Engravings.
          </p>
          <p className="mt-2 text-sm text-amber-900/80">
            We can't confirm delivery from here — the request only reaches KK once you
            press Send in your mail app.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate("home")}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--color-walnut-dark)] text-[var(--color-ivory)] text-sm hover:bg-[var(--color-walnut)]"
            >
              Continue shopping
            </button>
            <button
              type="button"
              onClick={() => leaveOrders("#home")}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-[var(--color-walnut)]/30 text-sm text-[var(--color-walnut-dark)] hover:bg-[var(--color-ivory-soft)]"
            >
              Back to home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
