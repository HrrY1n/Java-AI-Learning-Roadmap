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

  test("专题 Hub：如实呈现已发布课时与模块规划状态（拒绝虚假100%完成）", async ({
    page,
  }) => {
    await page.goto("http://127.0.0.1:4173/#/topics");

    // 1. 检查 Hub 标语
    await expect(
      page.getByRole("heading", { name: "与 Java 主线并行的计算机学科专题" }),
    ).toBeVisible();

    // 2. 检查 Hello 算法专题卡片进度统计
    const algoCard = page.locator(".topic-card").filter({ hasText: "数据结构与算法" });
    await expect(algoCard).toBeVisible();
    await expect(algoCard).toContainText("已发布首批课程");
    await expect(algoCard).toContainText("来源权威教材：Hello 算法");

    // 验证课时与真实模块统计（已发布8节，3个已上线模块，5个规划建设中，拒绝误显全部完成）
    await expect(algoCard.locator(".topic-progress-text")).toContainText("已发布课程：8 节");
    await expect(algoCard.locator(".topic-progress-text")).toContainText("已上线 3 个模块");
    await expect(algoCard.locator(".topic-progress-text")).toContainText("1 个建设中");
    await expect(algoCard.locator(".topic-progress-text")).toContainText("4 个规划中");

    // 检查模块状态药丸
    await expect(algoCard.locator(".published-pill").first()).toContainText("已上线");
    await expect(algoCard.locator(".building-pill")).toContainText("建设中");
    await expect(algoCard.locator(".planned-pill").first()).toContainText("规划中");

    // 3. 检查 Pro Git 专题卡片进度统计
    const gitCard = page.locator(".topic-card").filter({ hasText: "Git 工程实践" });
    await expect(gitCard).toBeVisible();
    await expect(gitCard).toContainText("已发布首批课程");
    await expect(gitCard.locator(".topic-progress-text")).toContainText("已发布课程：5 节");
    await expect(gitCard.locator(".topic-progress-text")).toContainText("已上线 2 个模块");
    await expect(gitCard.locator(".topic-progress-text")).toContainText("1 个建设中");
    await expect(gitCard.locator(".topic-progress-text")).toContainText("2 个规划中");

    // 4. 检查仅有资料索引的专题
    const csappCard = page.locator(".topic-card").filter({ hasText: "深入理解计算机系统" });
    await expect(csappCard).toBeVisible();
    await expect(csappCard).toContainText("仅有教材资料索引");
    await expect(csappCard.locator(".topic-progress-text")).toContainText(
      "全阶段教材资料已索引 · 待接入课程建设",
    );

    // 5. 检查外部教材库表格
    const booksTable = page.locator(".books-table");
    await expect(booksTable).toBeVisible();
    await expect(booksTable).toContainText("Hello 算法");
    await expect(booksTable).toContainText("Pro Git");
    await expect(booksTable).toContainText("On Java 8");
    await expect(booksTable).toContainText("CS:APP");
    await expect(booksTable).toContainText("操作系统导论");
    await expect(booksTable).toContainText("计算机网络");
  });

  test("KaTeX 数学公式渲染：行内公式、块级 LaTeX、求和与分式在深浅主题中正常渲染且代码块不受干扰", async ({
    page,
  }) => {
    await page.goto("http://127.0.0.1:4173/#/topic/topic-algo/algo-complexity-eval");

    // 1. 验证 KaTeX 行内公式元素正常生成（例如 $n$ 与 $O(n)$）
    const inlineMath = page.locator(".prose .katex");
    await expect(inlineMath.first()).toBeVisible();

    // 2. 验证行内代码与代码块未被错误解释为公式
    const codeBlock = page.locator(".lesson-code-block-card pre code");
    await expect(codeBlock).toBeVisible();
    await expect(codeBlock).toContainText("package com.javaroadmap.algo.complexity;");
    await expect(codeBlock).toContainText("public static long sumLinear(long n)");

    // 3. 访问包含块级公式的章节（algo-time-complexity）
    await page.goto("http://127.0.0.1:4173/#/topic/topic-algo/algo-time-complexity");
    const displayMath = page.locator(".prose .katex-display");
    await expect(displayMath.first()).toBeVisible();

    // 验证 LaTeX 大 O 阶梯与上标符号正确渲染为 KaTeX 结构
    await expect(displayMath.first().locator(".katex-html")).toContainText("O(1)");
    await expect(displayMath.first().locator(".katex-html")).toContainText("O(n!)");

    // 4. 访问包含分式与求和符号的章节，验证 LaTeX 符号生成
    await page.goto("http://127.0.0.1:4173/#/topic/topic-algo/algo-complexity-eval");
    const sumFormula = page.locator(".prose .katex").filter({ hasText: "∑" });
    await expect(sumFormula).toBeVisible();

    // 5. 切换深色主题验证对比度与样式正常
    await page.evaluate(() => (document.documentElement.dataset.theme = "dark"));
    await expect(page.locator(".prose .katex").first()).toBeVisible();

    // 6. 移动端 390px 视口无横向溢出验证
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("http://127.0.0.1:4173/#/topic/topic-algo/algo-time-complexity");
    await page.waitForLoadState("networkidle");
    const isOverflowing = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(isOverflowing).toBe(false);
  });

  test("复杂度图表柱形在深浅主题下均可见（非透明着色），且不显示原始 $O(...) 公式符号", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("http://127.0.0.1:4173/#/topic/topic-algo/algo-complexity-eval");
    const ladder = page.locator(".visualizer-card").filter({ hasText: "大 O 渐近复杂度增长断崖" });
    await expect(ladder).toBeVisible();

    // 每根柱形必须具有实际可见的填充颜色（此前使用了未定义的 CSS 变量导致不可见）
    const bars = ladder.locator(".ladder-fill");
    const count = await bars.count();
    expect(count).toBeGreaterThanOrEqual(6);
    for (let i = 0; i < count; i++) {
      const color = await bars.nth(i).evaluate((el) => getComputedStyle(el).backgroundColor);
      expect(color).toMatch(/rgba?\(\d+, \d+, \d+/);
      expect(color).not.toBe("rgba(0, 0, 0, 0)");
    }

    // 交互组件内的说明文字不得出现原始 $...$ 公式标记
    await expect(ladder).not.toContainText("$O(");

    // 深色主题下柱形依旧可见
    await page.evaluate(() => (document.documentElement.dataset.theme = "dark"));
    for (let i = 0; i < count; i++) {
      const color = await bars.nth(i).evaluate((el) => getComputedStyle(el).backgroundColor);
      expect(color).not.toBe("rgba(0, 0, 0, 0)");
    }
  });

  test("数组寻址图解标注模拟地址；环形队列图解标明预留空位法并与源码实现区分", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("http://127.0.0.1:4173/#/topic/topic-algo/algo-array");
    const addressing = page.locator(".visualizer-card").filter({ hasText: "连续内存寻址推导" });
    await expect(addressing).toContainText("简化教学模型");
    await expect(addressing).toContainText("模拟地址");
    await expect(addressing).not.toContainText("物理内存地址 0x");

    // 队列图解：真实交互验证——入队到预留空位法上限后按钮禁用
    await page.goto("http://127.0.0.1:4173/#/topic/topic-algo/algo-queue");
    const queueCard = page
      .locator(".visualizer-card")
      .filter({ hasText: "预留空位法演示" });
    await expect(queueCard).toBeVisible();
    await expect(queueCard).toContainText("6 个槽位最多存 5 个元素");

    const enqueueBtn = queueCard.getByRole("button", { name: /入队 Enqueue/ });
    const dequeueBtn = queueCard.getByRole("button", { name: /出队 Dequeue/ });
    // 初始 3 个元素：再入队 2 次后达到预留空位法上限（6 槽 5 元素）
    await enqueueBtn.click();
    await enqueueBtn.click();
    await expect(enqueueBtn).toBeDisabled();
    await expect(queueCard).toContainText("【队列已满】");
    // 出队一次后应恢复可入队（FIFO：先出 10），front 前进到下标 1
    await dequeueBtn.click();
    await expect(queueCard).toContainText("front = 1");
    await expect(enqueueBtn).toBeEnabled();
    await expect(dequeueBtn).toBeEnabled();
  });

  test("Hello 算法课程阅读：原书来源追溯、实操属性标识与阅读打卡（诚实性约定）", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
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

  test("Pro Git 课程阅读：明确澄清实操功能边界（演示 vs 本机沙箱实操）", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("http://127.0.0.1:4173/#/topic/topic-git/git-intro-basics");

    // 原书来源
    await expect(page.locator(".lesson-book-reference")).toContainText(
      "来源教材：Pro Git (第 2 版)",
    );

    // 实操标识栏
    await expect(page.locator(".badge-lab")).toContainText("Git 命令实操课");

    // 澄清 Git 实操功能边界 Banner
    const noticeBox = page.locator(".git-notice-box");
    await expect(noticeBox).toBeVisible();
    await expect(noticeBox).toContainText("实操功能边界与诚实性说明");
    await expect(noticeBox).toContainText("教学状态机演示，并非在线运行终端");
    await expect(noticeBox).toContainText("在您本机终端开辟独立的一次性临时目录");
    await expect(noticeBox).toContainText("自动化测试通过绝不代表学员个人已经完成实操");

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

    // 安全红线提醒
    await expect(page.locator(".git-step-footer")).toContainText("严禁在当前工作仓库");
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
    await page.setViewportSize({ width: 1280, height: 800 });
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
    await page.setViewportSize({ width: 1280, height: 800 });
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
