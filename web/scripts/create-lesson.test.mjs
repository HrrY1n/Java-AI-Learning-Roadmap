// create-lesson.mjs 脚手架测试：冲突预检、非法输入拒绝、多练习单提示节、事务性。
// 全部在临时目录进行，不触碰真实仓库内容。
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, readFile, rm } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { planLesson } from "./create-lesson.mjs";

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function makeStage({ withExercise = false } = {}) {
  const repoRoot = await mkdtemp(path.join(tmpdir(), "jrl-scaffold-"));
  const contentRoot = path.join(repoRoot, "content");
  await mkdir(path.join(contentRoot, "lessons/stage02"), { recursive: true });
  await mkdir(path.join(contentRoot, "exercises/stage02"), { recursive: true });
  await writeFile(
    path.join(contentRoot, "stages.json"),
    JSON.stringify(
      {
        stages: [
          {
            id: "02",
            contentState: "published",
            slug: "stage02_java_oop",
            packageNamePrefix: "com.javaroadmap.lab.stage02",
            prerequisites: "",
            modules: [{ id: "deep-dives", title: "概念深化" }],
            referenceRoots: [],
            referenceDocuments: [],
          },
        ],
      },
      null,
      2,
    ),
    "utf8",
  );
  if (withExercise) {
    await writeFile(
      path.join(contentRoot, "exercises/stage02/s02-guard.json"),
      JSON.stringify({ id: "s02-guard" }),
      "utf8",
    );
  }
  return { repoRoot, contentRoot };
}

const base = (overrides = {}) => ({
  stageId: "02",
  kind: "deep-dive",
  slug: "encapsulation",
  title: "封装",
  summary: "把修改入口收拢到类内。",
  index: "01",
  module: "deep-dives",
  exercise: "guard",
  exerciseTitle: "账户守门",
  ...overrides,
});

test("正常规划：生成课程 + 练习，题面/提示结构正确", async () => {
  const { repoRoot, contentRoot } = await makeStage();
  try {
    const plan = await planLesson({ ...base(), repoRoot, contentRoot });
    assert.equal(plan.lessonId, "s02-encapsulation");
    assert.equal(plan.writes.length, 5);
    const practice = plan.writes.find((write) =>
      write.path.endsWith("s02-exercises.md"),
    );
    assert.equal(practice.content.split("## 渐进提示").length - 1, 1);
    assert.match(practice.content, /## 练习 01：账户守门/);
    assert.match(practice.content, /### 练习 01：账户守门/);
    const java = plan.writes.find((write) => write.path.endsWith("Demo.java"));
    assert.match(java.content, /package com\.javaroadmap\.lab\.stage02\.encapsulation;/);
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

test("重复运行同参数：拒绝覆盖且不改动已生成内容", async () => {
  const { repoRoot, contentRoot } = await makeStage();
  try {
    const options = { ...base(), repoRoot, contentRoot };
    const first = await planLesson(options);
    for (const write of first.writes) {
      await mkdir(path.dirname(write.path), { recursive: true });
      await writeFile(write.path, write.content, "utf8");
    }
    const before = await readFile(first.writes[0].path, "utf8");
    await assert.rejects(
      () => planLesson(options),
      (error) =>
        /拒绝覆盖/.test(error.message) &&
        /s02-encapsulation\.json/.test(error.message),
    );
    assert.equal(await readFile(first.writes[0].path, "utf8"), before);
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

test("同一 Stage 追加多道练习：渐进提示只出现一次，锚点唯一", async () => {
  const { repoRoot, contentRoot } = await makeStage();
  try {
    const first = await planLesson({ ...base(), repoRoot, contentRoot });
    for (const write of first.writes) {
      await mkdir(path.dirname(write.path), { recursive: true });
      await writeFile(write.path, write.content, "utf8");
    }
    const second = await planLesson({
      ...base(),
      slug: "polymorphism",
      title: "多态",
      index: "02",
      exercise: "shape",
      exerciseTitle: "形状分发",
      repoRoot,
      contentRoot,
    });
    const practiceWrite = second.writes.find((write) =>
      write.path.endsWith("s02-exercises.md"),
    );
    const after = practiceWrite.content;
    assert.equal(after.split("## 渐进提示").length - 1, 1, "渐进提示必须唯一");
    assert.match(after, /## 练习 01：账户守门/);
    assert.match(after, /## 练习 02：形状分发/);
    assert.match(after, /### 练习 01：账户守门/);
    assert.match(after, /### 练习 02：形状分发/);
    // 练习章节在提示节之前，提示小节在提示节内部末尾
    assert.ok(after.indexOf("## 练习 02") < after.indexOf("## 渐进提示"));
    assert.ok(after.indexOf("## 渐进提示") < after.indexOf("### 练习 02"));
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

test("非法 slug 与非法包前缀被明确拒绝", async () => {
  const { repoRoot, contentRoot } = await makeStage();
  try {
    await assert.rejects(
      () => planLesson({ ...base(), slug: "Bad_Slug", repoRoot, contentRoot }),
      (error) => /非法 slug/.test(error.message),
    );
    await assert.rejects(
      () => planLesson({ ...base(), slug: "9lives", repoRoot, contentRoot }),
      (error) => /非法 slug/.test(error.message),
    );
    const stagesPath = path.join(contentRoot, "stages.json");
    const raw = await readFile(stagesPath, "utf8");
    const broken = JSON.parse(raw);
    broken.stages[0].packageNamePrefix = "com.Example.lab";
    await writeFile(stagesPath, JSON.stringify(broken, null, 2), "utf8");
    await assert.rejects(
      () => planLesson({ ...base(), repoRoot, contentRoot }),
      (error) => /不是合法 Java 包名/.test(error.message),
    );
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

test("冲突预检失败时不留下任何半生成文件", async () => {
  const { repoRoot, contentRoot } = await makeStage({ withExercise: true });
  try {
    await assert.rejects(
      () => planLesson({ ...base(), repoRoot, contentRoot }),
      (error) => /未写入任何文件/.test(error.message),
    );
    // 事务性验证：规划失败后不创建任何文件
    const { readdir } = await import("node:fs/promises");
    const lessonFiles = await readdir(path.join(contentRoot, "lessons/stage02"));
    assert.equal(lessonFiles.length, 0, "元数据目录必须保持为空");
    const exerciseFiles = await readdir(path.join(contentRoot, "exercises/stage02"));
    assert.deepEqual(exerciseFiles, ["s02-guard.json"], "除预置冲突文件外不得新增");
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

test("moduleId 不属于已注册模块时规划失败", async () => {
  const { repoRoot, contentRoot } = await makeStage();
  try {
    await assert.rejects(
      () => planLesson({ ...base(), module: "not-registered", repoRoot, contentRoot }),
      (error) => /不属于 Stage 02 已注册模块/.test(error.message),
    );
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});
