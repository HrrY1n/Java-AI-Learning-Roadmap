import ReactMarkdown from "react-markdown";
import type { ReactNode } from "react";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import hljs from "highlight.js/lib/core";
import java from "highlight.js/lib/languages/java";
import { catalog, resolveSourcePath, sourceHref } from "../catalog";
import { slugifyHeading } from "../slug-heading";

hljs.registerLanguage("java", java);

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
export function Code({
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
}

// 把课程 Markdown 渲染为站内链接或“主动解锁”，去掉重复的首个 H1；
// 数学公式由 KaTeX 接管，任务列表复选框保持只读，查看参考不等于完成练习。
export function Markdown({
  text,
  sourcePath = "",
  onReference,
}: {
  text: string;
  sourcePath?: string;
  onReference?: (path: string) => void;
}) {
  const headingIds = new Map<string, number>();
  return (
    <div className="prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
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
}
