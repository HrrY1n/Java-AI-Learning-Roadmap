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
  // 「格子越宽」只出现在 day07 深度正文/概念卡里，不在任何标题中
  await input.fill("格子越宽");
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
  // 「合并规则」是数据模型文档正文的独有词
  await input.fill("合并规则");
  const items = page.locator(".search-item");
  await expect(items.first()).toContainText("仓库文档");
  await items.first().click();
  await expect(page.getByRole("heading", { name: /数据模型|本地数据/ }).first()).toBeVisible();
});
