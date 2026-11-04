import raw from "./generated/catalog.json";
import type { Catalog } from "./content-types";

export const catalog = raw as Catalog;

// 把内容文档中的相对链接解析为仓库相对路径；外链、协议相对 URL 和坏 URI 返回空串。
export function resolveSourcePath(href: string, sourcePath: string): string {
  if (/^[a-z][a-z\d+.-]*:/i.test(href) || href.startsWith("//")) return "";
  try {
    return decodeURIComponent(
      new URL(href, `https://repo.local/${sourcePath}`).pathname,
    ).replace(/^\//, "");
  } catch {
    return "";
  }
}

// 先把仓库路径映射到站内 hash 路由；未命中时生成 GitHub blob/tree 链接并保留锚点。
export function sourceHref(href: string, sourcePath: string): string {
  if (/^https?:\/\//.test(href)) return href;
  const path = resolveSourcePath(href, sourcePath);
  if (!path) return "#/home";
  const url = new URL(href, `https://repo.local/${sourcePath}`);
  const lesson = catalog.lessons.find(
    (item) =>
      item.sourcePath === path ||
      item.codePath === path ||
      `${path.replace(/\/$/, "")}/` ===
        item.codePath.slice(0, item.codePath.indexOf("/com/") + 1),
  );
  if (lesson) return `#/lesson/${lesson.id}`;
  // 优先按 catalog 数据路由；末尾兜底仅兼容尚未登记到 catalog 的历史练习文档。
  const exercise = catalog.exercises.find((item) => item.sourcePath === path);
  if (exercise) return `#/lab/${exercise.id}`;
  if (
    catalog.predictions.some((item) => item.sourcePath === path) ||
    catalog.modifications.some((item) => item.sourcePath === path)
  )
    return "#/practice";
  if (path.endsWith("/predict_and_modify.md")) return "#/practice";
  if (path.endsWith("/basic_syntax_exercises.md")) return "#/lab/scores";
  const doc = catalog.documents.find(
    (item) =>
      item.sourcePath === path ||
      item.sourcePath === `${path.replace(/\/$/, "")}/README.md`,
  );
  if (doc) return `#/document/${doc.id}`;
  return `https://github.com/HrrY1n/Java-AI-Learning-Roadmap/${path.endsWith("/") ? "tree" : "blob"}/main/${path.split("/").map(encodeURIComponent).join("/")}${url.hash}`;
}
