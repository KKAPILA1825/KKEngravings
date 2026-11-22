import { Fragment, useEffect, useState } from "react";
import { Menu, X, ShoppingBag } from "lucide-react";
import { useScrollSpy } from "../hooks/useScrollSpy";
import { site } from "../data/site.config";

const LINKS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "gallery", label: "Gallery" },
  { id: "contact", label: "Contact" },
] as const;

// Final nav order is: Home · Shop · About · Gallery · Contact.
// Shop is injected after the first link so it sits 2nd.

function useOrdersActive() {
  const [active, setActive] = useState<boolean>(
    typeof window !== "undefined" && window.location.hash.startsWith("#/orders"),
  );
  useEffect(() => {
    const onChange = () => setActive(window.location.hash.startsWith("#/orders"));
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return active;
}

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const active = useScrollSpy(LINKS.map((l) => l.id), 120);
  const ordersActive = useOrdersActive();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // Close mobile menu on resize to desktop
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => mq.matches && setOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-[background,backdrop-filter,box-shadow] duration-300 ${
        scrolled || open
          ? "bg-[color-mix(in_oklab,var(--color-ivory)_88%,transparent)] backdrop-blur-md shadow-[0_1px_0_rgba(107,68,35,0.08)]"
          : "bg-transparent"
      }`}
    >
      <nav aria-label="Primary" className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <a
            href="#home"
            className="font-serif text-[1.15rem] sm:text-xl tracking-tight text-[var(--color-walnut-dark)]"
          >
            {site.name}
          </a>

          <ul className="hidden md:flex items-center gap-1">
            {LINKS.map((l, idx) => {
              const isActive = !ordersActive && active === l.id;
              return (
                <Fragment key={l.id}>
                  <li>
                    <a
                      href={`#${l.id}`}
                      aria-current={isActive ? "page" : undefined}
                      className={`relative px-3 py-2 text-sm rounded-md transition-colors ${
                        isActive
                          ? "text-[var(--color-walnut-dark)]"
                          : "text-[var(--color-charcoal-soft)] hover:text-[var(--color-walnut-dark)]"
                      }`}
                    >
                      {l.label}
                      <span
                        aria-hidden
                        className={`absolute left-3 right-3 -bottom-0.5 h-px bg-[var(--color-gold)] transition-opacity duration-300 ${
                          isActive ? "opacity-100" : "opacity-0"
                        }`}
                      />
                    </a>
                  </li>
                  {idx === 0 && (
                    <li>
                      <a
                        href="#/orders"
                        aria-current={ordersActive ? "page" : undefined}
                        className={`relative inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-md transition-colors ${
                          ordersActive
                            ? "text-[var(--color-walnut-dark)]"
                            : "text-[var(--color-charcoal-soft)] hover:text-[var(--color-walnut-dark)]"
                        }`}
                      >
                        <ShoppingBag size={15} aria-hidden />
                        Shop
                        <span
                          aria-hidden
                          className={`absolute left-3 right-3 -bottom-0.5 h-px bg-[var(--color-gold)] transition-opacity duration-300 ${
                            ordersActive ? "opacity-100" : "opacity-0"
                          }`}
                        />
                      </a>
                    </li>
                  )}
                </Fragment>
              );
            })}
          </ul>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden inline-flex items-center justify-center size-10 -mr-2 rounded-md text-[var(--color-walnut-dark)]"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {open && (
          <ul
            id="mobile-menu"
            className="md:hidden pb-4 pt-1 flex flex-col gap-1 border-t border-[color-mix(in_oklab,var(--color-walnut)_18%,transparent)]"
          >
            {LINKS.map((l, idx) => {
              const isActive = !ordersActive && active === l.id;
              return (
                <Fragment key={l.id}>
                  <li>
                    <a
                      href={`#${l.id}`}
                      onClick={() => setOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className={`block px-3 py-3 text-base rounded-md ${
                        isActive
                          ? "text-[var(--color-walnut-dark)] bg-[var(--color-ivory-deep)]"
                          : "text-[var(--color-charcoal-soft)]"
                      }`}
                    >
                      {l.label}
                    </a>
                  </li>
                  {idx === 0 && (
                    <li>
                      <a
                        href="#/orders"
                        onClick={() => setOpen(false)}
                        aria-current={ordersActive ? "page" : undefined}
                        className={`flex items-center gap-2 px-3 py-3 text-base rounded-md ${
                          ordersActive
                            ? "text-[var(--color-walnut-dark)] bg-[var(--color-ivory-deep)]"
                            : "text-[var(--color-charcoal-soft)]"
                        }`}
                      >
                        <ShoppingBag size={16} aria-hidden /> Shop
                      </a>
                    </li>
                  )}
                </Fragment>
              );
            })}
          </ul>
        )}
      </nav>
    </header>
  );
}
