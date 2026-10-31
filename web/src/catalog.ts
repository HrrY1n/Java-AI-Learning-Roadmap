import raw from "./generated/catalog.json";
import type { Catalog } from "./content-types";

export const catalog = raw as Catalog;

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
  // V1.2：练习与预测/修改题的来源文档按 catalog 数据路由，不再按文件名特判
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
