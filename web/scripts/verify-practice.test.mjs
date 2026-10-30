import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { test } from "node:test";
import {
  normalizeOutput,
  parseArgs,
  runProcess,
  verifyPractice,
} from "./verify-practice.mjs";

test("exact output comparison preserves leading whitespace and internal empty lines", () => {
  assert.equal(normalizeOutput("  x  \r\n\r\ny\t\r\n"), "  x\n\ny");
  assert.equal(normalizeOutput("x\ry\r"), "x\ny");
  assert.notEqual(normalizeOutput("x\n\n"), normalizeOutput("x\n"));
  assert.throws(() => parseArgs(["--exercise", "scores"]), /用法/);
  assert.throws(() => parseArgs(["--source", "a", "--source", "b"]), /重复/);
  assert.throws(
    () => parseArgs(["--source", "a", "--run-server", "yes"]),
    /参数/,
  );
});

test("process time and output limits produce a failure", async () => {
  const timed = await runProcess(
    process.execPath,
    ["-e", "setInterval(() => {}, 1000)"],
    { timeout: 120 },
  );
  assert.equal(timed.exitCode, -1);
  assert.match(timed.stderr, /超时/);
  const large = await runProcess(process.execPath, [
    "-e",
    'process.stdout.write("x".repeat(1000000)); setInterval(() => {}, 1000)',
  ]);
  assert.equal(large.exitCode, -1);
  assert.ok(Buffer.byteLength(large.stdout) <= 64 * 1024);
  assert.match(large.stderr, /超过/);
});

test(
  "timed process trees close inherited pipes and leave no running child",
  { timeout: 12_000 },
  async () => {
    const root = await mkdtemp(join(tmpdir(), "lab-process-tree-"));
    const pidFile = join(root, "owned-processes.json");
    const script = `
    const { spawn } = require('node:child_process');
    const { writeFileSync } = require('node:fs');
    const child = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], {
      stdio: ['ignore', 'inherit', 'inherit'], windowsHide: true,
      // Model a Windows JDK launcher whose real JVM outlives the wrapper.
      detached: process.platform === 'win32'
    });
    writeFileSync(process.argv[1], JSON.stringify([process.pid, child.pid]));
    setInterval(() => {}, 1000);
  `;
    let deadline;
    const execution = runProcess(process.execPath, ["-e", script, pidFile], {
      timeout: 2_000,
    });
    try {
      const result = await Promise.race([
        execution,
        new Promise((_, reject) => {
          deadline = setTimeout(
            () =>
              reject(
                new Error("child inherited pipes remained open after timeout"),
              ),
            7_000,
          );
        }),
      ]);
      assert.equal(result.exitCode, -1);
      assert.match(result.stderr, /超时/);
      const [, childPid] = JSON.parse(await readFile(pidFile, "utf8"));
      let alive = true;
      for (let attempt = 0; attempt < 40 && alive; attempt++) {
        try {
          process.kill(childPid, 0);
        } catch (error) {
          assert.equal(error.code, "ESRCH");
          alive = false;
        }
        if (alive) await new Promise((resolve) => setTimeout(resolve, 25));
      }
      assert.equal(alive, false, "the launcher child must terminate too");
    } finally {
      clearTimeout(deadline);
      // Only PIDs created by this fixture are candidates for cleanup.
      try {
        for (const pid of JSON.parse(await readFile(pidFile, "utf8"))) {
          try {
            process.kill(pid, "SIGKILL");
          } catch {
            /* already terminated */
          }
        }
      } catch {
        /* fixture failed before creating the file */
      }
      await execution.catch(() => undefined);
      if (
        dirname(root) === resolve(tmpdir()) &&
        basename(root).startsWith("lab-process-tree-")
      )
        await rm(root, { recursive: true, force: true });
    }
  },
);

test("real JDK execution records passing, wrong and compilation results without altering source", async () => {
  const root = await mkdtemp(join(tmpdir(), "lab-runner-test-"));
  const source = join(root, "SelfCheck.java");
  const expected = join(root, "expected.txt");
  const input = join(root, "input.txt");
  const catalog = {
    exercises: [
      {
        id: "self-check",
        packageName: "com.javaroadmap.lab.selfcheck",
        className: "SelfCheck",
      },
    ],
  };
  const code =
    "package com.javaroadmap.lab.selfcheck;\npublic class SelfCheck { public static void main(String[] args) { System.out.println(new java.util.Scanner(System.in).nextLine()); } }\n";
  try {
    await writeFile(source, code, "utf8");
    await writeFile(expected, "验证✓\n", "utf8");
    await writeFile(input, "验证✓\n", "utf8");
    const options = {
      exercise: "self-check",
      source,
      expectFile: expected,
      inputFile: input,
      label: "UTF-8 自检",
    };
    const passed = await verifyPractice(options, catalog);
    assert.equal(passed.allPassed, true);
    assert.equal(
      passed.sourceHash,
      createHash("sha256").update(code).digest("hex"),
    );
    assert.equal(normalizeOutput(passed.cases[0].stdout), "验证✓");
    assert.equal(passed.cases[0].match, "exact");
    assert.ok(passed.javaVersion.includes("version"));
    await writeFile(expected, "\uFEFF验证✓\r\n", "utf8");
    const bomExpected = await verifyPractice(options, catalog);
    assert.equal(
      bomExpected.allPassed,
      true,
      "Windows UTF-8 BOM in expected text is not program output",
    );
    await writeFile(expected, "验证✓\n", "utf8");
    await writeFile(input, "\uFEFF验证✓\r\n", "utf8");
    const bomInput = await verifyPractice(options, catalog);
    assert.equal(
      bomInput.allPassed,
      true,
      "Windows UTF-8 BOM must not become the first input character",
    );
    await writeFile(input, "验证✓\n", "utf8");
    await writeFile(expected, "错误的预期\n", "utf8");
    const wrong = await verifyPractice(options, catalog);
    assert.equal(wrong.allPassed, false);
    assert.equal(wrong.cases[0].exitCode, 0);
    assert.equal(wrong.cases[0].stdout, passed.cases[0].stdout);
    await writeFile(
      source,
      "package com.javaroadmap.lab.selfcheck; public class SelfCheck { public static void main(String[] args) { int n = ; } }",
      "utf8",
    );
    const compilation = await verifyPractice(options, catalog);
    assert.equal(compilation.allPassed, false);
    assert.notEqual(compilation.cases[0].exitCode, 0);
    assert.equal(compilation.cases[0].label, "编译");
    assert.ok(compilation.cases[0].stderr.length > 0);
    await writeFile(
      source,
      "package com.javaroadmap.lab.selfcheck; public class SelfCheck { public static void main(String[] args) { while (true) { } } }",
      "utf8",
    );
    const timed = await verifyPractice(options, catalog);
    assert.equal(timed.allPassed, false);
    assert.equal(timed.cases[0].exitCode, -1);
    assert.match(timed.cases[0].stderr, /超时/);
    await assert.rejects(
      () => verifyPractice({ ...options, exercise: "missing" }, catalog),
      /未知练习/,
    );
    await assert.rejects(
      () => verifyPractice({ ...options, expectFile: undefined }, catalog),
      /必须提供/,
    );
  } finally {
    if (
      dirname(root) === resolve(tmpdir()) &&
      basename(root).startsWith("lab-runner-test-")
    )
      await rm(root, { recursive: true, force: true });
  }
});
