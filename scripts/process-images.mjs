// Reads Photos_K/, outputs WebP thumbs (600w) + full (1600w) to public/images/.
// Applies EXIF rotation, strips ALL metadata (incl. GPS), decodes HEIC.
// Skips CR3 (raw) with a warning. Idempotent — skips files whose outputs exist.

import { readdir, mkdir, readFile, writeFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import heicConvert from "heic-convert";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\//, "")), "..");
const SRC = path.join(ROOT, "Photos_K");
const OUT = path.join(ROOT, "public", "images");
const META = path.join(ROOT, "public", "images", "manifest.json");

const SIZES = { thumb: 600, full: 1600 };
const SUPPORTED = new Set([".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"]);
const SKIP_EXT = new Set([".cr3", ".cr2", ".nef", ".arw", ".raf", ".dng"]);

function slugify(name) {
  const base = name.replace(/\.[^.]+$/, "");
  return base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function loadAsSharp(absPath, ext) {
  if (ext === ".heic" || ext === ".heif") {
    const buf = await readFile(absPath);
    const jpeg = await heicConvert({ buffer: buf, format: "JPEG", quality: 0.95 });
    return sharp(Buffer.from(jpeg));
  }
  return sharp(absPath, { failOnError: false });
}

async function processOne(file) {
  const ext = path.extname(file).toLowerCase();
  if (SKIP_EXT.has(ext)) {
    console.warn(`  skip (raw, unsupported): ${file}`);
    return null;
  }
  if (!SUPPORTED.has(ext)) {
    console.warn(`  skip (unknown ext): ${file}`);
    return null;
  }
  const slug = slugify(file);
  const absPath = path.join(SRC, file);
  const outThumb = path.join(OUT, `${slug}.thumb.webp`);
  const outFull = path.join(OUT, `${slug}.webp`);

  let img = await loadAsSharp(absPath, ext);
  img = img.rotate(); // bake EXIF orientation into pixels

  // Produce full-size WebP (strip all metadata by default — sharp strips unless withMetadata is called)
  const fullMeta = await img
    .clone()
    .resize({ width: SIZES.full, withoutEnlargement: true })
    .webp({ quality: 82, effort: 5 })
    .toFile(outFull);

  await img
    .clone()
    .resize({ width: SIZES.thumb, withoutEnlargement: true })
    .webp({ quality: 78, effort: 5 })
    .toFile(outThumb);

  return {
    source: file,
    slug,
    thumb: `/images/${slug}.thumb.webp`,
    full: `/images/${slug}.webp`,
    width: fullMeta.width,
    height: fullMeta.height,
  };
}

async function main() {
  const srcStat = await stat(SRC).catch(() => null);
  if (!srcStat) {
    console.error(`Source folder not found: ${SRC}`);
    process.exit(1);
  }
  await mkdir(OUT, { recursive: true });

  const files = (await readdir(SRC)).filter((f) => !f.startsWith("."));
  console.log(`Processing ${files.length} file(s) from ${SRC}`);
  console.log(`Output: ${OUT}\n`);

  const manifest = [];
  let skipped = 0;
  for (const f of files) {
    const outFull = path.join(OUT, `${slugify(f)}.webp`);
    if (existsSync(outFull)) {
      // Already processed — reuse existing dimensions for the manifest entry.
      const meta = await sharp(outFull).metadata();
      const slug = slugify(f);
      manifest.push({
        source: f,
        slug,
        thumb: `/images/${slug}.thumb.webp`,
        full: `/images/${slug}.webp`,
        width: meta.width ?? 0,
        height: meta.height ?? 0,
      });
      console.log(`  cached: ${f}`);
      continue;
    }
    try {
      const entry = await processOne(f);
      if (!entry) {
        skipped += 1;
        continue;
      }
      manifest.push(entry);
      console.log(`  ok:     ${f}  ->  ${entry.slug}.webp  (${entry.width}x${entry.height})`);
    } catch (err) {
      skipped += 1;
      console.error(`  ERROR:  ${f}  — ${err?.message ?? err}`);
    }
  }

  await writeFile(META, JSON.stringify(manifest, null, 2));
  console.log(`\nDone. ${manifest.length} processed, ${skipped} skipped.`);
  console.log(`Manifest: ${META}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
