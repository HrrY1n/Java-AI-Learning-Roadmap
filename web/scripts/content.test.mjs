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
  assert.equal(
    catalog.lessons.filter((lesson) => lesson.kind === "foundation").length,
    6,
  );
  assert.equal(
    catalog.lessons.filter((lesson) => lesson.kind === "deep-dive").length,
    7,
  );
  assert.equal(catalog.exercises.length, 4);
  assert.equal(catalog.predictions.length, 8);
  assert.equal(catalog.modifications.length, 4);
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
    catalog.predictions.map((prediction) => [prediction.id, prediction.answer]),
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
