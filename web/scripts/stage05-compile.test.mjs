// Stage 05 MySQL Java 编译守卫测试：
// 即使在没有 MySQL 服务与 Connector/J JAR 的 CI 环境中，所有 Stage 05 示例、
// 6 阶段连续演进项目与 TODO 练习骨架仅依赖 JDK 标准库 java.sql.*，必须原生 javac 零报错编译通过。
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readdir, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runProcess } from "./verify-practice.mjs";

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

async function collectJavaFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectJavaFiles(full)));
    } else if (entry.name.endsWith(".java")) {
      files.push(full);
    }
  }
  return files;
}

test("Stage 05 全部 5 课、6 阶段演进项目与练习骨架原生 javac 编译通过（零写死密码）", async () => {
  const stageRoot = path.join(repoRoot, "stages/stage05_mysql_db");
  const existingSources = await collectJavaFiles(path.join(stageRoot, "existing_course"));
  const skeletonSources = await collectJavaFiles(path.join(stageRoot, "practice/skeleton"));
  assert.ok(existingSources.length >= 16, `Stage 05 源码文件应 >= 16，实际 ${existingSources.length}`);
  assert.ok(skeletonSources.length >= 1, "Stage 05 应有练习 TODO 骨架");

  // 检查所有源码不含默认测试密码硬编码
  const { readFile } = await import("node:fs/promises");
  for (const file of [...existingSources, ...skeletonSources]) {
    const content = await readFile(file, "utf8");
    assert.ok(
      !content.includes("jrl_local_test_pw"),
      `源码 ${file} 不得硬编码测试密码`,
    );
  }

  const outRoot = await mkdtemp(path.join(tmpdir(), "jrl-s05-compile-"));
  try {
    const c1 = await runProcess(
      javaTool("javac"),
      ["-encoding", "UTF-8", "-d", path.join(outRoot, "main"), ...existingSources],
      { cwd: outRoot, timeout: 25_000 },
    );
    assert.equal(c1.exitCode, 0, `Stage 05 existing_course 编译失败：\n${c1.stderr}`);

    const c2 = await runProcess(
      javaTool("javac"),
      ["-encoding", "UTF-8", "-d", path.join(outRoot, "skel"), ...skeletonSources],
      { cwd: outRoot, timeout: 20_000 },
    );
    assert.equal(c2.exitCode, 0, `Stage 05 skeleton 编译失败：\n${c2.stderr}`);

    const cleanupSql = path.join(stageRoot, "sql/00_cleanup.sql");
    assert.ok((await stat(cleanupSql)).size > 0);
  } finally {
    await rm(outRoot, { recursive: true, force: true });
  }
});
