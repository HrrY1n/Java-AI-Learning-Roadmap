// 目录构建与内容合法性校验：Catalog 组装的唯一实现。
// 输入全部来自 web/content/ 元数据与仓库 Markdown/Java 权威来源；
// 本模块不做任何写入（写入由 generate-content.mjs CLI 负责）。
import path from "node:path";
import { contentError } from "./errors.mjs";
import {
  javaFiles,
  javaIdentity,
  listJsonFiles,
  readJson,
  readSource,
  requireSection,
  sections,
} from "./load.mjs";

const CONTENT_STATES = ["published", "materials", "draft", "planned"];
const KIND_RANK = { foundation: 0, "deep-dive": 1 };

export function cleanTitle(markdown) {
  return markdown.match(/^# (.+)$/m)?.[1].replace(/`/g, "") ?? "学习资料";
}

/* ---------- 课程发现与注册 ---------- */

async function loadLessonMetadata(contentRoot, stageEntries) {
  const lessons = [];
  // 只有正式发布的阶段才进行课程发现；materials/draft 阶段的目录不进入 Catalog
  for (const stage of stageEntries.filter(
    (item) => item.contentState === "published",
  )) {
    for (const file of await listJsonFiles(
      contentRoot,
      `lessons/stage${stage.id}`,
    )) {
      const meta = await readJson(contentRoot, `lessons/stage${stage.id}/${file}`);
      lessons.push({ file: `lessons/stage${stage.id}/${file}`, stage, meta });
    }
  }
  return lessons;
}

async function buildLessons(repoRoot, contentRoot, stageEntries) {
  const records = await loadLessonMetadata(contentRoot, stageEntries);
  const lessons = [];
  for (const { file, stage, meta } of records) {
    const context = { file, lesson: meta.id };
    for (const field of ["id", "title", "summary", "stageId", "moduleId", "kind", "contentState"])
      if (meta[field] === undefined)
        throw contentError(`课程元数据缺少字段 ${field}`, context);
    if (meta.stageId !== stage.id)
      throw contentError(
        `课程声明的 stageId(${meta.stageId}) 与所在目录/清单(${stage.id})不一致`,
        context,
      );
    if (!["foundation", "deep-dive"].includes(meta.kind))
      throw contentError(`非法课程类型 kind=${meta.kind}`, context);
    const moduleIds = (stage.modules ?? []).map((module) => module.id);
    if (!moduleIds.includes(meta.moduleId))
      throw contentError(
        `moduleId=${meta.moduleId} 不属于 Stage ${stage.id} 已注册的模块（${moduleIds.join("、") || "无"}）`,
        context,
      );
    if (meta.contentState !== "published") continue; // 未发布课程不进入 Catalog
    const codeDirectory = meta.codeDirectory;
    const directoryFiles = await javaFiles(repoRoot, codeDirectory);
    if (directoryFiles.length === 0)
      throw contentError("课程目录中没有 Java 源码", { ...context, codeDirectory });
    const codeContents = [];
    for (const codePath of directoryFiles) {
      const code = await readSource(repoRoot, codePath, context);
      codeContents.push({ codePath, code, ...javaIdentity(code, codePath) });
    }
    // 主文件 = 包含 main 方法的文件（多文件课程）；否则取第一个
    const primary =
      codeContents.find((item) => /public\s+static\s+void\s+main/.test(item.code)) ??
      codeContents[0];
    const codePath = primary.codePath;
    const code = primary.code;
    const markdown = meta.bodyPath
      ? await readSource(repoRoot, meta.bodyPath, context)
      : "";
    lessons.push({
      id: meta.id,
      kind: meta.kind,
      stageId: meta.stageId,
      moduleId: meta.moduleId,
      title: meta.title,
      summary: meta.summary,
      sourcePath: meta.bodyPath ?? codePath,
      markdown,
      code,
      codePath,
      ...javaIdentity(code, codePath),
      codeFiles: codeContents.map((item) => ({
        path: item.codePath,
        className: item.className,
        packageName: item.packageName,
        code: item.code,
      })),
      relatedLessonIds: meta.relatedLessonIds ?? [],
      exerciseIds: meta.exerciseIds ?? [],
      predictionIds: meta.predictionIds ?? [],
      steps: (meta.steps ?? []).map(({ label, body }) => ({ label, body })),
    });
  }
  lessons.sort(
    (a, b) =>
      KIND_RANK[a.kind] - KIND_RANK[b.kind] || a.id.localeCompare(b.id),
  );
  return lessons;
}

/* ---------- 练习 ---------- */

async function buildExercises(repoRoot, contentRoot, stageEntries) {
  const built = [];
  for (const stage of stageEntries.filter(
    (item) => item.contentState === "published",
  )) {
    for (const file of await listJsonFiles(
      contentRoot,
      `exercises/stage${stage.id}`,
    )) {
      const relative = `exercises/stage${stage.id}/${file}`;
      const meta = await readJson(contentRoot, relative);
      const context = { file: relative, exercise: meta.id };
      if (meta.contentState && meta.contentState !== "published") continue;
      for (const field of [
        "id",
        "title",
        "className",
        "statementAnchor",
        "statementSource",
        "hintSource",
        "todo",
        "cases",
        "referenceFiles",
        "order",
      ])
        if (meta[field] === undefined)
          throw contentError(`练习元数据缺少字段 ${field}`, context);
      const statementSource = await readSource(
        repoRoot,
        meta.statementSource,
        context,
      );
      const preHint = statementSource.split("## 渐进提示")[0];
      const statements = sections(preHint, 2);
      const statement = requireSection(statements, meta.statementAnchor, {
        ...context,
        statementSource: meta.statementSource,
      });
      const hintSectionSource = await readSource(
        repoRoot,
        meta.hintSource,
        context,
      );
      const hintSections = sections(
        hintSectionSource.split("## 渐进提示")[1] ?? "",
        3,
      );
      const hintSection = requireSection(hintSections, meta.statementAnchor, {
        ...context,
        hintSource: meta.hintSource,
      });
      const hints = [
        ...hintSection.body.matchAll(/^- \*\*L[1-4][^*]*\*\*[：:]?\s*(.+)$/gm),
      ].map((match) => match[1].trim());
      if (hints.length !== 4)
        throw contentError(
          `练习必须有四级提示，实际解析到 ${hints.length} 条`,
          context,
        );
      const packageNamePrefix = stage.packageNamePrefix;
      if (!packageNamePrefix)
        throw contentError("阶段清单缺少 packageNamePrefix", {
          stage: stage.id,
        });
      if (!stage.slug)
        throw contentError("阶段清单缺少 slug（stages/ 下的目录名）", {
          stage: stage.id,
        });
      const packageName = `${packageNamePrefix}.${meta.id}`;
      built.push({
        stageId: stage.id,
        order: meta.order,
        exercise: {
        id: meta.id,
        title: statement.title.replace(/^练习 \d+[：:]\s*/, ""),
        sourcePath: meta.statementSource,
        markdown: statement.body.replace(/\n---\s*$/, "").trim(),
        hints,
        starterCode: `package ${packageName};\n\npublic class ${meta.className} {\n    public static void main(String[] args) {\n        // TODO: ${meta.todo}\n    }\n}\n`,
        className: meta.className,
        packageName,
        lessonIds: meta.lessonIds ?? [],
        note: meta.note ?? null,
        cases: meta.cases.map(
          ({ label, input, expected, kind }, caseIndex) => ({
            id: `${meta.id}-${caseIndex + 1}`,
            label,
            input,
            expected,
            kind,
          }),
        ),
        referencePaths: (meta.referenceFiles ?? []).map(
          (file) =>
            `stages/${stage.slug}/existing_course/answers/main/java/com/javaroadmap/stage${stage.id}/answers/${file}`,
        ),
        },
      });
    }
  }
  built.sort((a, b) => a.order - b.order);
  return {
    exercises: built.map(({ order, stageId, exercise }) => exercise),
    stageByExercise: new Map(
      built.map(({ stageId, exercise }) => [exercise.id, stageId]),
    ),
  };
}

/* ---------- 预测题与修改题 ---------- */

async function buildPredictionsAndModifications(
  repoRoot,
  contentRoot,
  stageEntries,
) {
  const predictions = [];
  const modifications = [];
  for (const stage of stageEntries.filter(
    (item) => item.contentState === "published",
  )) {
    const relative = `predictions/stage${stage.id}.json`;
    let manifest;
    try {
      manifest = await readJson(contentRoot, relative);
    } catch (error) {
      if (error.code === "ENOENT") continue; // 该阶段暂无预测/修改内容
      throw error;
    }
    const context = { file: relative, stage: stage.id };
    const source = await readSource(repoRoot, manifest.statementSource, context);
    const answers = sections(
      await readSource(repoRoot, manifest.answerSource, context),
      2,
    );
    const answerMap = new Map(
      answers.map((section) => [section.title, section.body]),
    );
    for (const section of sections(source, 3)) {
      const id = section.title.match(/^((?:S\d{2})?[AB]\d+)/)?.[1];
      if (!id) continue;
      const body = section.body.split("\n## ")[0].trim();
      // 预测题以 A 结尾（含阶段命名空间 S02A1），修改题以 B 结尾
      const isPrediction = /A\d+$/.test(id);
      if (isPrediction) {
        const config = manifest.predictions[id];
        if (!config)
          throw contentError(`预测题 ${id} 缺少元数据注册`, context);
        if (config.contentState && config.contentState !== "published")
          continue; // 未发布预测题不进入 Catalog
        const answerBody = answerMap.get(id);
        const textBlocks = [
          ...(answerBody ?? "").matchAll(/```text\n([\s\S]*?)```/g),
        ].map((match) => match[1].trimEnd());
        const code = body.match(/```java\n([\s\S]*?)```/)?.[1].trimEnd();
        if (!code || !textBlocks[0])
          throw contentError(`预测题 ${id} 缺少题面代码或答案块`, context);
        const explanation = answerBody.includes("为什么：")
          ? answerBody.split("为什么：")[1].trim()
          : answerBody.replace(/```text\n[\s\S]*?```/g, "").trim();
        predictions.push({
          id,
          title: section.title.replace(/^(?:S\d{2})?[AB]\d+\s*/, ""),
          sourcePath: manifest.statementSource,
          code,
          prompt: body.replace(/```java\n[\s\S]*?```\n?/, "").trim(),
          answer: textBlocks[0],
          explanation,
          lessonIds: config.lessonIds ?? [],
          ...(config.modifiedAnswer ? { modifiedAnswer: textBlocks[1] } : {}),
        });
      } else {
        const config = manifest.modifications[id];
        if (!config)
          throw contentError(`修改题 ${id} 缺少元数据注册`, context);
        if (config.contentState && config.contentState !== "published")
          continue; // 未发布修改题不进入 Catalog
        modifications.push({
          id,
          title: section.title.replace(/^(?:S\d{2})?[AB]\d+\s*/, ""),
          sourcePath: manifest.statementSource,
          markdown: body.split("\n---")[0].trim(),
          lessonIds: config.lessonIds ?? [],
          ...(config.note ? { note: config.note } : {}),
          referencePaths: config.referencePaths ?? [],
        });
      }
    }
  }
  return { predictions, modifications };
}

/* ---------- Stage 知识地图（权威来源仍是仓库文档） ---------- */

async function buildStages(repoRoot, contentRoot) {
  const manifest = await readJson(contentRoot, "stages.json");
  const stageEntries = manifest.stages;
  const seenStageIds = new Set();
  for (const stage of stageEntries) {
    if (seenStageIds.has(stage.id))
      throw contentError(`Stage ${stage.id} 在 stages.json 中重复注册`, {
        stage: stage.id,
      });
    seenStageIds.add(stage.id);
    if (!CONTENT_STATES.includes(stage.contentState))
      throw contentError(
        `contentState 必须是 ${CONTENT_STATES.join("/")}`,
        { stage: stage.id, actual: stage.contentState },
      );
    const seenModuleIds = new Set();
    for (const module of stage.modules ?? []) {
      if (!module.id || !module.title)
        throw contentError("Module 必须包含 id 与 title", {
          stage: stage.id,
        });
      if (seenModuleIds.has(module.id))
        throw contentError(
          `Stage ${stage.id} 存在重复 Module ID：${module.id}`,
          { stage: stage.id },
        );
      seenModuleIds.add(module.id);
    }
  }
  const roadmap = await readSource(repoRoot, "统一学习路线.md");
  const progress = await readSource(repoRoot, "真实学习进度.md");
  const progressRows = new Map();
  for (const line of progress.split("\n")) {
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());
    const match = cells[0]?.match(/^(\d{2})\s+(.+)$/);
    if (match)
      progressRows.set(match[1], { title: match[2], status: cells[1] });
  }
  const mapSection = roadmap
    .split("## 统一 14 Stage 知识地图")[1]
    ?.split("\n未开始的阶段")[0];
  if (!mapSection)
    throw contentError("权威路线表（统一 14 Stage 知识地图）未找到");
  const stages = [];
  for (const line of mapSection.split("\n")) {
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());
    const id = cells[0]?.match(/^(?:\[)?(\d{2})(?:\])?/)?.[1];
    if (!id) continue;
    const entry = stageEntries.find((item) => item.id === id);
    if (!entry)
      throw contentError(`Stage ${id} 未在 web/content/stages.json 注册`);
    const progressRow = progressRows.get(id);
    if (!progressRow) throw contentError(`Stage ${id} 在真实学习进度.md 中缺少状态行`);
    const sourcePath = cells[0].match(/\]\(([^)]+)\)/)?.[1];
    stages.push({
      id,
      title: progressRow.title,
      scope: cells[1],
      status: progressRow.status,
      materialState: cells[2],
      ...(sourcePath ? { sourcePath } : {}),
      contentState: entry.contentState,
      modules: entry.modules ?? [],
      building: entry.building ?? false,
      prerequisites: entry.prerequisites ?? "",
      evidence: cells[3],
    });
  }
  if (stages.length !== 14)
    throw contentError(`权威路线必须包含 14 个 Stage，实际解析 ${stages.length}`);
  const registered = stageEntries.map((item) => item.id).sort();
  if (registered.join(",") !== stages.map((item) => item.id).join(","))
    throw contentError("stages.json 注册与权威路线的 Stage 集合不一致");
  return { stages, stageEntries };
}

/* ---------- 只读文档 ---------- */

async function buildDocuments(repoRoot, contentRoot, stages, lessons, extras) {
  const manifest = await readJson(contentRoot, "documents.json");
  const sources = manifest.documents.map(({ id, sourcePath }) => ({
    id,
    sourcePath,
  }));
  for (const stage of stages) {
    if (stage.id !== "01" && stage.sourcePath)
      sources.push({ id: `stage${stage.id}-guide`, sourcePath: stage.sourcePath });
  }
  for (const lesson of lessons.filter((item) => item.kind === "deep-dive"))
    sources.push({ id: `${lesson.id}-source`, sourcePath: lesson.sourcePath });
  sources.push(...extras);
  const documents = [];
  for (const { id, sourcePath } of sources) {
    let markdown = await readSource(repoRoot, sourcePath, { document: id });
    // 练习题面文档中的分级提示只允许出现在实验室，源文档视图一律剥离
    if (
      markdown.includes("## 渐进提示") &&
      (sourcePath.includes("/exercises/") || sourcePath.endsWith("_exercises.md"))
    )
      markdown = markdown.split("## 渐进提示")[0].trim();
    documents.push({ id, title: cleanTitle(markdown), sourcePath, markdown });
  }
  const documentIds = new Set(documents.map((item) => item.id));
  if (documentIds.size !== documents.length)
    throw contentError("文档 ID 重复", {
      duplicates: documents
        .map((item) => item.id)
        .filter((id, index, all) => all.indexOf(id) !== index),
    });
  return documents;
}

/* ---------- 稳定 ID 契约（防静默删除/改名） ---------- */

function checkRegistry(contentRoot, catalog, { allowUnknownIds = false } = {}) {
  let registry;
  try {
    registry = readJsonSync(contentRoot, "registry.json");
  } catch (error) {
    if (error.code === "ENOENT") return; // 测试 fixture 不携带 ID 契约
    throw error;
  }
  const known = new Set(registry.knownIds ?? []);
  const retired = new Set(registry.retired ?? []);
  const renames = registry.renames ?? {};
  const current = new Set([
    ...catalog.lessons.map((item) => item.id),
    ...catalog.exercises.map((item) => item.id),
    ...catalog.predictions.map((item) => item.id),
    ...catalog.modifications.map((item) => item.id),
  ]);
  const problems = [];
  if (!allowUnknownIds)
    for (const id of current)
      if (!known.has(id))
        problems.push(
          `新 ID「${id}」尚未登记进稳定 ID 契约：首次正式发布前请运行 npm run content -- --update-registry 显式登记`,
        );
  for (const id of known)
    if (!current.has(id) && !retired.has(id) && !Object.keys(renames).includes(id))
      problems.push(`ID「${id}」从目录中消失：请在 registry.json 显式登记 retired 或 renames`);
  for (const id of retired)
    if (current.has(id)) problems.push(`已下线 ID「${id}」重新出现`);
  for (const [oldId, newId] of Object.entries(renames)) {
    if (current.has(oldId))
      problems.push(`改名映射中的旧 ID「${oldId}」仍在目录中`);
    if (!current.has(newId))
      problems.push(`改名映射的新 ID「${newId}」不在目录中`);
    // 改名登记只约束目录 ID 集合：用户 IndexedDB 记录以 ID 为键保留原样，
    // 不会（也不应）被构建过程静默改写；见 new-lesson-guide.md 第 9 节。
  }
  for (const id of current)
    if (retired.has(id)) problems.push(`ID「${id}」已登记下线却仍在目录中`);
  if (problems.length) throw contentError("稳定 ID 契约校验失败", { problems });
  return current;
}

// registry.json 在校验阶段同步读取（构建入口已提前生成基线），这里使用同步兜底实现。
import { readFileSync } from "node:fs";
function readJsonSync(contentRoot, relative) {
  return JSON.parse(readFileSync(path.resolve(contentRoot, relative), "utf8"));
}

/* ---------- Catalog 组装 ---------- */

export async function buildCatalog({
  repoRoot,
  contentRoot,
  roadmapSource = "统一学习路线.md",
  allowUnknownIds = false,
} = {}) {
  const { stages, stageEntries } = await buildStages(repoRoot, contentRoot);
  const lessons = await buildLessons(repoRoot, contentRoot, stageEntries);
  const { exercises, stageByExercise } = await buildExercises(
    repoRoot,
    contentRoot,
    stageEntries,
  );
  const { predictions, modifications } = await buildPredictionsAndModifications(
    repoRoot,
    contentRoot,
    stageEntries,
  );
  const plan = await readSource(repoRoot, "学习执行计划.md");
  const currentSection = plan.split("## CURRENT")[1]?.split("## NEXT")[0] ?? "";
  const currentTasks = [...currentSection.matchAll(/^\d+\.\s+(.+)$/gm)].map(
    (match) => match[1],
  );
  const workspace = await readJson(contentRoot, "workspace.json");
  // 练习/预测的来源文档视图：按已发布阶段的数据驱动生成（Stage 01 保持既有 ID）
  const extras = [];
  for (const stage of stageEntries.filter(
    (item) => item.contentState === "published",
  )) {
    const stageExercises = exercises.filter(
      (exercise) => stageByExercise.get(exercise.id) === stage.id,
    );
    if (stageExercises.length > 0) {
      extras.push({
        id:
          stage.id === "01"
            ? "exercises-source"
            : `stage${stage.id}-exercises-source`,
        sourcePath: stageExercises[0].sourcePath,
      });
    }
    try {
      const manifest = await readJson(
        contentRoot,
        `predictions/stage${stage.id}.json`,
      );
      extras.push({
        id:
          stage.id === "01"
            ? "predictions-source"
            : `stage${stage.id}-predictions-source`,
        sourcePath: manifest.statementSource,
      });
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
  const documents = await buildDocuments(repoRoot, contentRoot, stages, lessons, extras);
  const referenceSources = [
    ...new Set([
      ...exercises.flatMap((exercise) => exercise.referencePaths),
      // 发布边界：只有正式发布 Stage 的参考文档/参考目录进入公开 Catalog
      ...stageEntries
        .filter((stage) => stage.contentState === "published")
        .flatMap((stage) => stage.referenceDocuments ?? []),
      ...(await Promise.all(
        stageEntries
          .filter((stage) => stage.contentState === "published")
          .flatMap((stage) => stage.referenceRoots ?? [])
          .map((root) => javaFiles(repoRoot, root)),
      )).flat(),
    ]),
  ];
  const references = referenceSources.map((sourcePath, index) => ({
    sourcePath,
    url: `reference/reference-${String(index + 1).padStart(2, "0")}.json`,
  }));
  const catalog = {
    lessons,
    exercises,
    predictions,
    modifications,
    stages,
    documents,
    currentTasks,
    references,
    workspace: {
      currentTaskRoutes: workspace.currentTaskRoutes ?? [],
      reviewPicks: workspace.reviewPicks ?? [],
    },
  };
  validateCatalog(catalog);
  await validateResources(repoRoot, catalog);
  checkRegistry(contentRoot, catalog, { allowUnknownIds });
  return catalog;
}

/* ---------- 参考资源存在性 ---------- */

async function validateResources(repoRoot, catalog) {
  const problems = [];
  const paths = [
    ...catalog.exercises.flatMap((item) => item.referencePaths),
    ...catalog.modifications.flatMap((item) => item.referencePaths),
    ...catalog.references.map((item) => item.sourcePath),
  ];
  for (const sourcePath of paths) {
    try {
      await readSource(repoRoot, sourcePath, {});
    } catch {
      problems.push(`参考资源缺失：${sourcePath}`);
    }
  }
  if (problems.length)
    throw contentError("参考资源校验失败", { problems });
}

/* ---------- 内容合法性校验 ---------- */

export function validateCatalog(catalog) {
  const problems = [];
  const lessons = new Map(catalog.lessons.map((item) => [item.id, item]));
  const exercises = new Map(catalog.exercises.map((item) => [item.id, item]));
  const predictions = new Map(
    catalog.predictions.map((item) => [item.id, item]),
  );
  const modifications = new Map(
    catalog.modifications.map((item) => [item.id, item]),
  );
  const all = new Map([...lessons, ...exercises, ...predictions, ...modifications]);
  if (all.size !== catalog.lessons.length + catalog.exercises.length + catalog.predictions.length + catalog.modifications.length)
    problems.push("存在重复 ID");
  const lessonIds = new Set(lessons.keys());
  for (const lesson of lessons.values()) {
    for (const id of lesson.relatedLessonIds)
      if (!lessonIds.has(id))
        problems.push(`课程 ${lesson.id} 关联了不存在的课程 ${id}`);
    for (const id of lesson.exerciseIds)
      if (!exercises.has(id))
        problems.push(`课程 ${lesson.id} 关联了不存在的练习 ${id}`);
    for (const id of lesson.predictionIds)
      if (!predictions.has(id))
        problems.push(`课程 ${lesson.id} 关联了不存在的预测题 ${id}`);
  }
  for (const activity of [
    ...exercises.values(),
    ...predictions.values(),
    ...modifications.values(),
  ]) {
    if (activity.lessonIds.length === 0)
      problems.push(`${activity.id} 未关联任何课程`);
    for (const id of activity.lessonIds)
      if (!lessonIds.has(id))
        problems.push(`${activity.id} 关联了不存在的课程 ${id}`);
  }
  for (const reference of catalog.references) {
    if (path.isAbsolute(reference.sourcePath))
      problems.push(`参考资源路径必须仓库相对：${reference.sourcePath}`);
  }
  if (problems.length) throw contentError("目录校验失败", { problems });
  return catalog;
}
