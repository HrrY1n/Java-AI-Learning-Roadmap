import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";
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

// 共享检查器：覆盖有/无修饰符方法、构造器、类声明（见 scripts/lesson-source-check.mjs）
import { collectDeclarations, findMissingDeclarations } from "./lesson-source-check.mjs";

const normalize = (s) => s.replace(/\s+/g, " ").trim();

function fencedJavaBlocks(markdown) {
  const blocks = [];
  const re = /```java\n([\s\S]*?)```/g;
  let m;
  while ((m = re.exec(markdown)) !== null) blocks.push(m[1]);
  return blocks;
}

test("正文 java 代码块中的每个声明都必须在对应落盘源码中逐个存在（逐方法核对，不允许多选一）", () => {
  const fileMap = {
    "algo-complexity-eval": "stages/topics/algorithms/complexity/com/javaroadmap/algo/complexity/App.java",
    "algo-iteration-recursion": "stages/topics/algorithms/recursion/com/javaroadmap/algo/recursion/App.java",
    "algo-time-complexity": "stages/topics/algorithms/big_o/com/javaroadmap/algo/bigo/App.java",
    "algo-space-complexity": "stages/topics/algorithms/space/com/javaroadmap/algo/space/App.java",
    "algo-array": "stages/topics/algorithms/array/com/javaroadmap/algo/array/App.java",
    "algo-linkedlist": "stages/topics/algorithms/linkedlist/com/javaroadmap/algo/linkedlist/App.java",
    "algo-stack": "stages/topics/algorithms/stack/com/javaroadmap/algo/stack/App.java",
    "algo-queue": "stages/topics/algorithms/queue/com/javaroadmap/algo/queue/App.java",
    "algo-ds-basics": "stages/topics/algorithms/ds_basics/com/javaroadmap/algo/dsbasics/App.java",
    "algo-hash-table": "stages/topics/algorithms/hash_table/com/javaroadmap/algo/hashtable/App.java",
    "algo-binary-tree": "stages/topics/algorithms/binary_tree/com/javaroadmap/algo/binarytree/App.java",
    "algo-heap": "stages/topics/algorithms/heap/com/javaroadmap/algo/heap/App.java",
    "algo-graph": "stages/topics/algorithms/graph/com/javaroadmap/algo/graph/App.java",
    "algo-binary-search": "stages/topics/algorithms/binary_search/com/javaroadmap/algo/binarysearch/App.java",
    "algo-sorting": "stages/topics/algorithms/sorting/com/javaroadmap/algo/sorting/App.java",
    "algo-divide-conquer": "stages/topics/algorithms/divide_conquer/com/javaroadmap/algo/divideconquer/App.java",
    "algo-backtracking": "stages/topics/algorithms/backtracking/com/javaroadmap/algo/backtracking/App.java",
    "algo-dynamic-programming": "stages/topics/algorithms/dynamic_programming/com/javaroadmap/algo/dynamicprogramming/App.java",
    "algo-greedy": "stages/topics/algorithms/greedy/com/javaroadmap/algo/greedy/App.java",
    "algo-deque": "stages/topics/algorithms/deque/com/javaroadmap/algo/deque/App.java",
    "algo-bst": "stages/topics/algorithms/bst/com/javaroadmap/algo/bst/App.java",
    "algo-balanced-tree": "stages/topics/algorithms/avl/com/javaroadmap/algo/avl/App.java",
    "algo-heap-topk": "stages/topics/algorithms/heap_topk/com/javaroadmap/algo/heaptopk/App.java",
    "algo-binary-boundary": "stages/topics/algorithms/binary_boundary/com/javaroadmap/algo/binaryboundary/App.java",
    "algo-selection-heapsort": "stages/topics/algorithms/selection_heapsort/com/javaroadmap/algo/selectionheapsort/App.java",
    "algo-non-comparison-sort": "stages/topics/algorithms/non_comparison_sort/com/javaroadmap/algo/noncomparisonsort/App.java",
    "algo-backtracking-subset": "stages/topics/algorithms/subset_sum/com/javaroadmap/algo/subsetsum/App.java",
    "algo-dp-knapsack": "stages/topics/algorithms/knapsack/com/javaroadmap/algo/knapsack/App.java",
    "algo-edit-distance": "stages/topics/algorithms/edit_distance/com/javaroadmap/algo/editdistance/App.java",
  };

  let checkedDecls = 0;
  for (const [lessonId, relFile] of Object.entries(fileMap)) {
    const lesson = algoLesson(lessonId);
    const blocks = fencedJavaBlocks(lesson.markdown);
    assert.ok(blocks.length > 0, `${lessonId} 正文应包含 java 代码块`);
    const source = normalize(fs.readFileSync(path.join(repoRoot, relFile), "utf8"));

    for (const block of blocks) {
      const decls = collectDeclarations(block);
      assert.ok(
        decls.length > 0,
        `${lessonId} 的 java 代码块应至少包含一个方法或类声明`,
      );
      for (const decl of decls) {
        assert.ok(
          source.includes(decl),
          `${lessonId} 正文声明「${decl}」在源码 ${relFile} 中不存在（名称、参数或返回类型不一致）`,
        );
        checkedDecls++;
      }
    }
  }
  // 确认本测试真的逐方法核对到了足量声明，而不是静默空转
  assert.ok(checkedDecls >= 40, `逐方法核对应覆盖至少 40 个声明，实际 ${checkedDecls}`);
});

test("一致性检查的正反例：篡改正文声明必须能被发现", () => {
  // 反例 1：方法名被改动
  const doctoredName = fencedJavaBlocks(algoLesson("algo-stack").markdown)[0]
    .replace("isValidParentheses", "isBalancedBrackets");
  const stackSource = normalize(
    fs.readFileSync(path.join(repoRoot, "stages/topics/algorithms/stack/com/javaroadmap/algo/stack/App.java"), "utf8"),
  );
  const missing1 = findMissingDeclarations(
    "```java\n" + doctoredName + "\n```",
    stackSource,
  );
  assert.ok(missing1.length > 0, "方法名被篡改后必须检出不一致");
  assert.match(missing1[0], /isBalancedBrackets/);

  // 反例 2：参数列表被改动
  const doctoredParams = fencedJavaBlocks(algoLesson("algo-array").markdown)[0]
    .replace("insert(int[] arr, int size, int index, int element)", "insert(int[] values, int len, int pos, int val)");
  const arraySource = normalize(
    fs.readFileSync(path.join(repoRoot, "stages/topics/algorithms/array/com/javaroadmap/algo/array/App.java"), "utf8"),
  );
  const missing2 = findMissingDeclarations(
    "```java\n" + doctoredParams + "\n```",
    arraySource,
  );
  assert.ok(missing2.length > 0, "参数列表被篡改后必须检出不一致");

  // 正例：真实课程应全部通过（findMissingDeclarations 返回空数组）
  for (const lessonId of ["algo-stack", "algo-array", "algo-queue"]) {
    const lesson = algoLesson(lessonId);
    const relFile = {
      "algo-stack": "stages/topics/algorithms/stack/com/javaroadmap/algo/stack/App.java",
      "algo-array": "stages/topics/algorithms/array/com/javaroadmap/algo/array/App.java",
      "algo-queue": "stages/topics/algorithms/queue/com/javaroadmap/algo/queue/App.java",
    }[lessonId];
    const missing = findMissingDeclarations(
      lesson.markdown,
      fs.readFileSync(path.join(repoRoot, relFile), "utf8"),
    );
    assert.deepEqual(missing, [], `${lessonId} 真实课程不应有不一致声明`);
  }
});

test("链表课程展示两个同包源码文件，且正文说明必须一起编译", () => {
  const lesson = algoLesson("algo-linkedlist");
  assert.ok(Array.isArray(lesson.codeFiles) && lesson.codeFiles.length === 1);
  const nodeFile = lesson.codeFiles[0];
  assert.equal(nodeFile.className, "ListNode");
  assert.equal(nodeFile.packageName, "com.javaroadmap.algo.linkedlist");
  assert.match(nodeFile.code, /public class ListNode/);
  assert.equal(nodeFile.code.trim(), fs.readFileSync(path.join(repoRoot, nodeFile.path), "utf8").trim());
  assert.match(lesson.markdown, /两个同包文件/);
  assert.match(lesson.markdown, /一起编译/);
});

test("数组课程如实说明固定容量边界：满时抛异常，扩容是动态数组封装层行为", () => {
  const lesson = algoLesson("algo-array");
  assert.match(lesson.markdown, /固定容量/);
  assert.match(lesson.markdown, /并不会自动扩容|不会自动扩容/);
  assert.match(lesson.markdown, /新建一个更大的数组并把旧元素整体复制过去/);
  const source = fs.readFileSync(
    path.join(repoRoot, "stages/topics/algorithms/array/com/javaroadmap/algo/array/App.java"),
    "utf8",
  );
  assert.match(source, /本示例是固定容量数组/);
  assert.match(source, /IndexOutOfBoundsException/);
  assert.doesNotMatch(source, /物理地址空间/);
  assert.match(source, /模拟值/);
});

test("基数排序与非比较排序：支持五位数边界与非负前置校验，负数被明确拦截", async () => {
  const stdout = await runLessonApp(
    "stages/topics/algorithms/non_comparison_sort",
    "com.javaroadmap.algo.noncomparisonsort",
  );
  assert.match(stdout, /五位数边界：\[9, 10000, 54321\]/);
  assert.match(stdout, /负数拦截：基数排序（当前实现）仅支持非负整数，收到负数：-1/);
});
