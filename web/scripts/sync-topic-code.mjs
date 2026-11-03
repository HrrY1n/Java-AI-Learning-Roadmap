// 同步算法专题课程的内嵌源码：topics.json 中每门 code 课的 code 字段
// 与 markdown 中的 ```java 完整代码块，均以仓库真实源码为准。
// 用法：node scripts/sync-topic-code.mjs [--check]（--check 只报告不写）
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const checkOnly = process.argv.includes("--check");
const topicsPath = path.join(repoRoot, "web/content/topics.json");
const raw = readFileSync(topicsPath, "utf8");
const crlf = raw.includes("\r\n");
const data = JSON.parse(raw.replace(/\r\n/g, "\n"));

let changed = 0;
for (const topic of data.topics) {
  for (const module of topic.modules ?? []) {
    for (const lesson of module.lessons ?? []) {
      if (!lesson.code) continue;
      const dirSlug = lesson.packageName.replace(/^com\.javaroadmap\.algo\./, "");
      const dirMap = {
        complexity: "complexity", recursion: "recursion", bigo: "big_o", space: "space",
        array: "array", linkedlist: "linkedlist", stack: "stack", queue: "queue",
        hashtable: "hash_table", binarytree: "binary_tree", heap: "heap", graph: "graph",
        binarysearch: "binary_search", sorting: "sorting", divideconquer: "divide_conquer",
        backtracking: "backtracking", dynamicprogramming: "dynamic_programming",
        greedy: "greedy", dsbasics: "ds_basics", deque: "deque", bst: "bst", avl: "avl",
        heaptopk: "heap_topk", binaryboundary: "binary_boundary",
        selectionheapsort: "selection_heapsort", noncomparisonsort: "non_comparison_sort",
        subsetsum: "subset_sum", knapsack: "knapsack", editdistance: "edit_distance",
      };
      const dir = dirMap[dirSlug];
      if (!dir) throw new Error(`未知包名映射：${lesson.packageName}`);
      const sourcePath = path.join(repoRoot, "stages/topics/algorithms", dir, "com/javaroadmap/algo", dirSlug, `${lesson.className || "App"}.java`);
      const source = readFileSync(sourcePath, "utf8").replace(/\r\n/g, "\n");
      const oldCode = lesson.code;
      if (oldCode.trim() !== source.trim()) {
        // 同步 code 字段
        lesson.code = source;
        // 同步 markdown 中与旧 code 完全一致的 fenced 代码块
        const fenceRe = /```java\n([\s\S]*?)```/g;
        lesson.markdown = lesson.markdown.replace(fenceRe, (block, body) =>
          body.trim() === oldCode.trim() ? "```java\n" + source + "```" : block,
        );
        changed++;
        console.log(`synced ${lesson.id}`);
        if (lesson.markdown.includes(oldCode.split("\n")[0])) {
          console.log(`  注意：${lesson.id} 的 markdown 可能仍含旧片段，请人工确认`);
        }
      }
    }
  }
}

if (changed === 0) {
  console.log("all topic lesson code in sync");
} else if (checkOnly) {
  console.error(`${changed} 门课的源码与仓库不一致`);
  process.exit(1);
} else {
  const out = (JSON.stringify(data, null, 2) + (raw.endsWith("\n") ? "\n" : "")).replace(/\n/g, crlf ? "\r\n" : "\n");
  writeFileSync(topicsPath, out);
  console.log(`topics.json updated (${changed} lessons synced)`);
}
