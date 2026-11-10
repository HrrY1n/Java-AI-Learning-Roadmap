# 08 · 课程展示方式与学习体验改进报告（V2.2-P5）

> 核心问题：用户反馈“课程内容有点空，为了排版而排版”。原因不在字体大小或卡片装饰，而在 **35 门 foundation 课原本全部 `bodyPath: null`，被迫把核心知识硬拆成 3 个各一两句话的大标题短块**，中间既无连续机理正文，也没有对照表与执行轨迹，右侧脉络目录也不支持长正文 `##` 小节跳转。

## 一、遵循原则（先治内容与信息架构，不堆装饰 CSS）

- 禁止靠放大字体、加多余花哨卡片制造虚假内容密度。
- 利用既有的 `bodyPath` + 连续 Markdown 讲义能力，让 14 门代表性核心课（Stage 01 `day03`/`day07`、Stage 02 `s02-static-lifecycle`/`s02-string-common-api`、Stage 03 `s03-arraylist`/`s03-hashmap`、Stage 04 3 门并发核心课、Stage 05 全部 5 门 MySQL 课）拥有连贯深入的正文讲义。

## 二、具体工程改进（`App.tsx` / `slug-heading.ts` / `styles.css`）

1. **按步骤教学职责智能分界（不再死硬 `steps.slice(0, 3)`）**：
   - `web/src/App.tsx` 中 `splitIndex` 自动定位第一个实践型步骤（`/^(?:预测|修改|独立练习|项目迁移|动手|验证|学习验收)/`）。
   - 对既有 7 步课，`splitIndex === 3`（与之前 100% 兼容）；对挂了 `bodyPath` 连续正文的课程，上面只放 1 步「学习目标与场景」导读，紧接着是连续完整的长正文讲义（含对比表、反例代码、四要素闭环），然后呈现示例代码与本地运行说明，最后把实践步骤落在代码下方，**彻底消除空洞的三段短卡片**！
2. **右侧「本节脉络」接通连续正文 `##` 小节（`extractH2Sections`）**：
   - `App.tsx` 对 `lesson.markdown` 自动提取小节并按真实阅读流依次排列：`导读步骤 → 正文 § 小节 → 源码与本地运行 → 实践步骤`；
   - `web/src/styles.css` 为 `.lesson-article .prose h2` 与 `.lesson-code` 增加 `scroll-margin-top: 80px;`，确保点击右侧任何脉络锚点后标题完整留在视口中，不被顶部粘性栏遮挡（已由 `v22-lessons.spec.ts` 测量 `boundingBox.y >= 50` 实证）。
   - 评审后顺手修复 `web/src/slug-heading.ts`：`extractH2Sections` 展示文本剥除原始反引号，使 `§` 目录不再出现 ``1. `AtomicInteger` ...`` 原始 Markdown 记号。
3. **跨包依赖徽标与 Stage 05 运行命令准确化（评审后修补）**：
   - `App.tsx` 根据 `file.packageName === lesson.packageName` 区分展示 `同包依赖类` 与 `跨包依赖类`（如 `s02-static-lifecycle` 的 `otherpkg` 类）；
   - Stage 05 本地运行提示自动在 `java -cp` 中展示 MySQL Connector/J JAR 占位与配置说明，防止学习者直接复制执行报驱动缺失。

## 三、真实页面截图与交互验证

- 真实截图已生成并经人工视觉审视：`docs/javaroadmap_lab/artifacts/v22-s05-lesson-desktop.png`（1440×900）与 `v22-s05-lesson-mobile.png`（390×844，gitignored 工件目录）。
- 桌面端实观：左侧 `Stage 05 · MySQL  5 课` 清晰展开，中央长正文、对比表、四要素闭环与右侧 `本节脉络` 顺序严格对应，无空卡片感；移动端零横向溢出、底部导航与正文阅读舒适。
- E2E 锁定：`web/e2e/v22-lessons.spec.ts` 2/2 实测通过。
