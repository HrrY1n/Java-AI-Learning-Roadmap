// 内容读取与解析：集中处理路径越界、CRLF 归一、JSON/Markdown/Java 解析错误。
// 构建器通过本模块读取正式内容；独立 CLI 可另行直接读取仓库文件。
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { contentError } from "./errors.mjs";

// 读取仓库内 UTF-8 文本并归一 CRLF；拒绝越出 repoRoot，保留系统错误码供调用方分支。
export async function readSource(repoRoot, sourcePath, context = {}) {
  const absolute = path.resolve(repoRoot, sourcePath);
  if (!absolute.startsWith(`${repoRoot}${path.sep}`))
    throw contentError(`内容路径逃出仓库: ${sourcePath}`, context);
  try {
    return (await readFile(absolute, "utf8")).replace(/\r\n/g, "\n");
  } catch (error) {
    const wrapped = contentError(
      `无法读取内容文件 ${sourcePath}：${error.code ?? error.message}`,
      context,
    );
    wrapped.code = error.code;
    throw wrapped;
  }
}

// 读取并解析内容 JSON，把语法错误包装成带文件路径的 ContentError。
export async function readJson(repoRoot, sourcePath) {
  const raw = await readSource(repoRoot, sourcePath, { file: sourcePath });
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw contentError(`JSON 解析失败：${error.message}`, {
      file: sourcePath,
    });
  }
}

// 返回目录中按文件名排序的 JSON 清单；目录不存在表示该阶段尚无内容。
export async function listJsonFiles(contentRoot, relative) {
  const directory = path.resolve(contentRoot, relative);
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return []; // 该阶段尚未建立课程目录
    throw error;
  }
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name)
    .sort();
}

// 递归收集目录中的 .java 文件并返回稳定排序，保证跨设备生成顺序一致。
// 与 readSource 相同的仓库边界守卫：目录字段写 ../ 或绝对路径时直接给出可定位的错误。
export async function javaFiles(repoRoot, directory) {
  const root = path.resolve(repoRoot, directory);
  if (!(root + path.sep).startsWith(path.resolve(repoRoot) + path.sep))
    throw new Error(`内容路径逃出仓库：${directory}`);
  const found = [];
  for (const entry of await readdir(root, {
    withFileTypes: true,
  })) {
    const relative = `${directory}/${entry.name}`;
    if (entry.isDirectory())
      found.push(...(await javaFiles(repoRoot, relative)));
    else if (entry.name.endsWith(".java")) found.push(relative);
  }
  return found.sort();
}

// 从 Java 源码提取显式包名与 public 类型名；缺一即终止，避免生成无包课程。
export function javaIdentity(code, sourcePath) {
  const packageName = code.match(/^package\s+([\w.]+);/m)?.[1];
  const className = code.match(
    /public\s+(?:abstract\s+|final\s+)?(?:class|interface|enum|record)\s+(\w+)/,
  )?.[1];
  if (!packageName || !className)
    throw contentError("Java 源码缺少 package 声明或 public 类型声明", {
      file: sourcePath,
    });
  return { packageName, className };
}

// 按指定标题级别切片 Markdown；每个标题的正文截止到下一个同级标题。
export function sections(markdown, level) {
  const heading = new RegExp(`^${"#".repeat(level)} ([^\\n]+)\\n`, "gm");
  const matches = [...markdown.matchAll(heading)];
  return matches.map((match, index) => ({
    title: match[1].trim(),
    body: markdown
      .slice(
        match.index + match[0].length,
        matches[index + 1]?.index ?? markdown.length,
      )
      .trim(),
  }));
}

// 标题前缀锚点必须且只能命中一处，避免内容章节调整时静默取错段落。
export function requireSection(list, anchor, context) {
  const hits = list.filter((section) => section.title.startsWith(anchor));
  if (hits.length !== 1)
    throw contentError(
      hits.length === 0
        ? `找不到章节锚点「${anchor}」`
        : `章节锚点「${anchor}」命中 ${hits.length} 处，必须唯一`,
      context,
    );
  return hits[0];
}
