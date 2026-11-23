import type { CartItem, ShippingAddress } from "./types";
import { designs } from "./data/designs.generated";
import { variantById } from "./data/variants";
import { categoryById } from "./data/categories";

const designById = (id: string) => designs.find((d) => d.id === id);

function formatLine(item: CartItem, index: number): string {
  const design = designById(item.designId);
  const variant = variantById(item.variantId);
  const cat = categoryById(item.categoryId);
  const title = design?.title ?? item.designId;
  const designRef = `${title} (ref: ${item.designId})`;
  const variantLabel = variant?.label ?? item.variantId;
  const categoryLabel = cat?.label ?? item.categoryId;
  const engraving = item.customization.engravingText.trim() || "(none provided)";
  const occasion = item.customization.occasionNote?.trim();
  return [
    `Item ${index + 1}`,
    `  Category: ${categoryLabel}`,
    `  Design:   ${designRef}`,
    `  Item:     ${variantLabel}`,
    `  Quantity: ${item.quantity}`,
    `  Engraving instructions:`,
    ...engraving.split("\n").map((l) => `    ${l}`),
    ...(occasion ? [`  Occasion / date: ${occasion}`] : []),
  ].join("\n");
}

export function buildOrderEmail(
  items: readonly CartItem[],
  ship: ShippingAddress,
): { subject: string; body: string } {
  const subject = `KK Engravings order request from ${ship.fullName || "a new customer"}`;
  const lines: string[] = [];
  lines.push("New order request from the KK Engravings website.");
  lines.push("");
  lines.push("Customer");
  lines.push(`  Name:  ${ship.fullName}`);
  lines.push(`  Email: ${ship.email}`);
  lines.push(`  Phone: ${ship.phone}`);
  lines.push("");
  lines.push("Shipping address");
  lines.push(`  ${ship.line1}`);
  if (ship.line2.trim()) lines.push(`  ${ship.line2}`);
  lines.push(`  ${ship.city}, ${ship.state} ${ship.postalCode}`);
  lines.push(`  ${ship.country}`);
  lines.push("");
  lines.push(`Items (${items.length})`);
  lines.push("────────────────────────────");
  items.forEach((it, i) => {
    lines.push(formatLine(it, i));
    lines.push("");
  });
  lines.push("");
  lines.push("Note: Prices are not shown in this request. KK Engravings will confirm");
  lines.push("design details, final pricing, and shipping before anything is produced.");
  return { subject, body: lines.join("\n") };
}

export function buildMailtoHref(
  to: string,
  items: readonly CartItem[],
  ship: ShippingAddress,
): string {
  const { subject, body } = buildOrderEmail(items, ship);
  // The email address itself must NOT be URL-encoded (breaks some mail clients);
  // only the query parameters are encoded.
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function openOrderMailto(
  to: string,
  items: readonly CartItem[],
  ship: ShippingAddress,
): void {
  window.location.href = buildMailtoHref(to, items, ship);
}

// Submits to the Google Apps Script endpoint (VITE_REVIEWS_ENDPOINT — same URL
// serves reviews, orders, and custom). Uses text/plain body to avoid CORS
// preflight. Host-agnostic (works on Amplify, Netlify, localhost, etc).
export async function submitOrderToAppsScript(
  items: readonly CartItem[],
  ship: ShippingAddress,
  idempotencyKey: string,
): Promise<{ id: string }> {
  const endpoint = (
    (import.meta.env?.VITE_REVIEWS_ENDPOINT as string | undefined) ?? ""
  ).trim();
  if (!endpoint) throw new Error("missing-endpoint");

  const resolvedItems = items.map((it) => {
    const design = designById(it.designId);
    const variant = variantById(it.variantId);
    return {
      designTitle: design?.title ?? it.designId,
      variantLabel: variant?.label ?? it.variantId,
      engravingText: it.customization.engravingText,
      occasionNote: it.customization.occasionNote ?? "",
      quantity: it.quantity,
    };
  });

  const payload = {
    idempotencyKey,
    fullName: ship.fullName,
    email: ship.email,
    phone: ship.phone,
    line1: ship.line1,
    line2: ship.line2,
    city: ship.city,
    state: ship.state,
    postalCode: ship.postalCode,
    country: ship.country,
    items: resolvedItems,
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ type: "order", payload }),
  });
  if (!res.ok) throw new Error(`Submission failed (${res.status})`);
  const data = (await res.json()) as {
    ok: boolean;
    id?: string;
    reason?: string;
    details?: string[];
  };
  if (!data.ok) {
    const detail =
      data.details && data.details.length > 0
        ? ` (${data.details.join(", ")})`
        : "";
    throw new Error((data.reason || "submit-failed") + detail);
  }
  return { id: data.id || "" };
}
