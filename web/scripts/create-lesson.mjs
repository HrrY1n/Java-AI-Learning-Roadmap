// 课程脚手架：为指定 Stage 生成一节新课程的元数据、正文模板与 Java 占位源码。
// 用法示例：
//   node scripts/create-lesson.mjs --stage 02 --kind deep-dive --slug encapsulation \
//     --title "封装" --summary "..." [--index 01] [--exercise guard --exercise-title "账户守门"]
// 安全规则：
//   - 先完整规划并预检冲突（已存在的文件、重复锚点、非法标识符），再统一写入；
//     任何规划错误都不会留下半生成的文件集合。
//   - 练习以“章节追加”写入题面 Markdown：无论追加多少道练习，`## 渐进提示` 只出现一次。
//   - 生成的课程/练习默认 contentState=draft，显式改为 published 才会发布。
import { mkdir, writeFile, readFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(webRoot, "..");
const contentRoot = path.join(webRoot, "content");

const SLUG_RE = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const PACKAGE_PREFIX_RE = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*$/;
const LESSON_INDEX_RE = /^\d{2}$/;
const PRACTICE_SPLIT = "\n## 渐进提示\n";

export function toPascal(slug) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

async function exists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

/**
 * 纯规划函数：校验输入与冲突，返回待写入文件集合。不做任何磁盘写入。
 * 冲突 / 非法输入抛出 Error（消息面向学习者，可直接展示）。
 */
export async function planLesson(options) {
  const {
    stageId,
    kind = "deep-dive",
    slug,
    title,
    summary = "",
    index,
    module: moduleId = "deep-dives",
    exercise,
    exerciseTitle,
    repoRoot,
    contentRoot,
  } = options;

  const conflicts = [];
  const fail = (message) => {
    const suffix = conflicts.length
      ? `（冲突：${conflicts.join("；")}）`
      : "";
    throw new Error(`${message}${suffix}`);
  };

  if (!stageId || !slug || !title)
    fail("必须提供 --stage、--slug 与 --title");
  if (!LESSON_INDEX_RE.test(index ?? ""))
    fail("--index 必须是两位数字（如 01），用于目录排序与练习锚点");
  if (!SLUG_RE.test(slug))
    fail(
      `非法 slug「${slug}」：只允许小写字母/数字并以连字符分段（用作目录名与 Java 包段）`,
    );
  if (!["foundation", "deep-dive"].includes(kind))
    fail(`非法课程类型 kind=${kind}（foundation 请按现有 existing_course/dayNN 结构手工添加）`);

  const stages = JSON.parse(
    await readFile(path.join(contentRoot, "stages.json"), "utf8"),
  );
  const stage = stages.stages.find((item) => item.id === stageId);
  if (!stage) fail(`Stage ${stageId} 未在 web/content/stages.json 注册`);
  if (stage.contentState !== "published" && stage.contentState !== "materials")
    fail(
      `Stage ${stageId} 的 contentState=${stage.contentState}，只有 published / materials 阶段可以挂课程`,
    );
  if (!stage.slug || !stage.packageNamePrefix)
    fail(`Stage ${stageId} 缺少 slug 或 packageNamePrefix：先在 stages.json 补齐`);
  if (!PACKAGE_PREFIX_RE.test(stage.packageNamePrefix))
    fail(
      `Stage ${stageId} 的 packageNamePrefix 不是合法 Java 包名：${stage.packageNamePrefix}`,
    );
  if (kind === "deep-dive" && !(stage.modules ?? []).some((m) => m.id === moduleId))
    fail(
      `moduleId=${moduleId} 不属于 Stage ${stageId} 已注册模块（${(stage.modules ?? []).map((m) => m.id).join("、") || "无"}）`,
    );

  const stageSlug = stage.slug;
  const directoryName = `${index}_${slug}`;
  const lessonDir = path.join(
    repoRoot,
    "stages",
    stageSlug,
    "deep_dives",
    directoryName,
  );
  const packageName = `${stage.packageNamePrefix}.${slug}`;
  const lessonId = `s${stageId}-${slug}`;
  const lessonJsonPath = path.join(
    contentRoot,
    "lessons",
    `stage${stageId}`,
    `${lessonId}.json`,
  );
  const readmePath = path.join(lessonDir, "README.md");
  const javaPath = path.join(
    lessonDir,
    ...packageName.split("."),
    `${toPascal(slug)}Demo.java`,
  );

  for (const target of [lessonJsonPath, readmePath, javaPath]) {
    if (await exists(target)) conflicts.push(path.relative(repoRoot, target));
  }
  if (await exists(lessonDir)) conflicts.push(path.relative(repoRoot, lessonDir) + "/");
  if (conflicts.length) fail("目标路径已存在，拒绝覆盖");

  const writes = [
    {
      path: readmePath,
      content: `# 深化课：${title}\n\n<!-- 本文件是这节课正文的唯一权威来源。删除本注释前请阅读 docs/javaroadmap_lab/new-lesson-guide.md。 -->\n\n## 场景：为什么值得搞清楚这个\n\n<!-- 用一个真实开发问题开场：不用这个概念会发生什么？ -->\n\n## 必须理解\n\n<!-- 概念与心智模型：少量术语 + 输入/状态/边界。 -->\n\n## 理解原理\n\n<!-- 程序内部发生了什么？给出可运行的小实验。 -->\n\n## 动手：修改一个条件\n\n<!-- 只改一个有意义的条件，让学习者先预测差异再运行。 -->\n\n## 常见错误\n\n<!-- 列出 2-3 个高频误解与修正方式。 -->\n\n## 独立练习\n\n<!-- 不给完整答案；指向实验室练习（如果有）。 -->\n\n## 与后面学习的联系\n\n<!-- 这节课在后续哪个 Stage / 项目中再次出现。 -->\n`,
    },
    {
      path: javaPath,
      content: `package ${packageName};\n\n/**\n * 深化课：${title}\n *\n * 场景：${summary || "（一句话说明这节课解决什么问题）"}\n * Observe：先预测输出，再运行核对。\n * Modify：只改一个条件，验证你的预测。\n */\npublic class ${toPascal(slug)}Demo {\n    public static void main(String[] args) {\n        // TODO: 由你实现这节课的最小示例。\n    }\n}\n`,
    },
    {
      path: lessonJsonPath,
      content: `${JSON.stringify(
        {
          id: lessonId,
          stageId,
          moduleId,
          kind,
          title,
          summary,
          contentState: "draft",
          relatedLessonIds: [],
          exerciseIds: exercise ? [`s${stageId}-${exercise}`] : [],
          predictionIds: [],
          steps: [],
          bodyPath: `stages/${stageSlug}/deep_dives/${directoryName}/README.md`,
          codeDirectory: `stages/${stageSlug}/deep_dives/${directoryName}`,
        },
        null,
        2,
      )}\n`,
    },
  ];

  let exercisePlan = null;
  if (exercise) {
    const exerciseId = `s${stageId}-${exercise}`;
    if (!SLUG_RE.test(exercise))
      fail(`非法练习 slug「${exercise}」：只允许小写字母/数字并以连字符分段`);
    const exerciseJsonPath = path.join(
      contentRoot,
      "exercises",
      `stage${stageId}`,
      `${exerciseId}.json`,
    );
    if (await exists(exerciseJsonPath)) conflicts.push(path.relative(repoRoot, exerciseJsonPath));
    const practiceDir = path.join(repoRoot, "stages", stageSlug, "practice");
    const practicePath = path.join(practiceDir, `s${stageId}-exercises.md`);
    const anchor = `练习 ${index}`;
    const heading = `## ${anchor}：${exerciseTitle ?? exercise}`;

    let practice = "";
    if (await exists(practicePath)) {
      practice = await readFile(practicePath, "utf8");
      const statementPart = practice.split(PRACTICE_SPLIT)[0];
      const hintPart = practice.includes(PRACTICE_SPLIT)
        ? PRACTICE_SPLIT + practice.split(PRACTICE_SPLIT).slice(1).join(PRACTICE_SPLIT)
        : "";
      if (statementPart.includes(`\n${heading}`) || statementPart.trimEnd().endsWith(`\n${heading}`))
        conflicts.push(`${path.relative(repoRoot, practicePath)} 中的「${heading}」`);
      if (hintPart.includes(`### ${anchor}`))
        conflicts.push(`${path.relative(repoRoot, practicePath)} 中的提示「### ${anchor}」`);
      exercisePlan = {
        exerciseJsonPath,
        practicePath,
        statementPart,
        hintPart,
        heading,
        anchor,
      };
    } else {
      exercisePlan = {
        exerciseJsonPath,
        practicePath,
        statementPart: `# Stage ${stageId} 练习\n`,
        hintPart: "",
        heading,
        anchor,
      };
    }

    const exerciseSection = `\n${heading}\n\n<!-- 任务背景 / 输入 / 输出 / 约束 / 示例（正常+边界+错误）/ 验收条件。不要在这里写答案。 -->\n`;
    const hintSection = `\n### ${anchor}：${exerciseTitle ?? exercise}\n\n- **L1 理解问题**：（用自己的话复述目标）\n- **L2 相关知识**：（指向相关课程）\n- **L3 结构思路**：（方法列表/数据流，不给实现）\n- **L4 调试线索**：（针对具体卡点的观察方法）\n`;

    const practiceContent = exercisePlan.hintPart
      ? exercisePlan.statementPart.trimEnd() + "\n" + exerciseSection + "\n" + PRACTICE_SPLIT.trim() + "\n" +
        exercisePlan.hintPart.slice(PRACTICE_SPLIT.length).trimEnd() + "\n" + hintSection
      : exercisePlan.statementPart.trimEnd() + "\n" + exerciseSection + "\n" +
        PRACTICE_SPLIT.trim() + "\n" + hintSection;

    writes.push({
      path: practicePath,
      content: practiceContent,
    });
    writes.push({
      path: exerciseJsonPath,
      content: `${JSON.stringify(
        {
          id: exerciseId,
          stageId,
          title: exerciseTitle ?? exercise,
          className: toPascal(exercise),
          order: 99,
          contentState: "draft",
          lessonIds: [lessonId],
          statementSource: `stages/${stageSlug}/practice/s${stageId}-exercises.md`,
          statementAnchor: anchor,
          hintSource: `stages/${stageSlug}/practice/s${stageId}-exercises.md`,
          todo: "由你完成核心实现；这里只保留 TODO。",
          note: null,
          cases: [
            { label: "正常示例", input: "（输入）", expected: "（预期输出）", kind: "normal" },
            { label: "边界示例", input: "（边界输入）", expected: "（预期输出）", kind: "boundary" },
            { label: "错误输入", input: "（非法输入）", expected: "（预期提示）", kind: "invalid" },
          ],
          referenceFiles: [],
        },
        null,
        2,
      )}\n`,
    });
  }

  if (conflicts.length)
    fail("检测到文件/章节冲突，未写入任何文件");

  return { lessonId, lessonDir, writes };
}

/* ---------- CLI ---------- */

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 2) {
    args[argv[i]?.replace(/^--/, "")] = argv[i + 1];
  }
  return args;
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const args = parseArgs(process.argv.slice(2));
  try {
    const plan = await planLesson({
      stageId: args.stage,
      kind: args.kind ?? "deep-dive",
      slug: args.slug,
      title: args.title,
      summary: args.summary ?? "",
      index: args.index,
      module: args.module,
      exercise: args.exercise,
      exerciseTitle: args["exercise-title"] ?? args.exerciseTitle,
      repoRoot,
      contentRoot,
    });
    for (const write of plan.writes) {
      await mkdir(path.dirname(write.path), { recursive: true });
      await writeFile(write.path, write.content, "utf8");
    }
    const rel = (target) => path.relative(repoRoot, target);
    console.log(
      `已生成课程骨架（contentState=draft，不会发布）：\n` +
        plan.writes.map((write) => `  ${rel(write.path)}`).join("\n") +
        `\n下一步：填写内容 → npm run content 校验 → 验收后改 contentState=published → npm run content -- --update-registry 登记稳定 ID → 提交 PR。`,
    );
  } catch (error) {
    console.error(`脚手架中止：${error.message}`);
    process.exit(1);
  }
}
