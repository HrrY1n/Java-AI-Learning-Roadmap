// V1.2 内容架构测试：跨 Stage 扩展、发布状态门禁、增量更新与破坏性操作。
// fixture 在临时目录组装一个最小仓库（14 Stage 路线表 + Stage 02 示例课程），
// 不接触 web/content 真实内容，也不会成为网站正式教学内容。
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, readFile, rm } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { buildCatalog } from "./content/build.mjs";
import { contentError } from "./content/errors.mjs"; // contentError 仅用于构造断言消息匹配

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function makeRepo({ stage02State = "published", withRegistry = true } = {}) {
  const repoRoot = await mkdtemp(path.join(tmpdir(), "jrl-fixture-"));
  const contentRoot = path.join(repoRoot, "content");
  await mkdir(contentRoot, { recursive: true });

  const roadmapRows = Array.from({ length: 14 }, (_, i) => {
    const id = String(i + 1).padStart(2, "0");
    return `| ${id} | Stage ${id} 能力范围 | 状态快照 | 产出 |`;
  }).join("\n");
  const progressRows = Array.from({ length: 14 }, (_, i) => {
    const id = String(i + 1).padStart(2, "0");
    return `| ${id} Stage ${id} | ${i === 0 ? "学习中" : "未开始"} | 证据 | 缺口 |`;
  }).join("\n");
  await writeFile(
    path.join(repoRoot, "统一学习路线.md"),
    `# 路线\n\n## 统一 14 Stage 知识地图\n\n| Stage | 能力范围 | 材料/学习状态快照 | 可核验产出 |\n| --- | --- | --- | --- |\n${roadmapRows}\n\n未开始的阶段不创建空目录。\n`,
    "utf8",
  );
  await writeFile(
    path.join(repoRoot, "真实学习进度.md"),
    `# 进度\n\n| Stage | 状态 | 审计证据 | 缺口 |\n| --- | --- | --- | --- |\n${progressRows}\n`,
    "utf8",
  );
  await writeFile(
    path.join(repoRoot, "学习执行计划.md"),
    "# 计划\n\n## CURRENT\n\n1. 示例任务一。\n2. 示例任务二。\n\n## NEXT\n\n1. 后续。\n",
    "utf8",
  );

  await mkdir(path.join(repoRoot, "stages/stage02_java_oop/deep_dives/01_encapsulation/com/x"), {
    recursive: true,
  });
  await writeFile(
    path.join(
      repoRoot,
      "stages/stage02_java_oop/deep_dives/01_encapsulation/README.md",
    ),
    "# 深化课：封装\n\n为什么字段需要 private。正文来自本文件，唯一权威来源。\n",
    "utf8",
  );
  await writeFile(
    path.join(
      repoRoot,
      "stages/stage02_java_oop/deep_dives/01_encapsulation/com/x/Demo.java",
    ),
    "package com.example.stage02.encapsulation;\n\npublic class Demo {\n}\n",
    "utf8",
  );

  const stageEntry = (id, extra = {}) => ({
    id,
    contentState: id === "02" ? stage02State : "planned",
    prerequisites: `Stage 前置。`,
    modules:
      id === "02"
        ? [{ id: "deep-dives", title: "概念深化" }]
        : [],
    referenceRoots: [],
    referenceDocuments: [],
    ...(id === "02"
      ? {
          packageNamePrefix: "com.javaroadmap.lab.stage02",
          slug: "stage02_java_oop",
        }
      : {}),
    ...extra,
  });
  await writeFile(
    path.join(contentRoot, "stages.json"),
    JSON.stringify(
      {
        stages: [
          stageEntry("01"),
          stageEntry("02"),
          ...Array.from({ length: 12 }, (_, i) => stageEntry(String(i + 3).padStart(2, "0"))),
        ],
      },
      null,
      2,
    ),
    "utf8",
  );
  await writeFile(
    path.join(contentRoot, "documents.json"),
    JSON.stringify({ documents: [] }, null, 2),
    "utf8",
  );
  await writeFile(
    path.join(contentRoot, "workspace.json"),
    JSON.stringify({ currentTaskRoutes: [], reviewPicks: [] }, null, 2),
    "utf8",
  );

  const lessonMeta = {
    id: "s02-encapsulation",
    stageId: "02",
    moduleId: "deep-dives",
    kind: "deep-dive",
    title: "封装",
    summary: "把修改入口收拢到类内。",
    contentState: "published",
    relatedLessonIds: [],
    exerciseIds: ["s02-guard"],
    predictionIds: [],
    steps: [],
    bodyPath: "stages/stage02_java_oop/deep_dives/01_encapsulation/README.md",
    codeDirectory: "stages/stage02_java_oop/deep_dives/01_encapsulation",
  };
  await mkdir(path.join(contentRoot, "lessons/stage02"), { recursive: true });
  await writeFile(
    path.join(contentRoot, "lessons/stage02/s02-encapsulation.json"),
    JSON.stringify(lessonMeta, null, 2),
    "utf8",
  );

  await mkdir(path.join(contentRoot, "exercises/stage02"), { recursive: true });
  await writeFile(
    path.join(contentRoot, "exercises/stage02/s02-guard.json"),
    JSON.stringify(
      {
        id: "s02-guard",
        stageId: "02",
        title: "账户守门",
        className: "AccountGuard",
        order: 1,
        contentState: "published",
        lessonIds: ["s02-encapsulation"],
        statementSource: "stages/stage02_java_oop/practice/s02-exercises.md",
        statementAnchor: "练习 1",
        hintSource: "stages/stage02_java_oop/practice/s02-exercises.md",
        todo: "把余额修改收拢到 deposit/withdraw。",
        note: null,
        cases: [
          { label: "正常存款", input: "100", expected: "余额：200.0", kind: "normal" },
          { label: "非法金额", input: "-5", expected: "金额必须大于 0", kind: "invalid" },
          { label: "余额不足", input: "99999", expected: "余额不足", kind: "boundary" },
        ],
        referenceFiles: [],
      },
      null,
      2,
    ),
    "utf8",
  );
  await mkdir(path.join(repoRoot, "stages/stage02_java_oop/practice"), {
    recursive: true,
  });
  await writeFile(
    path.join(repoRoot, "stages/stage02_java_oop/practice/s02-exercises.md"),
    "# Stage 02 练习\n\n## 练习 1：账户守门\n\n题面正文。规则：存款后打印余额。\n\n---\n\n## 渐进提示\n\n### 练习 1：账户守门\n\n- **L1 理解问题**：存款是受控的状态变更。\n- **L2 相关知识**：封装深化课。\n- **L3 结构思路**：字段私有 + 两个方法。\n- **L4 调试线索**：打印每步余额。\n",
    "utf8",
  );

  if (withRegistry)
    await writeFile(
      path.join(contentRoot, "registry.json"),
      JSON.stringify(
        {
          knownIds:
            stage02State === "published"
              ? ["s02-encapsulation", "s02-guard"]
              : [],
          retired: [],
          renames: {},
        },
        null,
        2,
      ),
      "utf8",
    );
  return { repoRoot, contentRoot, lessonMeta };
}

async function patchJson(file, patch) {
  const data = JSON.parse(await readFile(file, "utf8"));
  const next = { ...data, ...patch };
  await writeFile(file, JSON.stringify(next, null, 2), "utf8");
  return next;
}

test("跨 Stage fixture：Stage 02 课程被发现并正确关联 Stage/Module/练习", async () => {
  const { repoRoot, contentRoot } = await makeRepo();
  try {
    const catalog = await buildCatalog({ repoRoot, contentRoot });
    const lesson = catalog.lessons.find((item) => item.id === "s02-encapsulation");
    assert.ok(lesson, "Stage 02 课程应进入目录");
    assert.equal(lesson.stageId, "02");
    assert.equal(lesson.moduleId, "deep-dives");
    assert.equal(lesson.packageName, "com.example.stage02.encapsulation");
    assert.ok(catalog.exercises.some((item) => item.id === "s02-guard"));
    assert.ok(catalog.stages.find((s) => s.id === "02").contentState === "published");
    assert.equal(catalog.lessons.length, 1);
    assert.equal(catalog.exercises.length, 1);
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

test("未发布内容不会进入目录（draft/materials 门禁）", async () => {
  const { repoRoot, contentRoot } = await makeRepo({ stage02State: "materials" });
  try {
    const catalog = await buildCatalog({ repoRoot, contentRoot });
    assert.equal(catalog.lessons.length, 0);
    assert.equal(catalog.exercises.length, 0);
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

test("重复 ID 与非法关联在构建期失败", async () => {
  const { repoRoot, contentRoot } = await makeRepo();
  try {
    const lessonPath = path.join(contentRoot, "lessons/stage02/s02-encapsulation.json");
    await patchJson(lessonPath, { exerciseIds: ["不存在的练习"] });
    await assert.rejects(
      () => buildCatalog({ repoRoot, contentRoot }),
      (error) =>
        error.name === "ContentError" &&
        /不存在的练习/.test(error.message),
    );
    await patchJson(lessonPath, { exerciseIds: [], id: "s02-guard" });
    await assert.rejects(
      () => buildCatalog({ repoRoot, contentRoot }),
      (error) => /重复 ID|关联/.test(error.message),
    );
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

test("缺失参考资源或缺失文件会指明上下文", async () => {
  const { repoRoot, contentRoot } = await makeRepo();
  try {
    const exercisePath = path.join(contentRoot, "exercises/stage02/s02-guard.json");
    await patchJson(exercisePath, {
      referenceFiles: ["MissingAnswer.java"],
    });
    await assert.rejects(
      () => buildCatalog({ repoRoot, contentRoot }),
      (error) => /参考资源缺失/.test(error.message),
    );
    const lessonPath = path.join(contentRoot, "lessons/stage02/s02-encapsulation.json");
    await patchJson(lessonPath, {
      bodyPath: "stages/stage02_java_oop/deep_dives/01_encapsulation/MISSING.md",
      exerciseIds: ["s02-guard"],
    });
    await patchJson(exercisePath, { referenceFiles: [] });
    await assert.rejects(
      () => buildCatalog({ repoRoot, contentRoot }),
      (error) =>
        error.name === "ContentError" &&
        /无法读取内容文件/.test(error.message) &&
        /s02-encapsulation/.test(error.message),
    );
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

test("模拟增量更新：改正文/改标题/新增课程/调整顺序均不破坏稳定 ID", async () => {
  const { repoRoot, contentRoot } = await makeRepo();
  try {
    const before = await buildCatalog({ repoRoot, contentRoot });
    const bodyPath = path.join(
      repoRoot,
      "stages/stage02_java_oop/deep_dives/01_encapsulation/README.md",
    );
    await writeFile(bodyPath, "# 深化课：封装\n\n更新后的正文，ID 不变。\n", "utf8");
    await patchJson(path.join(contentRoot, "lessons/stage02/s02-encapsulation.json"), {
      title: "封装（修订）",
    });
    await patchJson(path.join(contentRoot, "exercises/stage02/s02-guard.json"), {
      order: 2,
    });
    const after = await buildCatalog({ repoRoot, contentRoot });
    assert.equal(after.lessons[0].id, before.lessons[0].id, "稳定 ID 不得改变");
    assert.match(after.lessons[0].markdown, /更新后的正文/);
    assert.equal(after.lessons[0].title, "封装（修订）");

    await writeFile(
      path.join(contentRoot, "lessons/stage02/s02-polymorphism.json"),
      JSON.stringify(
        {
          id: "s02-polymorphism",
          stageId: "02",
          moduleId: "deep-dives",
          kind: "deep-dive",
          title: "多态",
          summary: "同一约定，不同实现。",
          contentState: "published",
          relatedLessonIds: ["s02-encapsulation"],
          exerciseIds: [],
          predictionIds: [],
          steps: [],
          bodyPath: "stages/stage02_java_oop/deep_dives/01_encapsulation/README.md",
          codeDirectory: "stages/stage02_java_oop/deep_dives/01_encapsulation",
        },
        null,
        2,
      ),
      "utf8",
    );
    const grown = await buildCatalog({ repoRoot, contentRoot });
    assert.equal(grown.lessons.length, 2);
    assert.ok(grown.lessons.some((item) => item.id === "s02-polymorphism"));
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

test("删除课程必须显式登记 retired，静默删除会构建失败", async () => {
  const { repoRoot, contentRoot } = await makeRepo();
  try {
    // 删除课程（及其关联练习）而不登记下线：构建必须显式报错，不得静默丢弃
    await rm(path.join(contentRoot, "lessons/stage02/s02-encapsulation.json"));
    await rm(path.join(contentRoot, "exercises/stage02/s02-guard.json"));
    await assert.rejects(
      () => buildCatalog({ repoRoot, contentRoot }),
      (error) =>
        error.name === "ContentError" &&
        /显式登记 retired/.test(error.message) &&
        /s02-encapsulation/.test(error.message) &&
        /s02-guard/.test(error.message),
    );
    // 显式登记 retired 后构建通过
    await patchJson(path.join(contentRoot, "registry.json"), {
      retired: ["s02-encapsulation", "s02-guard"],
    });
    const catalog = await buildCatalog({ repoRoot, contentRoot });
    assert.equal(catalog.lessons.length, 0);
    assert.equal(catalog.exercises.length, 0);
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

test("课程改名通过 renames 显式迁移，不会静默丢历史", async () => {
  const { repoRoot, contentRoot } = await makeRepo();
  try {
    await rm(path.join(contentRoot, "lessons/stage02/s02-encapsulation.json"));
    await patchJson(path.join(contentRoot, "exercises/stage02/s02-guard.json"), {
      lessonIds: ["s02-oop-encapsulation"],
    });
    await patchJson(path.join(contentRoot, "registry.json"), {
      knownIds: ["s02-encapsulation", "s02-oop-encapsulation", "s02-guard"],
      renames: { "s02-encapsulation": "s02-oop-encapsulation" },
    });
    await writeFile(
      path.join(contentRoot, "lessons/stage02/s02-oop-encapsulation.json"),
      JSON.stringify(
        {
          id: "s02-oop-encapsulation",
          stageId: "02",
          moduleId: "deep-dives",
          kind: "deep-dive",
          title: "封装",
          summary: "同课程，迁移后的新 ID。",
          contentState: "published",
          relatedLessonIds: [],
          exerciseIds: ["s02-guard"],
          predictionIds: [],
          steps: [],
          bodyPath: "stages/stage02_java_oop/deep_dives/01_encapsulation/README.md",
          codeDirectory: "stages/stage02_java_oop/deep_dives/01_encapsulation",
        },
        null,
        2,
      ),
      "utf8",
    );
    const catalog = await buildCatalog({ repoRoot, contentRoot });
    assert.ok(catalog.lessons.some((item) => item.id === "s02-oop-encapsulation"));
    assert.ok(!catalog.lessons.some((item) => item.id === "s02-encapsulation"));
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});
