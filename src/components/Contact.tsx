import { Mail, MessageCircle, Instagram, Facebook, ShoppingBag } from "lucide-react";
import { Section } from "./Section";
import { site } from "../data/site.config";

type ChannelProps = {
  icon: React.ReactNode;
  label: string;
  value: string;      // raw stored value (handle / email / digits)
  href: string;       // ready URL
  display: string;    // human-readable
};

function Channel({ icon, label, value, href, display }: ChannelProps) {
  const hasValue = value.trim().length > 0;
  return (
    <div className="flex items-start gap-4 p-5 rounded-xl bg-[var(--color-ivory-soft)] border border-[color-mix(in_oklab,var(--color-walnut)_14%,transparent)]">
      <div className="shrink-0 size-10 rounded-full bg-[var(--color-ivory-deep)] text-[var(--color-walnut-dark)] inline-flex items-center justify-center">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-walnut)] font-medium">{label}</p>
        {hasValue ? (
          <a
            href={href}
            className="mt-1 inline-block text-[var(--color-walnut-dark)] text-base sm:text-lg hover:text-[var(--color-walnut)] break-all"
            {...(label === "Instagram" || label === "Facebook" || label === "Etsy" ? { target: "_blank", rel: "noreferrer" } : {})}
          >
            {display}
          </a>
        ) : (
          <p className="mt-1 text-[var(--color-charcoal-soft)]/70 italic text-sm">Coming soon</p>
        )}
      </div>
    </div>
  );
}

export function Contact() {
  const { email, whatsapp } = site.contact;
  const { instagram, facebook, etsy } = site.social;

  return (
    <Section id="contact" eyebrow="Contact" title="Let’s talk about your keepsake." tone="ivory">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
        <Channel
          icon={<Mail size={18} />}
          label="Email"
          value={email}
          href={email ? `mailto:${email}` : "#"}
          display={email}
        />
        <Channel
          icon={<MessageCircle size={18} />}
          label="WhatsApp"
          value={whatsapp}
          href={whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, "")}` : "#"}
          display={whatsapp ? `+${whatsapp}` : ""}
        />
        <Channel
          icon={<Instagram size={18} />}
          label="Instagram"
          value={instagram}
          href={instagram ? `https://instagram.com/${instagram}` : "#"}
          display={instagram ? `@${instagram}` : ""}
        />
        <Channel
          icon={<Facebook size={18} />}
          label="Facebook"
          value={facebook}
          href={facebook ? `https://facebook.com/${facebook}` : "#"}
          display={facebook}
        />
        <Channel
          icon={<ShoppingBag size={18} />}
          label="Etsy"
          value={etsy}
          href={etsy ? `https://${etsy}.etsy.com` : "#"}
          display={etsy}
        />
      </div>
    </Section>
  );
}
