import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const output = resolve("../docs/javaroadmap_lab/artifacts");

test.afterAll(async () => {
  await mkdir(resolve(output, "screenshots"), { recursive: true });
  const files = (await readdir(resolve(output, "screenshots")))
    .filter((name) => /^[a-z-]+-\d+-(light|dark)\.png$/.test(name))
    .sort();
  await writeFile(
    resolve(output, "gallery.html"),
    `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>JavaRoadmap Lab · 真实截图</title><style>body{font:16px/1.8 system-ui;background:#f5f4ef;color:#202f34;padding:24px;max-width:1500px;margin:auto}h1{font-size:32px}main{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:24px}figure{margin:0}img{max-width:100%;height:auto;border:1px solid #dce0d6}figcaption{overflow-wrap:anywhere}a{color:inherit}</style><h1>JavaRoadmap Lab · 真实浏览器截图</h1><p>六种视口、双主题与实际交互状态。文件名包含页面、宽度与主题；点击查看原尺寸。截图由 Playwright 重新运行生成，不属于学习者完成证据。</p><main>${files.map((name) => `<figure><a href="screenshots/${name}"><img loading="lazy" src="screenshots/${name}" alt="${name}"></a><figcaption>${name}</figcaption></figure>`).join("")}</main></html>`,
    "utf8",
  );
});
const viewports = [
  [1440, 900],
  [1280, 800],
  [1024, 768],
  [768, 1024],
  [390, 844],
  [360, 760],
];
const pages = [
  ["home", "#/home"],
  ["roadmap", "#/roadmap"],
  ["lesson", "#/lesson/day02"],
  ["lab", "#/lab/scores"],
  ["review", "#/review"],
  ["prediction", "#/practice/A1"],
];

for (const [width, height] of viewports) {
  for (const theme of ["light", "dark"] as const) {
    test(`真实渲染与 AA 扫描 ${width}x${height} ${theme}`, async ({
      page,
    }, testInfo) => {
      test.setTimeout(180_000);
      await page.setViewportSize({ width, height });
      await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
      await mkdir(resolve(output, "screenshots"), { recursive: true });
      const results = [];
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      for (const [name, route] of pages) {
        await page.goto(`/${route}`);
        await expect(page.locator("main h1").first()).toBeVisible();
        await expect(page.locator(".topbar .save-status")).toContainText(
          "已保存到此浏览器",
        );
        if (name === "lab" && width >= 768)
          await expect(page.getByTestId("monaco-editor")).toBeVisible();
        await page.evaluate(() => document.fonts.ready);
        const overflow = await page.evaluate(() => ({
          window: innerWidth,
          document: document.documentElement.scrollWidth,
          offenders: [...document.querySelectorAll<HTMLElement>("body *")]
            .filter(
              (node) =>
                node.getBoundingClientRect().right > innerWidth + 1 &&
                getComputedStyle(node).position !== "fixed",
            )
            .map((node) => ({ tag: node.tagName, class: node.className }))
            .slice(0, 12),
        }));
        const scan = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze();
        const violations = scan.violations.map((item) => ({
          id: item.id,
          impact: item.impact,
          help: item.help,
          nodes: item.nodes.map((node) => ({
            target: node.target,
            summary: node.failureSummary,
          })),
        }));
        results.push({ name, width, height, theme, overflow, violations });
        await page.screenshot({
          path: resolve(output, `screenshots/${name}-${width}-${theme}.png`),
          animations: "disabled",
          fullPage: false,
        });
      }
      await writeFile(
        resolve(output, `audit-${width}-${theme}.json`),
        JSON.stringify({ results, errors }, null, 2),
      );
      await testInfo.attach("visual-audit", {
        body: JSON.stringify(results, null, 2),
        contentType: "application/json",
      });
      expect(errors).toEqual([]);
      expect(results.filter((item) => item.overflow.document > width)).toEqual(
        [],
      );
      expect(
        results.flatMap((item) =>
          item.violations.map((violation) => ({
            page: item.name,
            ...violation,
          })),
        ),
      ).toEqual([]);
    });
  }
}

test("放大排版、减少动态效果和键盘标签导航", async ({ page }) => {
  await page.setViewportSize({ width: 720, height: 450 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#/practice/A1");
  await expect(page.locator("main h1")).toBeVisible();
  await page.getByRole("tab", { name: /输出预测/ }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: /条件修改/ })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(
    await page.evaluate(
      () =>
        getComputedStyle(document.querySelector("button")!).transitionDuration,
    ),
  ).toBe("0s");
});

test("实际课程提示抽屉与手机编辑区截图", async ({ page }) => {
  await mkdir(resolve(output, "screenshots"), { recursive: true });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto("/#/lab/scores");
  await page.getByRole("button", { name: /^课程辅导/ }).click();
  const dialog = page.getByRole("dialog", { name: "课程辅导" });
  await dialog.getByRole("button", { name: /^解锁 L1/ }).click();
  await dialog.getByRole("button", { name: /^解锁 L2/ }).click();
  await expect(dialog.locator(".hint-step.unlocked")).toHaveCount(2);
  const dialogScan = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(dialogScan.violations).toEqual([]);
  await page.screenshot({
    path: resolve(output, "screenshots/tutor-1440-dark.png"),
    animations: "disabled",
  });
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/#/lab/scores");
  const editor = page.getByRole("textbox", { name: "Java 代码草稿" });
  await expect(editor).toBeVisible();
  await editor.scrollIntoViewIfNeeded();
  await page.screenshot({
    path: resolve(output, "screenshots/lab-editor-390-light.png"),
    animations: "disabled",
  });
});
