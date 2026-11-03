import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { generateCatalog } from "./generate-content.mjs";

const catalog = await generateCatalog({ write: false });

test("V1.4 专题数据架构：包含 5 大专题并正确区分已发布与仅有资料状态", () => {
  assert.ok(Array.isArray(catalog.topics));
  assert.equal(catalog.topics.length, 5);

  const topicIds = catalog.topics.map((t) => t.id);
  assert.deepEqual(topicIds, [
    "topic-algo",
    "topic-git",
    "topic-csapp",
    "topic-ostep",
    "topic-network",
  ]);

  const algoTopic = catalog.topics.find((t) => t.id === "topic-algo");
  const gitTopic = catalog.topics.find((t) => t.id === "topic-git");
  const csappTopic = catalog.topics.find((t) => t.id === "topic-csapp");
  const ostepTopic = catalog.topics.find((t) => t.id === "topic-ostep");
  const netTopic = catalog.topics.find((t) => t.id === "topic-network");

  assert.equal(algoTopic.status, "published");
  assert.equal(gitTopic.status, "published");
  // 门禁：未发布课程不得误标为已发布
  assert.equal(csappTopic.status, "materials");
  assert.equal(ostepTopic.status, "materials");
  assert.equal(netTopic.status, "materials");
});

test("V1.4 《Hello 算法》专题：首批已发布课程包含完整教学结构与有效 Java 源码", () => {
  const algoTopic = catalog.topics.find((t) => t.id === "topic-algo");
  const publishedLessons = algoTopic.modules.flatMap((m) =>
    m.lessons.filter((l) => l.status === "published"),
  );

  assert.equal(publishedLessons.length, 19);
  // 全部 9 个模块均已上线，不再有建设中/规划占位
  for (const module of algoTopic.modules) {
    assert.equal(module.status, "published", `${module.id} 应已上线`);
    assert.ok(module.lessons.length > 0, `${module.id} 不应为空模块`);
  }
  assert.equal(algoTopic.modules.length, 9);

  for (const lesson of publishedLessons) {
    // 来源追溯
    assert.ok(lesson.bookReference, `${lesson.id} 必须包含原书引用`);
    assert.equal(lesson.bookReference.bookTitle, "Hello 算法");
    assert.ok(
      lesson.bookReference.pdfPageStart > 0 &&
        lesson.bookReference.pdfPageEnd >= lesson.bookReference.pdfPageStart,
      `${lesson.id} PDF 页码非法`,
    );

    // 教学结构完整性
    assert.match(lesson.markdown, /业务场景|需要解决的问题/);
    assert.match(lesson.markdown, /为什么/);
    assert.match(lesson.markdown, /来源|出处/);

    // Java 源码规范
    if (lesson.kind === "code") {
      assert.ok(lesson.code, `${lesson.id} 缺少 Java 源码`);
      assert.match(lesson.packageName, /^com\.javaroadmap\.algo\./);
      assert.match(lesson.code, /package com\.javaroadmap\.algo\./);
      assert.match(lesson.code, /public class /);
    }
  }
});

test("V1.4 算法教学审查：杜绝无依据耗时断言，公式严谨且明确操作前提与边界", () => {
  const algoTopic = catalog.topics.find((t) => t.id === "topic-algo");
  const publishedLessons = algoTopic.modules.flatMap((m) =>
    m.lessons.filter((l) => l.status === "published"),
  );

  for (const lesson of publishedLessons) {
    // 门禁 1：严禁无实验依据的主观断言（如十亿次约一秒、公式仅一纳秒）
    assert.doesNotMatch(lesson.markdown, /十亿次循环约一秒/);
    assert.doesNotMatch(lesson.markdown, /仅需 1 纳秒/);

    // 门禁 2：严禁公式符号损坏或变量丢失（如未闭合的 $ 的、缺失 O 的 (n)$ 与 (1)$）
    assert.doesNotMatch(lesson.markdown, /(?:规模|长度为)\s*\$\s*的/);
    assert.doesNotMatch(lesson.markdown, /\s\(n\)\$/);
    assert.doesNotMatch(lesson.markdown, /\s\(1\)\$/);
  }

  // 门禁 3：数组操作前提与边界审查
  const arrayLesson = publishedLessons.find((l) => l.id === "algo-array");
  assert.ok(arrayLesson);
  assert.match(arrayLesson.markdown, /下标|索引/, "数组随机访问必须指出依赖数字下标前提");
  assert.match(arrayLesson.markdown, /按值查找/, "数组必须辨析已知下标 O(1) 与按值查找 O(n)");
  assert.match(arrayLesson.markdown, /扩容|移动/, "数组插入必须指出数据后移与扩容边界");

  // 门禁 4：链表操作前提审查
  const listLesson = publishedLessons.find((l) => l.id === "algo-linkedlist");
  assert.ok(listLesson);
  assert.match(listLesson.markdown, /前驱节点/, "链表 O(1) 插入必须明确指出持有前驱节点指针的前提");
  assert.match(listLesson.markdown, /O\(n\)|遍历/, "链表必须指明查找目标位置依然需要 O(n) 遍历");

  // 门禁 5：栈与队列边界审查
  const stackLesson = publishedLessons.find((l) => l.id === "algo-stack");
  assert.ok(stackLesson);
  assert.match(stackLesson.markdown, /空栈|溢出/, "栈必须包含空栈或容量溢出边界说明");

  const queueLesson = publishedLessons.find((l) => l.id === "algo-queue");
  assert.ok(queueLesson);
  assert.match(queueLesson.markdown, /假溢出/, "队列必须阐述普通数组假溢出原因");
  assert.match(queueLesson.markdown, /队空|队满/, "队列必须阐明队空与队满判别边界");
});

test("V1.4 源码同步门禁：已发布算法课程代码与 stages/topics/algorithms 源码严格一致", () => {
  const fileMap = {
    "algo-complexity-eval": "stages/topics/algorithms/complexity/com/javaroadmap/algo/complexity/App.java",
    "algo-iteration-recursion": "stages/topics/algorithms/recursion/com/javaroadmap/algo/recursion/App.java",
    "algo-time-complexity": "stages/topics/algorithms/big_o/com/javaroadmap/algo/bigo/App.java",
    "algo-space-complexity": "stages/topics/algorithms/space/com/javaroadmap/algo/space/App.java",
    "algo-array": "stages/topics/algorithms/array/com/javaroadmap/algo/array/App.java",
    "algo-linkedlist": "stages/topics/algorithms/linkedlist/com/javaroadmap/algo/linkedlist/App.java",
    "algo-stack": "stages/topics/algorithms/stack/com/javaroadmap/algo/stack/App.java",
    "algo-queue": "stages/topics/algorithms/queue/com/javaroadmap/algo/queue/App.java",
  };

  const algoTopic = catalog.topics.find((t) => t.id === "topic-algo");
  const publishedLessons = algoTopic.modules.flatMap((m) =>
    m.lessons.filter((l) => l.status === "published"),
  );

  for (const lesson of publishedLessons) {
    if (fileMap[lesson.id]) {
      const repoRoot = path.resolve("..");
      const filePath = path.join(repoRoot, fileMap[lesson.id]);
      const actualContent = fs
        .readFileSync(filePath, "utf-8")
        .trim()
        .replace(/\r\n/g, "\n");
      const expectedContent = (lesson.code || "")
        .trim()
        .replace(/\r\n/g, "\n");
      assert.equal(
        expectedContent,
        actualContent,
        `${lesson.id} 的 code 属性与实际落盘源码不一致`,
      );
    }
  }
});

test("V1.4 《Pro Git》专题：首批课程包含真实 Git 行为、状态输出与命令流转", () => {
  const gitTopic = catalog.topics.find((t) => t.id === "topic-git");
  const publishedLessons = gitTopic.modules.flatMap((m) =>
    m.lessons.filter((l) => l.status === "published"),
  );

  assert.equal(publishedLessons.length, 13);
  // 全部 5 个 Git 模块均已上线
  for (const module of gitTopic.modules) {
    assert.equal(module.status, "published", `${module.id} 应已上线`);
    assert.ok(module.lessons.length > 0, `${module.id} 不应为空模块`);
  }
  assert.equal(gitTopic.modules.length, 5);

  for (const lesson of publishedLessons) {
    assert.equal(lesson.kind, "command-lab");
    assert.ok(lesson.bookReference, `${lesson.id} 缺少原书引用`);
    assert.match(lesson.bookReference.bookTitle, /Pro Git/);
    assert.ok(
      lesson.bookReference.pdfPageStart > 0 &&
        lesson.bookReference.pdfPageEnd >= lesson.bookReference.pdfPageStart,
    );

    // Git 命令步进数据
    assert.ok(Array.isArray(lesson.gitSteps) && lesson.gitSteps.length > 0);
    for (const step of lesson.gitSteps) {
      assert.ok(step.command.startsWith("git "));
      assert.ok(step.explanation.length > 0);
      assert.ok(step.repoStateBefore.length > 0);
      assert.ok(step.repoStateAfter.length > 0);
    }

    // 门禁：不硬塞 Java main 方法
    assert.equal(lesson.code, undefined);
    assert.equal(lesson.packageName, undefined);
  }

  // 严谨 Git 初始行为校验
  const introLesson = publishedLessons.find((l) => l.id === "git-intro-basics");
  assert.ok(introLesson);
  const initStep = introLesson.gitSteps.find((s) => s.command === "git init");
  assert.ok(initStep);
  assert.match(initStep.explanation, /Unborn|符号引用/, "必须严谨说明初始分支指针未真正创建");
  assert.match(initStep.explanation, /index/, "必须明确说明暂存区索引文件在 init 时尚未创建");

  const statusStep = introLesson.gitSteps.find((s) => s.command === "git status");
  assert.ok(statusStep);
  assert.match(statusStep.repoStateAfter, /No commits yet/, "必须体现真实 Git 初始状态文案");

  // 补齐课程的覆盖清单：冲突、撤销、stash、标签、rebase/cherry-pick、协作、考古、内部原理
  const expectedNewLessons = [
    "git-merge-conflict",
    "git-undo-recover",
    "git-stash",
    "git-tag",
    "git-rebase-cherry-pick",
    "git-collab-workflow",
    "git-history-archaeology",
    "git-internals-basics",
  ];
  for (const id of expectedNewLessons) {
    const lesson = publishedLessons.find((l) => l.id === id);
    assert.ok(lesson, `缺少补齐课程 ${id}`);
    assert.ok(lesson.gitSteps.length >= 3, `${id} 应包含完整的命令步进数据`);
  }

  // 危险操作必须在课程中如实警示，且步进命令不得包含破坏性写法
  const undoLesson = publishedLessons.find((l) => l.id === "git-undo-recover");
  assert.match(undoLesson.markdown, /reset --hard/, "撤销课必须如实说明 reset --hard 的破坏性");
  const conflictLesson = publishedLessons.find((l) => l.id === "git-merge-conflict");
  assert.match(conflictLesson.markdown, /<<<<<<< /, "冲突课必须展示真实冲突标记");
  const rebaseLesson = publishedLessons.find((l) => l.id === "git-rebase-cherry-pick");
  assert.match(rebaseLesson.markdown, /只变基私有提交|黄金法则/, "rebase 课必须写明黄金法则");
  for (const lesson of publishedLessons) {
    for (const step of lesson.gitSteps) {
      assert.doesNotMatch(step.command, /push --force|push -f/, "步进命令禁止强推");
    }
  }
});

test("V1.4 《On Java 8》补充关联：全部关联对应有效课程并标注现代 JDK 差异", () => {
  assert.ok(Array.isArray(catalog.onJavaLinks));
  // 覆盖全部 44 节已发布主线课程（Stage 01×13 + Stage 02×14 + Stage 03×17）
  assert.equal(catalog.onJavaLinks.length, 44);

  const validStageIds = new Set(catalog.stages.map((s) => s.id));
  const validLessonIds = new Set(catalog.lessons.map((l) => l.id));

  for (const link of catalog.onJavaLinks) {
    assert.ok(validStageIds.has(link.stageId), `非法 stageId: ${link.stageId}`);
    assert.ok(
      validLessonIds.has(link.lessonId),
      `非法 lessonId: ${link.lessonId}`,
    );
    assert.ok(link.bookChapter.startsWith("第"));
    assert.ok(link.pdfPages.length > 0);
    assert.ok(
      ["full-overlap", "extension", "gap-supplement", "advanced"].includes(
        link.overlapType,
      ),
    );
    assert.ok(link.rationale.length > 10);
  }

  // 核对关键章节真实页码
  const encapsulation = catalog.onJavaLinks.find(
    (l) => l.lessonId === "s02-encapsulation-basics",
  );
  assert.ok(encapsulation);
  assert.equal(encapsulation.pdfPages, "173-185", "封装章节起点必须对应真实 PDF 第 173 页");
});

test("V1.4 外部教材库索引：完整收录 6 本教材元数据", () => {
  assert.ok(Array.isArray(catalog.booksIndex));
  assert.equal(catalog.booksIndex.length, 6);

  const bookIds = catalog.booksIndex.map((b) => b.id);
  assert.deepEqual(bookIds, [
    "book-hello-algo",
    "book-pro-git",
    "book-on-java-8",
    "book-csapp",
    "book-ostep",
    "book-network",
  ]);

  for (const book of catalog.booksIndex) {
    assert.ok(book.totalPages > 100);
    assert.ok(Array.isArray(book.keyChapters) && book.keyChapters.length > 0);
    assert.ok(
      ["integrated-core", "integrated-topic", "indexed-future"].includes(
        book.status,
      ),
    );
  }
});
