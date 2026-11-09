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
import { loadContentBodies, type ContentBodies } from "../content-bodies";

interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
}

interface SearchItem {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  href: string;
  status?: string;
  /** 参与全文匹配的正文；title/subtitle/category 命中优先于正文命中。 */
  body?: string;
}

// 从正文命中位置截取一段可读上下文，压缩空白后展示在结果副标题里。
function bodySnippet(body: string, q: string): string {
  const index = body.toLowerCase().indexOf(q);
  if (index < 0) return "";
  const start = Math.max(0, index - 24);
  const end = Math.min(body.length, index + q.length + 36);
  const text = body
    .slice(start, end)
    .replace(/\s+/g, " ")
    .trim();
  return `${start > 0 ? "…" : ""}${text}${end < body.length ? "…" : ""}`;
}

const isApplePlatform =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad|iPod/.test(navigator.userAgent || navigator.platform || "");

// 原生 dialog 内做本地课程搜索；键盘高亮与 DOM 焦点分离，鼠标悬停不抢占键盘选择。
export function SearchDialog({ open, onClose }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  // 中文输入法组合输入期间不触发 Enter 直达，避免选字回车误跳转
  const composingRef = useRef(false);
  // V2.1：正文在懒加载 chunk 中——面板打开后异步载入一次并缓存；
  // 载入前标题/摘要照常可搜，正文命中随后补全。
  const [bodies, setBodies] = useState<ContentBodies | null>(null);
  useEffect(() => {
    if (!open || bodies) return;
    let alive = true;
    loadContentBodies().then((loaded) => {
      if (alive) setBodies(loaded);
    });
    return () => {
      alive = false;
    };
  }, [open, bodies]);

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
    // 只在这里同步聚焦一次。此前的 30ms 定时器兜底会迟到抢回焦点：用户/键盘若在
    // 定时器触发前按 Tab 移到关闭按钮，定时器随后把焦点拽回输入框，此时按 Enter
    // 就命中输入框的「直达当前高亮结果」，误跳 #/lesson/day01（V1.9-R 实测复现）。
    inputRef.current?.focus();
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
  }, [open]);

  // 全量可搜项目集合
  const allItems = useMemo<SearchItem[]>(() => {
    const items: SearchItem[] = [];

    // 1. 主线课程：标题/摘要之外，正文步骤、深化正文与课程源码都可全文命中
    for (const lesson of catalog.lessons) {
      const stepBodies = (lesson.steps ?? [])
        .map((step) => `${step.label} ${step.body}`)
        .join("\n");
      items.push({
        id: `lesson-${lesson.id}`,
        category: "主线课程",
        title: lesson.title,
        subtitle: `${lesson.stageId ? `Stage ${lesson.stageId} · ` : ""}${lesson.summary || "核心主线课程"}`,
        href: `#/lesson/${lesson.id}`,
        body: `${lesson.title}\n${lesson.summary}\n${stepBodies}\n${lesson.markdown ?? ""}\n${lesson.code}`,
      });
    }

    // 2. 专题课程 (算法 & Git) - 严格门禁：未发布课程不得入搜索；已发布课正文入索引
    for (const topic of catalog.topics ?? []) {
      for (const module of topic.modules ?? []) {
        for (const lesson of module.lessons ?? []) {
          if (lesson.status !== "published") continue;
          const category = topic.title;
          items.push({
            id: `topic-lesson-${lesson.id}`,
            category,
            title: lesson.title,
            subtitle: `${topic.title} · ${module.title} · ${lesson.summary}`,
            href: `#/topic/${topic.id}/${lesson.id}`,
            status: lesson.status,
            body: `${lesson.title}\n${lesson.summary}\n${bodies?.topics[lesson.id]?.markdown ?? ""}`,
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

    // 5. 仓库只读文档：标题、来源路径与正文全部入索引（"搜索课程/资料"的"资料"）
    for (const doc of catalog.documents ?? []) {
      items.push({
        id: `document-${doc.id}`,
        category: "仓库文档",
        title: doc.title,
        subtitle: doc.sourcePath,
        href: `#/document/${doc.id}`,
        body: `${doc.title}\n${doc.sourcePath}\n${bodies?.documents[doc.id] ?? ""}`,
      });
    }

    return items;
  }, [bodies]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems.slice(0, 8);
    const titleHits: SearchItem[] = [];
    const bodyHits: SearchItem[] = [];
    for (const item of allItems) {
      const inHeader =
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      if (inHeader) {
        titleHits.push(item);
        continue;
      }
      // 正文全文命中：副标题换成命中位置的上下文片段，直达才有意义
      if (item.body?.toLowerCase().includes(q)) {
        bodyHits.push({
          ...item,
          subtitle: `正文命中 · ${bodySnippet(item.body, q)}`,
        });
      }
    }
    return [...titleHits, ...bodyHits].slice(0, 12);
  }, [allItems, query]);

  // 键盘快捷穿梭：
  // 1. 在输入框内：↑↓ 切换高亮项且光标保留在输入框内（保持连续输入体验）；
  // 2. 在结果列表内：↑↓ 同步将 DOM 焦点与高亮移动到新项，保持焦点与选中完全一致；
  // 3. Tab 聚焦到关闭按钮按 Enter 正常关闭，Tab 聚焦结果项时高亮随焦点同步；
  // 4. 焦点在输入框且非中文输入法组合态时，Enter 直达当前高亮结果；
  //    焦点已在链接或按钮上时保留其原生 Enter 行为，由浏览器触发对应控件。
  const handleKeyDown = (e: KeyboardEvent<HTMLDialogElement>) => {
    const target = e.target as HTMLElement | null;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (filteredItems.length === 0) return;
      const next = (selectedIndex + 1) % filteredItems.length;
      setSelectedIndex(next);
      const targetItem = itemRefs.current[next];
      if (targetItem) {
        if (target?.closest(".search-item") || target?.closest(".search-close-btn")) {
          targetItem.focus();
        }
        targetItem.scrollIntoView({ block: "nearest" });
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (filteredItems.length === 0) return;
      const next =
        selectedIndex - 1 < 0 ? filteredItems.length - 1 : selectedIndex - 1;
      setSelectedIndex(next);
      const targetItem = itemRefs.current[next];
      if (targetItem) {
        if (target?.closest(".search-item") || target?.closest(".search-close-btn")) {
          targetItem.focus();
        }
        targetItem.scrollIntoView({ block: "nearest" });
      }
    } else if (e.key === "Enter") {
      // 若当前焦点在结果链接或关闭按钮等交互元素上，保留其原生的键盘 Enter 行为：
      // - 结果链接自身按 Enter 触发原生点击与跳转，绝不被全局拦截覆盖；
      // - 关闭按钮按 Enter 触发其原生点击关闭弹窗。
      if (target?.closest("a") || target?.closest("button")) {
        return;
      }
      // 焦点在输入框（且不在中文输入法拼音选字组合状态）时，Enter 直达当前选中的结果项
      if (!composingRef.current) {
        const chosen = filteredItems[selectedIndex];
        if (chosen) {
          e.preventDefault();
          window.location.hash = chosen.href;
          onClose();
        }
      }
    }
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
              if (item.category === "数据结构与算法") Icon = Binary;
              else if (item.category === "Git 工程实践") Icon = GitBranch;
              else if (item.category === "编程实验") Icon = Code2;
              else if (item.category === "权威教材索引") Icon = Bookmark;

              return (
                <a
                  key={item.id}
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  href={item.href}
                  className={`search-item ${isSelected ? "selected" : ""}`}
                  onClick={onClose}
                  onMouseEnter={() => {
                    // 若用户已通过键盘 Tab 聚焦到了结果链接列表，键盘焦点优先，鼠标经过不得抢占高亮与选中项
                    const active = document.activeElement;
                    if (!active?.closest(".search-item")) {
                      setSelectedIndex(index);
                    }
                  }}
                  onFocus={() => setSelectedIndex(index)}
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
