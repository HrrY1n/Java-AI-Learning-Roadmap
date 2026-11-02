import { test, expect, type Page } from "@playwright/test";

async function saved(page: Page) {
  await expect(page.locator(".topbar .save-status")).toContainText(
    "已保存到此浏览器",
  );
}

test.describe("V1.4 专题学习体系与导航交互验证", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://127.0.0.1:4173/");
    await page.waitForLoadState("networkidle");
  });

  test("专题 Hub：正确展示首批已发布专题与外部 6 本权威教材索引", async ({
    page,
  }) => {
    await page.goto("http://127.0.0.1:4173/#/topics");

    // 检查 Hub 标语
    await expect(
      page.getByRole("heading", { name: "与 Java 主线并行的计算机学科专题" }),
    ).toBeVisible();

    // 检查 Hello 算法专题卡片与状态
    const algoCard = page.locator(".topic-card").filter({ hasText: "数据结构与算法" });
    await expect(algoCard).toBeVisible();
    await expect(algoCard).toContainText("已发布首批课程");
    await expect(algoCard).toContainText("来源权威教材：Hello 算法");

    // 检查 Pro Git 专题卡片
    const gitCard = page.locator(".topic-card").filter({ hasText: "Git 工程实践" });
    await expect(gitCard).toBeVisible();
    await expect(gitCard).toContainText("已发布首批课程");

    // 检查仅有资料索引的专题
    const csappCard = page.locator(".topic-card").filter({ hasText: "深入理解计算机系统" });
    await expect(csappCard).toBeVisible();
    await expect(csappCard).toContainText("仅有教材资料索引");

    // 检查外部教材库表格
    const booksTable = page.locator(".books-table");
    await expect(booksTable).toBeVisible();
    await expect(booksTable).toContainText("Hello 算法");
    await expect(booksTable).toContainText("Pro Git");
    await expect(booksTable).toContainText("On Java 8");
    await expect(booksTable).toContainText("CS:APP");
    await expect(booksTable).toContainText("操作系统导论");
    await expect(booksTable).toContainText("计算机网络");
  });

  test("Hello 算法课程阅读：原书来源追溯、实操属性标识与阅读打卡（诚实性约定）", async ({
    page,
  }) => {
    await page.goto("http://127.0.0.1:4173/#/topic/topic-algo/algo-complexity-eval");

    // 面包屑导航
    await expect(page.locator(".reader-breadcrumbs")).toContainText("数据结构与算法");
    await expect(page.locator(".reader-breadcrumbs")).toContainText("复杂度分析");
    await expect(page.locator(".reader-breadcrumbs")).toContainText(
      "算法效率评估与渐近复杂度",
    );

    // 原书来源
    await expect(page.locator(".lesson-book-reference")).toContainText(
      "来源教材：Hello 算法 · 第 2 章 2.1 节 · PDF 页码：第 24 ~ 25 页",
    );

    // 实操模式标识栏（区分概念课 vs 编程课）
    await expect(page.locator(".lesson-learning-meta-strip")).toBeVisible();
    await expect(page.locator(".badge-concept")).toContainText("概念精读课 · 侧重原理、心智模型与理论分析");

    // 交互式复杂度对比图解
    await expect(page.locator(".visualizer-card")).toBeVisible();
    await expect(page.locator(".visualizer-card")).toContainText("大 O 渐近复杂度增长断崖");

    // Java 源码卡片
    await expect(page.locator(".lesson-code-block-card")).toBeVisible();
    await expect(page.locator(".lesson-code-block-card")).toContainText(
      "com.javaroadmap.algo.complexity.App",
    );

    // 诚实阅读进度打卡：明确区分已阅读 vs 已掌握，不虚构掌握证据
    const markBtn = page.locator(".mark-read-btn");
    await expect(markBtn).toContainText("标记为已阅读");
    await expect(page.locator(".reader-status-pill")).toContainText("未读");

    await markBtn.click();
    await expect(markBtn).toContainText("已阅读此小节");
    await expect(page.locator(".reader-status-pill")).toContainText("已读过本节");
    await saved(page);

    // 诚实底线提醒展示
    await expect(page.locator(".reader-honesty-banner")).toContainText("诚实性约定：点击“已阅读”仅代表浏览过教程内容，并不等同于掌握");

    // 刷新页面后状态依然持久化
    await page.reload();
    await expect(page.locator(".mark-read-btn")).toContainText("已阅读此小节");
    await expect(page.locator(".reader-status-pill")).toContainText("已读过本节");
  });

  test("Pro Git 课程阅读：命令步进器、状态机与沙箱实操标识", async ({ page }) => {
    await page.goto("http://127.0.0.1:4173/#/topic/topic-git/git-intro-basics");

    // 原书来源
    await expect(page.locator(".lesson-book-reference")).toContainText(
      "来源教材：Pro Git (第 2 版)",
    );

    // 实操标识栏
    await expect(page.locator(".badge-lab")).toContainText("Git 命令实操课 · 配套命令步进与状态机");

    // Git 三空间交互模型
    await expect(page.locator(".three-trees-grid")).toBeVisible();
    await expect(page.locator(".three-trees-grid")).toContainText("工作目录 (Working Dir)");
    await expect(page.locator(".three-trees-grid")).toContainText("暂存区 (Index / Stage)");
    await expect(page.locator(".three-trees-grid")).toContainText("版本库 (HEAD History)");

    // Git 命令步进器
    const gitSteps = page.locator(".git-steps-viewer");
    await expect(gitSteps).toBeVisible();
    await expect(gitSteps).toContainText("git init");
    await expect(gitSteps.locator(".git-state-contrast")).toBeVisible();
  });

  test("主线课程阅读：《On Java 8》原著延伸卡片与现代 JDK 差异展示", async ({
    page,
  }) => {
    await page.goto("http://127.0.0.1:4173/#/lesson/day01");

    // On Java 8 卡片
    const onJavaCard = page.locator(".on-java-card");
    await expect(onJavaCard).toBeVisible();
    await expect(onJavaCard).toContainText("权威教材深度延伸 ·《On Java 8》");
    await expect(onJavaCard).toContainText("第 3 章 万物皆对象");
    await expect(onJavaCard).toContainText("PDF 第 37-41 页");
    await expect(onJavaCard).toContainText("现代 JDK 演进与演变说明");
  });

  test("全局快捷检索与点击穿梭：消灭双重 Hash 与未发布课程门禁", async ({ page }) => {
    await page.goto("http://127.0.0.1:4173/#/home");

    // 1. 点击顶栏搜索按钮打开 Command Palette
    await page.getByRole("button", { name: "全局快速检索" }).click();
    const searchModal = page.locator(".search-palette");
    await expect(searchModal).toBeVisible();

    // 2. 搜索已发布算法课程并真实点击跳转
    const input = page.locator(".search-input");
    await input.fill("复杂度");

    const algoResult = page
      .locator(".search-item")
      .filter({ hasText: "算法效率评估与渐近复杂度" });
    await expect(algoResult).toBeVisible();
    await algoResult.click();
    await expect(page).toHaveURL(/#\/topic\/topic-algo\/algo-complexity-eval$/);

    // 3. 再次打开搜索，测试权威教材索引跳转（无双重 Hash，路由为 #/topics/book/:id）
    await page.keyboard.press("Control+k");
    await expect(searchModal).toBeVisible();
    await input.fill("Pro Git");

    const bookResult = page
      .locator(".search-item")
      .filter({ hasText: "Pro Git (第 2 版中文版)" });
    await expect(bookResult).toBeVisible();
    await bookResult.click();

    // 验证路由为规范的单 Hash 路径，消灭 #/topics#book-id 双重 Hash
    await expect(page).toHaveURL(/#\/topics\/book\/book-pro-git$/);
    const targetRow = page.locator("#book-pro-git");
    await expect(targetRow).toBeVisible();

    // 4. 未发布课程门禁：搜索未上线算法（如动态规划）不会出现可跳转正文
    await page.keyboard.press("Control+k");
    await expect(searchModal).toBeVisible();
    await input.fill("动态规划");
    const emptyNotice = page.locator(".search-empty");
    await expect(emptyNotice).toBeVisible();
    await expect(emptyNotice).toContainText("没有找到与 \"动态规划\" 相关的课程或材料");
  });

  test("路由与历史堆栈：前进后退与刷新保持页面状态", async ({ page }) => {
    // 依次访问三个不同体系的页面
    await page.goto("http://127.0.0.1:4173/#/home");
    await page.goto("http://127.0.0.1:4173/#/topic/topic-algo/algo-complexity-eval");
    await expect(page.getByRole("heading", { name: "算法效率评估与渐近复杂度" })).toBeVisible();

    await page.goto("http://127.0.0.1:4173/#/topic/topic-git/git-intro-basics");
    await expect(page.locator(".git-steps-viewer")).toBeVisible();

    // 浏览器后退
    await page.goBack();
    await expect(page).toHaveURL(/#\/topic\/topic-algo\/algo-complexity-eval$/);
    await expect(page.getByRole("heading", { name: "算法效率评估与渐近复杂度" })).toBeVisible();

    // 浏览器前进
    await page.goForward();
    await expect(page).toHaveURL(/#\/topic\/topic-git\/git-intro-basics$/);
    await expect(page.locator(".git-steps-viewer")).toBeVisible();

    // 刷新保持
    await page.reload();
    await expect(page).toHaveURL(/#\/topic\/topic-git\/git-intro-basics$/);
    await expect(page.locator(".git-steps-viewer")).toBeVisible();
  });
});
