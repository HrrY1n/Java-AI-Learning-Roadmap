// 练习 Java 契约测试：骨架真实 javac 编译 + verify-practice 身份识别。
// 覆盖全部已发布练习（Stage 01 与 Stage 02），JDK 来自环境（CI 已装 Temurin 21/25）。
import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(
  await readFile(path.join(webRoot, "src/generated/catalog.json"), "utf8"),
);
const javaTool = (name) =>
  process.env.JAVA_HOME
    ? path.join(
        process.env.JAVA_HOME,
        "bin",
        `${name}${process.platform === "win32" ? ".exe" : ""}`,
      )
    : name;

function run(command, args, cwd) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { cwd });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.stderr.on("data", (chunk) => (stderr += chunk));
    child.on("close", (exitCode) => resolve({ exitCode, stdout, stderr }));
    child.on("error", (error) =>
      resolve({ exitCode: -1, stdout, stderr: String(error) }),
    );
  });
}

test("全部已发布练习的初始骨架通过 javac 编译", async () => {
  const temporary = await mkdtemp(path.join(tmpdir(), "jrl-skeleton-"));
  try {
    assert.ok(catalog.exercises.length >= 5);
    for (const exercise of catalog.exercises) {
      const packagePath = exercise.packageName.split(".").join(path.sep);
      const directory = path.join(temporary, exercise.id, packagePath);
      await mkdir(directory, { recursive: true });
      const sourcePath = path.join(directory, `${exercise.className}.java`);
      await writeFile(sourcePath, exercise.starterCode, "utf8");
      const compilation = await run(
        javaTool("javac"),
        ["-encoding", "UTF-8", "-d", path.join(temporary, exercise.id, "out"), sourcePath],
        temporary,
      );
      assert.equal(
        compilation.exitCode,
        0,
        `${exercise.id} 骨架编译失败：${compilation.stderr}`,
      );
    }
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});

test("verify-practice 识别 Stage 02 新练习身份（s02-bank-account）", async () => {
  const temporary = await mkdtemp(path.join(tmpdir(), "jrl-identity-"));
  try {
    const bank = catalog.exercises.find(
      (exercise) => exercise.id === "s02-bank-account",
    );
    assert.ok(bank, "s02-bank-account 必须在目录中");
    const packagePath = bank.packageName.split(".").join(path.sep);
    const sourcePath = path.join(
      temporary,
      packagePath,
      `${bank.className}.java`,
    );
    await mkdir(path.dirname(sourcePath), { recursive: true });
    await writeFile(sourcePath, bank.starterCode, "utf8");
    // 骨架没有任何真实输出：身份校验必须通过，但用例断言失败（exit 1 + 证据文件）
    const firstCase = bank.cases[0];
    const inputPath = path.join(temporary, "input.txt");
    const expectPath = path.join(temporary, "expected.txt");
    await writeFile(inputPath, firstCase.input, "utf8");
    await writeFile(expectPath, firstCase.expected, "utf8");
    const evidencePath = path.join(temporary, "result.evidence.json");
    const result = await run(
      process.execPath,
      [
        path.join(webRoot, "scripts", "verify-practice.mjs"),
        "--exercise",
        bank.id,
        "--source",
        sourcePath,
        "--input-file",
        inputPath,
        "--expect-file",
        expectPath,
        "--label",
        firstCase.label,
        "--evidence",
        evidencePath,
      ],
      temporary,
    );
    // 身份拒绝会直接抛错且不产生证据文件；这里必须走到用例比对环节
    assert.ok(
      result.stdout.includes("本次验证失败"),
      `身份应被接受并进入用例比对，实际输出：${result.stdout}${result.stderr}`,
    );
    const evidence = JSON.parse(await readFile(evidencePath, "utf8"));
    assert.equal(evidence.exerciseId, "s02-bank-account");
    assert.equal(evidence.allPassed, false);
    // 证据的源码指纹与骨架一致（verify-practice 正确识别了这份源码）
    const { createHash } = await import("node:crypto");
    assert.equal(
      evidence.sourceHash,
      createHash("sha256").update(bank.starterCode).digest("hex"),
    );
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});
