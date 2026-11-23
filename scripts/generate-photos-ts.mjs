// Reads public/images/manifest.json + a static per-source metadata table,
// writes src/data/photos.ts (typed, ordered). Run after `npm run images` whenever
// the source set changes:   node scripts/generate-photos-ts.mjs
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST = path.join(ROOT, "public", "images", "manifest.json");
const OUT = path.join(ROOT, "src", "data", "photos.ts");

// source filename -> { title, category, alt }
// Omit a source filename here to exclude that photo from the site.
const META = {
  "1760451020300.jpg": { title: "“Appa” Elephant Family Puzzle", category: "Family Keepsakes", alt: "Framed wooden elephant family puzzle with the word Appa above and smaller elephants labeled with family names." },
  "IMG-20250808-WA0004.jpg": { title: "Kamakshi & Kalyani Round Signs", category: "Nameplates", alt: "Two round wooden name signs reading Kamakshi and Kalyani with engraved floral wreaths, resting on a tray near a small plant." },
  "IMG-20251125-WA0010.jpg": { title: "“K · Kalyan” Leather Luggage Tag", category: "Nameplates", alt: "Tan leather luggage tag engraved with a large letter K and the name Kalyan inside a laurel wreath." },
  "IMG-20251125-WA0012.jpg": { title: "Ugly-Sweater Family Ornaments", category: "Ornaments", alt: "Four wooden Christmas sweater ornaments personalized with the names Dhanvi, Neelima, Kaathyayini, and Kaundinya, hanging on a lit tree." },
  "IMG-20251130-WA0009.jpg": { title: "“Family” Bear Puzzle", category: "Family Keepsakes", alt: "Framed wooden sign reading Family with a cursive title and a bear family puzzle engraved with the names Mounika, Saranika, Vraj, and Vijay, sitting in grass." },
  "IMG_1292.JPG": { title: "“Varun, Sports Minister of Hadley”", category: "Nameplates", alt: "Light-wood engraved plaque reading Varun Sports Minister of Hadley with a paddleball and bicycle icon, beside a potted succulent." },
  "IMG_1295.JPG": { title: "Wooden Globe Wall Piece", category: "Wall Art", alt: "Layered wooden wall art featuring an abstract world and bird motif in natural plywood tones." },
  "IMG_1341.JPG": { title: "Buddha Idol with “Hadrian” Nameplate", category: "Devotional", alt: "Carved wooden Buddha figurine paired with a cursive Hadrian nameplate on a white background." },
  "Keychain.jpg": { title: "Script-Name Keychains Collection", category: "Keychains", alt: "A rustic wooden surface arrayed with cursive-script name keychains including Hadrian, Nora, Alan, Pooja, Rahm, Anagha, and Isabella." },
  "Nardo_s Coaster.jpg": { title: "“The Nando Family” Marble + Walnut Hexagon", category: "Coasters", alt: "Hexagonal coaster with white marble on top and walnut wood below, engraved with The Nando Family and a laurel wreath." },
  "one.jpg": { title: "“Nadendla” Elephant Family Puzzle", category: "Family Keepsakes", alt: "Framed wood sign reading Nadendla with a hand-painted elephant family puzzle labeled Nanna, Amma, Anirudh, and Akshith." },
  "original_21d4f7bf-1a1a-4cae-ba2b-c3079caaaf55_PXL_20260126_225639459.NIGHT.jpg": { title: "“Potturi” Family Trio · Puzzle, Hand Circle & Keychain", category: "Family Keepsakes", alt: "Three personalized Potturi family gifts on a teal cloth: a circular hand-holding engraving, a Rithikaa keychain, and a framed elephant family puzzle." },
  "original_388b8154-8aed-4270-b402-270a03d2e0ca_PXL_20251217_033112575.jpg": { title: "Bonsai Lovers Group Badges", category: "Nameplates", alt: "Two wooden badges reading Bonsai Lovers Group Sailaja Kapila with engraved bonsai tree artwork." },
  "PXL_20240723_215743241.MP.jpg": { title: "“KA Studios” Slate Coaster · Alt Angle", category: "Coasters", alt: "Dark slate coaster laser-etched with a KA Studios logo, photographed from a second angle." },
  "PXL_20240723_215800447.MP.jpg": { title: "“KA Studios” Slate Coaster", category: "Coasters", alt: "Square dark slate coaster laser-etched with a KA Studios logo, resting on crinkled kraft packaging." },
  "PXL_20240727_001158286.jpg": { title: "Yelagandula Monogram Slate Coaster", category: "Coasters", alt: "Round dark slate coaster engraved with a large letter Y and the name Yelagandula framed by leaves." },
  "PXL_20240824_182850731.jpg": { title: "“Kaundinya” Script Nameplate", category: "Nameplates", alt: "Black rectangular tag with a raised light-wood cursive engraving of the name Kaundinya." },
  "PXL_20240902_235129690.jpg": { title: "“A · Alison” Monogram Slate Coaster", category: "Coasters", alt: "Round dark slate coaster engraved with a large letter A over the name Alison surrounded by floral vines." },
  "PXL_20241219_044209400.PORTRAIT.jpg": { title: "“Manu” Poem Ornament", category: "Ornaments", alt: "Round wooden Christmas ornament engraved with a poem for Manu, hanging in front of a plush Santa figure." },
  "PXL_20241219_214457372.jpg": { title: "“Scarlet” Snowflake Bauble", category: "Ornaments", alt: "Light wood circular bauble reading Scarlet with laser-cut snowflakes, hanging on a Christmas tree beside a gold ornament." },
  "PXL_20241220_194910438.MP.jpg": { title: "“Kade” Snowflake Bauble", category: "Ornaments", alt: "Wooden circular Kade ornament with snowflake cutouts hanging on a Christmas tree with warm fairy lights." },
  "PXL_20241220_202205469.MP~3.jpg": { title: "Snowflake Bauble Set (9 Names)", category: "Ornaments", alt: "Nine wooden snowflake ornaments arranged in two rows, personalized with the names Aiden, Scarlett, Harper, Everett, Evelyn, Lidia, Maverick, Ava, and Kade." },
  "PXL_20241220_205745032.MP~3.jpg": { title: "Snowflake Bauble Set (5 Names)", category: "Ornaments", alt: "Five wooden snowflake baubles in a row, personalized with the names Mishika, Yuvan, Ronak, Ruhin, and Riona." },
  "PXL_20250204_135314324.MP.jpg": { title: "“ONEderful” First-Birthday Slate Pair", category: "Milestones", alt: "Two matching dark slate plaques reading Thank You For Making My Birthday ONEderful, from Kaathyayini, dated 7/9/24." },
  "PXL_20250210_022033451.MP~2.jpg": { title: "Bear Family Puzzle · Amma, Nanna, Kaathyayini & Kaundinya", category: "Family Keepsakes", alt: "Light wood interlocking bear family puzzle with a red heart, engraved with Amma, Nanna, Kaathyayini, and Kaundinya." },
  "PXL_20250405_060244840.jpg": { title: "“Hadrian” Dinosaur Shadow Box + Keychains", category: "Nameplates", alt: "Framed shadowbox spelling HADRIAN in bold red-outlined letters filled with dinosaur silhouettes, paired with cursive Praju and Snigdha keychains." },
  "PXL_20250411_201822209.PORTRAIT.ORIGINAL.jpg": { title: "“KAUNDINYA” Sports-Themed Block Letters", category: "Nameplates", alt: "Oversized block letters spelling KAUNDINYA, each letter filled with sports graphics including soccer, football, and team logos on a red and dark backdrop." },
  "PXL_20250412_132523460.PORTRAIT.ORIGINAL.jpg": { title: "Tree-of-Life Slate Coaster", category: "Coasters", alt: "Square dark slate coaster engraved with a detailed Tree of Life design." },
  "PXL_20250412_133202408.PORTRAIT.ORIGINAL.jpg": { title: "“K · Kapilas” Ornate Monogram Slate", category: "Coasters", alt: "Square dark slate coaster engraved with an ornate decorative letter K over the family name Kapilas." },
  "PXL_20250419_014533954.PORTRAIT.jpg": { title: "Name Keychains with Buddha Idol", category: "Keychains", alt: "A smiling carved wooden Buddha idol behind rows of cursive wood keychains reading Aishani, Abhirami, Amoolya, Agastya, Nivaan, Atulith, Samanvi, and Shourya." },
  "PXL_20250419_015305351.MP.jpg": { title: "Large Collection of Script Keychains", category: "Keychains", alt: "Dozens of cursive wooden name keychains laid out in rows with metal clasps, each engraved with a different personalized name." },
  "PXL_20250421_000314689.MP.jpg": { title: "“Una” Script Keychain + Oval Variants", category: "Keychains", alt: "A large cursive Una keychain at the top with three oval Una pendants below in light and dark wood." },
  "PXL_20250426_200542845.jpg": { title: "“Hello World” Birth Announcement Disc", category: "Milestones", alt: "Round wood plaque reading Hello World, personalized with name Dante Blayze Valentino Cooke, date Oct 1 2019, weight 6 oz, time 1:34 AM, height 8 inches, with baby feet and hand graphics." },
  "PXL_20250426_200623528.jpg": { title: "Birth Announcement Disc · Close-Up", category: "Milestones", alt: "Close-up of the Hello World birth announcement wood disc showing the engraved name Dante Blayze Valentino Cooke and birth details." },
  "PXL_20250504_013201633.PORTRAIT~2.jpg": { title: "“Congrats Sakya” Graduation Plaque", category: "Milestones", alt: "Rectangular wood plaque being held, engraved Congrats Sakya with a graduation cap and an encouraging message from Your Family." },
  "PXL_20250928_151402794.jpg": { title: "Durga Devi Name Keychains (Set of 9)", category: "Devotional", alt: "Nine wooden keychains in a row, each engraved with the face of Durga Devi and personalized with a different name including Aishani, Abhirami, Amoolya, Niharika, Sloka, Disha, Samanvi, Aadya, and Kridha." },
  "PXL_20251101_222606965.PORTRAIT.jpg": { title: "“The Yadavalli Family” Nameplate", category: "Family Keepsakes", alt: "Large white rectangular nameplate with raised black cursive script reading The Yadavalli Family, accented by a small wooden elephant family and beside a stone Ganesha figurine." },
  "PXL_20251128_213825938~2.jpg": { title: "Paw-Print Pet Ornaments", category: "Pet Keepsakes", alt: "Four light wood paw-print ornaments with snowflake cutouts, personalized with the pet names Bear, Canyon, Ruby, and Re-Annah." },
  "PXL_20251201_013926763.PORTRAIT.jpg": { title: "“Chandra’s Kitchen” Engraved Spatulas", category: "Home & Kitchen", alt: "Pair of dark wooden kitchen spatulas with handles engraved Chandra’s Kitchen alongside a mandala and decorative leaf motif." },
  "PXL_20251206_185854801~3.jpg": { title: "Cocoa Mug, Sweater & Beanie Ornaments", category: "Ornaments", alt: "Four wooden Christmas ornaments shaped like a cocoa mug, sweaters, and a beanie, personalized with the names Vijay, Mounika, Viraj, and Saranika." },
  "PXL_20251206_192152250.PORTRAIT.ORIGINAL.jpg": { title: "Lord Shiva Name Keychain Batch", category: "Devotional", alt: "A group of wooden keychains each engraved with an image of Lord Shiva and personalized names of family members." },
  "PXL_20251206_192331330.PORTRAIT.ORIGINAL.jpg": { title: "Lord Shiva Keychains in Red Presentation Box", category: "Devotional", alt: "Eight wooden Lord Shiva keychains presented in a red-cloth-lined gift box, each labeled with a different family name." },
  "PXL_20251214_014445258.jpg": { title: "Ugly-Sweater Ornaments (5 Names)", category: "Ornaments", alt: "Five wooden ugly-sweater Christmas ornaments on red strings, personalized with the names Kishore, Ramya, Vishwak, Chinu, and Srivarshika." },
  "PXL_20251216_000312017~2.jpg": { title: "Family-Name Christmas Baubles (8 Families)", category: "Ornaments", alt: "Eight round wooden Christmas baubles engraved with family surnames including Huber, Quach, Deraje, Mukherjee, Hayes, Billington, Kuester, and Lesinski, with sleigh or snow-covered motifs." },
  "PXL_20251219_125918327.jpg": { title: "Teacher Appreciation Ornament Set (8)", category: "Ornaments", alt: "Eight rectangular layered wood ornaments personalized for teachers with colorful backing and names such as Mr. Karnowski, Mr. Dunavant, Mr. Lehman, Mrs. O’Malley, Coach Kistler, Mrs. Kronitz, Mrs. Katie, and Mr. D." },
  "PXL_20251219_130153169~2.jpg": { title: "Teacher Ornaments for Kistler, Mr. D & Lehman", category: "Ornaments", alt: "Three rectangular wooden teacher ornaments featuring Coach Kistler with a tree, Mr. D with a reindeer, and Mr. Lehman with snowflakes, resting on a red sweater." },
  "PXL_20251219_130212788.jpg": { title: "Teacher Ornaments for Kronitz, Dunavant & Katie", category: "Ornaments", alt: "Three rectangular teacher ornaments personalized for Mrs. Kronitz, Mr. Dunavant, and Mrs. Katie, resting on a knitted red sweater." },
  "PXL_20251219_130236511.jpg": { title: "Teacher Ornaments for Dunavant, Karnowski & O’Malley", category: "Ornaments", alt: "Three teacher appreciation ornaments for Mr. Dunavant, Mr. Karnowski, and Mrs. O’Malley on a red sweater background." },
  "PXL_20251219_130639148~2.jpg": { title: "Teacher Sweater & Mug Trio", category: "Ornaments", alt: "Three teacher ornaments shaped like a Christmas sweater for Mr. D, a cocoa mug for Coach Kistler, and a snowflake sweater for Mrs. O’Malley on a red background." },
  "PXL_20251219_131635184~2.jpg": { title: "Snowman Scene Ornament Set (7 Names)", category: "Ornaments", alt: "Seven round wooden ornaments engraved with a snowman and pine tree scene, personalized with names Riona, Noori, Ahana, Yuvan, Ruhin, Mishika, and Ronak." },
  "PXL_20260218_022733606.jpg": { title: "“Maiyur’s 1st Birthday” Peacock Keychains", category: "Milestones", alt: "Two rectangular wood keychains on metal rings, one engraved Maiyur’s 1st Birthday and the other with an ornate peacock motif, resting on a purple fabric with gold embroidery." },
  "PXL_20260218_133551672.jpg": { title: "“New York” Skyline Two-Panel Wall Art", category: "Wall Art", alt: "Two black rectangular wall panels forming a continuous New York skyline cutout in natural wood, with the Statue of Liberty and tall buildings." },
  "PXL_20261018_143138737.MP.jpg": { title: "Durga Face Keychain Collection", category: "Devotional", alt: "A grouping of ornately carved wooden Durga Devi face keychains personalized with names such as Disha and Sreshta." },
  "PXL_20261018_143200900.PORTRAIT.jpg": { title: "“Samanvi” Durga Keychain Close-Up", category: "Devotional", alt: "Close-up of a wooden Durga Devi face keychain with ornate carved halo and the name Samanvi on the flat base tag." },
  "PXL_20261018_143207001.PORTRAIT.jpg": { title: "“Sreshta” Durga Keychain Close-Up", category: "Devotional", alt: "Detailed wooden keychain carved with a Durga Devi face and the name Sreshta on the base tag." },
  "PXL_20261018_143229419.PORTRAIT.jpg": { title: "“Disha” Durga Keychain", category: "Devotional", alt: "A wooden Durga Devi face keychain hanging in front of a softly blurred indoor background, personalized with the name Disha." },
  "PXL_20261018_143307446.PORTRAIT.jpg": { title: "“Disha” Durga Keychain Held", category: "Devotional", alt: "A fingertip holds up a wooden Durga Devi face keychain engraved with the name Disha." },
  "Screenshot_20250209-215032~2.png": { title: "Mini Animal Keychain Collection", category: "Keychains", alt: "A grid of tiny wooden animal keychains including hedgehogs, cats, elephants, and squirrels, each attached to a key ring." },
  "Screenshot_20250217-130945.png": { title: "Hand-Holding Family Circle", category: "Family Keepsakes", alt: "Round wooden plaque engraved with a line drawing of an adult hand holding a baby’s hand, surrounded by green plants." },
  "Screenshot_20250218-210442.png": { title: "“Frank & Jenna” Mountain Ornament", category: "Milestones", alt: "Round wooden ornament with layered pine trees and mountains, engraved Let The Adventure Begin Frank & Jenna Established 2023." },
  "Screenshot_20250218-212339.png": { title: "“Elizabeth & Jonathan” Engagement Plaque", category: "Milestones", alt: "Rectangular wooden plaque with a layered mountain and pine scene, engraved Our Adventure Awaits Elizabeth & Jonathan Engaged 2024." },
  "Screenshot_20250218-212455.png": { title: "“Amela + Josh” Reindeer Couple", category: "Ornaments", alt: "Round wooden ornament of two reindeer facing each other with a small heart above and the engraving Amela + Josh 2023." },
  "Screenshot_20250218-212655.png": { title: "“Kathrine & Alexander” Lovebirds Art", category: "Wall Art", alt: "Framed wooden art piece showing two silhouetted birds on a branch under a small red heart, engraved Kathrine & Alexander." },

  // --- Added in the 2nd batch (new photos uploaded to Photos_K) ---
  "20241219_071019-COLLAGE.jpg": { title: "Family Ornament Collage · Bagav Mama, Achu, Manu & Vikku", category: "Ornaments", alt: "Collage of four wooden Christmas ornaments personalized with heartfelt messages for Bagav Mama, Achu, Manu, and Vikku, hanging on a lit tree." },
  "20241219_171239-COLLAGE.jpg": { title: "Scarlet & Evelyn Baubles · Polaroid Collage", category: "Ornaments", alt: "Two wooden snowflake ornaments personalized Scarlet and Evelyn, styled as polaroid photographs over a soft paper background with hand-drawn flowers." },
  "20251008_092348.jpg": { title: "Bear Family Puzzle · Pavan, Elly, Nora, Isabel & Rocket", category: "Family Keepsakes", alt: "Framed wooden bear family puzzle with a red heart, engraved with the names Pavan, Elly, Nora, Isabel, and Rocket, propped outdoors against a brick wall." },
  "20251008_092421.jpg": { title: "Bear Family Puzzle · Sara, Kiran, Rahm & Alon", category: "Family Keepsakes", alt: "Framed wooden bear family puzzle with a red heart, engraved with the names Sara, Kiran, Rahm, and Alon, displayed outdoors against a wood post." },
  "IMG-20251130-WA0001.jpg": { title: "“Ms. Amita” Teacher Thank-You Plaque", category: "Milestones", alt: "Framed white-and-navy wooden plaque reading Ms. Amita, Big hearts shape little minds, Thank you for helping me grow, from Kaathyayini K., 2024-2025, with a small cutout figure holding a heart." },
  "IMG_1166.CR3.jpg": { title: "“First Trip Around the Sun” · Kaathyayini’s Birthday Slate", category: "Milestones", alt: "Square dark slate coaster engraved with a radiant sun and the text First Trip Around the Sun, dated 07/09/23, celebrating Kaathyayini’s Birthday." },
  "PXL_20240618_194557596.jpg": { title: "“#1 Dad” Insulated Tumbler", category: "Home & Kitchen", alt: "Tall white insulated tumbler engraved with a #1 Dad medallion design, displayed on a wooden surface." },
  "PXL_20240705_235513124.jpg": { title: "“Ashwath” Chennai Super Kings Bottle", category: "Home & Kitchen", alt: "Tall blue aluminum water bottle engraved with the cursive name Ashwath, a Real Madrid crest, and a Chennai Super Kings lion logo." },
  "PXL_20241220_194630937.MP.jpg": { title: "“Lidia” Snowflake Bauble", category: "Ornaments", alt: "Wooden circular Lidia ornament with snowflake cutouts hanging on a Christmas tree with warm fairy lights." },
  "PXL_20241220_195040934.MP.jpg": { title: "“Everett” Snowflake Bauble", category: "Ornaments", alt: "Wooden circular Everett ornament with snowflake cutouts hanging on a lit Christmas tree." },
  "PXL_20250210_215749706.MP~3.jpg": { title: "Valentine’s Animal Tokens Collection", category: "Keychains", alt: "A dozen small laser-cut wood animal tokens including a sloth, monkey, cat, dinosaur, raccoon, giraffe, and others, several holding small red hearts." },
  "PXL_20250321_021323243.jpg": { title: "“Maiyur Krishna” Birth Announcement Disc", category: "Milestones", alt: "Large round wooden plaque engraved with an ornate letter M featuring a Krishna flute and peacock feather, over Born Feb 24th 2025 3:12 am, Weight 5lb, Height 18.5 inches, and the name Maiyur Krishna, with traditional Indian artwork in the background." },
  "PXL_20251219_130554466~2.jpg": { title: "Teacher Sweater Ornaments · Kronitz, O’Malley, Dunavant & Lehman", category: "Ornaments", alt: "Four wooden Christmas sweater ornaments personalized with the teacher names Mrs. Kronitz, Mrs. O’Malley, Mr. Dunavant, and Mr. Lehman, arranged on a red knitted sweater background." },
  "Screenshot_20250217-125534~2.png": { title: "“Mum, You Are the Piece That Holds Us Together” Puzzle Plaque", category: "Family Keepsakes", alt: "Framed wooden plaque reading Mum You Are The Piece That Holds Us Together, with an interlocking puzzle piece arrangement engraved with the names Dad, Mum, Jack, Carol, and Arlene." },
  "Screenshot_20250218-210523.png": { title: "“Kaitlyn & Michael” Engaged 2023 Mountain Ornament", category: "Milestones", alt: "Round wooden ornament with a layered mountain and tree scene, engraved Our Adventure Awaits Kaitlyn & Michael Engaged 2023." },
  "mt-rainier-wallpiece~2.jpg": { title: "“Mt. Rainier, WA” Layered Wall Piece", category: "Wall Art", alt: "Wide layered wall art piece showing the Mount Rainier mountain silhouette rising above a dark pine-tree treeline, labeled Mt. Rainier WA." },

  // Excluded as near-duplicates of already-listed pieces (user prefers one canonical shot per item):
  // "PXL_20240723_215743241.MP.jpg":   variant of the KA Studios coaster (and shows a bare foot).
  // "PXL_20240727_001158968.jpg":      close-up variant of the Yelagandula slate coaster.
  // "PXL_20240902_235109034.MP.jpg":   top-down variant of the A-Alison slate coaster.
  // "PXL_20241219_214447775.jpg":      variant of the Scarlet snowflake bauble.
  // "PXL_20250412_133044961.PORTRAIT.ORIGINAL.jpg": variant of the Tree-of-Life slate coaster.

  // Excluded for privacy (a face is reflected in the shadowbox glass):
  // "PXL_20250405_060234114.jpg":  alternative HADRIAN shadowbox shot.

  // Excluded per Phase 1 flag F3 (looks like a vendor/stock shot, not creator's work):
  // "width_800.jpg":  intentionally omitted
  // "width_722.png":  intentionally omitted (same filename convention as width_800)

  // Excluded per Phase 1 flag F1 (file failed HEIC decode, cannot verify content):
  // "20251008_092422.heic":  intentionally omitted
};

const manifest = JSON.parse(await readFile(MANIFEST, "utf8"));
const entries = [];
const missing = [];

for (const item of manifest) {
  const m = META[item.source];
  if (!m) {
    missing.push(item.source);
    continue;
  }
  entries.push({
    slug: item.slug,
    title: m.title,
    category: m.category,
    alt: m.alt,
    thumb: item.thumb,
    full: item.full,
    width: item.width,
    height: item.height,
  });
}

// Order: display-friendly categories first, then by slug.
const CATEGORY_ORDER = [
  "Family Keepsakes", "Nameplates", "Coasters", "Ornaments",
  "Keychains", "Devotional", "Milestones", "Wall Art",
  "Home & Kitchen", "Pet Keepsakes",
];
entries.sort((a, b) => {
  const ai = CATEGORY_ORDER.indexOf(a.category);
  const bi = CATEGORY_ORDER.indexOf(b.category);
  if (ai !== bi) return ai - bi;
  return a.slug.localeCompare(b.slug);
});

const body =
  "// GENERATED by scripts/generate-photos-ts.mjs. Do not edit by hand.\n" +
  "// Re-run after `npm run images`:   node scripts/generate-photos-ts.mjs\n" +
  'import type { Photo } from "../types";\n\n' +
  "export const photos: readonly Photo[] = " +
  JSON.stringify(entries, null, 2) +
  " as const;\n";

await writeFile(OUT, body, "utf8");
console.log(`Wrote ${entries.length} entries to ${OUT}`);
if (missing.length) {
  console.log(`\nSkipped ${missing.length} manifest entries (no metadata):`);
  for (const s of missing) console.log("  -", s);
}
