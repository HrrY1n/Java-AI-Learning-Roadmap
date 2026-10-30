// 内容读取与解析：文件安全、JSON/Markdown/Java 解析的唯一入口。
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { contentError } from "./errors.mjs";

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

export async function javaFiles(repoRoot, directory) {
  const found = [];
  for (const entry of await readdir(path.resolve(repoRoot, directory), {
    withFileTypes: true,
  })) {
    const relative = `${directory}/${entry.name}`;
    if (entry.isDirectory())
      found.push(...(await javaFiles(repoRoot, relative)));
    else if (entry.name.endsWith(".java")) found.push(relative);
  }
  return found.sort();
}

export function javaIdentity(code, sourcePath) {
  const packageName = code.match(/^package\s+([\w.]+);/m)?.[1];
  const className = code.match(/public\s+class\s+(\w+)/)?.[1];
  if (!packageName || !className)
    throw contentError("Java 源码缺少 package 声明或 public class", {
      file: sourcePath,
    });
  return { packageName, className };
}

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
