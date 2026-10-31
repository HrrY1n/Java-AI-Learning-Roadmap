import { expect, test, type Page } from "@playwright/test";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import catalog from "../src/generated/catalog.json" with { type: "json" };
import { validateBackup } from "../src/lib/learning-store";

const output = resolve(process.env.LAB_ARTIFACT_DIR || "test-artifacts/pages-online");
const errors = new WeakMap<Page, string[]>();

test.beforeAll(async ({ request }) => {
  if (process.env.LAB_EXPECTED_SHA) {
    await expect.poll(async () => {
      try {
        const response = await request.get("deployment.json", {
          headers: { "Cache-Control": "no-cache" },
          params: { commit: process.env.LAB_EXPECTED_SHA! },
        });
        if (!response.ok()) return `HTTP ${response.status()}`;
        return ((await response.json()) as { commit: string }).commit;
      } catch {
        return "deployment not reachable";
      }
    }, { timeout: 120_000, intervals: [2_000, 5_000] }).toBe(process.env.LAB_EXPECTED_SHA);
  }
});

test.beforeEach(({ page, baseURL }) => {
  const failures: string[] = [];
  errors.set(page, failures);
  page.on("pageerror", (error) => failures.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") failures.push(message.text());
  });
  page.on("response", (response) => {
    if (response.url().startsWith(baseURL!) && response.status() >= 400)
      failures.push(`HTTP ${response.status()} ${response.url()}`);
  });
  page.on("requestfailed", (request) => {
    const reason = request.failure()?.errorText;
    if (request.url().startsWith(baseURL!) && reason !== "net::ERR_ABORTED")
      failures.push(`${reason} ${request.url()}`);
  });
  page.on("request", (request) => {
    if (!["GET", "HEAD"].includes(request.method()))
      failures.push(`Unexpected data upload: ${request.method()} ${request.url()}`);
  });
});

test.afterEach(async ({ page }, testInfo) => {
  await testInfo.attach("browser-errors", {
    body: JSON.stringify(errors.get(page)), contentType: "application/json",
  });
  expect(errors.get(page)).toEqual([]);
});

async function open(page: Page, route: string) {
  const response = await page.goto(`./#/${route}`);
  if (response) expect(response.ok()).toBe(true);
  await expect(page.locator("main h1")).toBeVisible();
}
async function saved(page: Page) {
  await expect(page.locator(".topbar .save-status")).toContainText("已保存到此浏览器");
}
async function editor(page: Page) {
  await expect(page.locator(".editor-mode")).toBeVisible();
  const toggle = page.getByRole("button", { name: "轻量编辑", exact: true });
  if (await toggle.isVisible()) await toggle.click();
  const field = page.getByRole("textbox", { name: "Java 代码草稿", exact: true });
  await expect(field).toBeVisible();
  return field;
}

test("正式子路径：首页、路线、目录与19节正式课程", async ({ page }) => {
  await open(page, "home");
  await page.getByRole("link", { name: "继续学习", exact: true }).click();
  await expect(page).toHaveURL(/#\/lesson\/day01$/);
  await page.getByRole("button", { name: "课程目录", exact: true }).click();
  await expect(page.locator(".chapter-picker").getByRole("link")).toHaveCount(19);
  expect(catalog.lessons).toHaveLength(19);
  expect(catalog.lessons.filter((lesson) => lesson.stageId === "01")).toHaveLength(13);
  expect(catalog.lessons.filter((lesson) => lesson.stageId === "02")).toHaveLength(6);
  for (const lesson of catalog.lessons) {
    await open(page, `lesson/${lesson.id}`);
    await expect(page.getByRole("heading", { level: 1, name: lesson.title, exact: true })).toBeVisible();
    await expect(page.locator(".lesson-code pre").first()).toContainText(
      lesson.stageId === "02"
        ? "package com.javaroadmap.stage02"
        : "package com.javaroadmap.stage01",
    );
    await saved(page);
  }
  await open(page, "roadmap");
  await expect(page.locator(".stage-row")).toHaveCount(14);
  await open(page, "review");
  await expect(page.locator(".notice")).toContainText("Stage 01 · 学习中");
});

test("Stage 02 首批课程：多文件展示、预测判定与银行练习", async ({ page }) => {
  // 多文件课程：主类之外还有同包依赖类，本地运行命令覆盖全部文件
  await open(page, "lesson/s02-class-basics");
  const companion = page.locator(".lesson-code").filter({ hasText: "同包依赖类" });
  await expect(companion).toHaveCount(1);
  await expect(companion.locator(".code-caption")).toContainText("Student.java");
  await expect(page.locator(".run-instructions")).toContainText("Student.java");
  await saved(page);

  // Stage 02 预测题真实判定
  await open(page, "practice/S02A1");
  const answer = page.getByRole("textbox", { name: "你预测的输出" });
  await answer.fill("明仔");
  await page.getByRole("button", { name: "检查预测", exact: true }).click();
  await expect(page.getByText("预测与真实语义一致。")).toBeVisible();
  await saved(page);

  // 银行账户练习：五组精确用例契约与分级提示门禁
  await open(page, "lab/s02-bank-account");
  await expect(page.getByText("任务背景")).toBeVisible();
  await expect(page.locator(".test-case")).toHaveCount(5);
  await expect(page.locator(".test-case").first()).toContainText("存款并查询");
  await expect(page.locator(".test-case").first()).toContainText("存入后余额：200.0");
  await expect(page.locator(".test-case").nth(3)).toContainText("非法存款金额");
  await expect(page.locator(".test-case").nth(4)).toContainText("余额不足");
  // L1 提示未解锁时不显示内容
  await expect(page.getByText("带守门规则的状态机")).toHaveCount(0);
  await page.getByRole("button", { name: "课程辅导" }).click();
  const dialog = page.getByRole("dialog", { name: "课程辅导" });
  await dialog.getByRole("button", { name: /解锁 L1/ }).click();
  await expect(dialog.getByText("带守门规则的状态机")).toBeVisible();
});

test("预测真实判定、刷新恢复与深浅主题", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await open(page, "practice/A1");
  const answer = page.getByRole("textbox", { name: "你预测的输出" });
  await answer.fill("3 / 1\n3.5");
  await page.getByRole("button", { name: "检查预测", exact: true }).click();
  await expect(page.getByText("预测与真实语义一致。")).toBeVisible();
  await saved(page);
  await page.reload();
  await expect(answer).toHaveValue("3 / 1\n3.5");
  await page.locator('button[aria-label="切换到深色主题"]:visible').click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await saved(page);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.locator('button[aria-label="切换到浅色主题"]:visible').click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await saved(page);
});

test("编辑器、Worker、草稿、按需参考与源码/备份下载恢复", async ({ page, browser, baseURL }) => {
  const references: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/reference/")) references.push(request.url());
  });
  await open(page, "lab/scores");
  if (page.viewportSize()!.width >= 768) {
    await expect(page.getByTestId("monaco-editor")).toBeVisible();
    const professional = page.getByRole("textbox", { name: /Java 代码编辑器/ });
    await professional.focus();
    await page.keyboard.press("Control+End");
    await page.keyboard.insertText("\n// Pages QA：仅验证编辑器，不是成绩统计实现。\n");
    await saved(page);
    // The minimal editor API does not load suggestion contributions; test its real worker factory explicitly.
    const workerStarted = page.waitForEvent("worker", { timeout: 15_000 });
    await page.evaluate(() => {
      const scope = self as typeof self & {
        MonacoEnvironment: { getWorker: () => Worker };
        pagesSmokeWorker?: Worker;
      };
      scope.pagesSmokeWorker = scope.MonacoEnvironment.getWorker();
    });
    const worker = await workerStarted;
    expect(worker.url()).toContain("editor.worker-");
    expect(worker.url().startsWith(baseURL!)).toBe(true);
    expect(await worker.evaluate(() => typeof self.postMessage)).toBe("function");
    await page.evaluate(() => {
      const scope = self as typeof self & { pagesSmokeWorker?: Worker };
      scope.pagesSmokeWorker?.terminate();
      delete scope.pagesSmokeWorker;
    });
  }
  let field = await editor(page);
  const draft = `${await field.inputValue()}\n// Pages QA：草稿与备份链路，核心TODO保留。\n`;
  expect(draft).toContain("TODO");
  await field.fill(draft);
  await saved(page);
  await page.reload();
  field = await editor(page);
  await expect(field).toHaveValue(draft);
  expect(references).toHaveLength(0);
  const javaEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "下载 Java", exact: true }).click();
  const java = await javaEvent;
  expect(await readFile((await java.path())!, "utf8")).toBe(draft);
  await page.locator(".reference-access summary").click();
  await page.locator(".reference-access").getByRole("button").first().click();
  expect(references).toHaveLength(0);
  await page.getByRole("button", { name: "我确认查看参考答案", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "参考实现 · 已主动解锁" }).locator("pre")).toContainText("package ");
  expect(references).toHaveLength(1);
  expect(references[0]!.startsWith(baseURL!)).toBe(true);
  await page.keyboard.press("Escape");
  await expect(field).toHaveValue(draft);
  await saved(page);
  await page.getByRole("button", { name: "数据与备份", exact: true }).click();
  const dataDialog = page.getByRole("dialog", { name: "学习数据与备份" });
  const backupEvent = page.waitForEvent("download");
  await dataDialog.getByRole("button", { name: "导出完整备份", exact: true }).click();
  const backup = await backupEvent;
  const buffer = await readFile((await backup.path())!);
  const state = validateBackup(JSON.parse(buffer.toString("utf8")) as unknown);
  expect(state.drafts.scores!.code).toBe(draft);
  const restored = await browser.newContext({ viewport: page.viewportSize()! });
  try {
    const target = await restored.newPage();
    await target.goto(baseURL!);
    await expect(target.locator("main h1")).toBeVisible();
    await target.getByRole("button", { name: "数据与备份", exact: true }).click();
    const restoreDialog = target.getByRole("dialog", { name: "学习数据与备份" });
    await restoreDialog.getByLabel("选择学习备份文件").setInputFiles({ name: "pages-qa.backup.json", mimeType: "application/json", buffer });
    await restoreDialog.getByRole("button", { name: "确认合并学习记录", exact: true }).click();
    await saved(target);
    await target.goto(new URL("./#/lab/scores", baseURL!).href);
    await expect(await editor(target)).toHaveValue(draft);
  } finally {
    await restored.close();
  }
});

test("桌面/手机双主题真实截图与页面溢出检查", async ({ page }, testInfo) => {
  test.setTimeout(150_000);
  const screenshots = resolve(output, "screenshots");
  await mkdir(screenshots, { recursive: true });
  const pages = [["home", "home"], ["roadmap", "roadmap"], ["lesson", "lesson/day02"], ["lab", "lab/scores"], ["review", "review"]];
  for (const theme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
    for (const [name, route] of pages) {
      await open(page, route!);
      await saved(page);
      if (name === "lab" && page.viewportSize()!.width >= 768)
        await expect(page.getByTestId("monaco-editor")).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: resolve(screenshots, `${testInfo.project.name}-${name}-${theme}.png`), animations: "disabled" });
    }
    await open(page, "lab/scores");
    await page.getByRole("button", { name: /^课程辅导/ }).click();
    await expect(page.getByRole("dialog", { name: "课程辅导" })).toBeVisible();
    await page.screenshot({ path: resolve(screenshots, `${testInfo.project.name}-tutor-${theme}.png`), animations: "disabled" });
    await page.keyboard.press("Escape");
    await saved(page);
  }
  if (page.viewportSize()!.width < 768) {
    await page.emulateMedia({ colorScheme: "light" });
    await open(page, "lab/scores");
    await (await editor(page)).scrollIntoViewIfNeeded();
    await page.screenshot({ path: resolve(screenshots, "mobile-chromium-editor-light.png"), animations: "disabled" });
  }
  await writeFile(resolve(output, `target-${testInfo.project.name}.json`), JSON.stringify({ url: testInfo.project.use.baseURL, viewport: page.viewportSize(), expectedCommit: process.env.LAB_EXPECTED_SHA || null, realIPhoneSafari: false }, null, 2));
});
