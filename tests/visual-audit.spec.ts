import { test, expect } from "@playwright/test";

/**
 * Smoke/audit tests exercised against the Zudoku site: basic rendering,
 * navigation, typography, dark code blocks, markdown endpoints and the
 * LLM-friendly outputs.
 */

const SCREENSHOT_DIR = "screenshots";

test.describe("Homepage", () => {
  test("renders correctly", async ({ page }, testInfo) => {
    await page.goto("/");
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/home-${testInfo.project.name}.png`,
      fullPage: true,
    });

    // Hero title comes from the MDX, not from Zudoku's frontmatter-generated h1
    await expect(page.locator("h1.akg-hero-title")).toContainText("API Keys");

    // KeyAnatomy specimen is on the homepage
    await expect(page.locator("#key-segments")).toBeVisible();

    // Zudoku uses .prose / .typography on the article body
    await expect(page.locator(".typography").first()).toBeVisible();

    // Footer with copyright + Zuplo
    const footer = page.locator("footer").first();
    await expect(footer).toBeVisible();
    await expect(footer).toContainText("Zuplo");
  });

  test("all internal links on the homepage resolve", async ({ page }) => {
    await page.goto("/");
    const hrefs = new Set<string>();
    const count = await page.locator('main a[href^="/"]').count();
    for (let i = 0; i < count; i++) {
      const href = await page.locator('main a[href^="/"]').nth(i).getAttribute("href");
      if (href && !href.startsWith("/@")) hrefs.add(href.split("#")[0]);
    }
    for (const href of hrefs) {
      const resp = await page.request.get(href);
      expect(resp.status(), `GET ${href}`).toBeLessThan(400);
    }
  });
});

test.describe("Doc pages", () => {
  const slugs = [
    "/docs/security/hashing-and-storage",
    "/docs/implementation/key-generation",
    "/docs/best-practices/for-providers",
    "/docs/operations/logging-and-monitoring",
  ];

  for (const slug of slugs) {
    test(`${slug} renders`, async ({ page }, testInfo) => {
      await page.goto(slug);
      await page.screenshot({
        path: `${SCREENSHOT_DIR}/doc-${slug.replace(/\//g, "_")}-${testInfo.project.name}.png`,
        fullPage: true,
      });
      await expect(page.locator(".typography h1").first()).toBeVisible();
      // At least one h2 in the body
      expect(await page.locator(".typography h2").count()).toBeGreaterThanOrEqual(1);
    });
  }

  test("sidebar navigation highlights the active page on desktop", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "Desktop only");
    await page.goto("/docs/security/hashing-and-storage");
    // Zudoku marks the active nav link with aria-current="page". Use the
    // auto-retrying Playwright assertion so we wait for client hydration
    // (the dev server runs with --ssr false; see CLAUDE.md).
    await expect(page.locator('a[aria-current="page"]').first()).toBeAttached();
  });

  test("checkbox lists render in best practices", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "Desktop only");
    await page.goto("/docs/best-practices/for-providers");
    await expect(
      page.locator('.typography input[type="checkbox"]').first(),
    ).toBeAttached();
  });
});

test.describe("Typography + styling", () => {
  test("headings use Readex Pro, body uses DM Sans", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "Desktop only");
    await page.goto("/docs/security/hashing-and-storage");
    const h1Font = await page
      .locator(".typography h1")
      .first()
      .evaluate((el) => getComputedStyle(el).fontFamily);
    expect(h1Font).toContain("Readex Pro");
    const bodyFont = await page
      .locator("body")
      .evaluate((el) => getComputedStyle(el).fontFamily);
    expect(bodyFont).toContain("DM Sans");
  });

  test("code blocks have a dark background on light mode", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "Desktop only");
    await page.goto("/docs/implementation/key-generation");
    await page.evaluate(() => {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    });
    await page.waitForTimeout(200);
    const blocks = page.locator(".typography pre");
    const count = await blocks.count();
    expect(count).toBeGreaterThan(0);
    const bg = await blocks.first().evaluate((el) => getComputedStyle(el).backgroundColor);
    const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (m) {
      const [, r, g, b] = m.map(Number);
      expect(r + g + b).toBeLessThan(150);
    }
  });

  test("code blocks render as a single flat rectangle with proper padding", async ({ page }, testInfo) => {
    // Regression check for the Shiki/Zudoku wrapper problems:
    //  - nested "darker inner + lighter outer" appearance
    //  - missing padding (text flush against the left edge)
    //  - visible scrollbar stripe at the bottom
    //  - <code> painting itself white because Shiki's @layer base rule won
    test.skip(testInfo.project.name !== "desktop", "Desktop only");
    await page.goto("/docs/implementation/key-generation");
    await page.waitForTimeout(200);
    const data = await page.evaluate(() => {
      const pre = document.querySelector(".typography pre") as HTMLElement;
      if (!pre) return null;
      const code = pre.querySelector("code") as HTMLElement | null;
      const wrapper = pre.querySelector(".code-block-wrapper") as HTMLElement | null;
      return {
        preBg: getComputedStyle(pre).backgroundColor,
        prePaddingLeft: parseFloat(getComputedStyle(pre).paddingLeft),
        prePaddingTop: parseFloat(getComputedStyle(pre).paddingTop),
        codeBg: code ? getComputedStyle(code).backgroundColor : null,
        wrapperBg: wrapper ? getComputedStyle(wrapper).backgroundColor : null,
      };
    });
    expect(data, "expected at least one <pre>").not.toBeNull();
    // <pre> is dark in light mode
    const preRgb = data!.preBg.match(/\d+/g)!.slice(0, 3).map(Number);
    expect(preRgb[0] + preRgb[1] + preRgb[2]).toBeLessThan(150);
    // <pre> has real padding on both axes (>= 16px left, >= 12px top)
    expect(data!.prePaddingLeft).toBeGreaterThanOrEqual(16);
    expect(data!.prePaddingTop).toBeGreaterThanOrEqual(12);
    // <code> and .code-block-wrapper are transparent so there's no nested
    // lighter/darker rectangle visible on top of <pre>'s dark background.
    expect(data!.codeBg, "<code> must not paint a solid background").toMatch(/rgba?\([^)]*,\s*0\)/);
    if (data!.wrapperBg) {
      expect(data!.wrapperBg, ".code-block-wrapper must not paint a solid background").toMatch(/rgba?\([^)]*,\s*0\)/);
    }
  });

  test("code block scrollbar is hidden", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "Desktop only");
    await page.goto("/docs/implementation/key-generation");
    await page.waitForTimeout(200);
    const sw = await page.evaluate(() => {
      const pre = document.querySelector(".typography pre") as HTMLElement;
      return pre ? getComputedStyle(pre).scrollbarWidth : null;
    });
    expect(sw).toBe("none");
  });
});

test.describe("Agent endpoints", () => {
  // These only resolve in the production build output; in dev Zudoku serves
  // them as HTML. Tests auto-skip when running against `zudoku dev`.
  test("/docs/<slug>.md returns markdown", async ({ page }) => {
    const resp = await page.request.get("/docs/security/hashing-and-storage.md");
    test.skip(!resp.headers()["content-type"]?.includes("markdown"), "dev server (HTML)");
    expect(resp.status()).toBe(200);
    const body = await resp.text();
    expect(body).toContain("Hashing");
  });

  test("/llms.txt lists all 23 docs", async ({ page }) => {
    const resp = await page.request.get("/llms.txt");
    test.skip(!resp.headers()["content-type"]?.includes("plain"), "dev server (HTML)");
    expect(resp.status()).toBe(200);
    const body = await resp.text();
    const mdLinks = body.match(/\]\(\/[^)]*\.md\)/g) || [];
    expect(mdLinks.length).toBeGreaterThanOrEqual(23);
  });
});
