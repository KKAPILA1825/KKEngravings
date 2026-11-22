import type { ShippingAddress } from "../types";

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID",
  "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO",
  "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA",
  "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
];

export const emptyShipping: ShippingAddress = {
  fullName: "",
  email: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "US",
};

export type ShippingErrors = Partial<Record<keyof ShippingAddress, string>>;

export function validateShipping(a: ShippingAddress): ShippingErrors {
  const errs: ShippingErrors = {};
  if (!a.fullName.trim()) errs.fullName = "Full name is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email.trim()))
    errs.email = "Please enter a valid email address.";
  const digits = a.phone.replace(/\D/g, "");
  if (digits.length !== 10) errs.phone = "Please enter a 10-digit US phone number.";
  if (!a.line1.trim()) errs.line1 = "Street address is required.";
  if (!a.city.trim()) errs.city = "City is required.";
  if (!US_STATES.includes(a.state)) errs.state = "Please choose a state.";
  if (!/^\d{5}(-\d{4})?$/.test(a.postalCode.trim()))
    errs.postalCode = "Please enter a valid US ZIP code.";
  return errs;
}

const inputCls =
  "w-full rounded-lg bg-[var(--color-ivory)] border border-[color-mix(in_oklab,var(--color-walnut)_20%,transparent)] px-3.5 py-2.5 text-[15px] focus:border-[var(--color-walnut)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/50 transition-colors";

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-[var(--color-walnut-dark)] mb-1.5">
        {label} {required && <span className="text-red-700">*</span>}
      </span>
      {children}
      {error && (
        <span role="alert" className="block mt-1 text-xs text-red-700">
          {error}
        </span>
      )}
    </label>
  );
}

type Props = {
  value: ShippingAddress;
  errors: ShippingErrors;
  onChange: (next: ShippingAddress) => void;
};

export function ShippingForm({ value, errors, onChange }: Props) {
  const set = <K extends keyof ShippingAddress>(k: K, v: ShippingAddress[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <div className="grid gap-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Full name" required error={errors.fullName}>
          <input
            type="text"
            value={value.fullName}
            onChange={(e) => set("fullName", e.target.value)}
            autoComplete="name"
            className={inputCls}
          />
        </Field>
        <Field label="Email" required error={errors.email}>
          <input
            type="email"
            value={value.email}
            onChange={(e) => set("email", e.target.value)}
            autoComplete="email"
            inputMode="email"
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="Mobile number" required error={errors.phone}>
        <input
          type="tel"
          value={value.phone}
          onChange={(e) => set("phone", e.target.value)}
          autoComplete="tel"
          inputMode="tel"
          placeholder="(555) 123-4567"
          className={inputCls}
        />
      </Field>

      <Field label="Address line 1" required error={errors.line1}>
        <input
          type="text"
          value={value.line1}
          onChange={(e) => set("line1", e.target.value)}
          autoComplete="address-line1"
          className={inputCls}
        />
      </Field>
      <Field label="Address line 2 (apt, suite, etc.)">
        <input
          type="text"
          value={value.line2}
          onChange={(e) => set("line2", e.target.value)}
          autoComplete="address-line2"
          className={inputCls}
        />
      </Field>

      <div className="grid sm:grid-cols-[1.5fr_1fr_1fr] gap-4">
        <Field label="City" required error={errors.city}>
          <input
            type="text"
            value={value.city}
            onChange={(e) => set("city", e.target.value)}
            autoComplete="address-level2"
            className={inputCls}
          />
        </Field>
        <Field label="State" required error={errors.state}>
          <select
            value={value.state}
            onChange={(e) => set("state", e.target.value)}
            autoComplete="address-level1"
            className={inputCls}
          >
            <option value="">—</option>
            {US_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <Field label="ZIP" required error={errors.postalCode}>
          <input
            type="text"
            value={value.postalCode}
            onChange={(e) => set("postalCode", e.target.value)}
            autoComplete="postal-code"
            inputMode="numeric"
            placeholder="12345"
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="Country">
        <input
          type="text"
          value="United States"
          disabled
          className={`${inputCls} opacity-70`}
        />
      </Field>
    </div>
  );
}
