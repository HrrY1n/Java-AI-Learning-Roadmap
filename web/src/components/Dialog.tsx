import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
  type KeyboardEvent,
} from "react";
import { X } from "lucide-react";

export function handleTabKeys(event: KeyboardEvent<HTMLElement>) {
  const target = event.target as HTMLElement;
  const tablist = target.closest('[role="tablist"]');
  if (
    !tablist ||
    target.getAttribute("role") !== "tab" ||
    !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
  )
    return;
  const tabs = Array.from(
    tablist.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
  );
  const index = tabs.indexOf(target as HTMLButtonElement);
  const next =
    event.key === "Home"
      ? 0
      : event.key === "End"
        ? tabs.length - 1
        : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) %
          tabs.length;
  event.preventDefault();
  tabs[next].focus();
  tabs[next].click();
}

export function Dialog({
  title,
  onClose,
  children,
  drawer = false,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  drawer?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const dialog = ref.current!;
    const opener = document.activeElement;
    const route = location.hash;
    dialog.showModal();
    return () => {
      dialog.close();
      queueMicrotask(() => {
        if (
          location.hash === route &&
          opener instanceof HTMLElement &&
          opener.isConnected
        )
          opener.focus({ preventScroll: true });
      });
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`dialog ${drawer ? "drawer" : ""}`}
      aria-labelledby={id}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      onKeyDown={handleTabKeys}
    >
      <header className="dialog-head">
        <h2 id={id}>{title}</h2>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="关闭对话框"
        >
          <X size={20} />
        </button>
      </header>
      <div className="dialog-body">{children}</div>
    </dialog>
  );
}
