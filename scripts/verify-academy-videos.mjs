#!/usr/bin/env node
/**
 * Verifies every URL in lesson-videos.ts via YouTube oEmbed.
 * Usage: node scripts/verify-academy-videos.mjs
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = readFileSync(
  join(root, "src/app/_lib/crypto-mastery-course/lesson-videos.ts"),
  "utf8",
);

const urls = [...new Set(src.match(/https:\/\/www\.youtube\.com\/watch\?v=[a-zA-Z0-9_-]+/g) ?? [])];

async function check(url) {
  const oembed =
    "https://www.youtube.com/oembed?format=json&url=" + encodeURIComponent(url);
  const res = await fetch(oembed, { headers: { "User-Agent": "PhronisAcademy/1.0" } });
  if (!res.ok) return { url, ok: false, status: res.status };
  const data = await res.json();
  return { url, ok: true, title: data.title };
}

let failed = 0;
for (const url of urls) {
  const r = await check(url);
  if (r.ok) {
    console.log("OK", url, "—", r.title);
  } else {
    failed++;
    console.error("FAIL", url, r.status);
  }
}

console.log(`\n${urls.length} unique URLs, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
