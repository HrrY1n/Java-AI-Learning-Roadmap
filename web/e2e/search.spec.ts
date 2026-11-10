import { expect, test } from "@playwright/test";

// 深度重构 R5/R9：搜索正文索引的端到端验证。
// 标题命中优先、正文命中带上下文片段、仓库文档可达。
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("标题命中优先于正文命中", async ({ page }) => {
  await page.keyboard.press("Control+k");
  const input = page.getByRole("textbox", { name: "搜索课程与资料" });
  await expect(input).toBeVisible();
  await input.fill("ArrayList");
  const firstCategory = page.locator(".search-item").first();
  await expect(firstCategory).toContainText("ArrayList");
});

test("正文关键词命中课程并显示上下文片段", async ({ page }) => {
  await page.keyboard.press("Control+k");
  const input = page.getByRole("textbox", { name: "搜索课程与资料" });
  await expect(input).toBeVisible();
  // 「补码绕回」只出现在 day07 深度正文与源码里，不在任何标题或 summary 中
  await input.fill("补码绕回");
  const items = page.locator(".search-item");
  await expect(items.first()).toBeVisible();
  await expect(page.locator(".search-item").first()).toContainText("正文命中");
  // 命中课文的搜索结果应能跳转到对应课程
  const firstHref = await items.first().getAttribute("href");
  expect(firstHref).toMatch(/^#\/lesson\/(day07|s02-static-lifecycle)$/);
});

test("仓库文档入索引且可直达", async ({ page }) => {
  await page.keyboard.press("Control+k");
  const input = page.getByRole("textbox", { name: "搜索课程与资料" });
  await expect(input).toBeVisible();
  // 「IndexedDB」是仓库文档正文的独有词（课程正文零命中，正文命中排序不干扰）
  await input.fill("IndexedDB");
  const items = page.locator(".search-item");
  await expect(items.first()).toContainText("仓库文档");
  await items.first().click();
  // 「IndexedDB」正文首命中是使用指南（lab-user-guide）；直达后校验路由与页面标题
  await expect(page).toHaveURL(/#\/document\/lab-user-guide/);
  await expect(page.locator("main h1")).toBeVisible();
});
