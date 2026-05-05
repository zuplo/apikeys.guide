import { test, expect } from "@playwright/test";

/**
 * Zudoku ships its own shadcn-style theme toggle that writes the active
 * theme to localStorage under key "theme" and toggles the class between
 * "light" / "dark" on <html>. The toggle is a 3-state cycle (light → dark →
 * system) so we don't rely on clicking it — we set the state directly and
 * verify the custom palette kicks in.
 */

test.describe("Dark mode", () => {
  test("light mode uses our white background", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("theme", "light"));
    await page.goto("/");
    await expect(page.locator("html")).toHaveClass(/light/);
    const bg = await page.locator("body").evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).toBe("rgb(255, 255, 255)");
  });

  test("dark mode uses our #0f1117 background", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("theme", "dark"));
    await page.goto("/");
    await expect(page.locator("html")).toHaveClass(/dark/);
    const bg = await page.locator("body").evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg.replace(/\s+/g, "")).toBe("rgb(15,17,23)");
  });

  test("doc pages render in dark mode too", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("theme", "dark"));
    await page.goto("/docs/security/hashing-and-storage");
    await expect(page.locator("html")).toHaveClass(/dark/);
    // Code block background stays dark even in dark mode
    const preBg = await page
      .locator(".typography pre")
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    const m = preBg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (m) {
      const [, r, g, b] = m.map(Number);
      expect(r + g + b).toBeLessThan(150);
    }
  });
});
