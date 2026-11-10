import { expect, test } from "@playwright/test";

// V2.2 P4/P5：连续正文展示、右侧脉络小节锚点、多包展示、Stage04 练习门禁与独立诊断集验证。
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("Stage 01/02/05 连续正文展示与右侧脉络目录锚点定位不被顶栏遮挡", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  // 1. Stage 01 day07：1 导读 + 长正文 + 代码 + 4 动手步骤
  await page.goto("/#/lesson/day07");
  await expect(page.getByRole("heading", { level: 1, name: "八种基本类型与溢出边界" })).toBeVisible();
  const tocBtn = page.locator(".margin-toc button", { hasText: "学习验收与自我检核" });
  await expect(tocBtn).toBeVisible();
  await tocBtn.click();
  await page.waitForTimeout(450);
  const targetH2 = page.locator(".lesson-deep-prose h2", { hasText: "学习验收与自我检核" });
  const box = await targetH2.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.y).toBeGreaterThanOrEqual(50);

  // 2. Stage 02 多包展示：App / Student / ExternalCaller / SubStudent
  await page.goto("/#/lesson/s02-static-lifecycle");
  await expect(page.locator(".lesson-code")).toHaveCount(4);
  await expect(page.locator(".lesson-article")).toContainText("SubStudent");
  await expect(page.locator(".lesson-article")).toContainText("ExternalCaller");

  // 3. Stage 05 MySQL 课程：连续正文、代码与跨 Stage 先修直达
  await page.goto("/#/lesson/s05-sql-basics");
  await expect(page.getByRole("heading", { level: 1, name: "SQL 基础、数据类型与约束" })).toBeVisible();
  await expect(page.locator(".lesson-deep-prose")).toContainText("MySQL 8.0.16");
  // 保存一份真实验证截图（落到 ignored 的 artifacts 目录）
  await page.screenshot({ path: "../docs/javaroadmap_lab/artifacts/v22-s05-lesson-desktop.png", fullPage: false });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "../docs/javaroadmap_lab/artifacts/v22-s05-lesson-mobile.png", fullPage: false });
});

test("Stage 04 并发练习 TODO 骨架与独立诊断集主动解锁门禁正常", async ({ page }) => {
  await page.goto("/#/lab/s04-thread-order");
  await expect(page.locator("main h1").first()).toBeVisible();
  await expect(page.getByText("任务背景")).toBeVisible();
  // L1 提示未解锁前不显示
  await expect(page.getByText("并发起跑 + 统一起点之后汇合")).toHaveCount(0);
  await page.getByRole("button", { name: "课程辅导" }).click();
  const dialog = page.getByRole("dialog", { name: "课程辅导" });
  await dialog.getByRole("button", { name: /解锁 L1/ }).click();
  await expect(dialog.getByText("并发起跑 + 统一起点之后汇合")).toBeVisible();
  await dialog.getByRole("button", { name: "关闭" }).first().click();

  // 独立诊断与迁移验证集：解析文件渲染为"主动解锁"按钮，不直接暴露正文
  await page.goto("/#/document/diagnostic-and-transfer");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("独立学习验证集");
  await expect(page.getByRole("button", { name: /参考解析与评判要点.*主动解锁/ }).first()).toBeVisible();
});
