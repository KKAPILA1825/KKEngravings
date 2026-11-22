import { Nav } from "./components/Nav";
import { Hero } from "./components/Hero";
import { About } from "./components/About";
import { Gallery } from "./components/Gallery";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";
import { BackToTop } from "./components/BackToTop";
import { OrdersRoot } from "./modules/orders/OrdersRoot";

export default function App() {
  return (
    <>
      <a
        href="#home"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-[var(--color-walnut-dark)] focus:text-[var(--color-ivory)] focus:px-3 focus:py-2 focus:rounded-md"
      >
        Skip to content
      </a>
      <Nav />
      <OrdersRoot
        fallback={
          <main>
            <Hero />
            <About />
            <Gallery />
            <Contact />
          </main>
        }
      />
      <Footer />
      <BackToTop />
    </>
  );
}
