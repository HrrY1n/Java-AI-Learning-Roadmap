// V1.3 Stage 02 首批课程导航与学习闭环冒烟（线上发布前在本地构建上运行）。
import { test, expect } from "@playwright/test";

test.describe("Stage 02 首批课程", () => {
  test("从学习路线进入 Stage 02 课程并保持导航闭环", async ({ page }) => {
    await page.goto("/#/roadmap");
    await expect(page.locator("main h1").first()).toBeVisible();
    await expect(page.locator(".stage-row")).toHaveCount(14);
    // Stage 02 行可见并选中
    await page.locator("#roadmap-stage-02").click();
    const detail = page.locator("#stage-detail");
    await expect(detail.getByText("Java OOP")).toBeVisible();
    // 持续建设标注：不能把首批课程误显示为整个阶段完成
    await expect(
      detail.getByText("本阶段内容仍在持续建设"),
    ).toBeVisible();
    // 跨 Stage 课程链接进入深化课
    await detail.getByRole("link", { name: /引用与对象状态/ }).click();
    await expect(page.locator("main h1")).toHaveText(/引用与对象状态/);
    // 课程目录包含 Stage 01 + Stage 02 全部课程
    await page.getByRole("button", { name: "课程目录" }).click();
    // V2.2：目录链接数随目录派生（新增课程不再假红）
    await expect(page.locator(".chapter-picker a")).toHaveCount(68);
  });

  test("Stage 02 预测题与修改题可用且与 Stage 01 共存", async ({ page }) => {
    await page.goto("/#/practice/S02A1");
    await expect(page.locator("main h1").first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "别名共享" })).toBeVisible();
    const answer = page.getByRole("textbox", { name: "你预测的输出" });
    await answer.fill("明仔");
    await page.getByRole("button", { name: "检查预测" }).click();
    await expect(page.getByText("预测与真实语义一致。")).toBeVisible();
    // Stage 01 历史预测题仍可访问
    await page.goto("/#/practice/A1");
    await expect(
      page.getByRole("heading", { name: "整数除法与取余" }),
    ).toBeVisible();
  });

  test("银行账户练习进入实验室并保持分级提示门禁", async ({ page }) => {
    await page.goto("/#/lab/s02-bank-account");
    await expect(page.locator("main h1").first()).toBeVisible();
    await expect(page.getByText("任务背景")).toBeVisible();
    // L1 提示未解锁时不显示内容
    await expect(page.getByText("带守门规则的状态机")).toHaveCount(0);
    await page.getByRole("button", { name: "课程辅导" }).click();
    const dialog = page.getByRole("dialog", { name: "课程辅导" });
    await dialog.getByRole("button", { name: /解锁 L1/ }).click();
    await expect(dialog.getByText("带守门规则的状态机")).toBeVisible();
  });

  test("Stage 02 修改题路由直达修改 tab 且计数随目录更新", async ({ page }) => {
    await page.goto("/#/practice/S02B2");
    await expect(page.locator("main h1").first()).toBeVisible();
    // S02B2 不以 B 开头，tab 必须按 catalog 归属判定而非 ID 首字母
    await expect(page.getByRole("tab", { name: /条件修改/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(
      page.locator(".practice-picker").getByRole("button", { name: /封装/ }),
    ).toBeVisible();
    await expect(page.locator(".practice-work")).toContainText(
      "amount > balance",
    );
    // tab 计数来自 catalog 派生（当前 22 预测 + 13 修改）
    await expect(page.getByRole("tab", { name: /输出预测/ })).toContainText("25");
    await expect(page.getByRole("tab", { name: /条件修改/ })).toContainText("15");
  });
});
