import type { ReactNode } from "react";
import { useReveal } from "../hooks/useReveal";

type Props = {
  id: string;
  eyebrow?: string;
  title?: string;
  children: ReactNode;
  tone?: "ivory" | "ivory-soft" | "ivory-deep";
  className?: string;
};

const TONE: Record<NonNullable<Props["tone"]>, string> = {
  "ivory": "bg-[var(--color-ivory)]",
  "ivory-soft": "bg-[var(--color-ivory-soft)]",
  "ivory-deep": "bg-[var(--color-ivory-deep)]",
};

export function Section({ id, eyebrow, title, children, tone = "ivory", className = "" }: Props) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section id={id} className={`${TONE[tone]} scroll-mt-20`}>
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-20 sm:py-28">
        {(eyebrow || title) && (
          <div ref={ref} className="reveal mb-10 sm:mb-14 max-w-3xl">
            {eyebrow && (
              <p className="text-xs sm:text-sm uppercase tracking-[0.22em] text-[var(--color-walnut)] font-medium mb-3">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="text-3xl sm:text-5xl font-serif leading-[1.05]">{title}</h2>
            )}
          </div>
        )}
        <div className={className}>{children}</div>
      </div>
    </section>
  );
}
