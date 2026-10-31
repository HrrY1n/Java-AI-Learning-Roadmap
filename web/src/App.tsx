import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Braces,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  Circle,
  CircleAlert,
  Clipboard,
  Code2,
  FileCode2,
  FileJson,
  FolderOpen,
  HelpCircle,
  Home,
  Laptop,
  Lightbulb,
  ListTree,
  Menu,
  Moon,
  PanelLeftClose,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Sun,
  Upload,
  X,
} from "lucide-react";
import { catalog } from "./catalog";
import type { Stage } from "./content-types";
import type { Exercise, Lesson, Prediction } from "./content-types";
import {
  createInitialState,
  exportBackup,
  importEvidence,
  loadState,
  mergeBackup,
  saveState,
  validateBackup,
  type LearningState,
} from "./lib/learning-store";
import {
  checkPrediction,
  courseTutor,
  sha256,
  type HintLevel,
} from "./lib/services";
import { Markdown, Code } from "./components/Markdown";
import { Dialog, handleTabKeys } from "./components/Dialog";
import { CodeEditor } from "./components/CodeEditor";

type Change = (recipe: (current: LearningState) => LearningState) => void;
type PageProps = {
  state: LearningState;
  change: Change;
  notify: (message: string) => void;
};
type Route = { page: string; id: string };
const timestamp = () => new Date().toISOString();
const lessonLink = (id = "day01") => `#/lesson/${id}`;
const labLink = (id = "scores") => `#/lab/${id}`;
const dateLabel = (date: string) =>
  new Date(date).toLocaleString("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

function download(name: string, text: string, type = "application/json") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function getRoute(): Route {
  const [page = "home", rawId = ""] = location.hash
    .replace(/^#\/?/, "")
    .split("/");
  try {
    return { page: page || "home", id: decodeURIComponent(rawId) };
  } catch {
    return { page: "missing", id: "" };
  }
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <div className="eyebrow">{children}</div>;
}
function Badge({
  children,
  tone = "",
}: {
  children: ReactNode;
  tone?: string;
}) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
function SectionTitle({
  index,
  title,
  action,
}: {
  index?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="section-title">
      <h2>
        {index && <span className="section-index">{index}</span>}
        {title}
      </h2>
      {action}
    </div>
  );
}

function Navigation({
  route,
  state,
  currentStage,
  close,
}: {
  route: Route;
  state: LearningState;
  currentStage: Stage;
  close?: () => void;
}) {
  const links = [
    {
      page: "home",
      href: "#/home",
      icon: Home,
      label: "学习工作台",
    },
    {
      page: "roadmap",
      href: "#/roadmap",
      icon: ListTree,
      label: "学习路线",
    },
    {
      page: "lesson",
      href: lessonLink(state.lastLessonId ?? "day01"),
      icon: BookOpen,
      label: "课程阅读",
    },
    {
      page: "lab",
      href: labLink(),
      icon: Code2,
      label: "编程实验室",
    },
    {
      page: "review",
      href: "#/review",
      icon: FolderOpen,
      label: "学习复盘",
    },
  ];
  return (
    <>
      <nav className="primary-nav" aria-label="主要导航">
        {links.map(({ page, href, icon: Icon, label }) => (
          <a
            key={page}
            href={href}
            onClick={close}
            className={
              route.page === page ||
              (page === "lab" && route.page === "practice")
                ? "active"
                : ""
            }
            aria-current={route.page === page ? "page" : undefined}
          >
            <Icon size={19} />
            <span>{label}</span>
            {route.page === page && <span className="nav-dot" />}
          </a>
        ))}
      </nav>
      <div className="rail-course">
        <div className="rail-label">
          正在学习 <span>{currentStage.id}</span>
        </div>
        <a href="#/roadmap" className="rail-stage">
          {currentStage.title} <ArrowUpRight size={15} />
        </a>
        <div className="rail-stage-meta">
          <span className="status-dot" /> {currentStage.status} · 以独立练习验收
        </div>
        <details open={route.page === "lesson"}>
          <summary>
            {currentStage.modules.find((m) => m.id === "foundations")?.title ??
              "基础课程"}{" "}
            <ChevronDown size={14} />
          </summary>
          {catalog.lessons
            .filter(
              (lesson) =>
                lesson.stageId === currentStage.id &&
                lesson.kind === "foundation",
            )
            .map((lesson, i) => (
              <a
                key={lesson.id}
                className={`rail-lesson ${route.id === lesson.id ? "selected" : ""}`}
                href={lessonLink(lesson.id)}
                onClick={close}
              >
                <span>{String(i + 1).padStart(2, "0")}</span>
                {lesson.title}
                {state.lessons[lesson.id]?.read && (
                  <Check size={13} aria-label="已阅读" />
                )}
              </a>
            ))}
        </details>
      </div>
      <a
        className="rail-principle"
        href="#/document/teaching-rules"
        onClick={close}
      >
        <Lightbulb size={18} />
        <span>
          先思考，再向提示靠近。<small>AI 教你写，不替你写。</small>
        </span>
      </a>
    </>
  );
}

export default function App() {
  const [route, setRoute] = useState(getRoute);
  const [state, setState] = useState(createInitialState);
  const [ready, setReady] = useState(false);
  const [canSave, setCanSave] = useState(false);
  const [storageError, setStorageError] = useState("");
  const [saveStatus, setSaveStatus] = useState("正在读取");
  const [systemDark, setSystemDark] = useState(
    () => matchMedia("(prefers-color-scheme: dark)").matches,
  );
  const [mobileNav, setMobileNav] = useState(false);
  const [dataDialog, setDataDialog] = useState(false);
  const [tutor, setTutor] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const main = useRef<HTMLElement>(null);
  const sequence = useRef(0);
  const dark =
    state.theme === "dark" || (state.theme === "system" && systemDark);
  const change: Change = (recipe) => {
    setSaveStatus(canSave ? "正在保存" : "尚未保存");
    setState((current) => ({ ...recipe(current), updatedAt: timestamp() }));
  };
  useEffect(() => {
    let active = true;
    loadState()
      .then((loaded) => {
        if (active) {
          setState(loaded);
          setCanSave(true);
          setReady(true);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setStorageError(String(error));
          setReady(true);
          setSaveStatus("尚未保存");
        }
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    const handle = () => setRoute(getRoute());
    window.addEventListener("hashchange", handle);
    return () => window.removeEventListener("hashchange", handle);
  }, []);
  useEffect(() => {
    const query = matchMedia("(prefers-color-scheme: dark)");
    const handle = () => setSystemDark(query.matches);
    query.addEventListener("change", handle);
    return () => query.removeEventListener("change", handle);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    try {
      localStorage.setItem("jrl-theme", state.theme);
    } catch {
      /* Theme cache is optional; the authoritative value is in IndexedDB. */
    }
  }, [dark, state.theme]);
  useEffect(() => {
    if (!ready || !canSave) return;
    const current = ++sequence.current;
    setSaveStatus("正在保存");
    const timer = setTimeout(() => {
      saveState(state)
        .then(() => {
          if (sequence.current === current) setSaveStatus("已保存到此浏览器");
        })
        .catch((error: unknown) => {
          setStorageError(String(error));
          setSaveStatus("保存失败");
          setCanSave(false);
        });
    }, 180);
    return () => clearTimeout(timer);
  }, [state, ready, canSave]);
  useEffect(() => {
    const handle = (event: BeforeUnloadEvent) => {
      if (saveStatus === "正在保存" || (!canSave && ready)) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handle);
    return () => window.removeEventListener("beforeunload", handle);
  }, [saveStatus, ready, canSave]);
  useEffect(() => {
    window.scrollTo(0, 0);
    main.current?.focus({ preventScroll: true });
    setMobileNav(false);
    const name =
      {
        home: "学习工作台",
        roadmap: "学习路线",
        lesson:
          catalog.lessons.find((item) => item.id === route.id)?.title ??
          "课程阅读",
        lab: "编程实验室",
        practice: "预测与修改",
        review: "学习复盘",
        document: "仓库资料",
      }[route.page] ?? "页面未找到";
    document.title = `${name} · JavaRoadmap Lab`;
  }, [route.page, route.id]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 5000);
    return () => clearTimeout(timer);
  }, [toast]);
  const props: PageProps = { state, change, notify: setToast };
  const currentStage: Stage =
    catalog.stages.find((stage) => stage.status === "学习中") ??
    catalog.stages[0];
  const currentExercise =
    catalog.exercises.find((item) => item.id === route.id) ??
    catalog.exercises[0];
  const openTutor = (id = currentExercise.id) => setTutor(id);
  let content: ReactNode;
  if (!ready)
    content = (
      <div className="loading-state" role="status">
        <div className="brand-mark">
          J<span>/</span>
        </div>
        <p>正在打开你的学习空间…</p>
      </div>
    );
  else if (route.page === "home") content = <HomePage {...props} />;
  else if (route.page === "roadmap") content = <RoadmapPage />;
  else if (
    route.page === "lesson" &&
    catalog.lessons.some((item) => item.id === route.id)
  )
    content = (
      <LessonPage
        key={route.id}
        {...props}
        lesson={catalog.lessons.find((item) => item.id === route.id)!}
        onTutor={openTutor}
        onReference={setReference}
      />
    );
  else if (
    route.page === "lab" &&
    catalog.exercises.some((item) => item.id === route.id)
  )
    content = (
      <LabPage
        key={route.id}
        {...props}
        exercise={currentExercise}
        dark={dark}
        saveStatus={saveStatus}
        onTutor={openTutor}
        onReference={setReference}
      />
    );
  else if (route.page === "practice")
    content = (
      <PracticePage
        key={route.id}
        {...props}
        routeId={route.id}
        onSelect={(id) => {
          location.hash = `#/practice/${id}`;
          setRoute({ page: "practice", id });
        }}
        onReference={setReference}
      />
    );
  else if (route.page === "review")
    content = <ReviewPage {...props} onData={() => setDataDialog(true)} />;
  else if (
    route.page === "document" &&
    catalog.documents.some((item) => item.id === route.id)
  ) {
    const doc = catalog.documents.find((item) => item.id === route.id)!;
    content = (
      <article className="document-page">
        <Eyebrow>仓库原文 · 学习底稿</Eyebrow>
        <h1>{doc.title}</h1>
        <p className="source-path">{doc.sourcePath}</p>
        <div className="notice">
          <BookOpen size={18} />
          <span>仓库原文只读视图。浏览器记录与仓库学习状态分开保存。</span>
        </div>
        <Markdown
          text={doc.markdown}
          sourcePath={doc.sourcePath}
          onReference={setReference}
        />
      </article>
    );
  } else
    content = (
      <div className="empty-state">
        <h1>这页暂不存在</h1>
        <p>请从当前课程继续。</p>
        <a
          className="button primary"
          href={lessonLink(state.lastLessonId ?? "day01")}
        >
          返回课程 <ArrowRight size={18} />
        </a>
      </div>
    );
  return (
    <>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          main.current?.focus();
        }}
      >
        跳到主要内容
      </a>
      <aside className="sidebar">
        <a href="#/home" className="brand" aria-label="JavaRoadmap Lab 首页">
          <div className="brand-mark">
            J<span>/</span>
          </div>
          <span>
            JavaRoadmap <b>Lab</b>
          </span>
        </a>
        <Navigation route={route} state={state} currentStage={currentStage} />
        <footer className="rail-footer">
          <span className="local-status">
            <span className={`status-dot ${storageError ? "warning" : ""}`} />
            本地优先 · 私人学习空间
          </span>
          <div className="rail-bottom">
            <span>阶段 01 / 14</span>
            <button
              className="icon-button"
              aria-label={dark ? "切换到浅色主题" : "切换到深色主题"}
              onClick={() =>
                change((current) => ({
                  ...current,
                  theme: dark ? "light" : "dark",
                }))
              }
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </footer>
      </aside>
      <div className="app-area" onKeyDown={handleTabKeys}>
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button mobile-menu"
              aria-label="打开导航菜单"
              onClick={() => setMobileNav(true)}
            >
              <Menu size={21} />
            </button>
            <span className="breadcrumb">
              个人学习空间 <ChevronRight size={14} />
              <strong>
                {route.page === "roadmap"
                  ? "知识地图"
                  : route.page === "review"
                    ? "学习复盘"
                    : route.page === "lab"
                      ? "编程实验室"
                      : `Stage ${currentStage.id} · ${currentStage.title}`}
              </strong>
            </span>
          </div>
          <div className="topbar-actions">
            <span className="save-status" role="status">
              <span className={`status-dot ${storageError ? "warning" : ""}`} />
              {saveStatus}
            </span>
            <button
              className="icon-button mobile-theme"
              aria-label={dark ? "切换到浅色主题" : "切换到深色主题"}
              onClick={() =>
                change((current) => ({
                  ...current,
                  theme: dark ? "light" : "dark",
                }))
              }
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              className="button subtle small"
              aria-label="数据与备份"
              onClick={() => setDataDialog(true)}
            >
              <FileJson size={16} />
              <span>数据与备份</span>
            </button>
          </div>
        </header>
        {storageError && (
          <div className="storage-warning" role="alert">
            <CircleAlert size={20} />
            <span>
              {storageError}{" "}
              当前更改仅保留在页面内。请先导出备份，再恢复或重新读取。
            </span>
            <button className="text-link" onClick={() => setDataDialog(true)}>
              保护与恢复数据
            </button>
          </div>
        )}
        <main
          ref={main}
          id="main-content"
          tabIndex={-1}
          className={`main-content page-${route.page}`}
        >
          {content}
        </main>
        <footer className="page-footer">
          <span>
            JavaRoadmap Lab <i>/</i> Learn · Build · Understand
          </span>
          <a href="#/document/stage01-guide">
            学习证据来自你的实践 <ArrowUpRight size={13} />
          </a>
        </footer>
      </div>
      <nav className="mobile-bottom-nav" aria-label="移动快捷导航">
        {[
          { page: "home", href: "#/home", label: "工作台", icon: Home },
          { page: "roadmap", href: "#/roadmap", label: "路线", icon: ListTree },
          {
            page: "lesson",
            href: lessonLink(state.lastLessonId ?? "day01"),
            label: "课程",
            icon: BookOpen,
          },
          { page: "lab", href: labLink(), label: "实验室", icon: Code2 },
          { page: "review", href: "#/review", label: "复盘", icon: FolderOpen },
        ].map(({ page, href, label, icon: Icon }) => (
          <a
            className={
              route.page === page ||
              (page === "lab" && route.page === "practice")
                ? "active"
                : ""
            }
            key={page}
            href={href}
            aria-current={route.page === page ? "page" : undefined}
          >
            <Icon size={19} />
            <span>{label}</span>
          </a>
        ))}
      </nav>
      {mobileNav && (
        <Dialog title="学习导航" onClose={() => setMobileNav(false)} drawer>
          <Navigation
            route={route}
            state={state}
            currentStage={currentStage}
            close={() => setMobileNav(false)}
          />
        </Dialog>
      )}
      {dataDialog && (
        <DataDialog
          state={state}
          onClose={() => setDataDialog(false)}
          onImport={(incoming) => {
            setState(incoming);
            setStorageError("");
            setCanSave(true);
            setToast("学习记录已恢复，正在写入本地数据库。");
          }}
          notify={setToast}
        />
      )}
      {tutor && (
        <TutorDialog
          {...props}
          exercise={catalog.exercises.find((item) => item.id === tutor)!}
          onClose={() => setTutor(null)}
        />
      )}
      {reference && (
        <ReferenceDialog
          path={reference}
          change={change}
          onClose={() => setReference(null)}
        />
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={18} />
          <span>{toast}</span>
          <button
            className="icon-button"
            aria-label="关闭消息"
            onClick={() => setToast("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </>
  );
}

function HomePage({ state }: PageProps) {
  const lesson =
    catalog.lessons.find((item) => item.id === state.lastLessonId) ??
    catalog.lessons[0];
  const readCount = Object.values(state.lessons).filter(
    (item) => item.read,
  ).length;
  const reflectionList = Object.entries(state.reflections).filter(
    ([, item]) => item.needsReview,
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <Eyebrow>
            个人学习空间 <span>01 · JAVA 基础</span>
          </Eyebrow>
          <h1>
            把基础，写成自己的能力<span className="heading-period">。</span>
          </h1>
          <p>从理解到独立实现。今天，继续一小步。</p>
        </div>
        <a className="text-link heading-link" href="#/document/execution-plan">
          查看学习执行计划 <ArrowUpRight size={16} />
        </a>
      </div>
      <section className="continue-card" aria-labelledby="continue-title">
        <div className="continue-copy">
          <div className="card-kicker">
            <span className="status-dot" />
            阶段 01 <span>正在学习</span>
          </div>
          <h2 id="continue-title">
            {state.lastLessonId ? "接着上次的思路。" : "先让第一行代码运行。"}
          </h2>
          <p>
            {lesson.title}
            <span className="dot-separator">/</span>
            {lesson.summary}
          </p>
          <a className="button accent" href={lessonLink(lesson.id)}>
            继续学习 <ArrowRight size={18} />
          </a>
          <div className="continue-meta">
            <BookOpen size={15} />
            {state.lastLessonId
              ? `${lesson.id.startsWith("day") ? "基础课" : "深化课"} · ${state.lessons[lesson.id]?.read ? "已阅读，可再次观察" : `阅读位置 ${Math.round((state.lessons[lesson.id]?.position ?? 0) * 100)}%`}`
              : "从 day01 输出与变量开始"}
            <span>阅读 ≠ 掌握</span>
          </div>
        </div>
        <div className="continue-visual" aria-hidden="true">
          <div className="code-window-label">
            <span />
            <span />
            <span />
            <b>MyLearning.java</b>
          </div>
          <div className="code-illustration">
            <span className="line-no">01</span>
            <span>
              <em>package</em> com.javaroadmap.lab;
            </span>
            <span className="line-no">02</span>
            <span>
              <em>public class</em> MyLearning {"{"}
            </span>
            <span className="line-no">03</span>
            <span>
              &nbsp; <em>public static void</em> main(String[] args) {"{"}
            </span>
            <span className="line-no">04</span>
            <span>
              &nbsp; &nbsp; <i>// 在这里，写下你自己的思路。</i>
            </span>
            <span className="line-no">05</span>
            <span>&nbsp; {"}"}</span>
            <span className="line-no">06</span>
            <span>{"}"}</span>
          </div>
          <div className="visual-caption">
            <Braces size={30} />
            <span>
              不是读懂答案
              <br />
              <strong>是能够自己写出来。</strong>
            </span>
          </div>
        </div>
      </section>
      <div className="learning-loop" aria-label="学习流程">
        <span>
          <b>01</b>理解概念
        </span>
        <ArrowRight size={15} />
        <span>
          <b>02</b>预测与观察
        </span>
        <ArrowRight size={15} />
        <span>
          <b>03</b>独立实现
        </span>
        <ArrowRight size={15} />
        <span>
          <b>04</b>验证与复盘
        </span>
      </div>
      <div className="dashboard-grid">
        <section>
          <SectionTitle
            index="01"
            title="当前该做什么"
            action={
              <a href="#/document/execution-plan" className="text-link">
                执行计划 <ArrowUpRight size={14} />
              </a>
            }
          />
          <div className="task-list">
            {catalog.currentTasks.map((task, index) => (
              <div className="task-item" key={task}>
                <span className="task-number">
                  {String(index).padStart(2, "0")}
                </span>
                <div>
                  <Markdown text={task} sourcePath="学习执行计划.md" />
                </div>
                <a
                  className="icon-button"
                  aria-label={`打开当前任务 ${index}`}
                  href={
                    catalog.workspace.currentTaskRoutes[index] ?? "#/review"
                  }
                >
                  <ArrowUpRight size={16} />
                </a>
              </div>
            ))}
          </div>
        </section>
        <aside className="dashboard-aside">
          <SectionTitle index="02" title="把疑问留给下一次理解" />
          <div className="review-note">
            <span className="note-mark">↗</span>
            <h3>值得再看一遍</h3>
            <p>来自仓库“需要复习”与自己的复盘。</p>
            {catalog.workspace.reviewPicks.map((pick) => (
              <a
                key={pick.id}
                href={
                  catalog.exercises.some((item) => item.id === pick.id)
                    ? labLink(pick.id)
                    : lessonLink(pick.id)
                }
              >
                <span>{pick.label}</span>
                <ChevronRight size={16} />
              </a>
            ))}
            {reflectionList.slice(0, 2).map(([id]) => (
              <a
                key={id}
                href={
                  catalog.exercises.some((item) => item.id === id)
                    ? labLink(id)
                    : "#/review"
                }
              >
                <span>
                  {catalog.exercises.find((item) => item.id === id)?.title ??
                    id}{" "}
                  · 我的复盘
                </span>
                <ChevronRight size={16} />
              </a>
            ))}
          </div>
          <div className="evidence-note">
            <ShieldCheck size={20} />
            <div>
              <strong>
                {readCount
                  ? `已读 ${readCount} 节，理解由实践验证。`
                  : "从真实的起点开始。"}
              </strong>
              <p>阅读、尝试和实测分别记录，不自动上调阶段状态。</p>
              <a href="#/review" className="text-link">
                查看我的学习证据 <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </aside>
      </div>
      <section className="entry-strip">
        <a href="#/practice">
          <span className="entry-icon">
            <Play size={21} />
          </span>
          <div>
            <Eyebrow>预测与观察</Eyebrow>
            <h3>先预测，再运行。</h3>
            <p>{catalog.predictions.length} 道预测题 · {catalog.modifications.length} 个条件修改</p>
          </div>
          <ArrowUpRight size={22} />
        </a>
        <a href={labLink()}>
          <span className="entry-icon">
            <Code2 size={23} />
          </span>
          <div>
            <Eyebrow>亲手实现</Eyebrow>
            <h3>给理解一个出口。</h3>
            <p>{catalog.exercises.length} 道独立练习 · 逐级课程提示</p>
          </div>
          <ArrowUpRight size={22} />
        </a>
      </section>
    </>
  );
}

function RoadmapPage() {
  const [selected, setSelected] = useState("01");
  const stage = catalog.stages.find((item) => item.id === selected)!;
  const stageLessons = catalog.lessons.filter(
    (lesson) => lesson.stageId === selected,
  );
  const groups = [
    { title: "语言与思维", note: "地基", range: ["01", "02", "03", "04"] },
    {
      title: "后端与工程",
      note: "工程与交付",
      range: ["05", "06", "07", "08", "09"],
    },
    {
      title: "Python 与 AI 应用",
      note: "智能应用",
      range: ["10", "11", "12", "13", "14"],
    },
  ];
  return (
    <>
      <div className="page-heading">
        <div>
          <Eyebrow>
            知识地图 <span>14 个阶段 · 一条主线</span>
          </Eyebrow>
          <h1>看见全貌，走好当前一步。</h1>
          <p>Java 是主线，AI 是延伸。知识地图不等于今天的任务清单。</p>
        </div>
        <a href="#/document/roadmap-source" className="text-link heading-link">
          权威路线原文 <ArrowUpRight size={16} />
        </a>
      </div>
      <div className="map-legend">
        <Badge tone="current">
          <span className="status-dot" />
          正在学习
        </Badge>
        <Badge>已有材料 · 未验证掌握</Badge>
        <Badge tone="muted">未开始</Badge>
        <span className="legend-evidence">
          <ShieldCheck size={16} />
          已完成需独立实现、验证与复盘证据
        </span>
      </div>
      <div className="roadmap-layout">
        <div className="roadmap-stages">
          {groups.map((group, index) => (
            <section key={group.title} className="stage-group">
              <div className="group-label">
                <span>0{index + 1}</span>
                <h2>{group.title}</h2>
                <small>{group.note}</small>
              </div>
              {catalog.stages
                .filter((item) => group.range.includes(item.id))
                .map((item) => (
                  <button
                    id={`roadmap-stage-${item.id}`}
                    key={item.id}
                    className={`stage-row ${selected === item.id ? "selected" : ""}`}
                    onClick={() => {
                      setSelected(item.id);
                      if (matchMedia("(max-width: 699px)").matches)
                        requestAnimationFrame(() => {
                          const detail =
                            document.getElementById("stage-detail");
                          detail?.scrollIntoView({
                            block: "start",
                            behavior: matchMedia(
                              "(prefers-reduced-motion: reduce)",
                            ).matches
                              ? "instant"
                              : "smooth",
                          });
                          detail?.focus({ preventScroll: true });
                        });
                    }}
                    aria-pressed={selected === item.id}
                  >
                    <span className="stage-index">{item.id}</span>
                    <span className="stage-row-copy">
                      <strong>{item.title}</strong>
                      <small>
                        {item.id === "01"
                          ? "当前专注 · 完成独立练习与验收"
                          : item.scope}
                      </small>
                    </span>
                    <span
                      className={`stage-state ${item.id === "01" ? "current" : ""}`}
                    >
                      {item.status}
                    </span>
                    <ChevronRight size={17} />
                  </button>
                ))}
            </section>
          ))}
        </div>
        <aside
          id="stage-detail"
          tabIndex={-1}
          className="stage-detail"
          aria-live="polite"
        >
          <Eyebrow>阶段 {stage.id}</Eyebrow>
          <button
            className="text-link mobile-stage-back"
            onClick={() => {
              const row = document.getElementById(`roadmap-stage-${selected}`);
              row?.scrollIntoView({ block: "center" });
              row?.focus({ preventScroll: true });
            }}
          >
            选择其他阶段 <ArrowDownToLine size={14} />
          </button>
          <h2>{stage.title}</h2>
          <Badge tone={stage.id === "01" ? "current" : ""}>
            {stage.status}
          </Badge>
          <dl>
            <dt>这一站学什么</dt>
            <dd>{stage.scope}</dd>
            <dt>前置与衔接</dt>
            <dd>{stage.prerequisites}</dd>
            <dt>实际资料</dt>
            <dd>{stage.materialState}</dd>
            <dt>应留下的证据</dt>
            <dd>{stage.evidence}</dd>
          </dl>
          {stage.id === "01" ? (
            <a href={lessonLink()} className="button primary">
              进入当前课程 <ArrowRight size={17} />
            </a>
          ) : stageLessons.length > 0 ? (
            <>
              {stage.building && (
                <div className="notice">
                  <Circle size={17} />
                  <span>
                    首批课程已发布；本阶段内容仍在持续建设，后续课程会逐步加入。
                  </span>
                </div>
              )}
              <div className="stage-lesson-links">
                {stageLessons.map((lesson) => (
                  <a key={lesson.id} href={lessonLink(lesson.id)} className="related-link">
                    <span>{lesson.title}</span>
                    <small>
                      {lesson.kind === "foundation" ? "基础课程" : "概念深化"}
                    </small>
                    <ArrowUpRight size={15} />
                  </a>
                ))}
              </div>
              {stage.sourcePath && (
                <a
                  href={`#/document/stage${stage.id}-guide`}
                  className="text-link"
                >
                  查看本阶段资料 <BookOpen size={15} />
                </a>
              )}
            </>
          ) : stage.sourcePath ? (
            <a
              href={`#/document/stage${stage.id}-guide`}
              className="button secondary"
            >
              查看现有资料 <BookOpen size={16} />
            </a>
          ) : (
            <p className="notice">
              <Circle size={17} />
              <span>目前只有路线信息，进入该阶段后再建立课程。</span>
            </p>
          )}
          <p className="fine-print">
            阶段状态来自真实学习进度。浏览或运行参考示例不会改变状态。
          </p>
        </aside>
      </div>
    </>
  );
}

function LessonPage({
  state,
  change,
  lesson,
  onTutor,
  onReference,
}: PageProps & {
  lesson: Lesson;
  onTutor: (id?: string) => void;
  onReference: (path: string) => void;
}) {
  const [chaptersOpen, setChaptersOpen] = useState(false);
  const storedPosition = useRef(state.lessons[lesson.id]?.position ?? 0);
  useEffect(() => {
    change((current) => ({ ...current, lastLessonId: lesson.id }));
    let timer: ReturnType<typeof setTimeout>;
    let active = false;
    const restore = setTimeout(() => {
      const height = document.documentElement.scrollHeight - innerHeight;
      window.scrollTo(0, storedPosition.current * Math.max(0, height));
      active = true;
    }, 100);
    const handle = () => {
      if (!active) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        const height = document.documentElement.scrollHeight - innerHeight;
        const position =
          height > 0 ? Math.min(1, Math.max(0, scrollY / height)) : 1;
        change((current) => ({
          ...current,
          lessons: {
            ...current.lessons,
            [lesson.id]: {
              read: current.lessons[lesson.id]?.read ?? false,
              position,
              updatedAt: timestamp(),
            },
          },
        }));
      }, 220);
    };
    window.addEventListener("scroll", handle, { passive: true });
    return () => {
      clearTimeout(restore);
      clearTimeout(timer);
      window.removeEventListener("scroll", handle);
    };
    // A lesson's initial saved position is restored once on entry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id]);
  const index = catalog.lessons.indexOf(lesson);
  const primary = lesson.steps.slice(0, 3);
  const observe = lesson.steps.slice(3);
  const exercise = catalog.exercises.find(
    (item) => item.id === lesson.exerciseIds[0],
  );
  return (
    <>
      <div className="lesson-toolbar">
        <button
          className="button subtle small"
          onClick={() => setChaptersOpen(!chaptersOpen)}
          aria-expanded={chaptersOpen}
        >
          <PanelLeftClose size={17} />
          课程目录
          <ChevronDown size={14} />
        </button>
        <span>
          STAGE {lesson.stageId} <i>/</i>{" "}
          {lesson.kind === "foundation" ? "基础课程" : "概念深化"}
        </span>
        <button
          className="button subtle small"
          onClick={() => onTutor(exercise?.id)}
        >
          <Sparkles size={16} />
          课程辅导
        </button>
      </div>
      {chaptersOpen && (
        <div className="chapter-picker">
          {["foundation", "deep-dive"].map((kind) => (
            <section key={kind}>
              <h2>
                {kind === "foundation"
                  ? `基础课程 · ${String(catalog.lessons.filter((item) => item.kind === "foundation").length).padStart(2, "0")}`
                  : `概念深化 · ${String(catalog.lessons.filter((item) => item.kind === "deep-dive").length).padStart(2, "0")}`}
              </h2>
              {catalog.lessons
                .filter((item) => item.kind === kind)
                .map((item) => (
                  <a
                    key={item.id}
                    className={item.id === lesson.id ? "active" : ""}
                    href={lessonLink(item.id)}
                  >
                    {item.id.replace("day", "DAY ").replace("deep", "DEEP ")}
                    <span>{item.title}</span>
                    {state.lessons[item.id]?.read ? (
                      <Check size={15} />
                    ) : (
                      <ChevronRight size={15} />
                    )}
                  </a>
                ))}
            </section>
          ))}
        </div>
      )}
      <div className="lesson-layout">
        <article className="lesson-article">
          <header className="lesson-heading">
            <Eyebrow>
              {lesson.kind === "foundation" ? "基础课程" : "概念深化"}{" "}
              <span>课程阅读</span>
            </Eyebrow>
            <h1>{lesson.title}</h1>
            <p>{lesson.summary}</p>
            <div className="lesson-meta">
              <Badge tone="current">
                {lesson.kind === "foundation"
                ? (catalog.stages.find((stage) => stage.id === lesson.stageId)
                    ?.title ?? "课程")
                : "深化理解"}
              </Badge>
              <span>
                <BookOpen size={15} />
                {state.lessons[lesson.id]?.read
                  ? "你已标记阅读"
                  : "等待你亲自观察"}
              </span>
              <span>
                阅读位置{" "}
                {Math.round((state.lessons[lesson.id]?.position ?? 0) * 100)}%
              </span>
            </div>
            <div className="reading-track">
              <span
                style={{
                  width: `${(state.lessons[lesson.id]?.position ?? 0) * 100}%`,
                }}
              />
            </div>
          </header>
          {primary.map((step, i) => (
            <section className="lesson-step" id={`step-${i}`} key={step.label}>
              <h2>
                <span>0{i + 1}</span>
                {step.label}
              </h2>
              <Markdown
                text={step.body}
                sourcePath={lesson.sourcePath}
                onReference={onReference}
              />
            </section>
          ))}
          {lesson.markdown && (
            <Markdown
              text={lesson.markdown}
              sourcePath={lesson.sourcePath}
              onReference={onReference}
            />
          )}
          <section className="lesson-code" id="minimal-code">
            <div className="code-caption">
              <span>
                <FileCode2 size={16} />
                {lesson.className}.java
              </span>
              <Badge>
                {lesson.kind === "foundation" ? "现有课程源码" : "教学示例"}
              </Badge>
            </div>
            <Code code={lesson.code} />
            <p className="fine-print">
              {lesson.kind === "foundation"
                ? "此源码保留仓库中的既有修改。先预测再运行，不把它当成个人练习答案。"
                : "参考示例用于观察概念；运行成功不代表已独立掌握。"}
            </p>
          </section>
          {lesson.codeFiles
            .filter((file) => file.path !== lesson.codePath)
            .map((file) => (
              <section className="lesson-code" key={file.path}>
                <div className="code-caption">
                  <span>
                    <FileCode2 size={16} />
                    {file.className}.java
                  </span>
                  <Badge>同包依赖类</Badge>
                </div>
                <Code code={file.code} />
              </section>
            ))}
          <details className="run-instructions">
            <summary>
              <Laptop size={17} />
              在本地 JDK 运行本节源码 <ChevronDown size={16} />
            </summary>
            <p>
              在包含 <code>com/</code> 的课程源码根目录中执行：
            </p>
            <Code
              language="text"
              code={`javac -encoding UTF-8 -d out ${lesson.codeFiles
                .map(
                  (file) =>
                    file.path.slice(file.path.indexOf("/com/") + 1),
                )
                .join(" ")}\njava -cp out ${lesson.packageName}.${lesson.className}`}
            />
            <p className="source-path">仓库来源：{lesson.codePath}</p>
            <a href="#/document/environment" className="text-link">
              环境搭建与 JDK 检查 <ArrowUpRight size={15} />
            </a>
          </details>
          {observe.map((step, i) => (
            <section
              className={`lesson-step ${i === 0 ? "observe-step" : ""}`}
              id={`step-${i + 3}`}
              key={step.label}
            >
              <h2>
                <span>0{i + 4}</span>
                {step.label}
              </h2>
              <Markdown
                text={step.body}
                sourcePath={lesson.sourcePath}
                onReference={onReference}
              />
            </section>
          ))}
          <div className="lesson-related">
            <SectionTitle title="把理解带进练习" />
            {lesson.predictionIds.length > 0 && (
              <a
                className="related-link"
                href={`#/practice/${lesson.predictionIds[0]}`}
              >
                <Play size={19} />
                <span>
                  先做一道预测题
                  <small>
                    {lesson.predictionIds.join(" · ")}，验证你的心智模型
                  </small>
                </span>
                <ArrowRight size={19} />
              </a>
            )}
            {exercise && (
              <a className="related-link" href={labLink(exercise.id)}>
                <Code2 size={20} />
                <span>
                  {exercise.title}
                  <small>独立实现 · 课程提示 L1–L4</small>
                </span>
                <ArrowRight size={19} />
              </a>
            )}
          </div>
          <button
            className={`button ${state.lessons[lesson.id]?.read ? "secondary" : "primary"}`}
            onClick={() => {
              change((current) => ({
                ...current,
                lessons: {
                  ...current.lessons,
                  [lesson.id]: {
                    read: !current.lessons[lesson.id]?.read,
                    position: current.lessons[lesson.id]?.position ?? 1,
                    updatedAt: timestamp(),
                  },
                },
              }));
            }}
          >
            {state.lessons[lesson.id]?.read ? (
              <CheckCheck size={18} />
            ) : (
              <Check size={18} />
            )}
            {state.lessons[lesson.id]?.read
              ? "已标记阅读 · 点击撤销"
              : "标记为已阅读"}
          </button>
          <p className="fine-print">
            这只记录阅读行为，不代表掌握，也不会修改仓库阶段状态。
          </p>
          <nav className="lesson-pagination" aria-label="前后课程">
            {index > 0 ? (
              <a href={lessonLink(catalog.lessons[index - 1].id)}>
                <ArrowLeft size={18} />
                <span>
                  <small>上一节</small>
                  {catalog.lessons[index - 1].title}
                </span>
              </a>
            ) : (
              <a href="#/document/stage01-guide">
                <ArrowLeft size={18} />
                <span>
                  <small>开始之前</small>Stage 01 学习说明
                </span>
              </a>
            )}
            {index < catalog.lessons.length - 1 && (
              <a href={lessonLink(catalog.lessons[index + 1].id)}>
                <span>
                  <small>下一节</small>
                  {catalog.lessons[index + 1].title}
                </span>
                <ArrowRight size={18} />
              </a>
            )}
          </nav>
        </article>
        <aside className="lesson-margin">
          <div className="margin-sticky">
            <Eyebrow>本节脉络</Eyebrow>
            <div className="margin-toc">
              {lesson.steps.map((step, i) => (
                <button
                  key={step.label}
                  onClick={() =>
                    document.getElementById(`step-${i}`)?.scrollIntoView({
                      behavior: matchMedia("(prefers-reduced-motion: reduce)")
                        .matches
                        ? "instant"
                        : "smooth",
                      block: "start",
                    })
                  }
                >
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  {step.label}
                </button>
              ))}
              <button
                onClick={() =>
                  document
                    .getElementById("minimal-code")
                    ?.scrollIntoView({ block: "start" })
                }
              >
                <Braces size={14} />
                源码与本地运行
              </button>
            </div>
            <div className="margin-deep">
              <Lightbulb size={20} />
              <h3>多问一句为什么</h3>
              {lesson.relatedLessonIds.map((id) => (
                <a key={id} href={lessonLink(id)}>
                  {catalog.lessons.find((item) => item.id === id)?.title}
                  <ArrowUpRight size={14} />
                </a>
              ))}
            </div>
            <p className="fine-print">
              源码与正文来自现有仓库；课程桥接只补充学习动作。
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}

function PracticePage(
  props: PageProps & {
    routeId: string;
    onSelect: (id: string) => void;
    onReference: (path: string) => void;
  },
) {
  const routeId = props.routeId;
  // 修改题 ID 可能带 Stage 前缀（如 S02B2），以 catalog 归属而非首字母判定 tab。
  const modification = catalog.modifications.some((item) => item.id === routeId)
    ? routeId
    : "B1";
  const tab = catalog.modifications.some((item) => item.id === routeId)
    ? "modify"
    : "predict";
  const selected = catalog.predictions.some(
    (item) => item.id === routeId.replace("-modified", ""),
  )
    ? routeId.replace("-modified", "")
    : "A1";
  const prediction = catalog.predictions.find((item) => item.id === selected)!;
  const item = catalog.modifications.find(
    (entry) => entry.id === modification,
  )!;
  return (
    <>
      <div className="page-heading">
        <div>
          <Eyebrow>预测 · 观察 · 修改</Eyebrow>
          <h1>在运行之前，先有自己的判断。</h1>
          <p>预测可以确定性判定；修改题请在自己的副本运行，再记录差异。</p>
        </div>
        <a href={labLink()} className="text-link heading-link">
          进入独立练习 <ArrowRight size={16} />
        </a>
      </div>
      <div className="tabs" role="tablist" aria-label="练习类型">
        <button
          role="tab"
          aria-selected={tab === "predict"}
          onClick={() => {
            props.onSelect("A1");
          }}
        >
          输出预测 <span>{catalog.predictions.length}</span>
        </button>
        <button
          role="tab"
          aria-selected={tab === "modify"}
          onClick={() => {
            props.onSelect("B1");
          }}
        >
          条件修改 <span>{catalog.modifications.length}</span>
        </button>
      </div>
      <div className="practice-layout">
        <nav
          className="practice-picker"
          aria-label={tab === "predict" ? "预测题选择" : "修改题选择"}
        >
          {(tab === "predict"
            ? catalog.predictions
            : catalog.modifications
          ).map((entry) => (
            <button
              key={entry.id}
              className={
                (tab === "predict" ? selected : modification) === entry.id
                  ? "selected"
                  : ""
              }
              onClick={() => {
                props.onSelect(entry.id);
              }}
            >
              <span>{entry.id}</span>
              <strong>{entry.title}</strong>
              {props.state.predictions[entry.id]?.correct ? (
                <Check size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>
          ))}
        </nav>
        <section className="practice-work">
          {tab === "predict" ? (
            <PredictionCard
              key={prediction.id}
              {...props}
              prediction={prediction}
              routeId={routeId}
            />
          ) : (
            <>
              <Eyebrow>条件修改 · {item.id.toUpperCase()}</Eyebrow>
              <h2>{item.title}</h2>
              {item.note && (
                <div className="notice warning">
                  <CircleAlert size={18} />
                  <span>{item.note}</span>
                </div>
              )}
              <Markdown text={item.markdown} sourcePath={item.sourcePath} />
              {item.lessonIds.map((id) => (
                <a
                  key={id}
                  className="button secondary small"
                  href={lessonLink(id)}
                >
                  查看 {catalog.lessons.find((entry) => entry.id === id)?.title}
                  <ArrowUpRight size={15} />
                </a>
              ))}
              <div className="related-chips">
                {item.referencePaths.map((path) => (
                  <button
                    className="button secondary small"
                    key={path}
                    onClick={() => props.onReference(path)}
                  >
                    查看要修改的原例 · {path.split("/").at(-1)}
                    <ArrowUpRight size={15} />
                  </button>
                ))}
              </div>
              <ReflectionForm {...props} id={item.id} />
              <p className="fine-print">
                修改练习不自动判题；在自己的代码副本中运行，保留真实差异。
              </p>
            </>
          )}
        </section>
      </div>
    </>
  );
}

function PredictionCard({
  state,
  change,
  prediction,
  routeId,
  onSelect,
}: PageProps & {
  prediction: Prediction;
  routeId: string;
  onSelect: (id: string) => void;
}) {
  const initialId = routeId.endsWith("-modified")
    ? `${prediction.id}-modified`
    : prediction.id;
  const [answer, setAnswer] = useState(
    state.predictions[initialId]?.answer ?? "",
  );
  const [result, setResult] = useState<boolean | null>(
    state.predictions[initialId]?.correct ?? null,
  );
  const [unlock, setUnlock] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [modified, setModified] = useState(initialId.endsWith("-modified"));
  const id = modified ? `${prediction.id}-modified` : prediction.id;
  const expected = modified ? prediction.modifiedAnswer! : prediction.answer;
  const submit = () => {
    const correct = checkPrediction(answer, expected);
    setResult(correct);
    change((current) => ({
      ...current,
      predictions: {
        ...current.predictions,
        [id]: {
          answer,
          correct,
          attempts: (current.predictions[id]?.attempts ?? 0) + 1,
          updatedAt: timestamp(),
        },
      },
    }));
  };
  return (
    <>
      <div className="practice-title">
        <Eyebrow>预测题 · {prediction.id.toUpperCase()}</Eyebrow>
        <Badge tone="current">确定性判定</Badge>
      </div>
      <h2>{prediction.title}</h2>
      <Markdown text={prediction.prompt} sourcePath={prediction.sourcePath} />
      <Code
        code={
          modified
            ? prediction.code.replace("i < 3", "i <= 3")
            : prediction.code
        }
      />
      {prediction.modifiedAnswer && (
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={modified}
            onChange={(event) => {
              const nextId = event.target.checked
                ? `${prediction.id}-modified`
                : prediction.id;
              setModified(event.target.checked);
              setAnswer(state.predictions[nextId]?.answer ?? "");
              setResult(state.predictions[nextId]?.correct ?? null);
              setRevealed(false);
              onSelect(nextId);
            }}
          />
          修改一个条件：将 &lt; 改为 &lt;=，再预测一次
        </label>
      )}
      <label className="field-label" htmlFor="prediction-answer">
        你预测的输出
      </label>
      <textarea
        id="prediction-answer"
        className="prediction-input"
        value={answer}
        spellCheck={false}
        placeholder="按实际输出逐行填写…"
        onChange={(event) => {
          setAnswer(event.target.value);
          setResult(null);
        }}
      />
      <p className="fine-print">
        保留输出顺序和内部空格；忽略平台换行、每行末尾空格与最后一个换行。
      </p>
      <div className="action-row">
        <button
          className="button primary"
          onClick={submit}
          disabled={!answer.trim()}
        >
          检查预测 <ArrowRight size={17} />
        </button>
        <button className="text-link" onClick={() => setUnlock(!unlock)}>
          查看解析与参考输出 <HelpCircle size={15} />
        </button>
      </div>
      {result !== null && (
        <div
          className={`result-banner ${result ? "success" : "warning"}`}
          role="status"
        >
          {result ? <CheckCheck size={21} /> : <CircleAlert size={21} />}
          <div>
            <strong>
              {result ? "预测与真实语义一致。" : "还不一致，再跟一遍执行顺序。"}
            </strong>
            <p>
              {result
                ? "用你自己的话解释原因，再改一个条件观察。预测正确不等于完整掌握。"
                : "检查操作数类型、循环边界与每一次输出。你可以返回相关课程，再试一次。"}
            </p>
          </div>
        </div>
      )}
      {unlock && !revealed && (
        <div className="unlock-box">
          <p>
            查看会记录为“已查看参考”，与独立预测分开。先保留你的判断，再比较原因。
          </p>
          <button
            className="button secondary small"
            onClick={() => {
              setRevealed(true);
              change((current) => ({
                ...current,
                referenceViews: {
                  ...current.referenceViews,
                  [prediction.id]: timestamp(),
                },
              }));
            }}
          >
            确认查看本题解析
          </button>
        </div>
      )}
      {revealed && (
        <section className="answer-section">
          <Badge>参考解析 · 已主动解锁</Badge>
          <Code language="text" code={expected} />
          <Markdown
            text={prediction.explanation}
            sourcePath={prediction.sourcePath}
          />
        </section>
      )}
      <div className="related-chips">
        {prediction.lessonIds.map((lessonId) => (
          <a key={lessonId} href={lessonLink(lessonId)}>
            <BookOpen size={14} />
            {catalog.lessons.find((item) => item.id === lessonId)?.title}
            <ArrowUpRight size={13} />
          </a>
        ))}
      </div>
      <ReflectionForm
        state={state}
        change={change}
        notify={() => undefined}
        id={prediction.id}
      />
    </>
  );
}

function LabPage({
  state,
  change,
  notify,
  exercise,
  dark,
  saveStatus,
  onTutor,
  onReference,
}: PageProps & {
  exercise: Exercise;
  dark: boolean;
  saveStatus: string;
  onTutor: (id?: string) => void;
  onReference: (path: string) => void;
}) {
  const code = state.drafts[exercise.id]?.code ?? exercise.starterCode;
  // 未来需要 stdin 的练习只需在元数据中声明 needsInput: true
  const needsInput = exercise.needsInput === true;
  const [tab, setTab] = useState<"cases" | "local" | "evidence">("cases");
  const [evidenceError, setEvidenceError] = useState("");
  const [reset, setReset] = useState(false);
  const [hash, setHash] = useState("");
  const importInput = useRef<HTMLInputElement>(null);
  const evidence = state.evidence.filter(
    (item) => item.exerciseId === exercise.id,
  );
  useEffect(() => {
    let active = true;
    sha256(code)
      .then((value) => {
        if (active) setHash(value);
      })
      .catch(() => {
        if (active) setHash("");
      });
    return () => {
      active = false;
    };
  }, [code]);
  const handleEvidence = async (file?: File) => {
    if (!file) return;
    try {
      if (file.size > 2_000_000)
        throw new Error("验证记录超过 2 MB，已拒绝读取。");
      const record = await importEvidence(
        JSON.parse(await file.text()),
        exercise.id,
        code,
      );
      const existing = state.evidence.find((item) => item.id === record.id);
      if (existing && JSON.stringify(existing) !== JSON.stringify(record))
        throw new Error(
          "同一验证 ID 的内容冲突，已取消导入。请保留两份原始记录。",
        );
      if (!existing)
        change((current) => ({
          ...current,
          evidence: [...current.evidence, record],
        }));
      setEvidenceError("");
      setTab("evidence");
      notify("已关联当前源码的本地实测记录。");
    } catch (error) {
      setEvidenceError(String(error));
    } finally {
      if (importInput.current) importInput.current.value = "";
    }
  };
  return (
    <>
      <div className="lab-heading">
        <div>
          <Eyebrow>
            编程实验室 <span>01 · 动手构建</span>
          </Eyebrow>
          <h1>让思路，经得起运行。</h1>
        </div>
        <button
          className="button secondary"
          onClick={() => onTutor(exercise.id)}
        >
          <Sparkles size={17} />
          课程辅导 <span className="keycap">L1–L4</span>
        </button>
      </div>
      <nav className="exercise-tabs" aria-label="独立编程练习">
        {catalog.exercises.map((item, index) => (
          <a
            href={labLink(item.id)}
            aria-current={item.id === exercise.id ? "page" : undefined}
            className={item.id === exercise.id ? "active" : ""}
            key={item.id}
          >
            <span>0{index + 1}</span>
            {item.title}
            {state.drafts[item.id] && (
              <span className="draft-dot" aria-label="有草稿" />
            )}
          </a>
        ))}
      </nav>
      <div className="lab-workspace">
        <section className="problem-pane">
          <div className="problem-heading">
            <Eyebrow>
              练习 {" "}
              {String(catalog.exercises.indexOf(exercise) + 1).padStart(2, "0")}
            </Eyebrow>
            <Badge>独立实现</Badge>
          </div>
          <h2>{exercise.title}</h2>
          <Markdown
            text={exercise.markdown}
            sourcePath={exercise.sourcePath}
            onReference={onReference}
          />
          {exercise.note && (
            <div className="notice warning">
              <CircleAlert size={18} />
              <span>{exercise.note}</span>
            </div>
          )}
          <div className="problem-links">
            {exercise.lessonIds.map((id) => (
              <a href={lessonLink(id)} key={id}>
                <BookOpen size={15} />
                {catalog.lessons.find((item) => item.id === id)?.title}
                <ArrowUpRight size={14} />
              </a>
            ))}
          </div>
          <div className="hint-teaser">
            <Lightbulb size={21} />
            <div>
              <strong>卡住时，只前进一步。</strong>
              <p>从理解问题开始，每次解锁一级。</p>
              <button
                className="text-link"
                onClick={() => onTutor(exercise.id)}
              >
                打开课程提示 <ArrowRight size={15} />
              </button>
            </div>
          </div>
          <details className="reference-access">
            <summary>
              完成后，再对照参考 <ChevronDown size={16} />
            </summary>
            <p className="fine-print">
              不会填入你的编辑器；查看行为将单独记录。
            </p>
            {exercise.referencePaths.map((path) => (
              <button
                className="text-link"
                key={path}
                onClick={() => onReference(path)}
              >
                {path.split("/").at(-1)} <ArrowUpRight size={14} />
              </button>
            ))}
          </details>
        </section>
        <section className="editor-pane" aria-label="Java 编程工作区">
          <div className="editor-filebar">
            <span>
              <FileCode2 size={18} />
              {exercise.className}.java{" "}
              <span className="draft-label">草稿</span>
            </span>
            <span className="editor-save">
              <span className="status-dot" />
              {saveStatus.startsWith("已保存") ? "已自动保存" : saveStatus}
            </span>
          </div>
          <CodeEditor
            key={exercise.id}
            dark={dark}
            value={code}
            onChange={(value) =>
              change((current) => ({
                ...current,
                drafts: {
                  ...current.drafts,
                  [exercise.id]: { code: value, updatedAt: timestamp() },
                },
              }))
            }
          />
          <div className="editor-actions">
            <div>
              <button
                className="button primary small"
                onClick={() => {
                  download(
                    `${exercise.className}.java`,
                    code,
                    "text/x-java-source;charset=utf-8",
                  );
                  notify("已导出当前草稿源码；使用本地 JDK 运行。");
                }}
              >
                <ArrowDownToLine size={16} />
                下载 Java
              </button>
              <button
                className="button subtle small"
                onClick={() => {
                  if (!navigator.clipboard) {
                    notify("当前环境不支持剪贴板，请下载 Java 文件。");
                    return;
                  }
                  navigator.clipboard
                    .writeText(code)
                    .then(() => notify("源码已复制。"))
                    .catch(() =>
                      notify("复制未获浏览器允许，请下载 Java 文件。"),
                    );
                }}
              >
                <Clipboard size={16} />
                复制
              </button>
            </div>
            <button
              className="icon-button"
              aria-label="恢复本题初始骨架"
              onClick={() => setReset(true)}
            >
              <RotateCcw size={17} />
            </button>
          </div>
          <div className="runner-status">
            <span className="runner-icon">
              <Laptop size={19} />
            </span>
            <div>
              <strong>本地 JDK 模式</strong>
              <p>编辑器不执行 Java。下载源码运行，再导入真实验证记录。</p>
            </div>
            <Badge>在线沙箱未配置</Badge>
          </div>
          <div
            className="tabs output-tabs"
            role="tablist"
            aria-label="验证与输出"
          >
            {[
              { id: "cases", label: "输入与预期" },
              { id: "local", label: "本地运行" },
              {
                id: "evidence",
                label: `实测记录${evidence.length ? ` · ${evidence.length}` : ""}`,
              },
            ].map((entry) => (
              <button
                key={entry.id}
                role="tab"
                aria-selected={tab === entry.id}
                onClick={() => setTab(entry.id as typeof tab)}
              >
                {entry.label}
              </button>
            ))}
          </div>
          <div className="output-panel">
            {tab === "cases" ? (
              <>
                {exercise.cases.map((item) => (
                  <details
                    className="test-case"
                    key={item.id}
                    open={item === exercise.cases[0]}
                  >
                    <summary>
                      <span className={`case-kind ${item.kind}`} />
                      {item.label}
                      <Badge>
                        {item.kind === "normal"
                          ? "正常"
                          : item.kind === "boundary"
                            ? "边界"
                            : "非法输入"}
                      </Badge>
                      <ChevronDown size={14} />
                    </summary>
                    <div className="case-data">
                      <div>
                        <span>输入 / 数据</span>
                        <pre>{item.input}</pre>
                      </div>
                      <div>
                        <span>预期行为</span>
                        <pre>{item.expected}</pre>
                      </div>
                    </div>
                  </details>
                ))}
                <p className="fine-print">
                  这些是题目案例，尚未执行；没有模拟 stdout 或通过率。
                </p>
              </>
            ) : tab === "local" ? (
              <>
                <Eyebrow>01 下载源码 → 02 本地验证 → 03 导入记录</Eyebrow>
                <p>
                  推荐：在仓库 web
                  目录运行下面一条命令。工具会编译、运行并生成记录，无需先手动编译。
                </p>
                <p>
                  {needsInput
                    ? "本题读取键盘输入，请准备 input.txt 和运行前推导的 expected.txt。"
                    : "本题的数组在源码中，只需准备运行前推导的 expected.txt，无需输入文件。"}
                  文件使用 UTF-8；将示例目录替换为你保存文件的位置。
                </p>
                <Code
                  language="text"
                  code={`npm run verify:practice -- --exercise ${exercise.id} --source "你的文件目录/${exercise.className}.java"${needsInput ? ' --input-file "你的文件目录/input.txt"' : ""} --expect-file "你的文件目录/expected.txt" --label "正常案例" --evidence "你的文件目录/result.evidence.json"`}
                />
                <p className="fine-print">
                  数组题需自己修改数组并分别运行，重复验证请使用新的记录文件名。记录只对应所列案例。此
                  CLI 在本机以你的权限运行，仅运行自己信任的源码。
                </p>
                <details className="test-case">
                  <summary>
                    直接使用 javac / java（可选，不生成实测记录）
                    <ChevronDown size={14} />
                  </summary>
                  <p>在源码所在目录执行；包名不需要删除。</p>
                  <Code
                    language="text"
                    code={`javac -encoding UTF-8 -d out ${exercise.className}.java\njava -cp out ${exercise.packageName}.${exercise.className}`}
                  />
                </details>
                <a className="text-link" href="#/document/lab-local-java">
                  完整运行指南 <ArrowUpRight size={14} />
                </a>
                <button
                  className="button secondary small"
                  onClick={() => importInput.current?.click()}
                >
                  <Upload size={16} />
                  导入实际验证记录
                </button>
              </>
            ) : (
              <>
                <button
                  className="button secondary small"
                  onClick={() => importInput.current?.click()}
                >
                  <Upload size={16} />
                  导入本地验证 JSON
                </button>
                {evidence.length === 0 ? (
                  <div className="inline-empty">
                    <ShieldCheck size={29} />
                    <h3>让验证留下依据。</h3>
                    <p>
                      记录包含源码
                      SHA-256、命令、JDK、输入、输出与退出码。导入时核对当前草稿。
                    </p>
                  </div>
                ) : (
                  evidence.map((item) => (
                    <details className="evidence-record" key={item.id}>
                      <summary>
                        <ShieldCheck size={18} />
                        <span>
                          {item.allPassed ? "所列案例通过" : "存在失败案例"}
                          <small>
                            {dateLabel(item.createdAt)} ·{" "}
                            {item.sourceHash === hash
                              ? "与当前源码一致"
                              : "源码已变化，请重新验证"}
                          </small>
                        </span>
                        <ChevronDown size={16} />
                      </summary>
                      <p className="source-path">SHA-256 {item.sourceHash}</p>
                      <pre>{item.command}</pre>
                      {item.cases.map((c, i) => (
                        <div className="case-result" key={i}>
                          <strong>
                            {c.passed ? "✓" : "×"} {c.label} · exit {c.exitCode}
                          </strong>
                          <span>实际 stdout</span>
                          <pre>{c.stdout || "（空）"}</pre>
                          {c.stderr && (
                            <>
                              <span>stderr</span>
                              <pre>{c.stderr}</pre>
                            </>
                          )}
                        </div>
                      ))}
                    </details>
                  ))
                )}
                <p className="fine-print">
                  本地实测记录可编辑、非签名认证；仅代表所列用例，不等于全题验收或阶段完成。
                </p>
              </>
            )}
            {evidenceError && (
              <p className="form-error" role="alert">
                {evidenceError}
              </p>
            )}
            <input
              type="file"
              accept="application/json,.json"
              hidden
              ref={importInput}
              aria-label="选择 Java 实测记录文件"
              onChange={(event) => {
                void handleEvidence(event.target.files?.[0]);
              }}
            />
          </div>
        </section>
      </div>
      <ReflectionForm {...{ state, change, notify }} id={exercise.id} />
      {reset && (
        <Dialog title="恢复初始骨架" onClose={() => setReset(false)}>
          <p>
            当前 {exercise.title} 草稿会先下载备份，再替换成只有 TODO
            的初始骨架。
          </p>
          <div className="action-row">
            <button
              className="button secondary"
              onClick={() => setReset(false)}
            >
              保留草稿
            </button>
            <button
              className="button primary"
              onClick={() => {
                download(
                  `${exercise.className}.backup.java`,
                  code,
                  "text/x-java-source",
                );
                change((current) => ({
                  ...current,
                  drafts: {
                    ...current.drafts,
                    [exercise.id]: {
                      code: exercise.starterCode,
                      updatedAt: timestamp(),
                    },
                  },
                }));
                setReset(false);
              }}
            >
              备份并确认恢复
            </button>
          </div>
        </Dialog>
      )}
    </>
  );
}

function ReflectionForm({ state, change, id }: PageProps & { id: string }) {
  const reflection = state.reflections[id] ?? {
    error: "",
    understanding: "",
    nextStep: "",
    needsReview: false,
    updatedAt: timestamp(),
  };
  const update = (
    key: "error" | "understanding" | "nextStep" | "needsReview",
    value: string | boolean,
  ) =>
    change((current) => ({
      ...current,
      reflections: {
        ...current.reflections,
        [id]: { ...reflection, [key]: value, updatedAt: timestamp() },
      },
    }));
  return (
    <section className="reflection-form" aria-label="本次学习复盘">
      <SectionTitle
        title="留下一点自己的理解"
        action={<span className="fine-print">自动保存</span>}
      />
      <div className="reflection-fields">
        {[
          {
            key: "error",
            label: "哪里与预期不同？",
            placeholder: "真实错误、输入或现象…",
          },
          {
            key: "understanding",
            label: "现在怎么理解？",
            placeholder: "原因是什么，如何验证…",
          },
          {
            key: "nextStep",
            label: "下一次验证什么？",
            placeholder: "一组边界输入，或一个新条件…",
          },
        ].map((field) => (
          <label key={field.key}>
            {field.label}
            <textarea
              value={
                reflection[field.key as "error" | "understanding" | "nextStep"]
              }
              maxLength={20_000}
              placeholder={field.placeholder}
              onChange={(event) =>
                update(
                  field.key as "error" | "understanding" | "nextStep",
                  event.target.value,
                )
              }
            />
          </label>
        ))}
      </div>
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={reflection.needsReview}
          onChange={(event) => update("needsReview", event.target.checked)}
        />
        把这个问题留到下次复习
      </label>
    </section>
  );
}

function ReviewPage({ state, onData }: PageProps & { onData: () => void }) {
  const read = Object.values(state.lessons).filter((item) => item.read).length;
  const drafts = Object.keys(state.drafts).length;
  const evidence = state.evidence.length;
  const hints = Object.keys(state.hints).filter(
    (id) => state.hints[id] > 0,
  ).length;
  const reflections = Object.entries(state.reflections).sort(
    (a, b) => Date.parse(b[1].updatedAt) - Date.parse(a[1].updatedAt),
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <Eyebrow>
            学习证据 <span>复盘 · 反思</span>
          </Eyebrow>
          <h1>用证据，看见理解的形状。</h1>
          <p>记录做过什么、遇见什么。掌握程度，留给独立实现来回答。</p>
        </div>
        <button className="button secondary heading-link" onClick={onData}>
          <ArrowDownToLine size={17} />
          备份学习记录
        </button>
      </div>
      <div className="evidence-metrics">
        {[
          {
            value: read,
            label: "标记已阅读",
            detail: "阅读是起点",
            icon: BookOpen,
          },
          {
            value: drafts,
            label: "有代码草稿",
            detail: "保留亲自尝试",
            icon: Code2,
          },
          {
            value: evidence,
            label: "本地实测记录",
            detail: "仅对应所列案例",
            icon: ShieldCheck,
          },
          {
            value: hints,
            label: "使用课程提示",
            detail: "提示不隐藏记录",
            icon: Lightbulb,
          },
        ].map(({ value, label, detail, icon: Icon }) => (
          <div key={label}>
            <Icon size={20} />
            <strong>{String(value).padStart(2, "0")}</strong>
            <span>{label}</span>
            <small>{detail}</small>
          </div>
        ))}
      </div>
      <div className="notice">
        <ShieldCheck size={20} />
        <span>
          当前阶段始终以仓库为准：<strong>Stage 01 · 学习中</strong>
          。本页记录不会覆盖真实学习进度，参考代码也不作为个人掌握证据。
        </span>
        <a href="#/document/progress-source" className="text-link">
          查看原文 <ArrowUpRight size={15} />
        </a>
      </div>
      <div className="review-grid">
        <section>
          <SectionTitle index="01" title="独立练习，分别看待" />
          <div className="evidence-table">
            <div className="evidence-table-head">
              <span>练习</span>
              <span>尝试 / 帮助 / 实测</span>
            </div>
            {catalog.exercises.map((exercise) => (
              <a
                className="evidence-row"
                href={labLink(exercise.id)}
                key={exercise.id}
              >
                <div>
                  <strong>{exercise.title}</strong>
                  <small>
                    {state.drafts[exercise.id]
                      ? dateLabel(state.drafts[exercise.id].updatedAt)
                      : "还没有代码尝试"}
                  </small>
                </div>
                <div className="evidence-tags">
                  <Badge>
                    {state.drafts[exercise.id] ? "有草稿" : "待尝试"}
                  </Badge>
                  {state.hints[exercise.id] ? (
                    <Badge tone="warning">
                      提示 L{state.hints[exercise.id]}
                    </Badge>
                  ) : (
                    <Badge>未用提示</Badge>
                  )}
                  {state.referenceViews[exercise.id] && (
                    <Badge tone="warning">已看参考</Badge>
                  )}
                  {state.evidence.some(
                    (item) => item.exerciseId === exercise.id,
                  ) && <Badge tone="current">有实测记录</Badge>}
                </div>
                <ChevronRight size={16} />
              </a>
            ))}
          </div>
          <SectionTitle index="02" title="预测与心智模型" />
          <div className="prediction-records">
            {catalog.predictions.map((item) => (
              <a href={`#/practice/${item.id}`} key={item.id}>
                <span>{item.id}</span>
                <strong>{item.title}</strong>
                <Badge
                  tone={state.predictions[item.id]?.correct ? "current" : ""}
                >
                  {!state.predictions[item.id]
                    ? "待预测"
                    : state.predictions[item.id].correct
                      ? "预测正确"
                      : "再想一遍"}
                </Badge>
                {state.referenceViews[item.id] && <small>已看解析</small>}
              </a>
            ))}
          </div>
        </section>
        <aside>
          <SectionTitle index="03" title="最近的理解与疑问" />
          {reflections.length === 0 ? (
            <div className="empty-reflection">
              <Braces size={36} />
              <h3>这里，留给你的发现。</h3>
              <p>在题目下方写下错误、原因和下一步，下一次从这里接上思路。</p>
              <a className="text-link" href={labLink()}>
                去尝试第一道练习 <ArrowRight size={15} />
              </a>
            </div>
          ) : (
            reflections.map(([id, item]) => (
              <article key={id} className="reflection-note">
                <header>
                  <span>
                    {catalog.exercises.find((entry) => entry.id === id)
                      ?.title ??
                      catalog.predictions.find((entry) => entry.id === id)
                        ?.title ??
                      id}
                  </span>
                  <small>{dateLabel(item.updatedAt)}</small>
                </header>
                {item.needsReview && <Badge tone="warning">需要复习</Badge>}
                {item.error && (
                  <p>
                    <strong>遇见</strong>
                    {item.error}
                  </p>
                )}
                {item.understanding && (
                  <p>
                    <strong>理解</strong>
                    {item.understanding}
                  </p>
                )}
                {item.nextStep && (
                  <p>
                    <strong>下一步</strong>
                    {item.nextStep}
                  </p>
                )}
                <a
                  className="text-link"
                  href={
                    catalog.exercises.some((entry) => entry.id === id)
                      ? labLink(id)
                      : `#/practice/${id}`
                  }
                >
                  返回现场 <ArrowUpRight size={14} />
                </a>
              </article>
            ))
          )}
        </aside>
      </div>
    </>
  );
}

function TutorDialog({
  state,
  change,
  exercise,
  onClose,
}: PageProps & { exercise: Exercise; onClose: () => void }) {
  const [mode, setMode] = useState<"hint" | "debug" | "review">("hint");
  const [error, setError] = useState("");
  const level = state.hints[exercise.id] ?? 0;
  return (
    <Dialog title="课程辅导" onClose={onClose} drawer>
      <div className="tutor-intro">
        <span className="tutor-symbol">
          <Sparkles size={22} />
        </span>
        <div>
          <strong>把下一步，留给你来写。</strong>
          <p>内置课程提示 · 未连接真实 AI 服务</p>
        </div>
      </div>
      <p className="fine-print">
        当前上下文：{exercise.title}。依据仓库教学协作细则，不生成完整实现。
      </p>
      <div className="tabs" role="tablist" aria-label="辅导模式">
        {[
          { id: "hint", label: "分级提示" },
          { id: "debug", label: "Debug 引导" },
          { id: "review", label: "Review 清单" },
        ].map((item) => (
          <button
            key={item.id}
            role="tab"
            aria-selected={mode === item.id}
            onClick={() => setMode(item.id as typeof mode)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {mode === "hint" ? (
        <>
          <div className="hint-ladder">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className={`hint-step ${level >= item ? "unlocked" : ""}`}
              >
                <div className="hint-step-label">
                  <span>L{item}</span>
                  <strong>
                    {["理解问题", "相关知识", "结构思路", "调试线索"][item - 1]}
                  </strong>
                  {level >= item ? <Check size={16} /> : <Circle size={16} />}
                </div>
                {level >= item ? (
                  <Markdown
                    text={courseTutor.hint(exercise.hints, item as HintLevel)}
                    sourcePath={exercise.sourcePath}
                  />
                ) : (
                  <p>先尝试上一级，再决定是否需要更具体的帮助。</p>
                )}
              </div>
            ))}
          </div>
          <button
            className="button primary full-width"
            disabled={level >= 4}
            onClick={() =>
              change((current) => ({
                ...current,
                hints: {
                  ...current.hints,
                  [exercise.id]: Math.min(4, level + 1),
                },
              }))
            }
          >
            {level >= 4
              ? "L1–L4 已全部解锁"
              : `解锁 L${level + 1} · ${["理解问题", "相关知识", "结构思路", "调试线索"][level]}`}
            <ArrowRight size={17} />
          </button>
          <p className="fine-print">
            使用过的提示会记录到复盘页。解锁不会把答案填进编辑器。
          </p>
          {exercise.note && <p className="notice warning">{exercise.note}</p>}
        </>
      ) : mode === "debug" ? (
        <>
          <label className="field-label" htmlFor="debug-error">
            粘贴你的真实错误
          </label>
          <textarea
            id="debug-error"
            className="prediction-input"
            value={error}
            onChange={(event) => setError(event.target.value)}
            placeholder="异常类型、错误消息和自己类名的行号…"
          />
          <ol className="debug-steps">
            {courseTutor.debug(error).map((step, index) => (
              <li key={step}>
                <span>0{index + 1}</span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
          <p className="fine-print">
            这是固定课程引导，不会自动分析或改写你的源码。
          </p>
        </>
      ) : (
        <>
          <p>
            按当前 Stage
            的能力逐层自查。每个结论记录文件、行号和一句自己的解释。
          </p>
          <div className="review-checklist">
            {courseTutor.review().map((item) => (
              <div key={item.priority}>
                <Badge>{item.priority}</Badge>
                <div>
                  <h3>{item.label}</h3>
                  <p>{item.prompt}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      <a
        className="text-link"
        href="#/document/teaching-rules"
        onClick={onClose}
      >
        教学行为依据 <ArrowUpRight size={15} />
      </a>
    </Dialog>
  );
}

function DataDialog({
  state,
  onClose,
  onImport,
  notify,
}: {
  state: LearningState;
  onClose: () => void;
  onImport: (state: LearningState) => void;
  notify: (message: string) => void;
}) {
  const [incoming, setIncoming] = useState<LearningState | null>(null);
  const [mode, setMode] = useState<"merge" | "replace">("merge");
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const readFile = async (file?: File) => {
    if (!file) return;
    try {
      if (file.size > 10_000_000)
        throw new Error("文件超过 10 MB，已拒绝读取。");
      setIncoming(validateBackup(JSON.parse(await file.text())));
      setError("");
    } catch (err) {
      setIncoming(null);
      setError(String(err));
    } finally {
      if (input.current) input.current.value = "";
    }
  };
  const doImport = () => {
    if (!incoming) return;
    try {
      const next = mode === "merge" ? mergeBackup(state, incoming) : incoming;
      if (mode === "replace")
        download(
          `javaroadmap-before-restore-${Date.now()}.backup.json`,
          exportBackup(state),
        );
      onImport({ ...next, updatedAt: timestamp() });
      onClose();
    } catch (err) {
      setError(String(err));
    }
  };
  const conflicts = incoming
    ? Object.keys(incoming.drafts).filter(
        (id) =>
          state.drafts[id] &&
          state.drafts[id].code !== incoming.drafts[id].code,
      ).length
    : 0;
  return (
    <Dialog title="学习数据与备份" onClose={onClose}>
      <div className="data-intro">
        <FileJson size={30} />
        <p>
          数据只保存在此浏览器。Windows 与 Mac
          通过文件导出、导入恢复；没有自动云同步。
        </p>
      </div>
      <div className="backup-summary">
        <span>
          数据格式 <b>v1</b>
        </span>
        <span>
          代码草稿 <b>{Object.keys(state.drafts).length}</b>
        </span>
        <span>
          实测记录 <b>{state.evidence.length}</b>
        </span>
      </div>
      <div className="backup-actions">
        <button
          className="button primary"
          onClick={() => {
            try {
              download(
                `javaroadmap-${new Date().toISOString().slice(0, 10)}.backup.json`,
                exportBackup(state),
              );
              notify("已导出学习记录，文件包含你的源码和复盘，请妥善保存。");
            } catch (err) {
              setError(String(err));
            }
          }}
        >
          <ArrowDownToLine size={17} />
          导出完整备份
        </button>
        <button
          className="button secondary"
          onClick={() => input.current?.click()}
        >
          <Upload size={17} />
          选择备份文件
        </button>
        <input
          type="file"
          hidden
          ref={input}
          accept="application/json,.json"
          aria-label="选择学习备份文件"
          onChange={(event) => {
            void readFile(event.target.files?.[0]);
          }}
        />
      </div>
      {incoming && (
        <div className="import-preview">
          <h3>先核对，再恢复</h3>
          <p>
            备份时间：{dateLabel(incoming.updatedAt)} ·{" "}
            {Object.keys(incoming.drafts).length} 份草稿 ·{" "}
            {incoming.evidence.length} 份实测记录。
          </p>
          <label className="radio-card">
            <input
              type="radio"
              name="import-mode"
              checked={mode === "merge"}
              onChange={() => setMode("merge")}
            />
            <span>
              <strong>合并记录</strong>
              <small>
                相同草稿保留时间较新的版本；提示保留最高等级，验证记录按 ID
                去重。
              </small>
            </span>
          </label>
          <label className="radio-card">
            <input
              type="radio"
              name="import-mode"
              checked={mode === "replace"}
              onChange={() => setMode("replace")}
            />
            <span>
              <strong>替换当前记录</strong>
              <small>先下载当前记录备份，再用导入内容整体恢复。</small>
            </span>
          </label>
          {conflicts > 0 && (
            <p className="notice warning">
              有 {conflicts}{" "}
              份同名草稿内容不同。合并将保留较新版本；先导出完整备份可保留两份原始记录。
            </p>
          )}
          <button className="button primary full-width" onClick={doImport}>
            {mode === "merge" ? "确认合并学习记录" : "备份并确认替换记录"}
          </button>
        </div>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <p className="fine-print">
        备份经过版本、字段、大小和结果一致性校验。损坏或不兼容的备份不会导入；此操作不会改写仓库学习进度。隐私模式与清理站点数据可能删除本地记录。
      </p>
    </Dialog>
  );
}

function ReferenceDialog({
  path,
  change,
  onClose,
}: {
  path: string;
  change: Change;
  onClose: () => void;
}) {
  const [resource, setResource] = useState<{
    content: string;
    language: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const unlock = async () => {
    setError("");
    setLoading(true);
    try {
      const reference = catalog.references.find(
        (item) => item.sourcePath === path,
      );
      if (!reference) throw new Error("参考资源不在当前内容清单中。");
      const response = await fetch(
        `${import.meta.env.BASE_URL}${reference.url}`,
      );
      if (!response.ok)
        throw new Error(`参考资源读取失败 (${response.status})`);
      const data: unknown = await response.json();
      if (
        !data ||
        typeof data !== "object" ||
        !("content" in data) ||
        typeof data.content !== "string" ||
        !("language" in data) ||
        typeof data.language !== "string"
      )
        throw new Error("参考资源格式错误。");
      setResource({ content: data.content, language: data.language });
      change((current) => {
        const views = { ...current.referenceViews };
        const stamp = timestamp();
        catalog.exercises
          .filter((item) => item.referencePaths.includes(path))
          .forEach((item) => {
            views[item.id] = stamp;
          });
        catalog.modifications
          .filter((item) => item.referencePaths.includes(path))
          .forEach((item) => {
            views[item.id] = stamp;
          });
        if (path.endsWith("/MenuDemoApp.java")) views.menu = stamp;
        if (path.endsWith("/SimpleCalculatorApp.java"))
          views.calculator = stamp;
        if (path.endsWith("/practice/answers.md"))
          catalog.predictions.forEach((item) => {
            views[item.id] = stamp;
          });
        return { ...current, referenceViews: views };
      });
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };
  return (
    <Dialog
      title={resource ? "参考实现 · 已主动解锁" : "先保留自己的尝试"}
      onClose={onClose}
    >
      <p className="source-path">{path}</p>
      {!resource ? (
        <>
          <p>
            这是参考答案，不会写入你的草稿。查看会单独记录，也不会被计为独立完成。
          </p>
          <p>先想一想：你已经尝试了哪一部分？接下来准备比较哪个差异？</p>
          <button
            className="button primary"
            onClick={() => {
              void unlock();
            }}
            disabled={loading}
          >
            {loading ? "正在读取…" : "我确认查看参考答案"}
            <ArrowRight size={17} />
          </button>
        </>
      ) : resource.language === "java" ? (
        <Code code={resource.content} />
      ) : (
        <Markdown text={resource.content} sourcePath={path} />
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </Dialog>
  );
}
