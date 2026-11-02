import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, mkdir, rm, readdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateCatalog } from "./generate-content.mjs";

const exec = promisify(execFile);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const catalog = await generateCatalog({ write: false });

function algoLesson(lessonId) {
  return catalog.topics
    .find((t) => t.id === "topic-algo")
    .modules.flatMap((m) => m.lessons)
    .find((l) => l.id === lessonId);
}

/**
 * 在一次性临时目录中编译并运行指定课程源码，返回真实 stdout。
 * 只做编译运行验证，不修改仓库内任何文件。
 */
async function runLessonApp(relSourceRoot, packageName, timeoutMs = 60_000) {
  const sandbox = await mkdtemp(path.join(os.tmpdir(), "algo-semantics-"));
  try {
    const sourceDir = path.join(repoRoot, relSourceRoot, "com");
    const outDir = path.join(sandbox, "out");
    await mkdir(outDir, { recursive: true });
    const javaFiles = [];
    async function collect(dir) {
      for (const entry of await readdir(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) await collect(full);
        else if (entry.name.endsWith(".java")) javaFiles.push(full);
      }
    }
    await collect(sourceDir);
    await exec("javac", ["-encoding", "UTF-8", "-d", outDir, ...javaFiles], {
      timeout: timeoutMs,
    });
    const { stdout } = await exec(
      "java",
      [
        "-Dstdout.encoding=UTF-8",
        "-Dstderr.encoding=UTF-8",
        "-Dfile.encoding=UTF-8",
        "-cp",
        outDir,
        `${packageName}.App`,
      ],
      {
        timeout: timeoutMs,
        encoding: "utf8",
      },
    );
    return stdout;
  } finally {
    await rm(sandbox, { recursive: true, force: true });
  }
}

test("栈课程括号匹配：普通字符不参与匹配，空串合法，错误闭合与未闭合非法", async () => {
  const stdout = await runLessonApp(
    "stages/topics/algorithms/stack",
    "com.javaroadmap.algo.stack",
  );

  assert.match(stdout, /括号合法性 \{\[\(\)\]\}：true/, "有效嵌套应判定合法");
  assert.match(stdout, /括号合法性 \{\[\(\]\)\}：false/, "错误闭合应判定非法");
  assert.match(stdout, /括号合法性 \(a\)：true/, "(a) 应为 true");
  assert.match(stdout, /括号合法性 \(a：false/, "(a 应为 false");
  assert.match(stdout, /括号合法性 空字符串：true/, "空字符串应视为合法");
  assert.match(stdout, /括号合法性 纯普通字符abc：true/, "纯普通字符应为 true");
});

test("环形队列边界：size 计数法、回绕 FIFO 正确、空/满异常保护且不用 -1 哨兵", async () => {
  const stdout = await runLessonApp(
    "stages/topics/algorithms/queue",
    "com.javaroadmap.algo.queue",
  );

  assert.match(stdout, /队首 peek：100/);
  assert.match(stdout, /出队 pop：100/);
  assert.match(stdout, /回绕后队首出队：200/, "回绕后应按 FIFO 取出 200");
  assert.match(stdout, /队满保护（size == capacity）：队列已满/);
  assert.match(stdout, /队空保护（size == 0）：队列为空/);
  assert.doesNotMatch(stdout, /pop\(\) 返回 -1|返回 -1 表示/);
});

test("队列课程正文：明确区分 size 计数法与预留空位法，并说明 -1 哨兵反模式", () => {
  const lesson = algoLesson("algo-queue");

  assert.match(lesson.markdown, /size 计数法（配套 Java 源码采用）/);
  assert.match(lesson.markdown, /预留空位法（网站交互图解采用）/);
  assert.match(lesson.markdown, /6 个槽位最多同时存放 5 个元素/);
  assert.match(lesson.markdown, /不返回 `-1` 之类的哨兵值/);
  // 正文声称引用源码：类名与源码一致，不再出现与源码矛盾的 ArrayQueue 版本
  assert.match(lesson.markdown, /class CircularQueue/);
  assert.doesNotMatch(lesson.markdown, /class ArrayQueue/);
});

test("栈课程正文：普通字符约定与源码行为一致", () => {
  const lesson = algoLesson("algo-stack");

  assert.match(lesson.markdown, /`\(a\)` 合法/);
  assert.match(lesson.markdown, /`\(a` 因左括号未闭合而非法/);
  assert.match(lesson.markdown, /纯文本 `abc` 合法/);
  assert.match(lesson.markdown, /普通字符（字母、数字等）不参与匹配/);
});

test("时间复杂度正文：全排列归入 O(n!) 而非 O(2^n)", () => {
  const lesson = algoLesson("algo-time-complexity");

  const exponentRow = lesson.markdown
    .split("\n")
    .find((line) => line.includes("$O(2^n)$"));
  assert.ok(exponentRow, "应存在指数阶行");
  assert.doesNotMatch(exponentRow, /全排列/);

  const factorialRow = lesson.markdown
    .split("\n")
    .find((line) => line.includes("$O(n!)$"));
  assert.ok(factorialRow, "应存在阶乘阶行");
  assert.match(factorialRow, /全排列/);
});

test("课程正文代码块的方法签名与实际落盘源码一致", () => {
  const checks = [
    [
      "algo-iteration-recursion",
      /sumByLoop\(|sumByRecursion\(|fib\(int n\)/,
    ],
    ["algo-space-complexity", /constantSpace\(|linearSpace\(int n\)/],
    [
      "algo-array",
      /insert\(int\[\] arr, int size, int index, int element\)|remove\(int\[\] arr, int size, int index\)/,
    ],
    [
      "algo-linkedlist",
      /insertAfter\(ListNode n0|removeAfter\(ListNode n0/,
    ],
    ["algo-stack", /isValidParentheses\(String s\)/],
    ["algo-queue", /class CircularQueue/],
  ];
  for (const [lessonId, signaturePattern] of checks) {
    assert.match(
      algoLesson(lessonId).markdown,
      signaturePattern,
      `${lessonId} 正文代码块方法签名应与源码一致`,
    );
  }
});
