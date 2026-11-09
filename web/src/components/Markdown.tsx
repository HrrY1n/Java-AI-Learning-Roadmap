import ReactMarkdown from "react-markdown";
import { memo, useEffect, useState } from "react";
import type { ReactNode } from "react";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import type { Pluggable } from "unified";
import hljs from "highlight.js/lib/core";
import java from "highlight.js/lib/languages/java";
import { catalog, resolveSourcePath, sourceHref } from "../catalog";
import { slugifyHeading } from "../slug-heading";

hljs.registerLanguage("java", java);

// KaTeX 只服务数学公式（目前仅专题课使用）。V2.1 起改为按需加载：
// 文本含数学定界符时才动态载入 rehype-katex 与其 CSS，主包不再携带全量 KaTeX。
// 加载完成前含公式的页面显示占位，避免闪现原始 TeX。
const MATH_PATTERN =
  /(?:\$\$[\s\S]+?\$\$|\$[^$\n]+\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\))/;
const FENCED_BLOCK = /```[\s\S]*?```/g;

// 数学检测前剔除代码围栏：fence 里的 "$VAR" / "$env:" 不是公式，
// 误触发会让非数学文档整页先渲染占位（评审实测 environment 等 2 篇）。
function hasMathOutsideFences(text: string): boolean {
  return MATH_PATTERN.test(text.replace(FENCED_BLOCK, ""));
}

let katexPromise: Promise<Pluggable> | null = null;
function loadKatex(): Promise<Pluggable> {
  katexPromise ??= Promise.all([
    import("rehype-katex"),
    import("katex/dist/katex.min.css"),
  ]).then(([plugin]) => plugin.default);
  return katexPromise;
}

function flattenNode(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(flattenNode).join("");
  if (typeof node === "object" && "props" in node) {
    return flattenNode((node.props as { children?: ReactNode }).children);
  }
  return "";
}

// 代码高亮依赖 highlight.js 对源码转义后再写入 innerHTML；未知语言退回纯文本节点。
// memo：code/language 不变时跳过整段重新高亮（编辑器打字会频繁触发父级重渲染）。
export const Code = memo(function Code({
  code,
  language = "java",
}: {
  code: string;
  language?: string;
}) {
  return (
    <pre
      className={`code-block language-${language}`}
      tabIndex={0}
      aria-label={`${language} 代码`}
    >
      {hljs.getLanguage(language) ? (
        <code
          dangerouslySetInnerHTML={{
            __html: hljs.highlight(code, { language }).value,
          }}
        />
      ) : (
        <code>{code}</code>
      )}
    </pre>
  );
});

// 把课程 Markdown 渲染为站内链接或“主动解锁”，去掉重复的首个 H1；
// 数学公式由 KaTeX 接管，任务列表复选框保持只读，查看参考不等于完成练习。
// memo：课程正文渲染是最重的子树（ReactMarkdown 全文 parse + KaTeX + 高亮）。
// 阅读页滚动停止写回位置、编辑器打字存草稿都只触发父级状态更新，text/sourcePath/
// onReference（稳定的 setState）不变时整棵子树直接跳过重渲染，消除全文重复解析。
export const Markdown = memo(function Markdown({
  text,
  sourcePath = "",
  onReference,
}: {
  text: string;
  sourcePath?: string;
  onReference?: (path: string) => void;
}) {
  const headingIds = new Map<string, number>();
  // 含公式的页面先挂占位，等 KaTeX 就绪后一次性渲染（不闪原始 TeX）
  const needsKatex = hasMathOutsideFences(text);
  const [katexPlugin, setKatexPlugin] = useState<Pluggable | null>(null);
  useEffect(() => {
    if (!needsKatex || katexPlugin) return;
    let alive = true;
    loadKatex().then((plugin) => {
      if (alive) setKatexPlugin(plugin);
    });
    return () => {
      alive = false;
    };
  }, [needsKatex, katexPlugin]);
  if (needsKatex && !katexPlugin) {
    return (
      <div className="prose">
        <p className="reader-body-loading">正在载入公式渲染…</p>
      </div>
    );
  }
  return (
    <div className="prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={katexPlugin ? [katexPlugin] : []}
        components={{
          h2: ({ children }) => {
            const text = flattenNode(children);
            return <h2 id={slugifyHeading(text, headingIds)}>{children}</h2>;
          },
          a: ({ href = "", children }) => {
            const path = resolveSourcePath(href, sourcePath);
            if (
              catalog.references.some((item) => item.sourcePath === path) &&
              onReference
            )
              return (
                <button
                  className="text-link inline-link"
                  onClick={() => onReference(path)}
                >
                  {children} · 主动解锁
                </button>
              );
            const link = sourceHref(href, sourcePath);
            return (
              <a
                href={link}
                {...(link.startsWith("http")
                  ? { target: "_blank", rel: "noreferrer noopener" }
                  : {})}
              >
                {children}
              </a>
            );
          },
          pre: ({ children }) => <>{children}</>,
          code: ({ className, children }) =>
            className?.startsWith("language-") ? (
              <Code
                code={String(children).replace(/\n$/, "")}
                language={className.slice(9)}
              />
            ) : String(children).includes("\n") ? (
              <pre className="code-block" tabIndex={0}>
                <code>{children}</code>
              </pre>
            ) : (
              <code className="inline-code">{children}</code>
            ),
          table: ({ children }) => (
            <div
              className="table-scroll"
              tabIndex={0}
              aria-label="表格，可横向滚动"
            >
              <table>{children}</table>
            </div>
          ),
          input: ({ checked }) => (
            <span
              className="source-checkbox"
              aria-label={checked ? "原文已勾选" : "原文未勾选"}
            >
              {checked ? "☑" : "□"}
            </span>
          ),
        }}
      >
        {text.replace(/^# [^\n]*(?:\n|$)/, "")}
      </ReactMarkdown>
    </div>
  );
});
