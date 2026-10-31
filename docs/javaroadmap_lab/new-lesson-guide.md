# 新增课程指南（V1.2 内容架构）

适用版本：main 含 V1.2 内容架构之后。本指南回答"未来增加课程需要做什么、不需要做什么"。

## 总览：三层职责

```text
仓库课程材料（stages/…）     web/content/ 元数据            生成器（scripts/content/）
Markdown 正文 / Java 源码  +  稳定 ID / 关系 / 发布状态  →  校验并生成 src/generated/catalog.json
（唯一权威来源，手写维护）     （每课/每练习一个小 JSON）        （自动：关系、ID 契约、参考资源）
```

**原则：正文只有一份权威来源；元数据只描述"是什么、和谁有关系、是否发布"；生成器负责校验一切。**

## 1. 新增一个 Stage

1. 在 `web/content/stages.json` 的 `stages` 数组中添加条目：

   ```json
   { "id": "02", "contentState": "materials", "prerequisites": "Stage 01 基础。",
     "modules": [], "referenceRoots": [], "referenceDocuments": [] }
   ```

2. `contentState` 含义（内容整理程度，与学习者掌握状态无关）：
   - `published`：已正式发布——该阶段课程会出现在网站；
   - `materials`：仓库有材料但尚未整理成正式课程；
   - `draft`：草稿/测试内容；
   - `planned`：尚未开始。
3. 首次挂课程前补齐 `"slug"`（`stages/` 下的目录名，如 `stage02_java_oop`）与 `"packageNamePrefix"`（如 `com.javaroadmap.lab.stage02`）。
4. 确认 `统一学习路线.md` 与 `真实学习进度.md` 中已有该 Stage 的行（内容生成器从这两份文档读取标题/状态——它们是唯一权威来源）。

## 2. 在既有 Stage 下新增 Module

在 `stages.json` 对应条目的 `modules` 数组中加 `{ "id": "foundations", "title": "基础课程" }`。Module 只是课程的组织标签（课程 JSON 的 `moduleId` 引用它），不创建空目录。

## 3. 新增一节课程（推荐：脚手架）

```bash
cd web
node scripts/create-lesson.mjs --stage 02 --kind deep-dive --slug encapsulation \
  --title "封装" --summary "把修改入口收拢到类内。" \
  --exercise guard --exercise-title "账户守门"
```

脚手架会生成：`stages/<slug>/deep_dives/<NN>_<slug>/README.md`（含教学结构模板）、`Demo.java` 占位（包名自动）、`web/content/lessons/stageNN/<id>.json`（**contentState=draft**）、练习与 L1–L4 提示模板（可选）。手工新增也完全合法：按第 4 节的元数据规范写 JSON 即可。

脚手架安全规则（2026-10-31 起强制）：

- 目标路径已有任何文件（正文/Java/元数据/练习 JSON）或目标目录已存在时**拒绝覆盖**并列出全部冲突，不写入任何文件（事务性）；
- `--slug` 必须是合法包段（小写字母开头、小写字母/数字/连字符），`packageNamePrefix` 必须是合法 Java 包名，否则明确拒绝；
- 同一 Stage 追加多道练习时采用"章节追加"：新练习章节插入 `## 渐进提示` 之前、新提示小节追加到提示节末尾——`## 渐进提示` 永远只有一个，不会产生解析错误；
- 同一题面锚点（`练习 NN`）重复出现会被拒绝。

## 4. 课程元数据规范（`web/content/lessons/stageNN/<id>.json`）

```json
{
  "id": "s02-encapsulation",
  "stageId": "02",
  "moduleId": "deep-dives",
  "kind": "deep-dive",
  "title": "封装",
  "summary": "一句话简介。",
  "contentState": "published",
  "relatedLessonIds": ["s02-inheritance"],
  "exerciseIds": ["s02-guard"],
  "predictionIds": ["A21"],
  "steps": [],
  "bodyPath": "stages/stage02_java_oop/deep_dives/01_encapsulation/README.md",
  "codeDirectory": "stages/stage02_java_oop/deep_dives/01_encapsulation"
}
```

- **稳定 ID 规范**：Stage 01 保留历史 ID（`day01`–`day06`、`deep01`–`deep07`、`scores` 等，永不改动）；新课程用 `s{NN}-{slug}`，预测/修改题用 `A{NN}{seq}` / `B{NN}{seq}`（Stage 01 已占 A1–A8、B1–B4）。ID 必须匹配 `^[a-zA-Z0-9][a-zA-Z0-9._-]*$` 且全局唯一。
- `steps`：foundation 课的教学步骤（label/body）；deep-dive 课为空数组（正文在 bodyPath）。
- `bodyPath` 是正文的**唯一权威来源**；`codeDirectory` 下第一个 `.java`（排序后）作为示例代码。
- **contentState 只有 `published` 会进入网站**；`draft`/`materials` 阶段的内容即使写了 JSON 也不会发布。

## 5. 关联示例代码 / 参考答案

- 课程示例：`codeDirectory` 指向含 `.java` 的目录即可。
- 练习参考答案：练习 JSON 的 `referenceFiles` 只写文件名，生成器拼接为 `stages/<slug>/existing_course/answers/.../answers/<文件>`；该目录必须是学习者完成练习后才查看的参考实现，缺失文件会让构建失败。
- 其它参考资源（源码树、项目目录）通过 `stages.json` 的 `referenceRoots` 注册；所有参考资源以懒加载 JSON 暴露，永不进入课程正文。

## 6. 新增预测题 / 修改题

在 `stages/<slug>/practice/predict_and_modify.md`（或你自己的练习源文件）里按 `### A21 标题` / `### B21 标题` 写章节，A 题正文内嵌 ```java 代码块，答案写在配套 answers 文件的 `## A21` 章节（```text 输出块 + "为什么："说明）。然后在 `web/content/predictions/stageNN.json` 登记元数据：

```json
{ "stageId": "02",
  "statementSource": "stages/…/predict_and_modify.md",
  "answerSource": "stages/…/answers.md",
  "predictions": { "A21": { "lessonIds": ["s02-encapsulation"], "modifiedAnswer": false } },
  "modifications": { "B21": { "lessonIds": ["s02-encapsulation"], "note": "以当前源码为准", "referencePaths": [] } } }
```

答案与解析只存在于 answers 文件（懒加载），不进入默认练习内容。

## 7. 独立编程练习与 L1–L4 提示

练习 = 一个 `web/content/exercises/stageNN/<id>.json`（`statementAnchor` 指向题面 Markdown 的 `## 练习 N` 章节；`cases` 必须覆盖 normal/boundary/invalid；`todo` 只写任务不写答案）+ 题面 Markdown 末尾的 `## 渐进提示`（L1 理解问题 → L2 相关知识 → L3 结构思路 → L4 调试线索，恰好四条）。提示与题面同源，但生成器自动保证提示不出现在题面文档视图中。

## 8. 本地验证与发布

```bash
cd web
npm run content                    # 生成 + 全量校验（关系/ID/资源/数量契约）
npm run content -- --update-registry   # 新课程稳定 ID 登记进 registry.json（显式动作；未登记时构建会失败并提示本命令）
npm test && npm run build && npm run test:e2e
```

然后提交 PR；CI（三平台 web-core + web-visual + Java 回归）通过后合并，`Deploy JavaRoadmap Lab Pages` 工作流自动发布。

## 9. 修改 / 撤回课程（不破坏用户历史）

- **改正文 / 改标题 / 调整顺序**：直接改，稳定 ID 不变则用户记录自动保持关联。
- **下线课程**：先删除课程（与关联练习），构建会**显式报错**并列出消失的 ID；在 `web/content/registry.json` 的 `retired` 登记后放行。retired ID 重新出现也会报错。
- **课程改名**：旧 ID 从目录消失 + `registry.json.renames` 登记 `{ "旧ID": "新ID" }`。**注意：renames 只登记目录层的 ID 映射，不会自动迁移用户 IndexedDB 里的历史记录**（记录以旧 ID 为键原样保留）；是否需要数据层面的迁移由你显式决定，构建器不代做。用户历史按键保留，不做静默迁移。
- 用户的学习数据（IndexedDB）永远以 ID 为键，本轮及以后的内容变更都不触碰 `LearningState` schema。

## 10. 教学质量红线

新课程遵守 Scenario → Why → Concept → Mental Model → Minimal Code → Observe → Modify → Exercise → Real Usage（可按主题调整，但必须有可验证的学习动作）；提示四级递进、默认不给完整答案；参考实现与个人练习（`my_practices/`）隔离；内容发布永远不会自动修改 `真实学习进度.md`、用户草稿或练习记录。
