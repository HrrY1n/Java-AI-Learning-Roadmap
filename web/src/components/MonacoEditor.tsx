import { useEffect, useRef } from "react";
import * as monaco from "monaco-editor/editor/editor.api.js";
import "monaco-editor/languages/definitions/java/register.js";
import EditorWorker from "monaco-editor/editor/editor.worker.js?worker";

(
  self as typeof self & { MonacoEnvironment: monaco.Environment }
).MonacoEnvironment = { getWorker: () => new EditorWorker() };

export default function MonacoEditor({
  value,
  onChange,
  dark,
}: {
  value: string;
  onChange: (code: string) => void;
  dark: boolean;
}) {
  const container = useRef<HTMLDivElement>(null);
  const editor = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const callback = useRef(onChange);
  callback.current = onChange;
  useEffect(() => {
    monaco.editor.defineTheme("lab-light", {
      base: "vs",
      inherit: true,
      rules: [{ token: "comment", foreground: "50665C" }],
      colors: {
        "editor.background": "#fffefa",
        "editorLineNumber.foreground": "#526462",
        "editor.lineHighlightBackground": "#f1f4ed",
      },
    });
    monaco.editor.defineTheme("lab-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [{ token: "comment", foreground: "9FBBB0" }],
      colors: {
        "editor.background": "#142329",
        "editorLineNumber.foreground": "#9FBBB0",
        "editor.lineHighlightBackground": "#1b3037",
      },
    });
    const instance = monaco.editor.create(container.current!, {
      value,
      language: "java",
      theme: dark ? "lab-dark" : "lab-light",
      automaticLayout: true,
      minimap: { enabled: false },
      fontSize: 15,
      lineHeight: 25,
      fontFamily: '"Cascadia Code", Consolas, monospace',
      padding: { top: 20 },
      scrollBeyondLastLine: false,
      tabSize: 4,
      wordWrap: "on",
      renderLineHighlight: "line",
      ariaLabel: "Java 代码编辑器，按 Escape 后 Tab 离开编辑区",
      accessibilitySupport: "on",
      fixedOverflowWidgets: true,
      suggestOnTriggerCharacters: false,
      quickSuggestions: false,
    });
    editor.current = instance;
    const listener = instance.onDidChangeModelContent(() =>
      callback.current(instance.getValue()),
    );
    return () => {
      listener.dispose();
      const model = instance.getModel();
      instance.dispose();
      model?.dispose();
      editor.current = null;
    };
    // The exercise owns the model lifetime; changes are synchronized below without moving the cursor.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (editor.current && editor.current.getValue() !== value)
      editor.current.setValue(value);
  }, [value]);
  useEffect(() => {
    monaco.editor.setTheme(dark ? "lab-dark" : "lab-light");
  }, [dark]);
  return (
    <div ref={container} className="monaco-host" data-testid="monaco-editor" />
  );
}
