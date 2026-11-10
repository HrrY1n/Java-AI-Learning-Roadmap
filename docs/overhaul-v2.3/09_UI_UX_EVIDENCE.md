# 09 · UI/UX 证据（V2.3）

> 全部截图来自**生产 preview 构建**（`vite preview`，非 dev server）的真实走查，存于 `docs/javaroadmap_lab/v23-evidence/`（随本报告入库）；原始走查脚本与全量 24 张截图在 `.audit-work/v23/journey*.mjs/.png`（gitignored）。

## 一、证据清单（9 张关键截图）

| 文件 | 页面 | 验证点 |
| --- | --- | --- |
| `A00-home.png` | 学习工作台首页 | 入口区、继续学习卡、品牌布局无空洞区域 |
| `A01-roadmap.png` | 知识地图 | 14 阶段分布与"当前专注"标记 |
| `A04-day03.png` | day03 条件分支（连续正文课） | 正文+右侧脉络 TOC+步骤切换无排版割裂 |
| `A08-day07.png` | day07 基本类型（连续正文课） | JLS 边界实验与修改步骤展示 |
| `B01-arraylist.png` | s03-arraylist | 连续讲义 + 三大坑结构 |
| `B06-sql.png` | s05-sql-basics | SQL 约束正文与本地实验指引 |
| `B08-transactions.png` | s05-transactions-acid | RR/MVCC 正文与运行命令 |
| `B10-jdbc.png` | s05-jdbc-dao | **MySQL 驱动 `-cp` 提示**与防注入正文 |
| `B11-lab-counter.png` | 编程实验室 s04-safe-counter | **新契约"实际累加线程（排序去重）"**、L1–L4 提示门禁、四用例区、Monaco 编辑器 |
| `B12-lab-pool.png` | 编程实验室 s04-thread-pool-lab | **新契约"执行线程名（排序去重）"**与 `pool-` 前缀判定说明 |

（`A01-roadmap` 与 `A09-lab-scores` 为补充证据；`A09` 文件名对应 scores 练习页。）

## 二、走查中的页面质量结论

1. **零页面错误**：24 页走查 0 console error / 0 pageerror / 0 HTTP≥400（生产 preview）。
2. **无空洞区域**：V2.2 修复的"空卡片 fragmented display"经抽样复查（day03/day07/arraylist/sql-basics）未见复发；7 步短卡课（day01/day04-06 等）步骤间有实质内容且与本课代码联动。
3. **新内容呈现**：R1/R2 的契约行、机制小节、Git 沙箱实测段均正常渲染（字体覆盖 1416 汉字全过，无豆腐块）。
4. **练习门禁**：L1–L4 提示逐级解锁、参考实现需确认加载（查看行为单独记录）——截图 `B11/B12` 可见门禁 UI。
5. **已知打磨项**（不改，记录于 13）：`#/practice`（预测中心）与 `#/lab`（实验室）命名对初学者不够自明；building 专题薄课无"待扩写"标记；day07 无结构化 Web 练习。

## 三、与任务书"先修内容再看 CSS"原则的对应

本轮全部 UI 证据都是**在内容修复完成后**采集的（R1/R2 提交之后的构建），页面展示的即是修复后的真实内容——不存在"给空洞内容加样式"的情况。
