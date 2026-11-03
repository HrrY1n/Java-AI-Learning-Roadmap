import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import {
  Search,
  BookOpen,
  Code2,
  Bookmark,
  ArrowRight,
  X,
  Binary,
  GitBranch,
} from "lucide-react";
import { catalog } from "../catalog";

interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
}

interface SearchItem {
  id: string;
  category: "主线课程" | "算法专题" | "Git专题" | "编程实验" | "权威教材索引";
  title: string;
  subtitle: string;
  href: string;
  status?: string;
}

const isApplePlatform =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad|iPod/.test(navigator.userAgent || navigator.platform || "");

export function SearchDialog({ open, onClose }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  // 中文输入法组合输入期间不触发 Enter 直达，避免选字回车误跳转
  const composingRef = useRef(false);

  // 原生 <dialog> showModal：焦点圈定在弹窗内、Esc 触发 onCancel、
  // 关闭时把焦点还给打开者——与项目 Dialog 组件同一机制。
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;
    setQuery("");
    setSelectedIndex(0);
    const opener = document.activeElement;
    const route = location.hash;
    dialog.showModal();
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 30);
    return () => {
      clearTimeout(focusTimer);
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
  }, [open]);

  // 全量可搜项目集合
  const allItems = useMemo<SearchItem[]>(() => {
    const items: SearchItem[] = [];

    // 1. 主线课程
    for (const lesson of catalog.lessons) {
      items.push({
        id: `lesson-${lesson.id}`,
        category: "主线课程",
        title: lesson.title,
        subtitle: `${lesson.stageId ? `Stage ${lesson.stageId} · ` : ""}${lesson.summary || "核心主线课程"}`,
        href: `#/lesson/${lesson.id}`,
      });
    }

    // 2. 专题课程 (算法 & Git) - 严格门禁：未发布课程不得入搜索
    for (const topic of catalog.topics ?? []) {
      for (const module of topic.modules ?? []) {
        for (const lesson of module.lessons ?? []) {
          if (lesson.status !== "published") continue;
          const category = topic.id === "topic-algo" ? "算法专题" : "Git专题";
          items.push({
            id: `topic-lesson-${lesson.id}`,
            category,
            title: lesson.title,
            subtitle: `${topic.title} · ${module.title} · ${lesson.summary}`,
            href: `#/topic/${topic.id}/${lesson.id}`,
            status: lesson.status,
          });
        }
      }
    }

    // 3. 编程练习
    for (const exercise of catalog.exercises ?? []) {
      items.push({
        id: `exercise-${exercise.id}`,
        category: "编程实验",
        title: exercise.title,
        subtitle: `实战代码练习 · ${exercise.title}`,
        href: `#/lab/${exercise.id}`,
      });
    }

    // 4. 教材索引 - 单一合法 Hash 路径，消灭 #/topics#book-id 双重 Hash
    for (const book of catalog.booksIndex ?? []) {
      items.push({
        id: `book-${book.id}`,
        category: "权威教材索引",
        title: book.title,
        subtitle: `${book.author} · ${book.totalPages}页 · ${book.summary}`,
        href: `#/topics/book/${book.id}`,
        status: book.status,
      });
    }

    return items;
  }, []);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems.slice(0, 8);
    return allItems
      .filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q),
      )
      .slice(0, 12);
  }, [allItems, query]);

  // 键盘快捷穿梭：↑↓ 循环、Enter 直达（输入法组合中除外）。
  // 事件挂在 dialog 元素上：原生 showModal 已把焦点圈在弹窗内，
  // Tab / Shift+Tab 自然在弹窗内循环，不会逃逸到页面。
  const handleKeyDown = (e: KeyboardEvent<HTMLDialogElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev - 1 < 0 ? Math.max(0, filteredItems.length - 1) : prev - 1,
      );
    } else if (e.key === "Enter" && !composingRef.current) {
      const chosen = filteredItems[selectedIndex];
      if (chosen) {
        e.preventDefault();
        window.location.hash = chosen.href;
        onClose();
      }
    }
    // Escape 由 <dialog> 原生 onCancel 处理，无需在此重复
  };

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      className="search-dialog"
      aria-label="全局搜索课程与资料"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        // 点击弹窗空白（调色板之外）关闭；原生 dialog 的点击目标即 dialog 本身
        if (e.target === dialogRef.current) onClose();
      }}
      onKeyDown={handleKeyDown}
    >
      <div className="search-palette">
        <div className="search-input-wrapper">
          <Search size={18} className="search-input-icon" />
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="搜索主线课程、Hello 算法、Pro Git、编程题与教材..."
            value={query}
            onCompositionStart={() => {
              composingRef.current = true;
            }}
            onCompositionEnd={() => {
              composingRef.current = false;
            }}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            aria-label="搜索课程与资料"
          />
          <button
            type="button"
            className="search-close-btn"
            onClick={onClose}
            aria-label="关闭搜索面板"
          >
            <X size={16} />
          </button>
        </div>

        <div className="search-results-list">
          {filteredItems.length === 0 ? (
            <div className="search-empty">没有找到与 "{query}" 相关的课程或材料</div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              let Icon = BookOpen;
              if (item.category === "算法专题") Icon = Binary;
              else if (item.category === "Git专题") Icon = GitBranch;
              else if (item.category === "编程实验") Icon = Code2;
              else if (item.category === "权威教材索引") Icon = Bookmark;

              return (
                <a
                  key={item.id}
                  href={item.href}
                  className={`search-item ${isSelected ? "selected" : ""}`}
                  onClick={onClose}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="search-item-icon">
                    <Icon size={16} />
                  </div>
                  <div className="search-item-body">
                    <div className="search-item-title-row">
                      <span className="search-item-title">{item.title}</span>
                      <span className="search-item-category">{item.category}</span>
                      {item.status && item.status !== "published" && (
                        <span className="search-item-status">
                          {item.status === "building" ? "建设中" : "仅资料"}
                        </span>
                      )}
                    </div>
                    <div className="search-item-sub">{item.subtitle}</div>
                  </div>
                  <ArrowRight size={14} className="search-item-arrow" />
                </a>
              );
            })
          )}
        </div>

        <div className="search-footer">
          <span>
            <kbd>↑</kbd> <kbd>↓</kbd> 穿梭切换
          </span>
          <span>
            <kbd>Enter</kbd> 选择直达
          </span>
          <span>
            <kbd>ESC</kbd> 关闭
          </span>
          <span className="search-footer-mod">
            <kbd>{isApplePlatform ? "⌘K" : "Ctrl K"}</kbd> 随时唤起
          </span>
        </div>
      </div>
    </dialog>
  );
}
