import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { runProcess, normalizeOutput } from "./verify-practice.mjs";

const webRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(
  await readFile(join(webRoot, "src/generated/catalog.json"), "utf8"),
);
const javaTool = (name) =>
  process.env.JAVA_HOME
    ? join(
        process.env.JAVA_HOME,
        "bin",
        `${name}${process.platform === "win32" ? ".exe" : ""}`,
      )
    : name;

test("all objective predictions match real Java output, including the modified loop", async () => {
  // 语义自动验证覆盖 Stage 01 的完整可运行片段；
  // Stage 02（S02*）片段依赖课堂补充类（如 Student/Point），不在此自动运行。
  const objective = catalog.predictions.filter(
    (prediction) => !prediction.id.startsWith("S02"),
  );
  const temporary = await mkdtemp(join(tmpdir(), "javaroadmap-predictions-"));
  try {
    const cases = objective.flatMap((prediction) => [
      prediction,
      ...(prediction.modifiedAnswer
        ? [
            {
              ...prediction,
              id: `${prediction.id}modified`,
              code: prediction.code.replace("i < 3", "i <= 3"),
              answer: prediction.modifiedAnswer,
            },
          ]
        : []),
    ]);
    const sources = [];
    const entries = [];
    for (const item of cases) {
      const packageName = `com.javaroadmap.lab.validation.${item.id.toLowerCase()}`;
      const className =
        item.code.match(/public class (\w+)/)?.[1] ?? "Prediction";
      const body =
        className === "Prediction"
          ? `public class Prediction { public static void main(String[] args) {\n${item.code}\n} }`
          : item.code;
      const directory = join(temporary, item.id);
      await mkdir(directory);
      const actualPath = join(directory, `${className}.java`);
      await writeFile(actualPath, `package ${packageName};\n${body}\n`, "utf8");
      sources.push(actualPath);
      entries.push({ ...item, fqcn: `${packageName}.${className}` });
    }
    const compilation = await runProcess(
      javaTool("javac"),
      ["-encoding", "UTF-8", "-d", join(temporary, "out"), ...sources],
      { cwd: temporary, timeout: 20_000 },
    );
    assert.equal(compilation.exitCode, 0, compilation.stderr);
    for (const item of entries) {
      const actual = await runProcess(
        javaTool("java"),
        [
          "-Dstdout.encoding=UTF-8",
          "-Dfile.encoding=UTF-8",
          "-cp",
          "out",
          item.fqcn,
        ],
        { cwd: temporary },
      );
      assert.equal(actual.exitCode, 0, `${item.id}: ${actual.stderr}`);
      assert.equal(
        normalizeOutput(actual.stdout),
        normalizeOutput(item.answer),
        item.id,
      );
    }
    assert.equal(entries.length, 9);
  } finally {
    if (
      dirname(temporary) === resolve(tmpdir()) &&
      basename(temporary).startsWith("javaroadmap-predictions-")
    )
      await rm(temporary, { recursive: true, force: true });
  }
});
