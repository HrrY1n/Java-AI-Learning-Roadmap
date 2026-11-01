import { useEffect, useMemo, useState, useRef } from "react";
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

export function SearchDialog({ open, onClose }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
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

    // 2. 专题课程 (算法 & Git)
    for (const topic of catalog.topics ?? []) {
      for (const module of topic.modules ?? []) {
        for (const lesson of module.lessons ?? []) {
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
        subtitle: `实战代码练习 · ${exercise.sourcePath}`,
        href: `#/lab/${exercise.id}`,
      });
    }

    // 4. 教材索引
    for (const book of catalog.booksIndex ?? []) {
      items.push({
        id: `book-${book.id}`,
        category: "权威教材索引",
        title: book.title,
        subtitle: `${book.author} · ${book.totalPages}页 · ${book.summary}`,
        href: `#/topics#${book.id}`,
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

  // 键盘快捷穿梭
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev - 1 < 0 ? Math.max(0, filteredItems.length - 1) : prev - 1,
        );
      } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
        e.preventDefault();
        window.location.hash = filteredItems[selectedIndex].href;
        onClose();
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, filteredItems, selectedIndex, onClose]);

  if (!open) return null;

  return (
    <div className="search-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="search-palette"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="search-input-wrapper">
          <Search size={18} className="search-input-icon" />
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="搜索主线课程、Hello 算法、Pro Git、编程题与教材..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
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
        </div>
      </div>
    </div>
  );
}
