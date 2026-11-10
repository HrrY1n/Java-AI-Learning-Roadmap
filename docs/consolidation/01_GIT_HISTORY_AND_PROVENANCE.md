# 01 · Git 历史与三代成果考古

## 一、提交-功能对应图（提交层）

```
main 6c3ca91 ──┬─ V2.0（codex/deep-overhaul，11 提交：R1-R10 深度重构 + 交付）
               │   239d9a9 R1+R2 内容 P0 → 2ddf0f5 R5 数据前向兼容/搜索全文索引 →
               │   9ad95b6 R6 断档课 → ca7991d R7 答案达标 → 174bec0/e752b10/365da68 → fb9e267 交付
               ├─ V2.1（codex/deep-overhaul-v2.1，10 提交）
               │   8d3b542 P1 元数据/正文分离+KaTeX 懒加载（主包 -44%）→ ceeb37f P4 算法纯函数化 →
               │   93f80a0 P5 modifiedCode → ada78bd P2 Git 薄课扩写 → 4363c8c P3 Stage04 首批四课 →
               │   6a44dfa P6 专题快修 → 3c10bf7/15b25b3/b9d76bc/6fc881f 交付+修复 → ea1898a 交付
               ├─ V2.2（codex/deep-overhaul-v2.2，13 提交）
               │   9aaac20/e2b8dfc/233c24d P0 干净检出三修复（KaTeX 静态回归）→ 65ac38a 基线报告 →
               │   a09d0c2 P3 Stage04 实践闭环 → daf62d4 P1/P5 深度修复+连续正文展示 →
               │   82a4094 P2 诊断机制 → 4e54dd2 P4 Stage05 MySQL+6 阶段项目 → 69e877a P6 专题升级 →
               │   c989512 P5 E2E → f6a822c CRLF → fca64d2 评审修复 → 32ecf59 交付
               └─ V2.3（codex/deep-overhaul-v2.3，7 提交）
                   949cdbc 基线+全量审计 → 8d80b4e R1 内容修复 → 853ecc7 R2 薄课扩写 →
                   2e39550 R3 路径验证+文档 → e703871 R4 审查修复 → 1e9342b R5 E2E 真实性 → 135a62f 交付
```

## 二、三代功能增量对照（功能层）

| 能力域 | V2.0+V2.1 建立了什么 | V2.2 增加了什么 | V2.3 增加了什么 | 判定 |
| --- | --- | --- | --- | --- |
| 内容架构 | catalog 元数据/正文分离（主包 −44%）、稳定 ID registry、内容生成器与校验器 | — | 内容幂等核验 | **KEEP**（核心架构，三轮零重构） |
| 主线课程 | Stage01–03 体系 + Stage04 首批 4 课 | Stage01–04 深度修复 + 连续正文展示（LessonPage splitIndex+TOC） | 全量审计修复 + 机制成文 | **KEEP** |
| Stage05 | — | MySQL 5 课 + 6 阶段演进项目 + verify_mysql 双脚本 | UNIQUE NULL/EXPLAIN/驱动表述修正 | **KEEP** |
| 练习体系 | 预测/修改题 schema（modifiedCode） | Stage04 3 门结构化练习（确定性契约） | 契约升级为真结构不变量 + 12 用例锁定 | **KEEP** |
| 诊断 | — | 理解/Debug/迁移题集 + 四要素闭环 + diagnostic-semantics 真机套件 | CRLF 归一化 | **KEEP** |
| 专题 | Git 4 门扩写、算法纯函数化、V1.4 架构 | 三大 building 专题 3 门实质升级 | Git 6 门沙箱扩写 + stageLinks/计数修正 | **KEEP** |
| 展示层 | React.memo、KaTeX fence 跳过 | LessonPage 连续正文+脉络 TOC+多包标注+驱动提示 | 仅修 2 个 E2E spec | **KEEP** |
| KaTeX | 动态懒加载（V2.1） | **被推翻**：回退静态 import（生产崩溃） | — | **REMOVE**（V2.1 方案被 V2.2 正确替代——"较新实现不一定更好"的实证） |
| E2E | — | v22-lessons spec + pages smoke 修复 | 4173 硬编码根治 + 探针独有词 | **KEEP + 待扩 CI 面**（07 文档） |
| Java 回归 | verify_manifest 双平台 | 104→107 项 | 107→108 项（FieldShadowDemo） | **KEEP** |
| 数据兼容 | schemaVersion 1 + BAD_KEYS + revision | 零破坏 | 零破坏 | **KEEP（红线）** |
| CI | JDK25×2 精简 | +web-core 3OS/core E2E + web-visual | 三提交全绿 | **KEEP + 方案 B**（+v14-topics，07 文档量化） |

## 三、"哪些只是改了表现形式 vs 真正提高质量"（证据）

**真正提高产品质量**（有实测前后对比）：
1. 元数据/正文分离（主包 1,892→1,560 KB raw，−17.5%）；
2. KaTeX 静态回退（生产页崩溃 → 0）；
3. 确定性并发练习契约（不可判分 → 12 用例锁定 + 防伪装结构不变量）；
4. Stage05 真库实验路径（纯文本 SQL → 6 程序隔离容器实测）；
5. 诊断四要素闭环 + 真机 javac 套件；
6. 干净检出验证纪律（三轮各抓出真实阻断：KaTeX 崩溃、CRLF、4173 假绿）。

**只是改变表现形式**（价值有限但无害，均保留）：
1. V2.2 的 LessonPage 连续正文展示改造——服务内容升级，本身不含新知识；
2. V2.1 的 Git 课扩写模板化改造——为 V2.3 六门扩写提供格式先例；
3. 各轮交付文档的统计口径调整。

**被覆盖/失效的旧实现**：
1. V2.1 KaTeX 动态 chunk（REMOVE，见上）；
2. `gen_stage04_lessons.py` 生成脚本（V2.2 评审后删除）；
3. E2E 中的陈旧计数断言与"旅行商"探针（V2.2/V2.3 陆续替换）；
4. V2.1 的"clean-checkout 69/69"结论中 4173 依赖部分（V2.3 R5 根治后才真正成立）。

## 四、容易被忽视但系统运行关键的历史功能

1. `verify_manifest.tsv` 的"预期输出子串"机制——Java 回归的确定性基石；
2. `registry.json` 的 knownIds 门禁——防止课程 ID 静默丢失；
3. `learning-store.ts` 的 `validateBackup` 硬拒未知 schemaVersion——用户学习数据的安全阀；
4. `stage05-compile.test.mjs` 的"无 DB 可编译"门禁——保证不装 MySQL 的学习者不破门禁；
5. `diagnostic-semantics.test.mjs` 的 locale 固定（`-J-Duser.language=en`）——中文 Windows 上 JLS 报错可复现的前提；
6. `check-font-coverage` 字体子集门禁——新内容汉字自动纳入校验（V2.3 期间 1412→1416 顺畅通过）。
