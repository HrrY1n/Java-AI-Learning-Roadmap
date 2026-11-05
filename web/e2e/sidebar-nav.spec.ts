import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// V1.9 侧边导航信息架构回归：分组、选中态、深链接、搜索跳转、历史、键盘、
// 短屏三段式布局、移动抽屉滚动与底栏，以及侧栏/抽屉的 WCAG AA 扫描。
const PRIMARY = [
  "学习工作台",
  "学习路线",
  "专题学习",
  "编程实验室",
  "学习记录",
];

const sidebar = (page: Page) => page.locator("aside.sidebar");

async function open(page: Page, hash: string) {
  await page.goto(`/${hash}`);
  await expect(page.locator("main h1, main .topic-hub").first()).toBeVisible({
    timeout: 20_000,
  });
  await expect(page.locator(".topbar .save-status")).toContainText(
    "已保存到此浏览器",
    { timeout: 20_000 },
  );
}

test.describe("侧边导航信息架构", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("桌面：五个主要入口 + 场景分组，首页选中且底栏固定", async ({ page }) => {
    await open(page, "#/home");
    const nav = sidebar(page);

    for (const name of PRIMARY) {
      await expect(
        nav.getByRole("link", { name, exact: true }),
      ).toBeVisible();
    }
    for (const group of ["主要入口", "Java 主线", "专题课程", "动手实践", "资料与底稿"]) {
      await expect(nav.getByText(group, { exact: true }).first()).toBeVisible();
    }

    await expect(
      nav.getByRole("link", { name: "学习工作台", exact: true }),
    ).toHaveAttribute("aria-current", "page");

    // 底部系统功能区保持可见（不随中部滚动）
    await expect(nav.locator(".sidebar-foot")).toBeVisible();
    await expect(nav.locator(".sidebar-foot").getByRole("button")).toBeVisible();

    // 中部独立滚动；侧栏自身不产生横向溢出
    const metrics = await nav.locator(".nav-scroll").evaluate((element) => ({
      scrollable: element.scrollHeight > element.clientHeight,
    }));
    expect(metrics.scrollable).toBe(true);
    const overflow = await nav.evaluate(
      (element) => element.scrollWidth - element.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("深链接：Stage 02 课程自动展开 Java 主线并高亮当前课，且课在滚动区内可见", async ({
    page,
  }) => {
    await open(page, "#/lesson/s02-class-basics");
    const nav = sidebar(page);
    // Stage 行与课行共享同一 href；用课程标题锁定“当前课”这一条
    const activeLesson = nav.getByRole("link", {
      name: "类与对象入门",
      exact: true,
    });
    await expect(activeLesson).toHaveAttribute("aria-current", "page");

    const mainline = nav
      .locator("details.nav-group-details")
      .filter({ hasText: "Java 主线" })
      .first();
    await expect(mainline).toHaveAttribute("open", "");

    const inScrollView = await activeLesson.evaluate((element) => {
      const scroller = element.closest(".nav-scroll");
      if (!scroller) return false;
      const item = element.getBoundingClientRect();
      const view = scroller.getBoundingClientRect();
      return item.top >= view.top - 1 && item.bottom <= view.bottom + 1;
    });
    expect(inScrollView).toBe(true);
  });

  test("全局搜索跳转到专题后，专题分组与主题条目同步选中", async ({ page }) => {
    await open(page, "#/home");
    await page.getByRole("button", { name: "全局快速检索" }).click();
    await expect(page.locator("dialog.search-dialog")).toBeVisible();
    await page.locator(".search-input").fill("排序");
    await expect(page.locator(".search-item").first()).toBeVisible();
    await page.keyboard.press("Enter");

    await expect(page).toHaveURL(/#\/topic\/topic-algo\//);
    const nav = sidebar(page);
    await expect(
      nav.getByRole("link", { name: /^Hello 算法/ }),
    ).toHaveAttribute("aria-current", "page");
    const topics = nav
      .locator("details.nav-group-details")
      .filter({ hasText: "专题课程" })
      .first();
    await expect(topics).toHaveAttribute("open", "");
  });

  test("浏览器前进/后退后选中状态同步更新", async ({ page }) => {
    await open(page, "#/home");
    const nav = sidebar(page);
    await nav.getByRole("link", { name: "专题学习", exact: true }).click();
    await expect(page).toHaveURL(/#\/topics$/);
    await expect(
      nav.getByRole("link", { name: "专题学习", exact: true }),
    ).toHaveAttribute("aria-current", "page");

    await page.goBack();
    await expect(page).toHaveURL(/#\/home$/);
    await expect(
      nav.getByRole("link", { name: "学习工作台", exact: true }),
    ).toHaveAttribute("aria-current", "page");

    await page.goForward();
    await expect(page).toHaveURL(/#\/topics$/);
    await expect(
      nav.getByRole("link", { name: "专题学习", exact: true }),
    ).toHaveAttribute("aria-current", "page");
  });

  test("键盘 Tab 顺序与焦点可见样式正常", async ({ page }) => {
    await open(page, "#/home");
    const nav = sidebar(page);
    const home = nav.getByRole("link", { name: "学习工作台", exact: true });
    await home.focus();
    await page.keyboard.press("Tab");
    const roadmap = nav.getByRole("link", { name: "学习路线", exact: true });
    await expect(roadmap).toBeFocused();
    const outline = await roadmap.evaluate(
      (element) => getComputedStyle(element).outlineStyle,
    );
    expect(["solid", "auto"]).toContain(outline);
  });
});

test("短屏 1280x540：底栏固定、中部可滚动且当前课可达", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 540 });
  await open(page, "#/lesson/day03");
  const nav = sidebar(page);
  await expect(nav.locator(".sidebar-foot")).toBeVisible();
  const scrollable = await nav.locator(".nav-scroll").evaluate(
    (element) => element.scrollHeight > element.clientHeight,
  );
  expect(scrollable).toBe(true);
  const active = nav.locator('a.nav-item[href="#/lesson/day03"]');
  await expect(active).toHaveAttribute("aria-current", "page");
  const visible = await active.evaluate((element) => {
    const scroller = element.closest(".nav-scroll");
    if (!scroller) return false;
    const item = element.getBoundingClientRect();
    const view = scroller.getBoundingClientRect();
    return item.top >= view.top - 1 && item.bottom <= view.bottom + 1;
  });
  expect(visible).toBe(true);
});

test("移动抽屉：分组可滚动、入口不丢失、底栏固定、Esc 关闭并归还焦点", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, "#/home");
  const menu = page.getByRole("button", { name: "打开导航菜单" });
  await menu.click();
  const drawer = page.getByRole("dialog", { name: "学习导航" });
  await expect(drawer).toBeVisible();

  for (const name of PRIMARY) {
    await expect(drawer.getByRole("link", { name, exact: true })).toBeVisible();
  }

  await drawer
    .locator("summary")
    .filter({ hasText: "资料与底稿" })
    .first()
    .click();
  const guide = drawer.getByRole("link", { name: "环境搭建与排查" });
  await guide.scrollIntoViewIfNeeded();
  await expect(guide).toBeVisible();

  // 底栏主题按钮的可见文字是“主题”，无障碍名按当前状态标注
  await expect(
    drawer.getByRole("button", { name: /切换到(深色|浅色)主题/ }),
  ).toBeVisible();
  await expect(drawer.getByRole("button", { name: "备份" })).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(drawer).not.toBeVisible();
  await expect(menu).toBeFocused();
});

test("侧栏与移动抽屉通过 WCAG AA 扫描（浅色与深色）", async ({ page }) => {
  test.setTimeout(120_000);
  for (const theme of ["light", "dark"] as const) {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
    await open(page, "#/home");
    const desktopScan = await new AxeBuilder({ page })
      .include("aside.sidebar")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(desktopScan.violations).toEqual([]);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("button", { name: "打开导航菜单" }).click();
    const drawer = page.getByRole("dialog", { name: "学习导航" });
    await expect(drawer).toBeVisible();
    const drawerScan = await new AxeBuilder({ page })
      .include("dialog.drawer")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(drawerScan.violations).toEqual([]);
    await page.keyboard.press("Escape");
  }
});

test("五档视口无整页横向溢出", async ({ page }) => {
  for (const width of [1440, 1024, 768, 390, 360]) {
    await page.setViewportSize({ width, height: 900 });
    await open(page, "#/home");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth,
    );
    expect(overflow, `${width}px 整页横向溢出`).toBeLessThanOrEqual(1);
  }
});
