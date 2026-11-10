// 独立学习验证集语义门禁（V2.2 P2）：
// 1. 解析 stages/practice/diagnostic_and_transfer.md 中所有标注为
//    `// diagnostic:compile-error:<预期关键字>` 与 `// diagnostic:runtime-output:<预期输出>` 的片段，
//    用真实 JDK 25 编译或运行核验——确保每道 Debug/诊断题的故障现象与预期完全真实，绝不虚构错误。
// 2. 验证阶段代表课讲义（Stage01-04 升级课程）均包含"学习验收与自我检核"四要素闭环，
//    且诊断答案文件不会泄漏进公开 catalog.documents。
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateCatalog } from "./generate-content.mjs";
import { runProcess, normalizeOutput } from "./verify-practice.mjs";

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(webRoot, "..");

const javaTool = (name) =>
  process.env.JAVA_HOME
    ? path.join(
        process.env.JAVA_HOME,
        "bin",
        `${name}${process.platform === "win32" ? ".exe" : ""}`,
      )
    : name;

test("诊断题集中的所有报错题与运行时输出题在真实 JDK 25 上严格复现", async () => {
  const md = (
    await readFile(
      path.join(repoRoot, "stages/practice/diagnostic_and_transfer.md"),
      "utf8",
    )
  ).replace(/\r\n?/g, "\n");
  const blocks = [...md.matchAll(/```java\n([\s\S]*?)```/g)].map((m) => m[1]);
  const tagged = blocks.filter((code) =>
    code.startsWith("// diagnostic:"),
  );
  assert.ok(tagged.length >= 6, `至少应有 6 道带实测标记的诊断题，实际 ${tagged.length}`);

  const temporary = await mkdtemp(path.join(tmpdir(), "jrl-diag-"));
  try {
    let checked = 0;
    for (const [index, code] of tagged.entries()) {
      const firstLine = code.split("\n")[0];
      const match = firstLine.match(/^\/\/ diagnostic:(compile-error|runtime-output):(.+)$/);
      assert.ok(match, `诊断标记格式无效: ${firstLine}`);
      const [, mode, expected] = match;

      const caseDir = path.join(temporary, `case_${index}`);
      await mkdir(caseDir, { recursive: true });

      if (code.includes("package pkgb;")) {
        // 跨包诊断题 U2：构造 pkga.Base 作为前提再编译 pkgb.Child
        const pkgA = path.join(caseDir, "pkga");
        const pkgB = path.join(caseDir, "pkgb");
        await mkdir(pkgA, { recursive: true });
        await mkdir(pkgB, { recursive: true });
        await writeFile(
          path.join(pkgA, "Base.java"),
          'package pkga;\npublic class Base {\n  protected String note = "x";\n}\n',
          "utf8",
        );
        await writeFile(path.join(pkgB, "Child.java"), code, "utf8");
        const comp = await runProcess(
          javaTool("javac"),
          [
            "-J-Duser.language=en",
            "-J-Duser.country=US",
            "-encoding",
            "UTF-8",
            "-d",
            path.join(caseDir, "out"),
            path.join(pkgA, "Base.java"),
            path.join(pkgB, "Child.java"),
          ],
          { cwd: caseDir, timeout: 20_000 },
        );
        assert.notEqual(comp.exitCode, 0, `U2 跨包题必须编译报错`);
        assert.ok(
          comp.stderr.includes(expected.trim()),
          `U2 报错输出应包含 "${expected}"，实际：\n${comp.stderr}`,
        );
        checked += 1;
        continue;
      }

      const className = code.match(/public class (\w+)/)?.[1];
      assert.ok(className, `诊断片段必须有 public class：${firstLine}`);
      const srcPath = path.join(caseDir, `${className}.java`);
      const outDir = path.join(caseDir, "out");
      await writeFile(srcPath, code, "utf8");
      const comp = await runProcess(
        javaTool("javac"),
        [
          "-J-Duser.language=en",
          "-J-Duser.country=US",
          "-encoding",
          "UTF-8",
          "-d",
          outDir,
          srcPath,
        ],
        { cwd: caseDir, timeout: 20_000 },
      );

      if (mode === "compile-error") {
        assert.notEqual(comp.exitCode, 0, `${className} 必须被 javac 拒绝编译`);
        assert.ok(
          comp.stderr.includes(expected.trim()),
          `${className} 编译报错应包含 "${expected}"，实际：\n${comp.stderr}`,
        );
      } else {
        assert.equal(comp.exitCode, 0, `${className} 编译失败：\n${comp.stderr}`);
        const run = await runProcess(
          javaTool("java"),
          ["-Dstdout.encoding=UTF-8", "-Dfile.encoding=UTF-8", "-cp", outDir, className],
          { cwd: caseDir },
        );
        assert.equal(run.exitCode, 0, `${className} 运行失败：${run.stderr}`);
        assert.equal(normalizeOutput(run.stdout), expected.trim(), `${className} 输出不符`);
      }
      checked += 1;
    }
    assert.ok(checked >= 6);
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});

test("代表性课程讲义均含学习验收四要素闭环，且诊断解析答案不泄漏到文档视图", async () => {
  const catalog = await generateCatalog({ write: false });
  // 1. 答案文件不得进入 documents，只能在 references 懒加载中
  assert.ok(
    catalog.documents.some((doc) => doc.id === "diagnostic-and-transfer"),
    "独立诊断与迁移验证集应作为文档可达",
  );
  assert.ok(
    catalog.documents.every((doc) => !doc.sourcePath.includes("diagnostic_solutions")),
    "诊断答案文件绝不能进入公开文档列表",
  );
  assert.ok(
    catalog.references.some((ref) => ref.sourcePath.endsWith("diagnostic_solutions.md")),
    "诊断答案文件必须走主动解锁 references 懒加载",
  );

  // 2. Stage01-04 核心升级讲义必须包含完整的四要素自我检核闭环
  const upgradedLessonIds = [
    "day03",
    "day07",
    "s02-static-lifecycle",
    "s02-string-common-api",
    "s03-arraylist",
    "s03-hashmap",
    "s04-visibility-volatile",
    "s04-synchronized-mutex",
    "s04-concurrent-tools",
    "s05-sql-basics",
    "s05-relational-design",
    "s05-transactions-acid",
    "s05-indexes-explain",
    "s05-jdbc-dao",
  ];
  for (const id of upgradedLessonIds) {
    const lesson = catalog.lessons.find((item) => item.id === id);
    assert.ok(lesson && lesson.markdown, `课程 ${id} 应挂载连续正文讲义`);
    for (const marker of [
      "需要掌握什么",
      "如何证明理解",
      "什么情况属于尚未掌握",
      "针对错误如何复习",
    ]) {
      assert.ok(
        lesson.markdown.includes(marker),
        `课程 ${id} 缺少四要素闭环条目「${marker}」`,
      );
    }
  }
});
