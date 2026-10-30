import { expect, test, type Page } from "@playwright/test";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import catalog from "../src/generated/catalog.json" with { type: "json" };

const executeFile = promisify(execFile);

const runtimeErrors = new WeakMap<Page, string[]>();
test.beforeEach(({ page }) => {
  const errors: string[] = [];
  runtimeErrors.set(page, errors);
  page.on("pageerror", (error) => errors.push(error.message));
});
test.afterEach(({ page }) => {
  expect(
    runtimeErrors.get(page),
    "页面不应出现未处理的 JavaScript 异常",
  ).toEqual([]);
});

async function open(page: Page, route = "#/home") {
  await page.goto(`/${route}`);
  await expect(page.locator("main h1")).toBeVisible();
}

async function saved(page: Page) {
  await expect(page.locator(".topbar .save-status")).toContainText(
    "已保存到此浏览器",
  );
}

async function lightEditor(page: Page) {
  await expect(page.locator(".editor-mode")).toBeVisible();
  const toggle = page.getByRole("button", { name: "轻量编辑", exact: true });
  if (await toggle.isVisible()) await toggle.click();
  const editor = page.getByRole("textbox", {
    name: "Java 代码草稿",
    exact: true,
  });
  await expect(editor).toBeVisible();
  return editor;
}

async function exportBackup(page: Page) {
  await page.getByRole("button", { name: "数据与备份", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "学习数据与备份" });
  const downloadEvent = page.waitForEvent("download");
  await dialog
    .getByRole("button", { name: "导出完整备份", exact: true })
    .click();
  const download = await downloadEvent;
  const path = await download.path();
  expect(path).not.toBeNull();
  const buffer = await readFile(path!);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  return buffer;
}

test("初访继续学习、完整课程切换与阅读记录保持真实语义", async ({ page }) => {
  await open(page);
  await expect(
    page.getByRole("heading", { name: "把基础，写成自己的能力。" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "继续学习", exact: true }).click();
  await expect(page).toHaveURL(/#\/lesson\/day01$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "输出与变量" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "标记为已阅读", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "已标记阅读 · 点击撤销" }),
  ).toBeVisible();
  await saved(page);
  await page.getByRole("button", { name: "课程目录" }).click();
  const picker = page.locator(".chapter-picker");
  await expect(picker.getByRole("link")).toHaveCount(13);
  await picker.getByRole("link", { name: /DAY 02.*数据类型与运算符/ }).click();
  await expect(
    page.getByRole("heading", { level: 1, name: "数据类型与运算符" }),
  ).toBeVisible();
  await saved(page);
  await open(page, "#/home");
  await page.getByRole("link", { name: "继续学习", exact: true }).click();
  await expect(page).toHaveURL(/#\/lesson\/day02$/);
  await open(page, "#/lesson/day01");
  await expect(
    page.getByRole("button", { name: "已标记阅读 · 点击撤销" }),
  ).toBeVisible();
  await expect(
    page.getByText("这只记录阅读行为，不代表掌握，也不会修改仓库阶段状态。"),
  ).toBeVisible();
});

test("14 阶段路线展示真实材料状态，无课程阶段只显示知识地图", async ({
  page,
}) => {
  await open(page, "#/roadmap");
  await expect(page.locator(".stage-row")).toHaveCount(14);
  await page
    .locator(".stage-row")
    .filter({ has: page.locator(".stage-index", { hasText: /^13$/ }) })
    .click();
  await expect(page.locator(".stage-detail")).toContainText("目前只有路线信息");
  await expect(
    page
      .locator(".stage-detail")
      .getByRole("link", { name: /进入当前课程|查看现有资料/ }),
  ).toHaveCount(0);
  await page
    .locator(".stage-row")
    .filter({ has: page.locator(".stage-index", { hasText: /^02$/ }) })
    .click();
  await expect(page.locator(".stage-detail")).toContainText("未验证");
  await page
    .locator(".stage-detail")
    .getByRole("link", { name: "查看现有资料" })
    .click();
  await expect(page).toHaveURL(/#\/document\/stage02-guide$/);
  await expect(page.locator("main h1")).toContainText("Stage 02");
});

test("6 节基础课与 7 节深化课均可读取原文和源码", async ({ page }) => {
  test.setTimeout(60_000);
  expect(
    catalog.lessons.filter((lesson) => lesson.kind === "foundation"),
  ).toHaveLength(6);
  expect(
    catalog.lessons.filter((lesson) => lesson.kind === "deep-dive"),
  ).toHaveLength(7);
  for (const { id, title } of catalog.lessons) {
    await open(page, `#/lesson/${id}`);
    await expect(
      page.getByRole("heading", { level: 1, name: title, exact: true }),
    ).toBeVisible();
    await expect(page.locator(".lesson-code pre")).toContainText(
      "package com.javaroadmap.stage01",
    );
    await expect(
      page.getByRole("button", { name: "标记为已阅读", exact: true }),
    ).toHaveCount(1);
    await saved(page);
  }
});

test("预测题真实判定：错误、正确、修改循环边界与刷新恢复", async ({ page }) => {
  await open(page, "#/practice/A1");
  const answer = page.getByRole("textbox", { name: "你预测的输出" });
  await answer.fill("4 / 1\n3.5");
  await page.getByRole("button", { name: "检查预测" }).click();
  await expect(page.getByText("还不一致，再跟一遍执行顺序。")).toBeVisible();
  await answer.fill("3 / 1\n3.5");
  await page.getByRole("button", { name: "检查预测" }).click();
  await expect(page.getByText("预测与真实语义一致。")).toBeVisible();
  await saved(page);
  await page.reload();
  await expect(answer).toHaveValue("3 / 1\n3.5");
  await page
    .getByRole("navigation", { name: "预测题选择" })
    .getByRole("button", { name: /^A3/ })
    .click();
  await answer.fill("012");
  await page.getByRole("button", { name: "检查预测" }).click();
  await expect(page.getByText("预测与真实语义一致。")).toBeVisible();
  await page.getByRole("checkbox", { name: /修改一个条件/ }).check();
  await expect(answer).toHaveValue("");
  await answer.fill("0123");
  await page.getByRole("button", { name: "检查预测" }).click();
  await expect(page.getByText("预测与真实语义一致。")).toBeVisible();
  await saved(page);
  await page.reload();
  await expect(page).toHaveURL(/#\/practice\/A3-modified$/);
  await expect(
    page.getByRole("checkbox", { name: /修改一个条件/ }),
  ).toBeChecked();
  await expect(answer).toHaveValue("0123");
  await expect(page.getByText("预测与真实语义一致。")).toBeVisible();
});

test("修改题保留独立判断与课程原文差异说明", async ({ page }) => {
  await open(page, "#/practice");
  await page.getByRole("tab", { name: /条件修改/ }).click();
  await page
    .getByRole("navigation", { name: "修改题选择" })
    .getByRole("button", { name: /^B3/ })
    .click();
  await expect(page.locator(".practice-work")).toContainText("return");
  await expect(page.getByRole("button", { name: "检查预测" })).toHaveCount(0);
  await page
    .getByRole("textbox", { name: "哪里与预期不同？" })
    .fill("先对照实际退出分支，再设计自己的最小验证。");
  await page
    .getByRole("textbox", { name: "下一次验证什么？" })
    .fill("输入 0 观察循环是否继续。");
  await saved(page);
  await open(page, "#/review");
  await expect(page.locator(".reflection-note")).toContainText(
    "先对照实际退出分支",
  );
  await page
    .locator(".reflection-note")
    .getByRole("link", { name: "返回现场" })
    .click();
  await expect(page).toHaveURL(/#\/practice\/B3$/);
  await expect(page.getByRole("tab", { name: /条件修改/ })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(
    page.getByRole("textbox", { name: "哪里与预期不同？" }),
  ).toHaveValue("先对照实际退出分支，再设计自己的最小验证。");
});

test("代码草稿自动保存、刷新恢复、下载与本地运行诚实状态", async ({ page }) => {
  await open(page, "#/lab/scores");
  const editor = await lightEditor(page);
  const starter = await editor.inputValue();
  expect(starter).toContain("TODO");
  expect(starter).toContain("package ");
  const draft = `${starter}\n// e2e：我的独立尝试仍未实现核心逻辑。\n`;
  await editor.fill(draft);
  await saved(page);
  await page.reload();
  await expect(await lightEditor(page)).toHaveValue(draft);
  await expect(page.getByText("在线沙箱未配置", { exact: true })).toBeVisible();
  await expect(page.getByText("本地 JDK 模式", { exact: true })).toBeVisible();
  await page.getByRole("tab", { name: "本地运行", exact: true }).click();
  await expect(page.locator(".output-panel")).toContainText(
    "javac -encoding UTF-8",
  );
  await expect(page.locator(".output-panel")).toContainText("verify:practice");
  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "下载 Java", exact: true }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe(
    `${catalog.exercises.find((item) => item.id === "scores")!.className}.java`,
  );
  expect(await readFile((await download.path())!, "utf8")).toBe(draft);
});

test("L1–L4 逐级解锁、Debug 和 Review 不替写，复盘独立保存", async ({
  page,
}) => {
  await open(page, "#/lab/scores");
  const editor = await lightEditor(page);
  const starter = await editor.inputValue();
  await page.getByRole("button", { name: /课程辅导/ }).click();
  const dialog = page.getByRole("dialog", { name: "课程辅导" });
  await expect(dialog).toContainText("未连接真实 AI 服务");
  await expect(dialog.locator(".hint-step.unlocked")).toHaveCount(0);
  for (let level = 1; level <= 4; level++) {
    await dialog
      .getByRole("button", { name: new RegExp(`^解锁 L${level}`) })
      .click();
    await expect(dialog.locator(".hint-step.unlocked")).toHaveCount(level);
  }
  await expect(
    dialog.getByRole("button", { name: "L1–L4 已全部解锁" }),
  ).toBeDisabled();
  await expect(dialog.locator("pre")).toHaveCount(0);
  await dialog.getByRole("tab", { name: "Debug 引导" }).click();
  await dialog
    .getByRole("textbox", { name: "粘贴你的真实错误" })
    .fill("先记录错误类型和自己类名的行号。");
  await expect(dialog.locator(".debug-steps li")).toHaveCount(5);
  await dialog.getByRole("tab", { name: "Review 清单" }).click();
  await expect(dialog.locator(".review-checklist > div")).toHaveCount(5);
  await page.keyboard.press("Escape");
  await expect(editor).toHaveValue(starter);
  await page
    .getByRole("textbox", { name: "哪里与预期不同？" })
    .fill("还没有运行，先把空数组验证列出来。");
  await page
    .getByRole("textbox", { name: "现在怎么理解？" })
    .fill("需要先确定数据，再决定每个方法的职责。");
  await page
    .getByRole("textbox", { name: "下一次验证什么？" })
    .fill("亲自实现后，验证单元素和空数组。");
  await page.getByRole("checkbox", { name: "把这个问题留到下次复习" }).check();
  await saved(page);
  await open(page, "#/review");
  await expect(
    page.locator(".evidence-row").filter({ hasText: "成绩统计" }),
  ).toContainText("提示 L4");
  await expect(page.locator(".reflection-note")).toContainText(
    "亲自实现后，验证单元素和空数组。",
  );
  await expect(page.locator(".reflection-note")).toContainText("需要复习");
  await expect(page.locator(".notice")).toContainText("Stage 01 · 学习中");
});

test("参考实现必须主动解锁、延迟请求且不污染草稿", async ({ page }) => {
  const requested: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/reference/")) requested.push(request.url());
  });
  await open(page, "#/lab/scores");
  const editor = await lightEditor(page);
  const starter = await editor.inputValue();
  expect(requested).toHaveLength(0);
  await page.locator(".reference-access summary").click();
  await page.locator(".reference-access").getByRole("button").first().click();
  let dialog = page.getByRole("dialog", { name: "先保留自己的尝试" });
  await expect(dialog).toBeVisible();
  expect(requested).toHaveLength(0);
  await dialog.getByRole("button", { name: "我确认查看参考答案" }).click();
  dialog = page.getByRole("dialog", { name: "参考实现 · 已主动解锁" });
  await expect(dialog.locator("pre")).toBeVisible();
  expect(requested).toHaveLength(1);
  await page.keyboard.press("Escape");
  await expect(editor).toHaveValue(starter);
  await saved(page);
  await open(page, "#/review");
  await expect(
    page.locator(".evidence-row").filter({ hasText: "成绩统计" }),
  ).toContainText("已看参考");
  await expect(
    page.locator(".evidence-row").filter({ hasText: "成绩统计" }),
  ).toContainText("待尝试");
});

test("参考资源读取失败不标记已查看，也不修改草稿", async ({ page }) => {
  await page.route("**/reference/*.json", (route) =>
    route.fulfill({ status: 503, body: "temporarily unavailable" }),
  );
  await open(page, "#/lab/scores");
  const editor = await lightEditor(page);
  const original = await editor.inputValue();
  await page.locator(".reference-access summary").click();
  await page.locator(".reference-access").getByRole("button").first().click();
  const dialog = page.getByRole("dialog", { name: "先保留自己的尝试" });
  await dialog.getByRole("button", { name: "我确认查看参考答案" }).click();
  await expect(dialog.getByRole("alert")).toContainText("503");
  await page.keyboard.press("Escape");
  await expect(editor).toHaveValue(original);
  await open(page, "#/review");
  await expect(
    page.locator(".evidence-row").filter({ hasText: "成绩统计" }),
  ).not.toContainText("已看参考");
});

test("剪贴板不可用时提示下载，保留源码", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      configurable: true,
    });
  });
  await open(page, "#/lab/scores");
  const editor = await lightEditor(page);
  const original = await editor.inputValue();
  await page.getByRole("button", { name: "复制", exact: true }).click();
  await expect(page.locator(".toast")).toContainText("请下载 Java 文件");
  await expect(editor).toHaveValue(original);
});

test("课程到真实下载/JDK/导入/复盘闭环；编译失败、重复和指纹受控", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await open(page, "#/lesson/day05");
  await page.getByRole("link", { name: /^成绩统计/ }).click();
  await expect(page.locator(".lab-heading")).toBeVisible();
  const editor = await lightEditor(page);
  const source = `${await editor.inputValue()}\n// e2e：仅编译空 TODO 骨架，不代表题目实现或验收。\n`;
  await editor.fill(source);
  await saved(page);
  const temporary = await mkdtemp(join(tmpdir(), "javaroadmap-e2e-"));
  try {
    const exercise = catalog.exercises.find((item) => item.id === "scores")!;
    const sourcePath = join(temporary, `${exercise.className}.java`);
    const expectedPath = join(temporary, "expected.txt");
    const evidencePath = join(temporary, "actual.evidence.json");
    const downloadEvent = page.waitForEvent("download");
    await page.getByRole("button", { name: "下载 Java", exact: true }).click();
    const downloaded = await downloadEvent;
    const downloadedBytes = await readFile((await downloaded.path())!);
    expect(downloadedBytes.toString("utf8")).toBe(source);
    await writeFile(sourcePath, downloadedBytes);
    await writeFile(expectedPath, "", "utf8");
    const runner = fileURLToPath(
      new URL("../scripts/verify-practice.mjs", import.meta.url),
    );
    await executeFile(
      process.execPath,
      [
        runner,
        "--exercise",
        "scores",
        "--source",
        sourcePath,
        "--expect-file",
        expectedPath,
        "--label",
        "仅验证空骨架可编译且无输出",
        "--evidence",
        evidencePath,
      ],
      { timeout: 40_000, windowsHide: true },
    );
    const evidenceBuffer = await readFile(evidencePath);
    const record = JSON.parse(evidenceBuffer.toString("utf8")) as {
      id: string;
      sourceHash: string;
      command: string;
      allPassed: boolean;
    };
    expect(record.allPassed).toBe(true);
    await page.getByRole("tab", { name: "实测记录", exact: true }).click();
    const upload = page.getByLabel("选择 Java 实测记录文件");
    const file = {
      name: "actual.evidence.json",
      mimeType: "application/json",
      buffer: evidenceBuffer,
    };
    await upload.setInputFiles(file);
    await expect(page.locator(".evidence-record")).toHaveCount(1);
    await expect(page.locator(".evidence-record")).toContainText(
      "与当前源码一致",
    );
    await upload.setInputFiles(file);
    await expect(page.locator(".evidence-record")).toHaveCount(1);
    await upload.setInputFiles({
      name: "conflicting.json",
      mimeType: "application/json",
      buffer: Buffer.from(
        JSON.stringify({
          ...record,
          command: `${record.command}\nconflicting metadata`,
        }),
      ),
    });
    await expect(
      page.locator(".output-panel").getByRole("alert"),
    ).toContainText("同一验证 ID 的内容冲突");
    await upload.setInputFiles({
      name: "wrong-hash.json",
      mimeType: "application/json",
      buffer: Buffer.from(
        JSON.stringify({ ...record, sourceHash: "0".repeat(64) }),
      ),
    });
    await expect(
      page.locator(".output-panel").getByRole("alert"),
    ).toContainText("指纹");
    await expect(page.locator(".evidence-record")).toHaveCount(1);
    const invalidSource = source.replace(
      "public static void main(String[] args) {",
      "public static void main(String[] args) { int n = ;",
    );
    await editor.fill(invalidSource);
    await saved(page);
    await writeFile(sourcePath, invalidSource, "utf8");
    const failurePath = join(temporary, "compilation.evidence.json");
    await expect(
      executeFile(
        process.execPath,
        [
          runner,
          "--exercise",
          "scores",
          "--source",
          sourcePath,
          "--expect-file",
          expectedPath,
          "--label",
          "QA编译失败",
          "--evidence",
          failurePath,
        ],
        { timeout: 40_000, windowsHide: true },
      ),
    ).rejects.toThrow();
    const failureBuffer = await readFile(failurePath);
    const failureRecord = JSON.parse(failureBuffer.toString("utf8"));
    expect(failureRecord.allPassed).toBe(false);
    expect(failureRecord.cases[0].label).toBe("编译");
    await upload.setInputFiles({
      name: "compilation.evidence.json",
      mimeType: "application/json",
      buffer: failureBuffer,
    });
    await expect(page.locator(".evidence-record")).toHaveCount(2);
    await expect(
      page.locator(".evidence-record").filter({ hasText: "存在失败案例" }),
    ).toContainText("与当前源码一致");
    await editor.fill(`${source}// e2e：验证之后只改一条注释。\n`);
    await expect(page.locator(".evidence-record").first()).toContainText(
      "源码已变化，请重新验证",
    );
    await upload.setInputFiles(file);
    await expect(
      page.locator(".output-panel").getByRole("alert"),
    ).toContainText("指纹");
    await page
      .getByRole("textbox", { name: "现在怎么理解？", exact: true })
      .fill("QA空骨架与故意语法错误只验证工具链路，不代表成绩统计完成。");
    await page
      .getByRole("textbox", { name: "下一次验证什么？", exact: true })
      .fill("由本人独立完成业务逻辑后，再验证正常、单元素与空数组。");
    await saved(page);
    await open(page, "#/review");
    await expect(page.locator(".notice")).toContainText("Stage 01 · 学习中");
    await expect(
      page.locator(".evidence-row").filter({ hasText: "成绩统计" }),
    ).toContainText("有实测记录");
    await expect(page.locator(".reflection-note")).toContainText(
      "不代表成绩统计完成",
    );
    await page.getByRole("link", { name: "返回现场", exact: true }).click();
    await expect(await lightEditor(page)).toHaveValue(
      `${source}// e2e：验证之后只改一条注释。\n`,
    );
  } finally {
    if (
      dirname(temporary) === resolve(tmpdir()) &&
      basename(temporary).startsWith("javaroadmap-e2e-")
    )
      await rm(temporary, { recursive: true, force: true });
  }
});

test("深浅主题切换后刷新保持，键盘模态焦点受控并返回触发器", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await open(page);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: "切换到深色主题" }).first().click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await saved(page);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "切换到浅色主题" }).first().click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  const opener = page.getByRole("button", { name: "数据与备份", exact: true });
  await opener.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "学习数据与备份" });
  await expect(dialog).toBeVisible();
  for (let index = 0; index < 8; index++) {
    await page.keyboard.press("Tab");
    // 原生 dialog 允许 Tab 到浏览器 Chrome，headless 此时以 BODY 表示焦点。
    expect(
      await dialog.evaluate(
        (element) =>
          document.activeElement === document.body ||
          element.contains(document.activeElement),
      ),
    ).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(opener).toBeFocused();
});

test("备份导出、重复合并、明确替换；坏 JSON 和未来版本不覆盖", async ({
  page,
}) => {
  await open(page, "#/lab/scores");
  let editor = await lightEditor(page);
  const starter = await editor.inputValue();
  const original = `${starter}\n// e2e：备份里的第一版草稿。\n`;
  const newer = `${starter}\n// e2e：保留本机较新的独立尝试。\n`;
  await editor.fill(original);
  await saved(page);
  const backup = await exportBackup(page);
  await editor.fill(newer);
  await saved(page);
  await page.getByRole("button", { name: "数据与备份", exact: true }).click();
  let dialog = page.getByRole("dialog", { name: "学习数据与备份" });
  const file = {
    name: "learning.backup.json",
    mimeType: "application/json",
    buffer: backup,
  };
  await dialog.getByLabel("选择学习备份文件").setInputFiles(file);
  await expect(dialog).toContainText("有 1 份同名草稿内容不同");
  await dialog.getByRole("button", { name: "确认合并学习记录" }).click();
  await expect(editor).toHaveValue(newer);
  await saved(page);
  await page.getByRole("button", { name: "数据与备份", exact: true }).click();
  dialog = page.getByRole("dialog", { name: "学习数据与备份" });
  await dialog.getByLabel("选择学习备份文件").setInputFiles(file);
  await dialog.getByRole("button", { name: "确认合并学习记录" }).click();
  await expect(editor).toHaveValue(newer);
  await saved(page);
  await page.getByRole("button", { name: "数据与备份", exact: true }).click();
  dialog = page.getByRole("dialog", { name: "学习数据与备份" });
  await dialog.getByLabel("选择学习备份文件").setInputFiles({
    name: "broken.json",
    mimeType: "application/json",
    buffer: Buffer.from("{broken"),
  });
  await expect(dialog.getByRole("alert")).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "确认合并学习记录" }),
  ).toHaveCount(0);
  const future = {
    ...(JSON.parse(backup.toString("utf8")) as Record<string, unknown>),
    schemaVersion: 999,
  };
  await dialog.getByLabel("选择学习备份文件").setInputFiles({
    name: "future.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(future)),
  });
  await expect(dialog.getByRole("alert")).toContainText("版本不受支持");
  await page.keyboard.press("Escape");
  await expect(editor).toHaveValue(newer);
  await page.getByRole("button", { name: "数据与备份", exact: true }).click();
  dialog = page.getByRole("dialog", { name: "学习数据与备份" });
  await dialog.getByLabel("选择学习备份文件").setInputFiles(file);
  await dialog.getByRole("radio", { name: /替换当前记录/ }).check();
  const beforeRestore = page.waitForEvent("download");
  await dialog.getByRole("button", { name: "备份并确认替换记录" }).click();
  const protection = await beforeRestore;
  const protectedState = JSON.parse(
    await readFile((await protection.path())!, "utf8"),
  ) as { drafts: { scores: { code: string } } };
  expect(protectedState.drafts.scores.code).toBe(newer);
  await expect(editor).toHaveValue(original);
  await saved(page);
  await page.reload();
  editor = await lightEditor(page);
  await expect(editor).toHaveValue(original);
});

test("手机导航、轻量输入与触控学习流程可用", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page);
  await page.getByRole("button", { name: "打开导航菜单" }).click();
  const drawer = page.getByRole("dialog", { name: "学习导航" });
  await expect(drawer).toBeVisible();
  await drawer.getByRole("link", { name: /学习路线/ }).click();
  await expect(drawer).not.toBeVisible();
  await expect(page).toHaveURL(/#\/roadmap$/);
  await page.locator("#roadmap-stage-13").click();
  await expect(page.locator("#stage-detail")).toBeInViewport();
  await expect(page.locator("#stage-detail")).toContainText("目前只有路线信息");
  await page.getByRole("button", { name: "选择其他阶段" }).click();
  await expect(page.locator("#roadmap-stage-13")).toBeInViewport();
  const navigation = page.getByRole("navigation", { name: "移动快捷导航" });
  await navigation.getByRole("link", { name: "课程", exact: true }).click();
  await expect(
    page.getByRole("heading", { level: 1, name: "输出与变量" }),
  ).toBeVisible();
  await navigation.getByRole("link", { name: "实验室", exact: true }).click();
  const editor = page.getByRole("textbox", { name: "Java 代码草稿" });
  await expect(editor).toBeVisible();
  await editor.fill(
    `${await editor.inputValue()}\n// 手机端保留自己的思路。\n`,
  );
  await saved(page);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("禁用站点存储时明确报错，仍可导出当前页面草稿保护数据", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "indexedDB", {
      value: undefined,
      configurable: true,
    });
  });
  await open(page, "#/lab/scores");
  await expect(page.locator('.storage-warning[role="alert"]')).toContainText(
    "无法保存",
  );
  const editor = await lightEditor(page);
  const draft = `${await editor.inputValue()}\n// 存储失败时先导出。\n`;
  await editor.fill(draft);
  await expect(page.locator(".topbar .save-status")).not.toContainText(
    "已保存到此浏览器",
  );
  const backup = JSON.parse((await exportBackup(page)).toString("utf8")) as {
    drafts: { scores: { code: string } };
  };
  expect(backup.drafts.scores.code).toBe(draft);
});

test("损坏的已有本地快照不会被初访自动清空", async ({ page }) => {
  await open(page);
  await saved(page);
  await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("javaroadmap-lab", 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction("learning", "readwrite");
      transaction
        .objectStore("learning")
        .put({ schemaVersion: 999, marker: "keep-original" }, "snapshot");
      transaction.oncomplete = () => resolve();
      transaction.onabort = () => reject(transaction.error);
    });
    database.close();
  });
  await page.reload();
  await expect(page.locator('.storage-warning[role="alert"]')).toContainText(
    "版本不受支持",
  );
  await expect(page.locator(".topbar .save-status")).toContainText("尚未保存");
  const snapshot = await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve) => {
      const request = indexedDB.open("javaroadmap-lab", 1);
      request.onsuccess = () => resolve(request.result);
    });
    const state = await new Promise<unknown>((resolve) => {
      const request = database
        .transaction("learning", "readonly")
        .objectStore("learning")
        .get("snapshot");
      request.onsuccess = () => resolve(request.result);
    });
    database.close();
    return state;
  });
  expect(snapshot).toEqual({ schemaVersion: 999, marker: "keep-original" });
});

test("同时打开两页时拒绝静默覆盖另一页的保存", async ({ page, context }) => {
  await open(page, "#/lab/scores");
  await saved(page);
  const second = await context.newPage();
  await open(second, "#/lab/scores");
  await saved(second);
  // 第二页初次保存会更新 revision；重新读取后，两页从同一快照开始。
  await page.reload();
  const editor = await lightEditor(page);
  const starter = await editor.inputValue();
  await editor.fill(`${starter}\n// 第一页已经保存。\n`);
  await saved(page);
  const secondEditor = await lightEditor(second);
  const secondDraft = `${await secondEditor.inputValue()}\n// 第二页先导出再合并。\n`;
  await secondEditor.fill(secondDraft);
  await expect(second.locator('.storage-warning[role="alert"]')).toContainText(
    "另一标签页已更新",
  );
  const backup = JSON.parse((await exportBackup(second)).toString("utf8")) as {
    drafts: { scores: { code: string } };
  };
  expect(backup.drafts.scores.code).toBe(secondDraft);
  await page.reload();
  await expect(await lightEditor(page)).toHaveValue(
    `${starter}\n// 第一页已经保存。\n`,
  );
  await second.close();
});

test("离线编辑与编辑器资源失败仍能保存和恢复草稿", async ({
  page,
  context,
}) => {
  await page.route(/MonacoEditor.*\.(?:js|tsx)(?:\?|$)/, (route) =>
    route.abort(),
  );
  await open(page, "#/lab/scores");
  await expect(
    page.getByText("专业编辑器加载失败，已提供轻量编辑。"),
  ).toBeVisible();
  const editor = page.getByRole("textbox", {
    name: "Java 代码草稿",
    exact: true,
  });
  const source = `${await editor.inputValue()}\n// QA：断网时的草稿，不是练习解答。\n`;
  await context.setOffline(true);
  await editor.fill(source);
  await saved(page);
  await context.setOffline(false);
  await page.reload();
  await expect(editor).toHaveValue(source);
});

test("保存失败清晰反馈并保留上次有效版本，当前源码仍可下载", async ({
  page,
}) => {
  await open(page, "#/lab/scores");
  const editor = await lightEditor(page);
  const original = `${await editor.inputValue()}\n// QA：最后一次有效保存。\n`;
  await editor.fill(original);
  await saved(page);
  const oversized = "x".repeat(1_000_001);
  await editor.fill(oversized);
  await expect(page.locator(".storage-warning")).toContainText("过长");
  await expect(page.locator(".topbar .save-status")).toContainText("保存失败");
  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "下载 Java", exact: true }).click();
  expect(await readFile((await (await downloadEvent).path())!, "utf8")).toBe(
    oversized,
  );
  page.once("dialog", (dialog) => dialog.accept());
  await page.reload();
  await expect(await lightEditor(page)).toHaveValue(original);
});

test("尚未完成异步保存时离开有保护，取消后可保存并刷新", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-11-01T00:00:00Z") });
  await open(page, "#/lab/scores");
  const editor = await lightEditor(page);
  await saved(page);
  await page.clock.pauseAt(new Date("2026-11-01T01:00:00Z"));
  const source = `${await editor.inputValue()}\n// QA：尚未落盘的编辑。\n`;
  await editor.fill(source);
  await expect(page.locator(".topbar .save-status")).toContainText("正在保存");
  const dialogEvent = page.waitForEvent("dialog");
  await page.close({ runBeforeUnload: true });
  const dialog = await dialogEvent;
  expect(dialog.type()).toBe("beforeunload");
  await dialog.dismiss();
  expect(page.isClosed()).toBe(false);
  await page.clock.runFor(250);
  await saved(page);
  await page.clock.resume();
  await page.reload();
  await expect(await lightEditor(page)).toHaveValue(source);
});

test("本地验证说明只有一条推荐路径，按题型包含必需输入文件", async ({
  page,
}) => {
  for (const id of ["scores", "calculator"]) {
    await open(page, `#/lab/${id}`);
    await page.getByRole("tab", { name: "本地运行", exact: true }).click();
    const panel = page.locator(".output-panel");
    await expect(panel).toContainText("无需先手动编译");
    const command = panel
      .locator("code")
      .filter({ hasText: "verify:practice" });
    if (id === "calculator")
      await expect(command).toContainText("--input-file");
    else await expect(command).not.toContainText("--input-file");
    const direct = panel.locator("details");
    await expect(direct).not.toHaveAttribute("open");
    await direct.locator("summary").click();
    await expect(direct).toContainText("javac -encoding UTF-8");
  }
});
