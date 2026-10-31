import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateCatalog, sections } from "./generate-content.mjs";

const catalog = await generateCatalog({ write: false });
const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

test("catalog mirrors the actual Stage 01 learning assets", () => {
  // 断言收窄到 Stage 01 作用域（V1.3 起 Stage 02 也有已发布课程）
  const stage01Lessons = catalog.lessons.filter(
    (lesson) => lesson.stageId === "01",
  );
  assert.equal(
    stage01Lessons.filter((lesson) => lesson.kind === "foundation").length,
    6,
  );
  assert.equal(
    stage01Lessons.filter((lesson) => lesson.kind === "deep-dive").length,
    7,
  );
  assert.equal(
    catalog.exercises.filter((exercise) => !exercise.id.startsWith("s02-"))
      .length,
    4,
  );
  assert.equal(
    catalog.predictions.filter((prediction) => !prediction.id.startsWith("S02"))
      .length,
    8,
  );
  assert.equal(
    catalog.modifications.filter((modification) => !modification.id.startsWith("S02"))
      .length,
    4,
  );
  assert.equal(catalog.stages.length, 14);
  assert.equal(catalog.stages[0].status, "学习中");
  assert.ok(catalog.stages.every((stage) => !stage.status.includes("已完成")));
  assert.equal(catalog.currentTasks.length, 6);
});

test("canonical Java content is read from source instead of copied into metadata", async () => {
  for (const lesson of catalog.lessons) {
    const actual = (
      await readFile(path.join(repoRoot, lesson.codePath), "utf8")
    ).replace(/\r\n/g, "\n");
    assert.equal(lesson.code, actual);
    assert.match(
      lesson.code,
      new RegExp(`package ${lesson.packageName.replaceAll(".", "\\.")};`),
    );
  }
});

test("exercise core implementations stay empty and hints stay outside statements", () => {
  for (const exercise of catalog.exercises) {
    assert.equal(exercise.hints.length, 4);
    assert.match(exercise.starterCode, /\/\/ TODO:/);
    assert.doesNotMatch(
      exercise.starterCode,
      /System\.out|for\s*\(|while\s*\(/,
    );
    assert.doesNotMatch(exercise.markdown, /渐进提示|\*\*L[1-4]/);
    assert.ok(exercise.cases.length >= 3);
    assert.equal(
      new Set(exercise.cases.map((item) => item.id)).size,
      exercise.cases.length,
    );
    assert.ok(
      exercise.referencePaths.every((source) => source.includes("/answers/")),
    );
  }
  const exerciseDocument = catalog.documents.find(
    (document) => document.id === "exercises-source",
  );
  assert.doesNotMatch(exerciseDocument.markdown, /渐进提示|\*\*L[1-4]/);
});

test("prediction answers use the first answer block; modified outputs are distinct", () => {
  const answers = Object.fromEntries(
    catalog.predictions
      .filter((prediction) => !prediction.id.startsWith("S02"))
      .map((prediction) => [prediction.id, prediction.answer]),
  );
  assert.deepEqual(answers, {
    A1: "3 / 1\n3.5",
    A2: "3345",
    A3: "012",
    A4: "1 3 结束",
    A5: "99",
    A6: "5",
    A7: "66\nB",
    A8: "安全",
  });
  assert.equal(
    catalog.predictions.find((prediction) => prediction.id === "A3")
      .modifiedAnswer,
    "0123",
  );
  assert.ok(
    catalog.predictions.every(
      (prediction) => prediction.explanation.length > 10,
    ),
  );
  assert.ok(
    catalog.predictions.every(
      (prediction) => !prediction.prompt.includes("## B."),
    ),
  );
});

test("all learning relations resolve and source paths remain repository relative", () => {
  const lessons = new Set(catalog.lessons.map((lesson) => lesson.id));
  const exercises = new Set(catalog.exercises.map((exercise) => exercise.id));
  const predictions = new Set(
    catalog.predictions.map((prediction) => prediction.id),
  );
  for (const lesson of catalog.lessons) {
    assert.ok(lesson.relatedLessonIds.every((id) => lessons.has(id)));
    assert.ok(lesson.exerciseIds.every((id) => exercises.has(id)));
    assert.ok(lesson.predictionIds.every((id) => predictions.has(id)));
  }
  for (const activity of [
    ...catalog.exercises,
    ...catalog.predictions,
    ...catalog.modifications,
  ]) {
    assert.ok(activity.lessonIds.every((id) => lessons.has(id)));
  }
  for (const item of [
    ...catalog.lessons,
    ...catalog.exercises,
    ...catalog.documents,
    ...catalog.references,
  ]) {
    assert.equal(path.isAbsolute(item.sourcePath), false);
    assert.doesNotMatch(item.sourcePath, /\\|\.\.|my_practices/);
  }
});

test("answers and complete reference applications require explicit lazy loading", () => {
  assert.ok(
    catalog.references.some((reference) =>
      reference.sourcePath.endsWith("/practice/answers.md"),
    ),
  );
  assert.ok(
    catalog.references.some((reference) =>
      reference.sourcePath.endsWith("/ScoreStatisticsAnswer.java"),
    ),
  );
  assert.ok(
    catalog.references.every((reference) =>
      reference.url.startsWith("reference/"),
    ),
  );
  assert.ok(
    catalog.documents.every(
      (document) => !document.sourcePath.includes("/answers"),
    ),
  );
  assert.ok(
    catalog.lessons.every((lesson) => !lesson.sourcePath.includes("/answers")),
  );
  for (const modification of catalog.modifications) {
    assert.ok(
      modification.referencePaths.every((source) =>
        catalog.references.some((resource) => resource.sourcePath === source),
      ),
    );
  }
  assert.ok(
    catalog.modifications
      .find((item) => item.id === "B3")
      .referencePaths[0].endsWith("/MenuDemoApp.java"),
  );
  assert.doesNotMatch(
    JSON.stringify(catalog),
    /public class (?:ScoreStatisticsAnswer|SimpleCalculatorAnswer|ScoreStatisticsApp|SimpleCalculatorApp|MenuDemoApp|GuessNumberApp|GuessNumber|loop|method)\s*\{/,
  );
});

test("known source inconsistencies are surfaced beside affected tasks", () => {
  assert.match(
    catalog.exercises.find((exercise) => exercise.id === "calculator").note,
    /提示后正常结束/,
  );
  assert.match(
    catalog.exercises.find((exercise) => exercise.id === "menu").note,
    /静默/,
  );
  assert.match(
    catalog.modifications.find((modification) => modification.id === "B3").note,
    /return/,
  );
  assert.match(
    catalog.modifications.find((modification) => modification.id === "B1").note,
    /加减乘除/,
  );
});

test("heading segmentation preserves nested headings and does not mix siblings", () => {
  assert.deepEqual(
    sections("# 标题\n\n## 第一节\n正文\n### 子节\n细节\n## 第二节\n另文\n", 2),
    [
      { title: "第一节", body: "正文\n### 子节\n细节" },
      { title: "第二节", body: "另文" },
    ],
  );
});

test("all relative Markdown links in imported documents and exercise statements exist", async () => {
  let checked = 0;
  for (const item of [...catalog.documents, ...catalog.exercises]) {
    for (const match of item.markdown.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      const href = match[1];
      if (/^(?:https?:|mailto:|#)/i.test(href)) continue;
      const relative = decodeURIComponent(
        new URL(href, `https://repo.local/${item.sourcePath}`).pathname,
      ).slice(1);
      const absolute = path.resolve(repoRoot, relative);
      assert.ok(
        absolute.startsWith(`${repoRoot}${path.sep}`),
        `Link escapes repository: ${href}`,
      );
      await assert.doesNotReject(
        stat(absolute),
        `Missing link in ${item.sourcePath}: ${href}`,
      );
      checked += 1;
    }
  }
  assert.ok(checked > 100);
});

test("V1.3：Stage 02 首批课程接入且与 Stage 01 命名空间零冲突", () => {
  const stage02Lessons = catalog.lessons.filter(
    (lesson) => lesson.stageId === "02",
  );
  assert.equal(stage02Lessons.length, 6);
  assert.deepEqual(
    stage02Lessons.map((lesson) => lesson.id),
    [
      "s02-class-basics",
      "s02-constructor-this",
      "s02-encapsulation-basics",
      "s02-encapsulation-why",
      "s02-object-construction",
      "s02-reference-state",
    ],
  );
  const stage02 = catalog.stages.find((stage) => stage.id === "02");
  assert.equal(stage02.contentState, "published");
  assert.equal(stage02.building, true);
  assert.equal(
    catalog.exercises.filter((exercise) => exercise.id.startsWith("s02-"))
      .length,
    1,
  );
  // 命名空间：Stage 02 预测/修改题不与 Stage 01 历史短编号冲突
  const stage01Ids = new Set(
    [...catalog.predictions, ...catalog.modifications]
      .filter((item) => !item.id.startsWith("S02"))
      .map((item) => item.id),
  );
  const stage02Ids = new Set(
    [...catalog.predictions, ...catalog.modifications]
      .filter((item) => item.id.startsWith("S02"))
      .map((item) => item.id),
  );
  assert.equal(stage02Ids.size, 6);
  for (const id of stage02Ids) assert.ok(!stage01Ids.has(id));
  // 草稿内容被门禁拦截（S02A4 多态、S02B3 综合练习、S02B1 多态修改题属后续批次）
  for (const draftId of ["S02A4", "S02B3", "S02B1"])
    assert.ok(!stage02Ids.has(draftId), draftId);
});

test("V1.3：多文件 Java 示例完整进入目录且主文件含 main", () => {
  for (const lesson of catalog.lessons) {
    assert.ok(lesson.codeFiles.length >= 1);
    const primary = lesson.codeFiles.find(
      (file) => file.path === lesson.codePath,
    );
    assert.ok(primary, "主文件必须在 codeFiles 中");
    assert.match(primary.code, /static void main/);
    for (const file of lesson.codeFiles)
      assert.match(
        file.code,
        new RegExp(`package ${file.packageName.replaceAll(".", "\.")};`),
      );
  }
  const multi = catalog.lessons.find(
    (lesson) => lesson.id === "s02-class-basics",
  );
  assert.equal(multi.codeFiles.length, 2, "day01 课程应包含 App 与 Student");
  const dependencies = multi.codeFiles.filter(
    (file) => file.path !== multi.codePath,
  );
  assert.ok(
    dependencies.some((file) => file.className === "Student"),
    "依赖类 Student 不得遗漏",
  );
});

test("V1.3 修补：Java 包名合法、用例契约完整、stdin 标记正确", () => {
  for (const exercise of catalog.exercises) {
    // Java 包段与练习 ID 分离后，包名必须完全合法
    assert.match(
      exercise.packageName,
      /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/,
      `${exercise.id} 的包名非法：${exercise.packageName}`,
    );
    assert.ok(!exercise.packageName.includes("-"));
    // 用例契约：对象结构、非空、kind 枚举
    for (const entry of exercise.cases) {
      for (const field of ["label", "input", "expected"])
        assert.ok(
          typeof entry[field] === "string" && entry[field].trim() !== "",
          `${exercise.id} 用例 ${entry.label ?? entry.id} 字段 ${field} 非空`,
        );
      assert.ok(
        ["normal", "boundary", "invalid"].includes(entry.kind),
        `${exercise.id} 用例 kind 非法`,
      );
      assert.match(entry.expected, /\S/, "预期输出不能是纯描述");
    }
    assert.equal(
      exercise.needsInput,
      ["calculator", "menu", "s02-bank-account"].includes(exercise.id),
    );
  }
  const bank = catalog.exercises.find((item) => item.id === "s02-bank-account");
  assert.equal(bank.packageName, "com.javaroadmap.lab.stage02.bankaccount");
  // 非法操作用例必须证明状态未变：预期输出包含操作前余额
  for (const entry of bank.cases.filter((item) => item.kind === "invalid")) {
    assert.match(entry.expected, /当前余额：100\.0/);
  }
});
