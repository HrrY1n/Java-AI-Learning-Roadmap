import test from "node:test";
import assert from "node:assert/strict";
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

  assert.equal(publishedLessons.length, 8);

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

test("V1.4 《Pro Git》专题：首批课程包含工作区状态图解与命令流转，绝不塞 Java main", () => {
  const gitTopic = catalog.topics.find((t) => t.id === "topic-git");
  const publishedLessons = gitTopic.modules.flatMap((m) =>
    m.lessons.filter((l) => l.status === "published"),
  );

  assert.equal(publishedLessons.length, 5);

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
});

test("V1.4 《On Java 8》补充关联：全部关联对应有效课程并标注现代 JDK 差异", () => {
  assert.ok(Array.isArray(catalog.onJavaLinks));
  assert.equal(catalog.onJavaLinks.length, 14);

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
