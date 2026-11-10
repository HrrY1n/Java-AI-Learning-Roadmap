# 08 · 未解决问题与已知限制（2026-11-10）

> 诚实披露原则：以下每项都给出「为什么没做」与「建议路径」。不把未完成描述为已完成。

## A. 审计认定但本轮未修复（按审计编号）

| 项 | 现状 | 未做原因 | 建议 |
|---|---|---|---|
| Stage03 现代 API 路标（Optional/Comparator/List.of/PECS 完整讲解） | 部分完成：deep-dive 01/03/05 已上站承接路标；系统性讲授留 Stage04+ | 整课讲授与 Stage04/05 的自然归宿重复，强塞进 Stage03 违反 02 设计的「宁缺毋滥」 | Stage04 开课时装为前置小节 |
| Stage01 do-while/二维数组/三目/复合赋值 | 未补 | 预算让位给更高价值项（类型系统断档已用 day07 补齐）；这些属于「讲解缺口」而非「断档」 | 并入 supplemental_exercises 或后续 day08 |
| Stage02 equals/toString 重写系统讲授 | reference-state 深化课已有手写比较铺垫；Object.equals/hashCode 重写未成课 | 需要新深化课（含hashCode 契约实验），超出本轮预算 | 建议新 deep dive 07 |
| Stage02 web 交互练习仅 1 门 | 未变 | oop_project_exercises 三方向是架构型练习，建交互 cases 需要单文件化重设计（Stage03 的 4 门先探路） | 视 Stage03 模式效果复制 |
| algo 3 处算法函数内 println（knapsack01/editDistance/selectionSort） | 未重构 | 纯函数化必须逐一保证 stdout 与 manifest 断言逐字符一致，属机械但高风险改动；P2 价值 | 下次触碰这些文件时顺手重构 |
| git 专题 4 个薄课（record-changes/history-diff/tag/stash）缺「先预测」节 | 未补 | 需 git 沙箱实测每条命令真实输出后成文（git-lab 测试已证明可行），属下一内容批次 | 4 课 × 半天，按 F 类模板扩写 |
| git-merge-conflict 练习 `/tmp` 表述、Conventional Commits `!` 语义、签名标签 | 未改 | P2 文案级 | 随薄课扩写一并处理 |
| csapp/ostep/network 单节深度（1.2-1.8k 字符）与代码课覆盖率 | 维持 building，未扩写 | 43 节扩到发布线（2.5-4k+实验）是下一个大版本的工作量；虚报发布违反诚实纪律 | 按模块逐个转正，每模块配齐实验 |

## B. web 工程未做项（审计 P1/P2）

| 项 | 现状 | 未做原因 | 建议 |
|---|---|---|---|
| 首屏 1.80MB 单 bundle（catalog 静态导入） | 未拆 | documents/topics 正文拆分需改 catalog 数据流（触及所有页面），回归验证成本高于本轮预算；gzip 后实际传输约 300-400KB | `React.lazy` 页面级分割 + documents 动态 import()，一个独立分支完成 |
| App.tsx（2999 行）/styles.css（7431 行）拆分 | 未动 | 纯机械搬移但回归面大（无逐页视觉快照基线）；memo 化已消掉最痛的重渲染 | 独立重构分支，按 pages/dialogs/styles 三步走，每步全量 E2E |
| 预测题「修改模式」硬编码 `replace("i < 3","i <= 3")` | 未改 | 当前唯一 modifiedAnswer（A3）恰含该串，不出错；改法需 catalog 增 `modifiedCode` 字段并动 19 题数据 | 下次新增 modifiedAnswer 题之前必须先改（08 首要项） |
| ReferenceDialog 魔法路径 / 路线页 `["01".."14"]` 硬编码 / lessonLink 重复实现 / Tailwind 仅作 reset / KaTeX 全量字体 | 未改 | P2，单点小改但收益有限 | 随 App 拆分一并清理 |
| MAX_ITEMS=500 静默封顶语义 | 未改 | 当前用量远离上限 | 触顶前改为显式「容量不足」错误 |

## C. 已知限制（非缺陷，如实声明）

1. **building 三专题不因本轮扩写而变更状态**——module 级 published 的门禁语义不变（防「冒充全书建成」）。
2. **IAB 桌面面板点击通道**在本会话环境不可用（快照/读取正常，三类点击均不达 React 事件）——已用项目 Playwright（headless chromium）完成等效验证并固化为 E2E；非产品缺陷。
3. **字体子集无法增量加字**（无源字体文件）：新增已发布汉字会触发覆盖门禁，需重新子集化或选用已覆盖表达（R7 已示范后者）。
4. **Stage04-07/09/13/14** 仍为 planned：路线占位诚实呈现，材料级工作属后续版本。
5. **验证范围**：`test:pages` 与三 OS 矩阵属 CI 侧职责，本次单 OS 完成同套件（见 07 说明）。

## D. 过程修正记录（透明化）

- R5/R10 两次 `git add -A -- docs` 误吸未跟踪截图目录进提交，均以 `git rm --cached` + `commit --amend` 移除；5 张原件 md5 与基线逐字节一致，零损伤。教训已写入记忆与提交纪律。
- R8 的溢出注记初稿（4.3e9）为估算而非实测，R10 评审以数值实验纠正为 3,037,000,500——数值结论必须数值验证。
- R6 后未重跑 core E2E 导致计数断言过期（本地 dev server 复用掩盖），R10 评审在新鲜构建下抓出——门禁必须在新鲜构建下复跑。
