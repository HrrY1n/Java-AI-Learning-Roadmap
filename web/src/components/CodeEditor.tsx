import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Code } from "./Markdown";

const MonacoEditor = lazy(() => import("./MonacoEditor"));

class EditorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export function CodeEditor({
  value,
  onChange,
  dark,
}: {
  value: string;
  onChange: (code: string) => void;
  dark: boolean;
}) {
  const [lightweight, setLightweight] = useState(
    () => matchMedia("(max-width: 767px)").matches,
  );
  const [preview, setPreview] = useState(false);
  useEffect(() => {
    const media = matchMedia("(max-width: 767px)");
    const handle = () => {
      if (media.matches) setLightweight(true);
    };
    media.addEventListener("change", handle);
    return () => media.removeEventListener("change", handle);
  }, []);
  const basic = (
    <textarea
      className="mobile-editor"
      aria-label="Java 代码草稿"
      spellCheck={false}
      autoCapitalize="off"
      autoCorrect="off"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
  return (
    <>
      <div className="editor-mode">
        <span>{lightweight ? "轻量编辑 · 支持移动输入" : "Monaco · Java"}</span>
        <div>
          <button
            className="text-link"
            onClick={() => {
              setLightweight(!lightweight);
              setPreview(false);
            }}
          >
            {lightweight ? "使用专业编辑器" : "轻量编辑"}
          </button>
          {lightweight && (
            <button className="text-link" onClick={() => setPreview(!preview)}>
              {preview ? "返回编辑" : "语法预览"}
            </button>
          )}
        </div>
      </div>
      {preview ? (
        <div className="editor-preview">
          <Code code={value} />
        </div>
      ) : lightweight ? (
        basic
      ) : (
        <EditorBoundary
          fallback={
            <>
              <p className="notice">专业编辑器加载失败，已提供轻量编辑。</p>
              {basic}
            </>
          }
        >
          <Suspense
            fallback={
              <div className="editor-loading" role="status">
                正在加载编辑器…
              </div>
            }
          >
            <MonacoEditor value={value} onChange={onChange} dark={dark} />
          </Suspense>
        </EditorBoundary>
      )}
    </>
  );
}
