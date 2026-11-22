# KK Engravings

A single-page business website for **KK Engravings** — personalized engravings, wooden gifts, and handcrafted creative products by Kaundinya Kapila.

Built with React 19 + Vite 7 + TypeScript + Tailwind v4.

---

## Run locally

```bash
npm install         # one-time
npm run images      # one-time (generates optimized WebP from Photos_K/)
npm run dev         # starts the dev server (prints the URL, e.g. http://localhost:5173)
```

Then open the URL that Vite prints in the terminal.

### Production build

```bash
npm run build       # type-checks + builds to dist/
npm run preview     # serves the production build locally for a smoke test
```

---

## Adding a new photo

1. Drop the photo (JPG / PNG / HEIC) into **`Photos_K/`**. Keep the originals — never delete or edit them.
2. Run the image pipeline to convert it to web-sized WebP:
   ```bash
   npm run images
   ```
   This writes `public/images/<slug>.webp` (full ~1600px) and `public/images/<slug>.thumb.webp` (thumb ~600px), auto-rotates per EXIF, and strips all metadata including GPS. Already-converted photos are skipped automatically.
3. Register the photo so it appears on the site. Open **`scripts/generate-photos-ts.mjs`** and add an entry to the `META` map, keyed by the **original filename in `Photos_K/`**:
   ```js
   "my-new-photo.jpg": {
     title: "Short Title",
     category: "Nameplates",            // one of the categories in src/types.ts
     alt: "A longer sentence describing what's actually visible in the photo."
   },
   ```
   Then run:
   ```bash
   node scripts/generate-photos-ts.mjs
   ```
   This regenerates `src/data/photos.ts` with the full typed list.
4. Reload the dev server — the new photo now appears in the gallery under the category you assigned, and in the lightbox navigation.

To **exclude** a photo that's in `Photos_K/`, just omit it from `META` — the generator will skip it and log a warning.

**Valid categories** (`src/types.ts`): `Family Keepsakes`, `Nameplates`, `Coasters`, `Ornaments`, `Keychains`, `Devotional`, `Milestones`, `Wall Art`, `Home & Kitchen`, `Pet Keepsakes`. Add a new one by editing `PhotoCategory` in `src/types.ts` and the `CATEGORY_ORDER` array in `scripts/generate-photos-ts.mjs`.

### Choosing the hero photos

The four collage images on the hero are selected by slug in **`src/components/Hero.tsx`** — look for `HERO_SLUGS`. The slug is the kebab-case version of the original filename (also written in `public/images/manifest.json`).

---

## Editing the biography and contact details

All editorial content lives in a single file: **`src/data/site.config.ts`**. Components do not hard-code anything — edit this file and reload.

```ts
export const site = {
  name: "KK Engravings",
  tagline: "Personalized Creations, Made to Remember",
  creator: "Kaundinya Kapila",

  biography: [
    "Paragraph 1 ...",
    "Paragraph 2 ...",        // add more paragraphs here — the About section handles any length
  ],

  contact: {
    email: "",                 // leave empty = form button disabled + "coming soon"
    whatsapp: "",              // full international, digits only, e.g. "15551234567"
  },

  social: {
    instagram: "",             // handle only, no "@"
    facebook: "",
    etsy: "",                  // shop slug
  },
};
```

Rules:
- Any **empty** value renders a **"Coming soon"** placeholder — never a fake link.
- The **Custom Requests** form's submit button is disabled while `contact.email` is empty.

---

## Project layout

```
src/
  components/      Nav, Hero, About, Gallery, Lightbox, Custom, Contact, Footer, BackToTop, Section
  data/            site.config.ts, photos.ts (generated)
  hooks/           useReveal, useScrollSpy, useReducedMotion
  App.tsx          composes the page
  main.tsx         React entry + font imports
  index.css        Tailwind v4 + theme tokens + reveal/float keyframes
  types.ts         Photo + PhotoCategory types

scripts/
  process-images.mjs       Photos_K -> public/images (WebP x2 sizes)
  generate-photos-ts.mjs   manifest + per-source metadata -> src/data/photos.ts

Photos_K/          Originals — NEVER modified or committed to dist
public/
  favicon.svg      Serif K monogram
  images/          Generated WebP + manifest.json (gitignored)
```

---

## Notes

- **Privacy for the creator (a minor):** no school, city, address, personal phone, or personal photo of Kaundinya appears anywhere on the site. All personal context is limited to what's in `site.config.ts`.
- **Accessibility:** semantic landmarks, logical heading order, skip-to-content link, visible focus rings, keyboard-navigable lightbox (Esc closes, ← →  navigate, focus is trapped and returned on close), swipe gestures on mobile.
- **Reduced motion:** all animations collapse when `prefers-reduced-motion: reduce` is set.
- **No analytics, backend, or cart** — the inquiry form opens a `mailto:` link in the visitor's email client.

