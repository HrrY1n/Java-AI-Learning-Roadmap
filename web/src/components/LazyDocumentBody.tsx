import { useEffect, useState } from "react";
import { loadContentBodies } from "../content-bodies";
import { Markdown } from "./Markdown";

// 仓库文档正文懒加载（V2.1）：标题与元信息即时渲染，正文从 content-bodies chunk 到达后填充。
export function LazyDocumentBody({
  documentId,
  sourcePath,
  onReference,
}: {
  documentId: string;
  sourcePath: string;
  onReference: (path: string) => void;
}) {
  const [markdown, setMarkdown] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    setMarkdown(null);
    loadContentBodies().then((bodies) => {
      if (alive) setMarkdown(bodies.documents[documentId] ?? "");
    });
    return () => {
      alive = false;
    };
  }, [documentId]);

  if (markdown === null) {
    return <p className="reader-body-loading">正在载入正文…</p>;
  }
  return (
    <Markdown text={markdown} sourcePath={sourcePath} onReference={onReference} />
  );
}
