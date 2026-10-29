import { spawn } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import {
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import {
  basename,
  dirname,
  isAbsolute,
  join,
  relative,
  resolve,
  sep,
} from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const maxOutput = 64 * 1024;

export function normalizeOutput(value) {
  return value
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/g, ""))
    .join("\n")
    .replace(/\n$/, "");
}

function javaCommand(name) {
  return process.env.JAVA_HOME
    ? join(
        process.env.JAVA_HOME,
        "bin",
        process.platform === "win32" ? `${name}.exe` : name,
      )
    : name;
}

// The timeout limits mistakes; it does not isolate code from the user's machine.
export function runProcess(
  command,
  args,
  { cwd, input = "", timeout = 5000 } = {},
) {
  return new Promise((resolveRun, reject) => {
    const child = spawn(command, args, {
      cwd,
      shell: false,
      windowsHide: true,
      detached: process.platform !== "win32",
      stdio: ["pipe", "pipe", "pipe"],
    });
    let stdout = Buffer.alloc(0);
    let stderr = Buffer.alloc(0);
    let terminated = "";
    let killRequested = false;
    const kill = (reason) => {
      if (killRequested) return;
      killRequested = true;
      terminated = reason;
      if (!child.pid) return;
      if (process.platform === "win32") {
        // shortcut: Windows kills only this process; use an OS sandbox before accepting untrusted programs.
        child.kill();
      } else {
        try {
          process.kill(-child.pid, "SIGKILL");
        } catch {
          child.kill("SIGKILL");
        }
      }
    };
    const timer = setTimeout(() => kill("运行超时，已终止本次进程。"), timeout);
    const collect = (name, chunk) => {
      const previous = name === "stdout" ? stdout : stderr;
      const next = Buffer.concat([previous, chunk]).subarray(0, maxOutput);
      if (name === "stdout") stdout = next;
      else stderr = next;
      if (previous.length + chunk.length > maxOutput)
        kill("输出超过 64 KiB，已终止本次进程。");
    };
    child.stdout.on("data", (chunk) => collect("stdout", chunk));
    child.stderr.on("data", (chunk) => collect("stderr", chunk));
    child.stdin.on("error", (error) => {
      if (error.code !== "EPIPE" && error.code !== "ECONNRESET")
        kill(`输入失败：${error.code}`);
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      reject(
        new Error(
          `无法启动 ${basename(command)}：${error.message}。请检查 JDK / JAVA_HOME。`,
        ),
      );
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      const diagnostic = terminated ? `\n[JavaRoadmap Lab] ${terminated}` : "";
      resolveRun({
        stdout: stdout.toString("utf8"),
        stderr: stderr.toString("utf8") + diagnostic,
        exitCode: terminated ? -1 : (code ?? -1),
      });
    });
    child.stdin.end(input);
  });
}

async function readSmall(path, label, limit = 100_000) {
  const buffer = await readFile(path);
  if (buffer.length > limit)
    throw new Error(`${label}超过 ${limit} 字节，未执行。`);
  const text = buffer.toString("utf8");
  if (!Buffer.from(text, "utf8").equals(buffer))
    throw new Error(`${label}必须是有效 UTF-8 文件。`);
  return { buffer, text };
}

export async function verifyPractice(options, catalog) {
  const exercise = catalog.exercises.find(
    (item) => item.id === options.exercise,
  );
  if (!exercise)
    throw new Error(
      "未知练习，请先运行 npm run content 并使用网站显示的练习 ID。",
    );
  if (!options.source || !options.expectFile)
    throw new Error(
      "必须提供 --source 和 --expect-file；预期输出由你在运行前明确填写。",
    );
  if (
    !/^[a-z][a-z0-9]*(?:\.[a-z][a-z0-9]*)+$/.test(exercise.packageName) ||
    !/^[A-Z][A-Za-z0-9]*$/.test(exercise.className)
  ) {
    throw new Error("课程元数据中的 Java 包名或类名无效。");
  }
  const sourcePath = await realpath(resolve(options.source));
  const sourceWithinRepository = relative(repositoryRoot, sourcePath);
  if (
    !sourceWithinRepository.startsWith(`..${sep}`) &&
    !isAbsolute(sourceWithinRepository) &&
    sourceWithinRepository
      .split(sep)
      .some((part) => ["answers", "my_practices"].includes(part))
  ) {
    throw new Error(
      "请使用从网站下载的独立源码副本；本工具不读取答案目录或 my_practices。",
    );
  }
  if (!sourcePath.endsWith(".java"))
    throw new Error("--source 必须指向 .java 文件。");
  const source = await readSmall(sourcePath, "Java 源码", 128 * 1024);
  const expected = (await readSmall(resolve(options.expectFile), "预期输出"))
    .text;
  const input = options.inputFile
    ? (await readSmall(resolve(options.inputFile), "测试输入")).text
    : "";
  const packagePattern = new RegExp(
    `^\\s*package\\s+${exercise.packageName.replaceAll(".", "\\.")}\\s*;`,
    "m",
  );
  const classPattern = new RegExp(
    `\\bpublic\\s+(?:final\\s+)?class\\s+${exercise.className}\\b`,
  );
  if (!packagePattern.test(source.text) || !classPattern.test(source.text))
    throw new Error(
      `源码必须声明 package ${exercise.packageName}; 与 public class ${exercise.className}。请使用网站导出的模板身份。`,
    );
  const version = await runProcess(javaCommand("java"), ["-version"]);
  if (version.exitCode !== 0)
    throw new Error(`JDK 自检失败：${version.stderr || version.stdout}`);
  const temporaryRoot = await mkdtemp(join(tmpdir(), "javaroadmap-lab-"));
  try {
    const packagePath = exercise.packageName.split(".").join(sep);
    const temporarySource = join(
      temporaryRoot,
      packagePath,
      `${exercise.className}.java`,
    );
    const outputPath = join(temporaryRoot, "out");
    await mkdir(dirname(temporarySource), { recursive: true });
    await writeFile(temporarySource, source.buffer);
    const compileArgs = [
      "-encoding",
      "UTF-8",
      "-d",
      outputPath,
      temporarySource,
    ];
    const runArgs = [
      "-Dfile.encoding=UTF-8",
      "-Dstdout.encoding=UTF-8",
      "-Dstderr.encoding=UTF-8",
      "-cp",
      outputPath,
      `${exercise.packageName}.${exercise.className}`,
    ];
    const compilation = await runProcess(javaCommand("javac"), compileArgs, {
      cwd: temporaryRoot,
      timeout: 20_000,
    });
    const compiled = compilation.exitCode === 0;
    const result = compiled
      ? await runProcess(javaCommand("java"), runArgs, {
          cwd: temporaryRoot,
          input,
        })
      : compilation;
    const actualExpected = compiled ? expected : "";
    const passed =
      compiled &&
      result.exitCode === 0 &&
      normalizeOutput(result.stdout) === normalizeOutput(actualExpected);
    return {
      id: randomUUID(),
      exerciseId: exercise.id,
      sourceHash: createHash("sha256").update(source.buffer).digest("hex"),
      createdAt: new Date().toISOString(),
      origin: "local-jdk",
      command: `${JSON.stringify([javaCommand("javac"), ...compileArgs])}${compiled ? `\n${JSON.stringify([javaCommand("java"), ...runArgs])}` : ""}`,
      javaVersion: normalizeOutput(version.stderr || version.stdout),
      cases: [
        {
          label: compiled ? options.label || "自定义精确输出断言" : "编译",
          input: compiled ? input : "",
          expected: actualExpected,
          ...result,
          passed,
          match: "exact",
        },
      ],
      allPassed: passed,
    };
  } finally {
    // This path is created here, never derived from a source or CLI deletion argument.
    if (
      dirname(temporaryRoot) === resolve(tmpdir()) &&
      basename(temporaryRoot).startsWith("javaroadmap-lab-")
    ) {
      await rm(temporaryRoot, { recursive: true, force: true });
    }
  }
}

export function parseArgs(args) {
  const names = {
    "--exercise": "exercise",
    "--source": "source",
    "--expect-file": "expectFile",
    "--input-file": "inputFile",
    "--label": "label",
    "--evidence": "evidence",
  };
  const options = {};
  for (let index = 0; index < args.length; index += 2) {
    const name = names[args[index]];
    const value = args[index + 1];
    if (
      !name ||
      !value ||
      value.startsWith("--") ||
      Object.hasOwn(options, name)
    )
      throw new Error(
        "参数错误或重复。支持 --exercise / --source / --expect-file / --input-file / --label / --evidence。",
      );
    options[name] = value;
  }
  if (!options.exercise || !options.source || !options.expectFile)
    throw new Error(
      "用法：node scripts/verify-practice.mjs --exercise scores --source ScoreStatistics.java --expect-file expected.txt [--input-file input.txt] [--label 正常输入] [--evidence result.json]",
    );
  if (options.label && options.label.length > 200)
    throw new Error("测试标签不能超过 200 字符。");
  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const catalog = JSON.parse(
    await readFile(
      new URL("../src/generated/catalog.json", import.meta.url),
      "utf8",
    ),
  );
  const evidence = await verifyPractice(options, catalog);
  const output = options.evidence
    ? resolve(options.evidence)
    : join(
        dirname(resolve(options.source)),
        `${basename(options.source, ".java")}.${evidence.id}.evidence.json`,
      );
  if (!output.toLowerCase().endsWith(".json"))
    throw new Error("--evidence 必须是 .json 文件，拒绝覆盖源码。");
  await writeFile(output, `${JSON.stringify(evidence, null, 2)}\n`, {
    encoding: "utf8",
    flag: "wx",
  });
  console.log(
    `${evidence.allPassed ? "本次断言通过" : "本次验证失败"}，已记录真实输出。\n证据文件：${output}\n仅验证本次输入和断言，不代表整题完成或已经掌握。`,
  );
  if (!evidence.allPassed) process.exitCode = 1;
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
