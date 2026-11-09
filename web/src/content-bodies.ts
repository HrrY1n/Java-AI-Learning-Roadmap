// 正文懒加载层（V2.1 Bundle 优化）。
// catalog.json 只含元数据；专题课正文/源码与仓库文档正文在 content-bodies.json，
// 由动态 import 拆成独立 chunk，仅在进入阅读页或打开搜索时加载一次并缓存。
export interface TopicLessonBody {
  markdown: string;
  code: string;
}

export interface ContentBodies {
  topics: Record<string, TopicLessonBody>;
  documents: Record<string, string>;
}

let bodiesPromise: Promise<ContentBodies> | null = null;

export function loadContentBodies(): Promise<ContentBodies> {
  bodiesPromise ??= import("./generated/content-bodies.json").then(
    (module) => module.default as ContentBodies,
  );
  return bodiesPromise;
}
