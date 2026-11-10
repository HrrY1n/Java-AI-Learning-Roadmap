// V1.9-R 章节锚点：专题课「本节脉络」目录与 Markdown h2 锚点共用的小工具。
// 只做纯字符串处理，便于单测；不引入任何学习进度语义。

// 把标题文本折叠为稳定的 DOM id（中日英数字与连字符保留，其余剥除）。
// 同一篇文档内重复标题按出现顺序追加序号（-2、-3…），避免 id 冲突。
export function slugifyHeading(text: string, seen?: Map<string, number>): string {
  const base =
    text
      .trim()
      .replace(/[\s./\\]+/g, "-")
      .replace(/[^\p{L}\p{N}-]/gu, "")
      .toLowerCase() || "section";
  if (!seen) return base;
  const count = seen.get(base) ?? 0;
  seen.set(base, count + 1);
  return count === 0 ? base : `${base}-${count + 1}`;
}

// 从课程 markdown 提取二级小节（先剥掉 fenced 代码块，避免块内 "##" 误判）。
// 生成的 id 与 Markdown 组件为渲染后 h2 计算的 slug 一致：两侧都只保留
// 文字与数字，行内格式记号（`*_[ 等）不会进入 id。
export function extractH2Sections(markdown: string): {
  text: string;
  id: string;
}[] {
  const proseOnly = markdown.replace(/^```[\s\S]*?^```/gm, "");
  const seen = new Map<string, number>();
  const sections: { text: string; id: string }[] = [];
  for (const match of proseOnly.matchAll(/^##\s+(.+)$/gm)) {
    const raw = match[1].trim();
    const text = raw.replace(/`/g, "");
    sections.push({ text, id: slugifyHeading(raw, seen) });
  }
  return sections;
}
