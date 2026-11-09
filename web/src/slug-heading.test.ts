// V1.9-R 章节锚点回归：slug 生成、目录提取，以及全量课程「目录 id ↔ 渲染锚点」
// 一致性与唯一性。锚点只服务页内定位，不承载任何学习进度语义。
import { describe, expect, it } from "vitest";
import { extractH2Sections, slugifyHeading } from "./slug-heading";
import { catalog } from "./catalog";
import bodiesRaw from "../src/generated/content-bodies.json";
import type { ContentBodies } from "./content-bodies";

// 生成的 JSON 推断为字面量形状；此处按运行时契约宽化为索引类型。
const bodies = bodiesRaw as ContentBodies;

describe("slugifyHeading", () => {
  it("普通中文标题", () => {
    expect(slugifyHeading("业务场景与需要解决的问题")).toBe(
      "业务场景与需要解决的问题",
    );
  });

  it("英文标题转小写", () => {
    expect(slugifyHeading("Remote-tracking Branches")).toBe(
      "remote-tracking-branches",
    );
  });

  it("中英文混合", () => {
    expect(slugifyHeading("Git 操作安全铁律")).toBe("git-操作安全铁律");
  });

  it("含行内代码与标点的标题：记号剥除，文字保留", () => {
    expect(slugifyHeading("用 `count[v]` 数出现次数")).toBe(
      "用-countv-数出现次数",
    );
    expect(slugifyHeading("先预测，再运行！")).toBe("先预测再运行");
  });

  it("纯符号标题退化为 section", () => {
    expect(slugifyHeading(" *** ")).toBe("section");
  });

  it("无 seen 表时不参与去重，只做折叠", () => {
    expect(slugifyHeading("常见问题")).toBe(slugifyHeading("常见问题"));
  });

  it("同篇文档内重复标题按顺序追加序号，保证 id 唯一", () => {
    const seen = new Map<string, number>();
    const first = slugifyHeading("示例", seen);
    const second = slugifyHeading("示例", seen);
    const third = slugifyHeading("示例！", seen);
    expect(first).toBe("示例");
    expect(second).toBe("示例-2");
    expect(third).toBe("示例-3");
    expect(new Set([first, second, third]).size).toBe(3);
  });
});

describe("extractH2Sections", () => {
  it("fenced 代码块内的 '##' 不算小节标题", () => {
    const markdown = [
      "## 真实小节",
      "```bash",
      "## 这只是注释",
      "git status",
      "```",
      "## 第二小节",
    ].join("\n");
    const sections = extractH2Sections(markdown);
    expect(sections.map((section) => section.text)).toEqual([
      "真实小节",
      "第二小节",
    ]);
  });

  it("与 Markdown 渲染侧 slug 一致：原始行内记号不影响 id", () => {
    // 渲染侧对 flatten 后的纯文本（无记号）调 slug；提取侧对原始行调 slug。
    // 两侧都只保留文字与数字，因此相等。
    const raw = "## 用 `origin/main` 追踪分支";
    const renderedText = "用 origin/main 追踪分支";
    expect(extractH2Sections(raw)[0].id).toBe(slugifyHeading(renderedText));
  });

  it("没有小节的课程返回空数组（目录自然隐藏，不报错）", () => {
    expect(extractH2Sections("# 只有正文\n\n一段没有二级标题的内容。")).toEqual(
      [],
    );
  });
});

describe("全量课程锚点唯一性（防 id 冲突回归）", () => {
  it("每门专题课的目录 id 在课内唯一，且来源行不含实体字符", () => {
    let lessonCount = 0;
    for (const topic of catalog.topics) {
      for (const module of topic.modules ?? []) {
        for (const lesson of module.lessons ?? []) {
          // V2.1 起正文在 content-bodies.json（catalog 只含元数据）
          const markdown = bodies.topics[lesson.id]?.markdown ?? "";
          if (!markdown) continue;
          lessonCount += 1;
          const sections = extractH2Sections(markdown);
          const ids = sections.map((section) => section.id);
          expect(ids.length).toBe(new Set(ids).size);
          for (const section of sections) {
            // 已知边界：原始标题若含 HTML 实体（&amp; 等），提取侧与渲染侧
            // 的 slug 会分叉。当前内容约定不使用实体标题，这里钉住该约定。
            expect(section.text).not.toMatch(/&|<|>/);
          }
        }
      }
    }
    expect(lessonCount).toBeGreaterThan(40);
  });

  it("主线课程 markdown 的 h2 id 同样课内唯一", () => {
    for (const lesson of catalog.lessons) {
      const markdown = lesson.markdown ?? "";
      if (!markdown) continue;
      const sections = extractH2Sections(markdown);
      const ids = sections.map((section) => section.id);
      expect(ids.length).toBe(new Set(ids).size);
    }
  });
});
