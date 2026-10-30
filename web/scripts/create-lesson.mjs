// 课程脚手架：为指定 Stage 生成一节新课程的元数据、正文模板与 Java 占位源码。
// 用法示例：
//   node scripts/create-lesson.mjs --stage 02 --kind deep-dive --slug encapsulation \
//     --title "封装" --summary "把修改入口收拢到类内。" [--exercise guard --exercise-title "账户守门"]
// 生成的课程默认 contentState=draft：只有显式改为 published 才会进入网站。
import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(webRoot, "..");
const contentRoot = path.join(webRoot, "content");

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i]?.replace(/^--/, "");
    args[key] = argv[i + 1];
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const stageId = args.stage;
const kind = args.kind ?? "deep-dive";
const slug = args.slug;
const title = args.title;
const summary = args.summary ?? "";
const exerciseSlug = args.exercise;
const exerciseTitle = args["exercise-title"] ?? args.exerciseTitle;

if (!stageId || !slug || !title) {
  console.error(
    "用法：node scripts/create-lesson.mjs --stage 02 --kind deep-dive --slug encapsulation --title 封装 --summary 简介 [--exercise guard --exercise-title 账户守门]",
  );
  process.exit(2);
}
if (!["foundation", "deep-dive"].includes(kind)) {
  console.error(`--kind 必须是 foundation 或 deep-dive，收到：${kind}`);
  process.exit(2);
}

const stages = JSON.parse(
  await readFile(path.join(contentRoot, "stages.json"), "utf8"),
);
const stage = stages.stages.find((item) => item.id === stageId);
if (!stage) {
  console.error(`Stage ${stageId} 未在 web/content/stages.json 注册。请先按指南新增 Stage。`);
  process.exit(1);
}
if (stage.contentState !== "published" && stage.contentState !== "materials") {
  console.error(
    `Stage ${stageId} 的 contentState=${stage.contentState}。只有 published / materials 阶段可以挂课程；先在 stages.json 调整状态并补齐 slug 与 packageNamePrefix。`,
  );
  process.exit(1);
}
if (!stage.slug || !stage.packageNamePrefix) {
  console.error(
    `Stage ${stageId} 缺少 slug 或 packageNamePrefix：请在 web/content/stages.json 补齐后再运行脚手架。`,
  );
  process.exit(1);
}
if (stage.contentState === "materials") {
  console.warn(
    `提示：Stage ${stageId} 仍是 materials。课程将以 draft 状态生成，且该阶段整体未发布前不会出现在网站上。`,
  );
}

const stageSlug = stage.slug;
const lessonIndex = args.index ?? String(Date.now()).slice(-2);
const directoryName = `${lessonIndex}_${slug}`;
const lessonDir = path.join(repoRoot, "stages", stageSlug, "deep_dives", directoryName);
if (kind === "foundation") {
  console.error("foundation 课程请遵循现有 existing_course/dayNN 目录结构，参考 docs/javaroadmap_lab/new-lesson-guide.md。");
  process.exit(1);
}
const packageName = `${stage.packageNamePrefix}.${slug}`;
const lessonId = `s${stageId}-${slug}`;

const readme = `# 深化课：${title}

<!-- 本文件是这节课正文的唯一权威来源。删除本注释前请阅读 docs/javaroadmap_lab/new-lesson-guide.md。 -->

## 场景：为什么值得搞清楚这个

<!-- 用一个真实开发问题开场：不用这个概念会发生什么？ -->

## 必须理解

<!-- 概念与心智模型：少量术语 + 输入/状态/边界。 -->

## 理解原理

<!-- 程序内部发生了什么？给出可运行的小实验。 -->

## 动手：修改一个条件

<!-- 只改一个有意义的条件，让学习者先预测差异再运行。 -->

## 常见错误

<!-- 列出 2-3 个高频误解与修正方式。 -->

## 独立练习

<!-- 不给完整答案；指向实验室练习（如果有）。 -->

## 与后面学习的联系

<!-- 这节课在后续哪个 Stage / 项目中再次出现。 -->
`;

const java = `package ${packageName};

/**
 * 深化课：${title}
 *
 * 场景：${summary || "（一句话说明这节课解决什么问题）"}
 * Observe：先预测输出，再运行核对。
 * Modify：只改一个条件，验证你的预测。
 */
public class ${slug
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("")}Demo {
    public static void main(String[] args) {
        // TODO: 由你实现这节课的最小示例。
    }
}
`;

await mkdir(path.join(lessonDir, "com", ...packageName.split(".").slice(0, -1), packageName.split(".").at(-1)), {
  recursive: true,
});
await writeFile(path.join(lessonDir, "README.md"), readme, "utf8");
const javaName = `${slug
  .split(/[-_]/)
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join("")}Demo.java`;
await writeFile(path.join(lessonDir, "com", ...packageName.split("."), `${javaName}`), java, "utf8");

const lessonMeta = {
  id: lessonId,
  stageId,
  moduleId: args.module ?? "deep-dives",
  kind,
  title,
  summary,
  contentState: "draft",
  relatedLessonIds: [],
  exerciseIds: exerciseSlug ? [`s${stageId}-${exerciseSlug}`] : [],
  predictionIds: [],
  steps: [],
  bodyPath: `stages/${stageSlug}/deep_dives/${directoryName}/README.md`,
  codeDirectory: `stages/${stageSlug}/deep_dives/${directoryName}`,
};
await mkdir(path.join(contentRoot, `lessons/stage${stageId}`), { recursive: true });
await writeFile(
  path.join(contentRoot, `lessons/stage${stageId}/${lessonId}.json`),
  `${JSON.stringify(lessonMeta, null, 2)}\n`,
  "utf8",
);

if (exerciseSlug) {
  const exerciseMeta = {
    id: `s${stageId}-${exerciseSlug}`,
    stageId,
    title: exerciseTitle ?? exerciseSlug,
    className: exerciseSlug
      .split(/[-_]/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(""),
    order: 99,
    contentState: "draft",
    lessonIds: [lessonId],
    statementSource: `stages/${stageSlug}/practice/s${stageId}-exercises.md`,
    statementAnchor: `练习 ${lessonIndex}`,
    hintSource: `stages/${stageSlug}/practice/s${stageId}-exercises.md`,
    todo: "由你完成核心实现；这里只保留 TODO。",
    note: null,
    cases: [
      { label: "正常示例", input: "（输入）", expected: "（预期输出）", kind: "normal" },
      { label: "边界示例", input: "（边界输入）", expected: "（预期输出）", kind: "boundary" },
      { label: "错误输入", input: "（非法输入）", expected: "（预期提示）", kind: "invalid" },
    ],
    referenceFiles: [],
  };
  await mkdir(path.join(contentRoot, `exercises/stage${stageId}`), { recursive: true });
  await writeFile(
    path.join(contentRoot, `exercises/stage${stageId}/s${stageId}-${exerciseSlug}.json`),
    `${JSON.stringify(exerciseMeta, null, 2)}\n`,
    "utf8",
  );
  const practiceDir = path.join(repoRoot, "stages", stageSlug, "practice");
  const practiceFile = path.join(practiceDir, `s${stageId}-exercises.md`);
  let practice = "";
  try {
    practice = await readFile(practiceFile, "utf8");
  } catch {
    practice = `# Stage ${stageId} 练习\n`;
  }
  practice += `\n## 练习 ${lessonIndex}：${exerciseTitle ?? exerciseSlug}\n\n<!-- 任务背景 / 输入 / 输出 / 约束 / 示例（正常+边界+错误）/ 验收条件。不要在这里写答案。 -->\n\n---\n\n## 渐进提示\n\n### 练习 ${lessonIndex}：${exerciseTitle ?? exerciseSlug}\n\n- **L1 理解问题**：（用自己的话复述目标）\n- **L2 相关知识**：（指向相关课程）\n- **L3 结构思路**：（方法列表/数据流，不给实现）\n- **L4 调试线索**：（针对具体卡点的观察方法）\n`;
  await mkdir(practiceDir, { recursive: true });
  await writeFile(practiceFile, practice, "utf8");
}

console.log(`已生成课程骨架（contentState=draft，不会发布）：
  正文   stages/${stageSlug}/deep_dives/${directoryName}/README.md
  示例   ${javaName}（包 ${packageName}）
  元数据 web/content/lessons/stage${stageId}/${lessonId}.json
${exerciseSlug ? `  练习   web/content/exercises/stage${stageId}/s${stageId}-${exerciseSlug}.json + stages/${stageSlug}/practice/` : ""}
下一步：
  1) 填写正文与示例代码；
  2) npm run content 校验；
  3) 完成教学验收后，把元数据 contentState 改为 published（阶段也需为 published）；
  4) npm run content -- --update-registry 登记稳定 ID；
  5) 提交 PR。`);
