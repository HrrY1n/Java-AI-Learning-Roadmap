import { useState, useEffect } from "react";
import {
  Binary,
  GitBranch,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Circle,
  FileCode2,
  Terminal,
  Bookmark,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { catalog } from "../catalog";
import type { Topic, TopicLesson, TopicModule } from "../content-types";
import { Markdown } from "./Markdown";
import { TopicVisualizer } from "./TopicVisualizer";
import type { LearningState } from "../lib/learning-store";

interface TopicViewProps {
  topicId?: string;
  lessonId?: string;
  state: LearningState;
  onToggleRead: (lessonId: string) => void;
}

export function TopicView({
  topicId,
  lessonId,
  state,
  onToggleRead,
}: TopicViewProps) {
  // 1. 如果是教材索引精准跳转：如 #/topics/book/book-pro-git
  if (topicId === "book" && lessonId) {
    return <TopicHub targetBookId={lessonId} />;
  }

  // 2. 如果指定了具体 lessonId，渲染课程正文阅读页
  if (topicId && lessonId) {
    const topic = catalog.topics.find((t) => t.id === topicId);
    let currentLesson: TopicLesson | undefined;
    let currentModule: TopicModule | undefined;

    for (const mod of topic?.modules ?? []) {
      const found = mod.lessons.find((l) => l.id === lessonId);
      if (found) {
        currentLesson = found;
        currentModule = mod;
        break;
      }
    }

    if (currentLesson && topic && currentModule) {
      return (
        <TopicLessonReader
          topic={topic}
          module={currentModule}
          lesson={currentLesson}
          state={state}
          onToggleRead={onToggleRead}
        />
      );
    }
  }

  // 3. 如果仅指定了 topicId，或者未指定，展示专题 Hub 概览
  return <TopicHub />;
}

// 专题 Hub 概览界面
function TopicHub({ targetBookId }: { targetBookId?: string }) {
  const [filter, setFilter] = useState<"all" | "published" | "indexed">("all");

  useEffect(() => {
    if (targetBookId) {
      const timer = setTimeout(() => {
        const el = document.getElementById(targetBookId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.classList.add("highlight-target-book");
          setTimeout(() => el.classList.remove("highlight-target-book"), 3500);
        }
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [targetBookId]);

  const topics = catalog.topics ?? [];
  const books = catalog.booksIndex ?? [];

  const filteredTopics = topics.filter((t) => {
    if (filter === "published") return t.status === "published";
    if (filter === "indexed") return t.status === "materials" || t.status === "planned";
    return true;
  });

  return (
    <div className="topic-hub">
      <div className="hub-header">
        <div className="hub-badge">
          <Sparkles size={14} />
          <span>V1.4 专题学习体系</span>
        </div>
        <h1 className="hub-title">与 Java 主线并行的计算机学科专题</h1>
        <p className="hub-subtitle">
          不仅掌握 Java 编程语言，更建立扎实的数据结构、算法思维、工程版本协作与底层计算机系统心智模型。
        </p>

        <div className="hub-filters">
          <button
            type="button"
            className={`hub-filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            全部专题 ({topics.length})
          </button>
          <button
            type="button"
            className={`hub-filter-btn ${filter === "published" ? "active" : ""}`}
            onClick={() => setFilter("published")}
          >
            已上线课程 ({topics.filter((t) => t.status === "published").length})
          </button>
          <button
            type="button"
            className={`hub-filter-btn ${filter === "indexed" ? "active" : ""}`}
            onClick={() => setFilter("indexed")}
          >
            仅有资料索引 ({topics.filter((t) => t.status !== "published").length})
          </button>
        </div>
      </div>

      <div className="topics-grid">
        {filteredTopics.map((topic) => {
          let Icon = Binary;
          if (topic.id === "topic-git") Icon = GitBranch;
          else if (topic.id.includes("csapp") || topic.id.includes("ostep"))
            Icon = BookOpen;

          const isPublished = topic.status === "published";
          const publishedLessons = topic.modules.flatMap((m) =>
            m.lessons.filter((l) => l.status === "published"),
          );
          const publishedModules = topic.modules.filter((m) => m.status === "published");
          const buildingModules = topic.modules.filter((m) => m.status === "building");
          const plannedModules = topic.modules.filter((m) => m.status === "planned" || m.status === "materials");

          return (
            <div key={topic.id} className={`topic-card ${topic.status}`}>
              <div className="topic-card-header">
                <div className="topic-icon-box">
                  <Icon size={22} />
                </div>
                <div className="topic-card-badges">
                  {isPublished ? (
                    <span className="badge badge-published">已发布首批课程</span>
                  ) : (
                    <span className="badge badge-materials">仅有教材资料索引</span>
                  )}
                </div>
              </div>

              <h2 className="topic-title">{topic.title}</h2>
              <div className="topic-subtitle">{topic.subtitle}</div>
              <p className="topic-desc">{topic.description}</p>

              <div className="topic-book-meta">
                <Bookmark size={14} />
                <span>来源权威教材：{topic.sourceBook.title} ({topic.sourceBook.totalPages} 页)</span>
              </div>

              <div className="topic-modules-preview">
                <div className="preview-label">模块建设进度：</div>
                <div className="module-pills">
                  {topic.modules.map((m) => {
                    let pillClass = "module-pill";
                    let statusLabel = "规划中";
                    if (m.status === "published") {
                      pillClass += " published-pill";
                      statusLabel = "已上线";
                    } else if (m.status === "building") {
                      pillClass += " building-pill";
                      statusLabel = "建设中";
                    } else {
                      pillClass += " planned-pill";
                    }
                    return (
                      <span key={m.id} className={pillClass}>
                        {m.title} <small className="module-pill-status">({statusLabel})</small>
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="topic-card-footer">
                <div className="topic-progress-text">
                  {isPublished ? (
                    <div className="topic-stat-block">
                      <div className="stat-main">
                        已发布课程：<strong>{publishedLessons.length}</strong> 节
                      </div>
                      <div className="stat-sub">
                        已上线 {publishedModules.length} 个模块 · {buildingModules.length > 0 ? `${buildingModules.length} 个建设中 · ` : ""}{plannedModules.length} 个规划中
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted">全阶段教材资料已索引 · 待接入课程建设</span>
                  )}
                </div>

                {isPublished ? (
                  <a
                    href={`#/topic/${topic.id}/${publishedLessons[0]?.id}`}
                    className="topic-enter-btn"
                  >
                    <span>开始学习</span>
                    <ArrowRight size={14} />
                  </a>
                ) : (
                  <span className="topic-disabled-btn">待接入课程</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 外部教材库总览 */}
      <div className="external-books-section">
        <div className="section-title">
          <h2>
            <Bookmark size={18} />
            <span>外部权威教材库与来源追溯索引（共 {books.length} 本）</span>
          </h2>
        </div>
        <p className="books-intro">
          本项目严格遵守版权与学术规范，本地教材作为只读知识参考，不移动、不修改、不公开全文，课程内容全部原创重构。
        </p>

        <div className="books-table-wrapper">
          <table className="books-table">
            <thead>
              <tr>
                <th>教材名称</th>
                <th>版本与作者</th>
                <th>物理页数</th>
                <th>对应专题 / 主线</th>
                <th>集成状态</th>
                <th>核心知识覆盖</th>
              </tr>
            </thead>
            <tbody>
              {books.map((b) => (
                <tr key={b.id} id={b.id}>
                  <td>
                    <strong>{b.title}</strong>
                    <div className="book-sub-title">{b.subtitle}</div>
                  </td>
                  <td>
                    {b.author}
                    <div className="book-sub-title">{b.version}</div>
                  </td>
                  <td>{b.totalPages} 页</td>
                  <td>
                    <code>{b.topicId}</code>
                  </td>
                  <td>
                    <span
                      className={`book-status-badge status-${b.status}`}
                    >
                      {b.status === "integrated-core"
                        ? "主线延伸"
                        : b.status === "integrated-topic"
                          ? "已建专题"
                          : "规划索引"}
                    </span>
                  </td>
                  <td>
                    <div className="book-key-chapters">
                      {b.keyChapters.slice(0, 3).map((kc) => (
                        <div key={kc.chapter} className="kc-item">
                          <span>{kc.chapter} {kc.title}</span>
                          <span className="kc-pages">P.{kc.pdfPages}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 专题小节正文阅读器
function TopicLessonReader({
  topic,
  module,
  lesson,
  state,
  onToggleRead,
}: {
  topic: Topic;
  module: TopicModule;
  lesson: TopicLesson;
  state: LearningState;
  onToggleRead: (lessonId: string) => void;
}) {
  const isRead = !!state.lessons[lesson.id]?.read;

  // 寻找上一节与下一节
  const allLessons = topic.modules.flatMap((m) =>
    m.lessons.filter((l) => l.status === "published"),
  );
  const currentIndex = allLessons.findIndex((l) => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < allLessons.length - 1
      ? allLessons[currentIndex + 1]
      : null;

  // 决定匹配的可视化组件
  let visualizerType = "";
  if (lesson.id === "algo-complexity-eval" || lesson.id === "algo-time-complexity") {
    visualizerType = "complexity-ladder";
  } else if (lesson.id === "algo-array") {
    visualizerType = "array-addressing";
  } else if (lesson.id === "algo-linkedlist") {
    visualizerType = "linkedlist-pointer";
  } else if (lesson.id === "algo-queue") {
    visualizerType = "circular-queue";
  } else if (lesson.id === "git-intro-basics" || lesson.id === "git-record-changes") {
    visualizerType = "git-three-trees";
  } else if (lesson.id === "git-branch-create-merge") {
    visualizerType = "git-merge-tree";
  }

  return (
    <div className="topic-reader-container">
      {/* 顶部面包屑与阅读打卡操作栏 */}
      <div className="reader-toolbar">
        <div className="reader-breadcrumbs">
          <a href="#/topics" className="bc-link">
            专题体系
          </a>
          <ChevronRight size={14} />
          <a href={`#/topic/${topic.id}/${allLessons[0]?.id}`} className="bc-link">
            {topic.title}
          </a>
          <ChevronRight size={14} />
          <span className="bc-module">{module.title}</span>
          <ChevronRight size={14} />
          <span className="bc-current">{lesson.title}</span>
        </div>

        <div className="reader-status-actions">
          <span className={`reader-status-pill ${isRead ? "status-read" : "status-unread"}`}>
            {isRead ? "已读过本节" : "未读"}
          </span>
          <button
            type="button"
            className={`mark-read-btn ${isRead ? "is-read" : ""}`}
            onClick={() => onToggleRead(lesson.id)}
            title={isRead ? "取消已阅读标记" : "记录已阅读进度"}
          >
            {isRead ? (
              <>
                <CheckCircle2 size={16} />
                <span>已阅读此小节</span>
              </>
            ) : (
              <>
                <Circle size={16} />
                <span>标记为已阅读</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 课程标题与简要 */}
      <div className="topic-lesson-heading">
        <h1 className="topic-lesson-title">{lesson.title}</h1>
        <p className="topic-lesson-summary">{lesson.summary}</p>
      </div>

      {/* 课程模式与实操属性标识栏 */}
      <div className="lesson-learning-meta-strip">
        {lesson.kind === "concept" && (
          <div className="meta-badge-item badge-concept">
            <BookOpen size={14} />
            <span>概念精读课 · 侧重原理、心智模型与理论分析（无独立编程题）</span>
          </div>
        )}
        {lesson.kind === "code" && (
          <div className="meta-badge-item badge-code">
            <FileCode2 size={14} />
            <span>配套 Java 规范源码 · 建议在本机 JDK 编译运行验证（阅读 ≠ 掌握）</span>
          </div>
        )}
        {lesson.kind === "command-lab" && (
          <div className="meta-badge-item badge-lab">
            <Terminal size={14} />
            <span>Git 命令实操课 · 配套命令步进与状态机（命令已在一次性沙箱实测）</span>
          </div>
        )}
      </div>

      {/* 原书来源信息条 */}
      {lesson.bookReference && (
        <div className="lesson-book-reference">
          <Bookmark size={15} />
          <span>
            来源教材：<strong>{lesson.bookReference.bookTitle}</strong> ·{" "}
            {lesson.bookReference.chapter} · PDF 页码：第{" "}
            {lesson.bookReference.pdfPageStart} ~ {lesson.bookReference.pdfPageEnd}{" "}
            页 {lesson.bookReference.printPage && `(原书印刷 P.${lesson.bookReference.printPage})`}
          </span>
        </div>
      )}

      {/* 核心原理可视化交互组件 */}
      {visualizerType && (
        <div className="reader-visualizer-slot">
          <TopicVisualizer type={visualizerType} />
        </div>
      )}

      {/* 正文 Markdown */}
      <div className="lesson-markdown-body">
        <Markdown text={lesson.markdown} />
      </div>

      {/* Git 专用：交互式命令步进器 */}
      {lesson.gitSteps && lesson.gitSteps.length > 0 && (
        <GitStepsViewer steps={lesson.gitSteps} />
      )}

      {/* Java 课程专用：代码高亮展示 */}
      {lesson.code && (
        <div className="lesson-code-block-card">
          <div className="code-card-header">
            <div className="code-title">
              <FileCode2 size={16} />
              <span>
                Java 规范源码：{lesson.packageName}.{lesson.className || "App"}
              </span>
            </div>
            <span className="code-env-badge">JDK 25 编译验证通过</span>
          </div>
          <div className="code-card-content">
            <pre className="code-pre">
              <code>{lesson.code}</code>
            </pre>
          </div>
        </div>
      )}

      {/* 诚实学习底线提醒 */}
      <div className="reader-honesty-banner">
        <span>
          💡 诚实性约定：点击“已阅读”仅代表浏览过教程内容，并不等同于掌握；独立编程与工程协作能力必须通过真实运行与实测证据来证明。
        </span>
      </div>

      {/* 底部上一节/下一节导航 */}
      <div className="reader-pagination">
        {prevLesson ? (
          <a
            href={`#/topic/${topic.id}/${prevLesson.id}`}
            className="pagination-btn prev-btn"
          >
            <ArrowLeft size={16} />
            <div className="pag-text">
              <span className="pag-label">上一节</span>
              <span className="pag-title">{prevLesson.title}</span>
            </div>
          </a>
        ) : (
          <div />
        )}

        {nextLesson ? (
          <a
            href={`#/topic/${topic.id}/${nextLesson.id}`}
            className="pagination-btn next-btn"
          >
            <div className="pag-text">
              <span className="pag-label">下一节</span>
              <span className="pag-title">{nextLesson.title}</span>
            </div>
            <ArrowRight size={16} />
          </a>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}

// Git 命令流转步进器
function GitStepsViewer({
  steps,
}: {
  steps: Array<{
    command: string;
    explanation: string;
    repoStateBefore: string;
    repoStateAfter: string;
  }>;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = steps[currentStep];

  return (
    <div className="git-steps-viewer">
      <div className="git-steps-header">
        <div className="git-steps-title">
          <Terminal size={16} />
          <span>Git 命令与状态交互演进演示（第 {currentStep + 1} / {steps.length} 步）</span>
        </div>
        <div className="git-step-tabs">
          {steps.map((s, idx) => (
            <button
              key={idx}
              type="button"
              className={`git-tab-btn ${idx === currentStep ? "active" : ""}`}
              onClick={() => setCurrentStep(idx)}
            >
              {idx + 1}. {s.command.split(" ")[1] || "cmd"}
            </button>
          ))}
        </div>
      </div>

      <div className="git-notice-box">
        <div className="git-notice-title">
          <span>🛠️ 实操功能边界与诚实性说明</span>
        </div>
        <ul className="git-notice-list">
          <li>
            <strong>网站演示角色</strong>：本步进器用于交互式解析命令前后的仓库状态流转（工作区 ➔ 暂存区 ➔ 版本库），属于<strong>教学状态机演示</strong>，并非在线运行终端。
          </li>
          <li>
            <strong>学员真实实操</strong>：请在您本机终端开辟<strong>独立的一次性临时目录</strong>（如 <code>mkdir ~/git-sandbox && cd ~/git-sandbox</code>）亲手执行命令验证。
          </li>
          <li>
            <strong>验证边界</strong>：工程自动化测试已在临时沙箱中验证了本命令序列的客观正确性，但<strong>自动化测试通过绝不代表学员个人已经完成实操</strong>。
          </li>
        </ul>
      </div>

      <div className="git-step-body">
        <div className="git-command-box">
          <code>$ {step.command}</code>
        </div>
        <p className="git-explanation">{step.explanation}</p>

        <div className="git-state-contrast">
          <div className="git-state-pane before">
            <span className="state-tag">执行前仓库状态</span>
            <pre>{step.repoStateBefore}</pre>
          </div>
          <div className="git-state-arrow">
            <ArrowRight size={18} />
          </div>
          <div className="git-state-pane after">
            <span className="state-tag">执行后仓库状态</span>
            <pre>{step.repoStateAfter}</pre>
          </div>
        </div>
      </div>
      <div className="git-step-footer">
        <span>
          🛡️ 安全红线提醒：严禁在当前工作仓库（如 JavaRoadmap Lab 项目根目录）执行任何测试或破坏性 Git 命令！所有自动化验证均运行在 <code>os.tmpdir()</code> 一次性隔离沙箱中。
        </span>
      </div>
    </div>
  );
}
