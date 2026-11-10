import { test, expect, type Page } from "@playwright/test";

async function saved(page: Page) {
  await expect(page.locator(".topbar .save-status")).toContainText(
    "已保存到此浏览器",
  );
}

test.describe("V1.4 专题学习体系与导航交互验证", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./");
    await page.waitForLoadState("networkidle");
  });

  test("专题 Hub：如实呈现已发布课时与模块规划状态（拒绝虚假100%完成）", async ({
    page,
  }) => {
    await page.goto("./#/topics");

    // 1. 检查 Hub 标语
    await expect(
      page.getByRole("heading", { name: "与 Java 主线并行的计算机学科专题" }),
    ).toBeVisible();

    // 2. 检查 Hello 算法专题卡片进度统计
    const algoCard = page.locator(".topic-card").filter({ hasText: "数据结构与算法" });
    await expect(algoCard).toBeVisible();
    await expect(algoCard).toContainText("已发布首批课程");
    await expect(algoCard).toContainText("来源权威教材：Hello 算法");

    // 验证课时与真实模块统计（V1.7 补齐：算法 29 节、9 个模块全部上线、0 建设 0 规划）
    await expect(algoCard.locator(".topic-progress-text")).toContainText("已发布课程：29 节");
    await expect(algoCard.locator(".topic-progress-text")).toContainText("已上线 9 个模块");
    await expect(algoCard.locator(".topic-progress-text")).toContainText("0 个规划中");
    await expect(algoCard.locator(".topic-progress-text")).not.toContainText("个建设中");

    // 检查模块状态药丸：全部为已上线，无建设中/规划中占位
    await expect(algoCard.locator(".published-pill").first()).toContainText("已上线");
    await expect(algoCard.locator(".building-pill")).toHaveCount(0);
    await expect(algoCard.locator(".planned-pill")).toHaveCount(0);

    // 3. 检查 Pro Git 专题卡片进度统计（V1.7 补齐：19 节、5 个模块全部上线）
    const gitCard = page.locator(".topic-card").filter({ hasText: "Git 工程实践" });
    await expect(gitCard).toBeVisible();
    await expect(gitCard).toContainText("已发布首批课程");
    await expect(gitCard.locator(".topic-progress-text")).toContainText("已发布课程：19 节");
    await expect(gitCard.locator(".topic-progress-text")).toContainText("已上线 5 个模块");
    await expect(gitCard.locator(".building-pill")).toHaveCount(0);
    await expect(gitCard.locator(".planned-pill")).toHaveCount(0);

    // 4. 检查三本新教材专题：已有可学课程，但整体仍保持建设中
    const csappCard = page.locator(".topic-card").filter({ hasText: "深入理解计算机系统" });
    await expect(csappCard).toBeVisible();
    await expect(csappCard).toContainText("课程建设中 · 已有可学内容");
    await expect(csappCard.locator(".topic-progress-text")).toContainText("已发布课程：14 节");

    const ostepCard = page.locator(".topic-card").filter({ hasText: "操作系统导论" });
    await expect(ostepCard).toBeVisible();
    await expect(ostepCard).toContainText("课程建设中 · 已有可学内容");
    await expect(ostepCard.locator(".topic-progress-text")).toContainText("已发布课程：17 节");

    const networkCard = page.locator(".topic-card").filter({ hasText: "计算机网络" });
    await expect(networkCard).toBeVisible();
    await expect(networkCard).toContainText("课程建设中 · 已有可学内容");
    await expect(networkCard.locator(".topic-progress-text")).toContainText("已发布课程：12 节");

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

  test("链表课程多文件展示与编译提示：ListNode 依赖类与一起编译说明可见", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("./#/topic/topic-algo/algo-linkedlist");

    // 主文件与依赖文件都要展示
    await expect(page.locator(".lesson-code-block-card").first()).toContainText(
      "Java 规范源码：com.javaroadmap.algo.linkedlist.App",
    );
    const depCard = page
      .locator(".lesson-code-block-card")
      .filter({ hasText: "同包依赖类：com.javaroadmap.algo.linkedlist.ListNode" });
    await expect(depCard).toBeVisible();
    await expect(depCard).toContainText("需与主文件一起编译");
    await expect(depCard).toContainText("public class ListNode");

    // 编译命令包含两个文件
    const hint = page.locator(".lesson-compile-hint");
    await expect(hint).toBeVisible();
    await expect(hint).toContainText("ListNode.java");
    await expect(hint).toContainText("javac -encoding UTF-8 -d out");
  });

  test("新增算法专题导航：哈希表、二叉树、堆、图、排序、DP 等课程可直达且结构完整", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    const checks = [
      ["topic-algo/algo-hash-table", "哈希表：哈希函数与冲突解决", "拉链法"],
      ["topic-algo/algo-binary-tree", "二叉树与四种遍历", "中序：左 → 根 → 右"],
      ["topic-algo/algo-heap", "堆与优先队列", "自底向上与父节点比较交换"],
      ["topic-algo/algo-graph", "图的表示与 BFS/DFS 遍历", "邻接表"],
      ["topic-algo/algo-sorting", "排序算法对比", "快速排序"],
      ["topic-algo/algo-dynamic-programming", "动态规划", "转移方程"],
    ];
    for (const [route, title, keyword] of checks) {
      await page.goto(`./#/topic/${route}`);
      await expect(
        page.locator(".topic-lesson-title").filter({ hasText: title.split("：")[0] }),
      ).toBeVisible();
      await expect(page.locator(".lesson-markdown-body")).toContainText(keyword);
      await expect(page.locator(".lesson-code-block-card")).toBeVisible();
    }
  });

  test("新增 Pro Git 专题导航：冲突、撤销、stash、变基等课程可直达", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    const checks = [
      ["topic-git/git-merge-conflict", "解决合并冲突", "<<<<<<< HEAD"],
      ["topic-git/git-undo-recover", "撤销与恢复", "git revert HEAD"],
      ["topic-git/git-stash", "贮藏与恢复", "git stash list"],
      ["topic-git/git-rebase-cherry-pick", "变基与拣选", "黄金法则"],
      ["topic-git/git-internals-basics", "配置体系与对象模型", "blob"],
    ];
    for (const [route, title, keyword] of checks) {
      await page.goto(`./#/topic/${route}`);
      await expect(
        page.locator(".topic-lesson-title").filter({ hasText: title.split("：")[0] }),
      ).toBeVisible();
      await expect(page.locator(".lesson-markdown-body")).toContainText(keyword);
    }
  });

  test("KaTeX 数学公式渲染：行内公式、块级 LaTeX、求和与分式在深浅主题中正常渲染且代码块不受干扰", async ({
    page,
  }) => {
    await page.goto("./#/topic/topic-algo/algo-complexity-eval");

    // 1. 验证 KaTeX 行内公式元素正常生成（例如 $n$ 与 $O(n)$）
    const inlineMath = page.locator(".prose .katex");
    await expect(inlineMath.first()).toBeVisible();

    // 2. 验证行内代码与代码块未被错误解释为公式
    const codeBlock = page.locator(".lesson-code-block-card pre code");
    await expect(codeBlock).toBeVisible();
    await expect(codeBlock).toContainText("package com.javaroadmap.algo.complexity;");
    await expect(codeBlock).toContainText("public static long sumLinear(long n)");

    // 3. 访问包含块级公式的章节（algo-time-complexity）
    await page.goto("./#/topic/topic-algo/algo-time-complexity");
    const displayMath = page.locator(".prose .katex-display");
    await expect(displayMath.first()).toBeVisible();

    // 验证 LaTeX 大 O 阶梯与上标符号正确渲染为 KaTeX 结构
    await expect(displayMath.first().locator(".katex-html")).toContainText("O(1)");
    await expect(displayMath.first().locator(".katex-html")).toContainText("O(n!)");

    // 4. 访问包含分式与求和符号的章节，验证 LaTeX 符号生成
    await page.goto("./#/topic/topic-algo/algo-complexity-eval");
    const sumFormula = page.locator(".prose .katex").filter({ hasText: "∑" });
    await expect(sumFormula).toBeVisible();

    // 5. 切换深色主题验证对比度与样式正常
    await page.evaluate(() => (document.documentElement.dataset.theme = "dark"));
    await expect(page.locator(".prose .katex").first()).toBeVisible();

    // 6. 移动端 390px 视口无横向溢出验证
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("./#/topic/topic-algo/algo-time-complexity");
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
    await page.goto("./#/topic/topic-algo/algo-complexity-eval");
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
    await page.goto("./#/topic/topic-algo/algo-array");
    const addressing = page.locator(".visualizer-card").filter({ hasText: "连续内存寻址推导" });
    await expect(addressing).toContainText("简化教学模型");
    await expect(addressing).toContainText("模拟地址");
    await expect(addressing).not.toContainText("物理内存地址 0x");

    // 队列图解：真实交互验证——入队到预留空位法上限后按钮禁用
    await page.goto("./#/topic/topic-algo/algo-queue");
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
    await page.goto("./#/topic/topic-algo/algo-complexity-eval");

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
    await page.goto("./#/topic/topic-git/git-intro-basics");

    // 原书来源
    await expect(page.locator(".lesson-book-reference")).toContainText(
      "来源教材：Pro Git (第 2 版)",
    );

    // 实操标识栏
    await expect(page.locator(".badge-lab")).toContainText("命令实验课");

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
    await page.goto("./#/lesson/day01");

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
    await page.goto("./#/home");

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

    // 3. 检查三本新教材的专题搜索都能显示自己的专题名，而不是 Git 专题
    for (const [query, title, topicId] of [
      ["虚拟内存", "虚拟内存：地址空间、页表与 Java 堆的边界", "计算机系统要素"],
      ["缺页", "交换空间、缺页与替换策略", "操作系统导论"],
      ["DNS、CDN 与名称解析", "DNS、CDN 与名称解析", "计算机网络：自顶向下方法"],
    ] as const) {
      await page.keyboard.press("Control+k");
      await expect(searchModal).toBeVisible();
      await input.fill(query);
      const result = page.locator(".search-item").filter({ hasText: title });
      await expect(result).toBeVisible();
      await expect(result).toContainText(topicId);
      await page.keyboard.press("Escape");
    }

    // 4. 再次打开搜索，测试权威教材索引跳转（无双重 Hash，路由为 #/topics/book/:id）
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

    // 5. 未发布课程门禁：搜索未上线的内容不会出现可跳转正文
    //    （V2.2：正文搜索上线后"旅行商"在 algo-time-complexity 正文里可命中，
    //     改用真正未发布的探针——building 专题里只出现在未发布课文的概念词）
    await page.keyboard.press("Control+k");
    await expect(searchModal).toBeVisible();
    await input.fill("微架构分支预测器");
    const emptyNotice = page.locator(".search-empty");
    await expect(emptyNotice).toBeVisible();
    await expect(emptyNotice).toContainText("没有找到与 \"微架构分支预测器\" 相关的课程或材料");
  });

  test("搜索弹窗焦点圈定、Tab与Enter分工、Escape关闭与焦点返回（键盘无障碍）", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("./#/home");
    const trigger = page.getByRole("button", { name: "全局快速检索" });
    await trigger.click();
    const dialog = page.locator("dialog.search-dialog");
    await expect(dialog).toBeVisible();
    const searchInput = page.locator(".search-input");
    await expect(searchInput).toBeFocused();

    // 1. Shift+Tab 多次后焦点仍被圈定在弹窗内（原生 showModal 的 inert 背景）
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Shift+Tab");
    const escapedDialog = await page.evaluate(
      () => !(document.activeElement instanceof HTMLElement) || document.activeElement.closest("dialog") === null,
    );
    expect(escapedDialog, "焦点不应逃出搜索弹窗").toBe(false);

    // 2. Escape 关闭后焦点返回触发按钮
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();

    // 3. Tab 聚焦到关闭按钮按 Enter：仅关闭弹窗，不误跳转到第一门课程
    await trigger.click();
    await expect(dialog).toBeVisible();
    const closeBtn = page.getByRole("button", { name: "关闭搜索面板" });
    await page.keyboard.press("Tab"); // 从 input Tab 到关闭按钮
    await expect(closeBtn).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(dialog).not.toBeVisible();
    await expect(page).toHaveURL(/#\/home$/); // 确认仍在 home，未误跳课程

    // 4. Tab 移动到第 2 条搜索结果并按 Enter：正确进入第 2 条结果，而不是被强制覆盖为第 1 条
    await trigger.click();
    await expect(dialog).toBeVisible();
    const items = page.locator(".search-item");
    const secondItem = items.nth(1);
    const secondItemHref = await secondItem.getAttribute("href");
    expect(secondItemHref).toBeTruthy();

    await page.keyboard.press("Tab"); // 聚焦关闭按钮
    await page.keyboard.press("Tab"); // 聚焦第 1 条结果
    await page.keyboard.press("Tab"); // 聚焦第 2 条结果
    await expect(secondItem).toBeFocused();
    await page.keyboard.press("Enter");

    await expect(dialog).not.toBeVisible();
    await expect(page).toHaveURL(new RegExp(secondItemHref!.replace("#", "\\#") + "$"));

    // 5. 焦点与方向键同步：Tab 聚焦第 2 条结果后按 ↓，焦点与高亮同步移动至第 3 条，按 Enter 必须打开第 3 条
    await trigger.click();
    await expect(dialog).toBeVisible();
    const thirdItem = items.nth(2);
    const thirdItemHref = await thirdItem.getAttribute("href");
    expect(thirdItemHref).toBeTruthy();

    await page.keyboard.press("Tab"); // 聚焦关闭按钮
    await page.keyboard.press("Tab"); // 聚焦第 1 条结果
    await page.keyboard.press("Tab"); // 聚焦第 2 条结果
    await expect(secondItem).toBeFocused();
    await expect(secondItem).toHaveClass(/selected/);

    await page.keyboard.press("ArrowDown");
    await expect(thirdItem).toBeFocused();
    await expect(thirdItem).toHaveClass(/selected/);

    await page.keyboard.press("Enter");
    await expect(dialog).not.toBeVisible();
    await expect(page).toHaveURL(new RegExp(thirdItemHref!.replace("#", "\\#") + "$"));

    // 6. 输入框内连续输入与方向键选择：光标保留在 input 内，按 Enter 依然能直达选中的项
    await trigger.click();
    await expect(dialog).toBeVisible();
    await searchInput.fill("二叉树");
    const matchedItems = page.locator(".search-item");
    await expect(matchedItems.first()).toBeVisible();
    // input 内按 ↓ 切换高亮，焦点保留在 input（便于退格或追加打字）
    await page.keyboard.press("ArrowDown");
    await expect(searchInput).toBeFocused();
    const activeSelectedHref = await matchedItems.nth(1).getAttribute("href");
    await page.keyboard.press("Enter");
    await expect(dialog).not.toBeVisible();
    if (activeSelectedHref) {
      await expect(page).toHaveURL(new RegExp(activeSelectedHref.replace("#", "\\#") + "$"));
    }

    // 7. 鼠标与键盘混合操作：Tab 聚焦第 2 条结果，鼠标悬停到第 4 条，按 Enter 必须打开键盘焦点所在的第 2 条链接
    await trigger.click();
    await expect(dialog).toBeVisible();
    const fourthItem = items.nth(3);
    const fourthItemHref = await fourthItem.getAttribute("href");
    expect(fourthItemHref).toBeTruthy();

    await page.keyboard.press("Tab"); // 聚焦关闭按钮
    await page.keyboard.press("Tab"); // 聚焦第 1 条结果
    await page.keyboard.press("Tab"); // 聚焦第 2 条结果
    await expect(secondItem).toBeFocused();
    await expect(secondItem).toHaveClass(/selected/);

    // 鼠标移动并悬停到第 4 条结果
    await fourthItem.hover();
    // 键盘焦点依然在第 2 条，且高亮不得被鼠标悬停抢占
    await expect(secondItem).toBeFocused();
    await expect(secondItem).toHaveClass(/selected/);

    // 按 Enter 激活焦点项，必须打开第 2 条结果，绝不可跳转到第 4 条
    await page.keyboard.press("Enter");
    await expect(dialog).not.toBeVisible();
    await expect(page).toHaveURL(new RegExp(secondItemHref!.replace("#", "\\#") + "$"));

    // 8. 中文输入法合成状态（IME composition）：选字回车不会错误触发搜索跳转
    await trigger.click();
    await expect(dialog).toBeVisible();
    await searchInput.fill("erchashu");
    await searchInput.dispatchEvent("compositionstart");
    await page.keyboard.press("Enter");
    // 弹窗依然保持打开，未发生跳转
    await expect(dialog).toBeVisible();
    await searchInput.dispatchEvent("compositionend");
    await searchInput.fill("二叉树");
    await page.keyboard.press("Enter");
    await expect(dialog).not.toBeVisible();

    // 9. 回归（V1.9-R）：打开弹窗后立即 Tab 到关闭按钮，焦点不得被延迟定时器抢回输入框。
    // 此前的 30ms 焦点兜底会在 Tab 之后把焦点拽回 input，用户按 Enter 就命中
    // 「直达第一项结果」而误跳转。这里打开后不做任何等待直接 Tab，并断言关闭后
    // 路由保持在第 8 步结束时所在的页面（未被 Enter 误导向任何课程）。
    const urlBeforeRegression = page.url();
    for (let round = 0; round < 3; round += 1) {
      await trigger.click();
      await expect(dialog).toBeVisible();
      await page.keyboard.press("Tab");
      const closeFocused = page.getByRole("button", { name: "关闭搜索面板" });
      await expect(closeFocused).toBeFocused();
      // 等过旧实现的 30ms 定时器窗口，确认焦点没有被抢回输入框
      await page.waitForTimeout(120);
      await expect(closeFocused).toBeFocused();
      await expect(searchInput).not.toBeFocused();
      await page.keyboard.press("Enter");
      await expect(dialog).not.toBeVisible();
      await expect(page).toHaveURL(urlBeforeRegression);
    }
  });

  test("Git 课程不同步骤数切换不发生白屏且步进状态安全重置", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    // 1. 打开含 5 步命令演示的课程
    await page.goto("./#/topic/topic-git/git-hooks-automation");
    const viewer = page.locator(".git-steps-viewer");
    await expect(viewer).toBeVisible();

    // 选中最后一步（第 5 步，索引 4）
    const tabs = page.locator(".git-step-tabs button");
    await expect(tabs).toHaveCount(5);
    await tabs.nth(4).click();
    await expect(tabs.nth(4)).toHaveClass(/active/);
    await expect(page.locator(".git-steps-title")).toContainText("第 5 / 5 步");

    // 2. 点击“下一节”跳转到只有 3 步的课程（git-collab-workflow）
    const nextBtn = page.locator(".pagination-btn.next-btn");
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();

    await expect(page).toHaveURL(/#\/topic\/topic-git\/git-collab-workflow$/);
    await expect(page.getByRole("heading", { name: "分布式协作与 GitHub 工作流" })).toBeVisible();

    // 验证页面完全正常，步进器安全钳制在有效范围内（通常重置为第 1 步）
    const newTabs = page.locator(".git-step-tabs button");
    await expect(newTabs).toHaveCount(3);
    await expect(page.locator(".git-steps-title")).toContainText("第 1 / 3 步");
    expect(errors, "Git 步骤切换过程不应抛出未捕获异常").toEqual([]);

    // 3. 点击“上一节”返回 5 步课程，页面依然自洽
    const prevBtn = page.locator(".pagination-btn.prev-btn");
    await expect(prevBtn).toBeVisible();
    await prevBtn.click();
    await expect(page).toHaveURL(/#\/topic\/topic-git\/git-hooks-automation$/);
    await expect(page.locator(".git-steps-viewer")).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("专题课程前后切换自动置顶，不残留上一节底部滚动位置", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("./#/topic/topic-git/git-intro-basics");
    await page.waitForLoadState("networkidle");

    // 滚动到页面底部以点击“下一节”
    const nextBtn = page.locator(".pagination-btn.next-btn");
    await nextBtn.scrollIntoViewIfNeeded();
    const scrollYBefore = await page.evaluate(() => window.scrollY);
    expect(scrollYBefore, "点击前应已向下滚动").toBeGreaterThan(300);

    await nextBtn.click();
    await expect(page).toHaveURL(/#\/topic\/topic-git\/git-record-changes$/);

    // 验证切换后页面自动置顶，标题进入视口可见区域
    await expect(page.getByRole("heading", { name: "记录每次更新：从 git add 到语义化 commit" })).toBeVisible();
    const scrollYAfter = await page.evaluate(() => window.scrollY);
    expect(scrollYAfter, "切换新课后页面应自动置顶").toBeLessThan(80);
  });

  test("290px/305px/320px/390px 极窄屏及占位式滚动条环境下无整页横向溢出", async ({ page }) => {
    // 验证 max-width: 374px 下 visualizer-card 实际计算 padding 生效为 14px 12px，
    // 在大于 374px（如 390px）下保持 20px
    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto("./#/topic/topic-algo/algo-time-complexity");
    await page.waitForLoadState("networkidle");
    const padding320 = await page.locator(".visualizer-card").evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return `${cs.paddingTop} ${cs.paddingRight}`;
    });
    expect(padding320, "320px 视口下 visualizer-card 的 padding 应为 14px 12px").toBe("14px 12px");

    await page.setViewportSize({ width: 390, height: 700 });
    await page.waitForTimeout(100);
    const padding390 = await page.locator(".visualizer-card").evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return `${cs.paddingTop} ${cs.paddingRight}`;
    });
    expect(padding390, "390px 视口下 visualizer-card 的 padding 应为 20px 20px").toBe("20px 20px");

    // 覆盖极窄屏（290px 实际内容区）、305px 占位垂直滚动条极限、320px 与 390px 视口
    for (const width of [290, 305, 320, 390]) {
      await page.setViewportSize({ width, height: 700 });
      const routes = [
        "#/home",
        "#/topics",
        "#/roadmap",
        "#/lesson/day01",
        "#/topic/topic-algo/algo-time-complexity",
        "#/topic/topic-algo/algo-complexity-eval",
        "#/topic/topic-algo/algo-array",
        "#/topic/topic-algo/algo-linkedlist",
        "#/topic/topic-algo/algo-queue",
        "#/topic/topic-algo/algo-deque",
        "#/topic/topic-git/git-intro-basics",
        "#/topic/topic-git/git-branch-create-merge",
        "#/lab/scores",
        "#/review",
      ];
      for (const route of routes) {
        await page.goto("./" + route);
        await page.waitForLoadState("networkidle");
        // 强制启用纵向滚动条以测试占位式滚动条极限
        await page.evaluate(() => {
          document.documentElement.style.overflowY = "scroll";
        });
        await page.waitForTimeout(60);

        const metrics = await page.evaluate(() => {
          const doc = document.documentElement;
          // 尝试向右滚动
          window.scrollTo(100, 0);
          const scrolledX = window.scrollX;
          window.scrollTo(0, 0);
          return {
            scrollWidth: doc.scrollWidth,
            clientWidth: doc.clientWidth,
            scrolledX,
          };
        });

        expect(
          metrics.scrollWidth <= metrics.clientWidth,
          `${route} 在 ${width}px 下 scrollWidth(${metrics.scrollWidth}) 超过 clientWidth(${metrics.clientWidth})`,
        ).toBe(true);
        expect(
          metrics.scrolledX,
          `${route} 在 ${width}px 下产生不应有的横向滚动位移`,
        ).toBe(0);
      }
    }
  });
  test("路由与历史堆栈：前进后退与刷新保持页面状态", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    // 依次访问三个不同体系的页面
    await page.goto("./#/home");
    await page.goto("./#/topic/topic-algo/algo-complexity-eval");
    await expect(page.getByRole("heading", { name: "算法效率评估与渐近复杂度" })).toBeVisible();

    await page.goto("./#/topic/topic-git/git-intro-basics");
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
