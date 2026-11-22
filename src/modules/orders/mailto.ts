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

// Submits to Netlify Forms. Works only on the deployed Netlify site; locally
// the POST will typically fail. Callers should handle rejection and surface a
// mailto fallback.
export async function submitOrderToNetlify(
  items: readonly CartItem[],
  ship: ShippingAddress,
): Promise<void> {
  const { body } = buildOrderEmail(items, ship);
  const params = new URLSearchParams();
  params.set("form-name", "kk-engravings-order");
  params.set("bot-field", "");
  params.set("customer_name", ship.fullName);
  params.set("email", ship.email);
  params.set("phone", ship.phone);
  params.set("address_line1", ship.line1);
  params.set("address_line2", ship.line2);
  params.set("city", ship.city);
  params.set("state", ship.state);
  params.set("zip", ship.postalCode);
  params.set("order_details", body);

  const res = await fetch("/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  if (!res.ok) {
    throw new Error(`Netlify Forms submission failed (${res.status})`);
  }
}
