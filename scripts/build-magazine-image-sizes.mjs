// Schreibt data/magazin-bilder.json: Breite und Höhe der Titelbilder (WebP) für media_details im WP-REST-Endpunkt.
// Aufruf nach neuen Titelbildern: node scripts/build-magazine-image-sizes.mjs
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";

const root = process.cwd();
const dir = join(root, "content", "magazin");

function webpSize(buffer) {
  if (buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WEBP") return null;
  const type = buffer.toString("ascii", 12, 16);
  if (type === "VP8X") return { width: 1 + buffer.readUIntLE(24, 3), height: 1 + buffer.readUIntLE(27, 3) };
  if (type === "VP8L") {
    const bits = buffer.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (type === "VP8 ") return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff };
  return null;
}

const result = {};
for (const file of readdirSync(dir).filter((name) => name.endsWith(".md") && !name.startsWith("_"))) {
  const { data } = matter(readFileSync(join(dir, file), "utf8"));
  if (!data.image || result[data.image]) continue;
  const path = join(root, "public", String(data.image));
  if (!existsSync(path)) continue;
  const size = webpSize(readFileSync(path));
  if (size) result[data.image] = { ...size, bytes: readFileSync(path).length };
}

const sorted = Object.fromEntries(Object.entries(result).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(join(root, "data", "magazin-bilder.json"), `${JSON.stringify(sorted, null, 2)}\n`);
console.log(`${Object.keys(sorted).length} Bilder`);
