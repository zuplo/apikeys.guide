/**
 * IndexNow ping.
 *
 * Runs at the tail of `pnpm build` (invoked from scripts/postbuild.cjs).
 * Walks dist/sitemap.xml, extracts every <loc>, and submits the URL list
 * to https://www.bing.com/indexnow so Bing — which ChatGPT's browse tool
 * and several other LLM crawlers read from — discovers fresh content on
 * the same deploy rather than waiting for the next organic recrawl.
 *
 * Skipped when not running on Vercel production (VERCEL_ENV=production)
 * or when INDEXNOW_DISABLE is set, so local / preview builds don't
 * trigger unsolicited pings.
 *
 * Security note
 * -------------
 * The input to this script is dist/sitemap.xml, a file produced by our
 * own build. It is not remote or user-controlled, but we still treat
 * every <loc> as untrusted and:
 *
 *   1. Parse each candidate through `new URL(...)` so malformed strings
 *      fall out.
 *   2. Require `url.protocol === "https:"` and `url.hostname === HOST`
 *      (exact match — no "apikeys.guide.attacker.com" suffix games).
 *   3. Cap the number of URLs sent and the length of any single URL.
 *   4. Log only counts, never the URL strings themselves, so a future
 *      regression cannot leak internal paths into build logs.
 *
 * The wire destination is a hardcoded HTTPS URL on bing.com, not
 * derived from the filesystem input.
 */
const fs = require("node:fs");
const path = require("node:path");
const https = require("node:https");

const KEY = "a1979da5c9183f63b5a077bdd551d796";
const HOST = "apikeys.guide";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = "https://www.bing.com/indexnow";
// IndexNow accepts up to 10,000 URLs per submission. Our site has a few
// dozen pages, so cap well below that and treat the ceiling as a tripwire:
// if we ever submit more than this, something has gone wrong upstream
// (a sitemap regression, a bad merge) and we'd rather abort than flood.
const MAX_URLS = 500;
// Defensive per-URL length limit. IndexNow's own limit is 2048 chars;
// anything above a few hundred from our sitemap means something is off.
const MAX_URL_LENGTH = 512;

function shouldRun() {
  if (process.env.INDEXNOW_DISABLE === "1") return false;
  // On Vercel, skip preview / development builds; only ping on production.
  // VERCEL is unset locally, so local `pnpm build` is also a no-op.
  if (process.env.VERCEL && process.env.VERCEL_ENV !== "production") {
    return false;
  }
  // Local dev — don't hammer the IndexNow endpoint during iterative work.
  if (!process.env.VERCEL && process.env.INDEXNOW_FORCE !== "1") {
    return false;
  }
  return true;
}

function isAllowedUrl(candidate) {
  if (typeof candidate !== "string") return false;
  if (candidate.length === 0 || candidate.length > MAX_URL_LENGTH) return false;
  let parsed;
  try {
    parsed = new URL(candidate);
  } catch {
    return false;
  }
  // Protocol must be HTTPS and the host must match exactly — `startsWith`
  // would accept e.g. "https://apikeys.guide.attacker.com/", so require
  // a strict hostname equality check instead.
  if (parsed.protocol !== "https:") return false;
  if (parsed.hostname !== HOST) return false;
  // No auth, no non-standard port, no hash fragment — none of those belong
  // in a sitemap URL and their presence signals a malformed input.
  if (parsed.username || parsed.password) return false;
  if (parsed.port && parsed.port !== "443") return false;
  if (parsed.hash) return false;
  return true;
}

function readSitemapUrls() {
  const sitemap = path.join(__dirname, "..", "dist", "sitemap.xml");
  if (!fs.existsSync(sitemap)) {
    console.warn("indexnow: dist/sitemap.xml not found — skipping");
    return [];
  }
  const xml = fs.readFileSync(sitemap, "utf-8");
  const allowed = [];
  const rejected = [];
  const re = /<loc>\s*([^<\s]+)\s*<\/loc>/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const candidate = m[1];
    if (isAllowedUrl(candidate)) {
      // Re-serialise through URL so any surprising encoding in the
      // sitemap is normalised before we put it on the wire.
      allowed.push(new URL(candidate).toString());
    } else {
      rejected.push(candidate);
    }
  }
  if (rejected.length > 0) {
    // Log count only, not the rejected strings themselves, so a malformed
    // sitemap cannot leak its contents into build logs.
    console.warn(`indexnow: rejected ${rejected.length} non-conforming <loc> entries`);
  }
  return allowed;
}

function submit(urls) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: KEY_LOCATION,
      urlList: urls,
    });
    const req = https.request(
      ENDPOINT,
      {
        method: "POST",
        headers: {
          "content-type": "application/json; charset=utf-8",
          "content-length": Buffer.byteLength(body),
          "user-agent": "apikeys.guide-indexnow/1.0",
        },
      },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf-8");
          resolve({ status: res.statusCode ?? 0, body: text });
        });
      },
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  if (!shouldRun()) {
    console.log("indexnow: skipped (set INDEXNOW_FORCE=1 to run locally)");
    return;
  }
  const all = readSitemapUrls();
  if (all.length > MAX_URLS) {
    // Tripwire, not silent truncation — if the sitemap ever blows past
    // our cap, stop rather than submit a suspiciously large batch.
    console.warn(
      `indexnow: sitemap has ${all.length} URLs, above cap of ${MAX_URLS} — aborting submission`,
    );
    return;
  }
  if (all.length === 0) {
    console.warn("indexnow: no URLs to submit");
    return;
  }
  try {
    const { status, body } = await submit(all);
    console.log(`indexnow: submitted ${all.length} URLs — status ${status}`);
    // 200 / 202 are both successes. On anything else, log status only —
    // the response body may echo submitted URLs and we do not want those
    // in the build log.
    if (status !== 200 && status !== 202) {
      console.warn(
        `indexnow: unexpected status ${status} (response body length ${body.length})`,
      );
    }
  } catch (err) {
    // Never fail the build on an IndexNow error; this is best-effort.
    console.warn(`indexnow: ping failed — ${err instanceof Error ? err.message : err}`);
  }
}

main();
