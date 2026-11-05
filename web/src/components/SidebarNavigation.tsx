// 侧边导航信息架构：按用户学习场景分组，复用现有 hash 路由，不改变课程 ID。
// 仅做导航组织与视觉呈现；分组展开状态由当前路由派生，不写入学习记录。
import { useEffect, useRef } from "react";
import {
  Binary,
  BookOpen,
  ChevronRight,
  Code2,
  FileText,
  FolderOpen,
  GitBranch,
  GraduationCap,
  HardDrive,
  Home,
  Layers3,
  Lightbulb,
  ListTree,
  Network,
  ShieldCheck,
  Sparkles,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { catalog } from "../catalog";
import type { Stage } from "../content-types";
import type { LearningState } from "../lib/learning-store";

const lessonLink = (id = "day01") => `#/lesson/${id}`;
const labLink = (id = "scores") => `#/lab/${id}`;

type Route = { page: string; id: string; subId?: string };

type NavLeaf = {
  id: string;
  label: string;
  hint?: string;
  href: string;
  icon?: LucideIcon;
  indexBadge?: string;
  active?: boolean;
  isRead?: boolean;
};

type NavGroup = {
  id: string;
  label: string;
  items: NavLeaf[];
  defaultOpen?: boolean;
  forceOpen?: boolean;
  dividerAfter?: boolean;
};

function topicFirstLesson(id: string): string {
  return (
    catalog.topics
      .find((topic) => topic.id === id)
      ?.modules.flatMap((module) => module.lessons)
      .find((lesson) => lesson.status === "published")?.id ?? ""
  );
}

function stageFirstLesson(id: string): string {
  return catalog.lessons.find((lesson) => lesson.stageId === id)?.id ?? "day01";
}

function currentTopicId(route: Route): string {
  return route.page === "topic" ? route.id || "" : "";
}

function currentLessonStageId(route: Route): string {
  if (route.page !== "lesson") return "";
  return (
    catalog.lessons.find((lesson) => lesson.id === route.id)?.stageId ?? ""
  );
}

function isTopicActive(route: Route, topicId: string): boolean {
  return route.page === "topic" && currentTopicId(route) === topicId;
}

function isStageActive(route: Route, stageId: string): boolean {
  return route.page === "lesson" && currentLessonStageId(route) === stageId;
}

// 把当前路由映射到所属分组，保证深链接、刷新、前进后退、搜索跳转都能自动展开。
function activeGroupIds(route: Route): Set<string> {
  const ids = new Set<string>();
  if (route.page === "home") ids.add("primary");
  if (["roadmap", "lesson"].includes(route.page)) ids.add("mainline");
  if (["topics", "topic"].includes(route.page)) ids.add("topics");
  if (["lab", "practice"].includes(route.page)) ids.add("practice");
  if (route.page === "review") ids.add("primary");
  if (route.page === "document") ids.add("resources");
  return ids;
}

function findScrollParent(element: HTMLElement | null): HTMLElement | null {
  let node = element?.parentElement ?? null;
  while (node) {
    const style = getComputedStyle(node);
    if (
      /(auto|scroll)/.test(style.overflowY) &&
      node.scrollHeight > node.clientHeight + 1
    )
      return node;
    node = node.parentElement;
  }
  return null;
}

function NavItem({
  item,
  nested = false,
  close,
}: {
  item: NavLeaf;
  nested?: boolean;
  close?: () => void;
}) {
  const IconComponent = item.icon;
  return (
    <a
      className={`nav-item${nested ? " nav-item-nested" : ""}${item.active ? " active" : ""}`}
      href={item.href}
      onClick={close}
      aria-current={item.active ? "page" : undefined}
    >
      {IconComponent ? (
        <IconComponent size={17} className="nav-item-icon" />
      ) : item.indexBadge ? (
        <span className="nav-item-index" aria-hidden="true">
          {item.indexBadge}
        </span>
      ) : (
        <span className="nav-item-bullet" aria-hidden="true" />
      )}
      <span className="nav-item-label">{item.label}</span>
      {item.isRead && (
        <span className="nav-item-read" aria-label="已阅读">
          ✓
        </span>
      )}
      {item.hint && <span className="nav-item-hint">{item.hint}</span>}
    </a>
  );
}

function NavGroupBlock({
  group,
  route,
  close,
}: {
  group: NavGroup;
  route: Route;
  close?: () => void;
}) {
  const activeGroups = activeGroupIds(route);
  const hasActive = group.items.some((item) => item.active);
  const shouldOpen =
    Boolean(group.forceOpen) ||
    Boolean(group.defaultOpen) ||
    activeGroups.has(group.id) ||
    hasActive;
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (detailsRef.current) detailsRef.current.open = shouldOpen;
  }, [shouldOpen, route.page, route.id, route.subId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!hasActive || !activeRef.current) return;
      const scroller = findScrollParent(activeRef.current);
      if (!scroller) return;
      const itemRect = activeRef.current.getBoundingClientRect();
      const scrollRect = scroller.getBoundingClientRect();
      if (itemRect.top < scrollRect.top) {
        scroller.scrollTop -= scrollRect.top - itemRect.top + 8;
      } else if (itemRect.bottom > scrollRect.bottom) {
        scroller.scrollTop += itemRect.bottom - scrollRect.bottom + 8;
      }
    }, 80);
    return () => window.clearTimeout(timer);
  }, [hasActive, route.page, route.id, route.subId]);

  if (group.forceOpen) {
    return (
      <section
        className={`nav-group nav-group-static${group.dividerAfter ? " nav-group-divider" : ""}`}
      >
        <div className="nav-group-static-title">
          <span className="nav-group-dot" />
          <span>{group.label}</span>
        </div>
        <div className="nav-group-items">
          {group.items.map((item) => (
            <div key={item.id} ref={item.active ? activeRef : undefined}>
              <NavItem item={item} close={close} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className={`nav-group${group.dividerAfter ? " nav-group-divider" : ""}`}>
      <details ref={detailsRef} open={shouldOpen} className="nav-group-details">
        <summary>
          <span className="nav-group-dot" />
          <span>{group.label}</span>
          <ChevronRight size={13} className="nav-group-chevron" />
        </summary>
        <div className="nav-group-items">
          {group.items.map((item) => (
            <div key={item.id} ref={item.active ? activeRef : undefined}>
              <NavItem item={item} nested close={close} />
            </div>
          ))}
        </div>
      </details>
    </section>
  );
}

function groupedNavigation(
  route: Route,
  state: LearningState,
  currentStage: Stage,
): { primaryGroup: NavGroup; middleGroups: NavGroup[] } {
  const topicHrefs: Record<string, string> = {
    "topic-algo": `#/topic/topic-algo/${topicFirstLesson("topic-algo")}`,
    "topic-git": `#/topic/topic-git/${topicFirstLesson("topic-git")}`,
    "topic-csapp": `#/topic/topic-csapp/${topicFirstLesson("topic-csapp")}`,
    "topic-ostep": `#/topic/topic-ostep/${topicFirstLesson("topic-ostep")}`,
    "topic-network": `#/topic/topic-network/${topicFirstLesson("topic-network")}`,
  };
  const topicIcons: Record<string, LucideIcon> = {
    "topic-algo": Binary,
    "topic-git": GitBranch,
    "topic-csapp": Layers3,
    "topic-ostep": HardDrive,
    "topic-network": Network,
  };
  const topicLabels: Record<string, string> = {
    "topic-algo": "Hello 算法",
    "topic-git": "Pro Git",
    "topic-csapp": "计算机系统要素",
    "topic-ostep": "操作系统导论",
    "topic-network": "计算机网络",
  };
  const onJavaBook = catalog.booksIndex.find(
    (book) => book.topicId === "mainline-java",
  );

  // 1. 顶部主要入口：保持 5 大核心支柱原有名词与路由，E2E 测试与书签 100% 兼容
  const primaryItems: NavLeaf[] = [
    {
      id: "primary-home",
      label: "学习工作台",
      href: "#/home",
      icon: Home,
      active: route.page === "home",
    },
    {
      id: "primary-roadmap",
      label: "学习路线",
      href: "#/roadmap",
      icon: ListTree,
      active: route.page === "roadmap",
    },
    {
      id: "primary-topics",
      label: "专题学习",
      href: "#/topics",
      icon: Binary,
      active: route.page === "topics",
    },
    {
      id: "primary-lab",
      label: "编程实验室",
      href: labLink(),
      icon: Code2,
      active: route.page === "lab" && !route.id,
    },
    {
      id: "primary-review",
      label: "学习记录",
      href: "#/review",
      icon: FolderOpen,
      active: route.page === "review",
    },
  ];

  // 2. 中部区域 - 专题学科教材
  const topicItems: NavLeaf[] = catalog.topics.map((topic) => {
    const count = topic.modules
      .flatMap((module) => module.lessons)
      .filter((lesson) => lesson.status === "published").length;
    return {
      id: `topic-${topic.id}`,
      label: topicLabels[topic.id] ?? topic.title,
      href: topicHrefs[topic.id] ?? "#/topics",
      icon: topicIcons[topic.id] ?? BookOpen,
      hint: `${count} 节`,
      active: isTopicActive(route, topic.id),
    };
  });

  // 3. 中部区域 - Java 主线课程
  const currentLesson =
    route.page === "lesson"
      ? catalog.lessons.find((lesson) => lesson.id === route.id)
      : undefined;
  const activeStageId = currentLesson?.stageId ?? currentStage.id;

  const publishedStages = catalog.stages.filter(
    (stage) =>
      catalog.lessons.some((lesson) => lesson.stageId === stage.id) ||
      stage.status === "学习中",
  );

  const stageLeaves: NavLeaf[] = publishedStages.map((stage) => {
    const stageLessons = catalog.lessons.filter(
      (lesson) => lesson.stageId === stage.id,
    );
    const isThisStageActive = isStageActive(route, stage.id);
    return {
      id: `stage-${stage.id}`,
      label: `Stage ${stage.id} · ${stage.title}`,
      hint: `${stageLessons.length} 课`,
      href: lessonLink(stageFirstLesson(stage.id)),
      icon: GraduationCap,
      active: isThisStageActive && !currentLesson,
    };
  });

  // 当前正在学习或阅读的 Stage：展开列出该 Stage 的课程列表，并高亮当前课
  const activeStageLessons = catalog.lessons.filter(
    (lesson) => lesson.stageId === activeStageId,
  );
  const currentStageLessonLeaves: NavLeaf[] =
    route.page === "lesson"
      ? activeStageLessons.map((lesson, idx) => ({
          id: `lesson-${lesson.id}`,
          label: lesson.title,
          href: lessonLink(lesson.id),
          indexBadge: String(idx + 1).padStart(2, "0"),
          active: route.id === lesson.id,
          isRead: Boolean(state.lessons[lesson.id]?.read),
        }))
      : [];

  const mainlineItems: NavLeaf[] = [
    ...stageLeaves,
    {
      id: "mainline-all-stages",
      label: "14 个阶段路线全貌",
      href: "#/roadmap",
      icon: ListTree,
      active: route.page === "roadmap",
    },
    ...currentStageLessonLeaves,
  ];

  // 4. 中部区域 - 动手与实践
  const practiceItems: NavLeaf[] = [
    {
      id: "practice-scores",
      label: "练习 01 · 成绩统计",
      href: labLink("scores"),
      icon: Code2,
      active: route.page === "lab" && (route.id === "scores" || !route.id),
    },
    {
      id: "practice-bank",
      label: "练习 02 · 银行账户守门",
      href: labLink("s02-bank-account"),
      icon: Code2,
      active: route.page === "lab" && route.id === "s02-bank-account",
    },
    {
      id: "practice-predict",
      label: "预测与条件修改",
      href: "#/practice",
      icon: Sparkles,
      hint: `${catalog.predictions.length + catalog.modifications.length} 项`,
      active: route.page === "practice",
    },
  ];

  // 5. 中部区域 - 资料与底稿
  const resourceItems: NavLeaf[] = [
    {
      id: "resource-execution-plan",
      label: "学习执行计划",
      href: "#/document/execution-plan",
      icon: FileText,
      active: route.page === "document" && route.id === "execution-plan",
    },
    {
      id: "resource-roadmap-source",
      label: "路线底稿 (统一路线)",
      href: "#/document/roadmap-source",
      icon: ListTree,
      active: route.page === "document" && route.id === "roadmap-source",
    },
    {
      id: "resource-progress-source",
      label: "真实进度底稿",
      href: "#/document/progress-source",
      icon: ShieldCheck,
      active: route.page === "document" && route.id === "progress-source",
    },
    {
      id: "resource-on-java",
      label: "On Java 8 延伸",
      href: onJavaBook ? `#/topics/book/${onJavaBook.id}` : "#/lesson/day01",
      icon: BookOpen,
      active:
        route.page === "topics" &&
        route.id === "book" &&
        route.subId === onJavaBook?.id,
    },
    {
      id: "resource-teaching-rules",
      label: "教学协作细则",
      href: "#/document/teaching-rules",
      icon: Wrench,
      active: route.page === "document" && route.id === "teaching-rules",
    },
    {
      id: "resource-environment",
      label: "环境搭建与排查",
      href: "#/document/environment",
      icon: Wrench,
      active:
        route.page === "document" &&
        ["environment", "troubleshooting"].includes(route.id),
    },
  ];

  const primaryGroup: NavGroup = {
    id: "primary",
    label: "主要入口",
    forceOpen: true,
    items: primaryItems,
    dividerAfter: true,
  };

  const middleGroups: NavGroup[] = [
    {
      id: "mainline",
      label: "Java 主线",
      defaultOpen: true,
      items: mainlineItems,
      dividerAfter: true,
    },
    {
      id: "topics",
      label: "专题课程",
      defaultOpen: true,
      items: topicItems,
      dividerAfter: true,
    },
    {
      id: "practice",
      label: "动手实践",
      defaultOpen: true,
      items: practiceItems,
      dividerAfter: true,
    },
    {
      id: "resources",
      label: "资料与底稿",
      defaultOpen: false,
      items: resourceItems,
    },
  ];

  return { primaryGroup, middleGroups };
}

export function SidebarNavigation({
  route,
  state,
  currentStage,
  close,
  compact = false,
}: {
  route: Route;
  state: LearningState;
  currentStage: Stage;
  close?: () => void;
  compact?: boolean;
}) {
  const { primaryGroup, middleGroups } = groupedNavigation(
    route,
    state,
    currentStage,
  );
  const activeCount = [
    ...primaryGroup.items,
    ...middleGroups.flatMap((group) => group.items),
  ].filter((item) => item.active).length;

  return (
    <div className={`nav-shell${compact ? " nav-shell-compact" : ""}`}>
      {/* 顶部区域：主要入口固定在顶部，不随中部滚动 */}
      <NavGroupBlock group={primaryGroup} route={route} close={close} />

      {/* 中部区域：场景分组独立滚动 */}
      <div className="nav-scroll" aria-label="学习入口导航">
        {middleGroups.map((group) => (
          <NavGroupBlock
            key={group.id}
            group={group}
            route={route}
            close={close}
          />
        ))}

        {/* 教学原则轻提示：位于滚动列表末尾，不挤占小屏幕顶部或底部空间 */}
        <a
          className="nav-principle-card"
          href="#/document/teaching-rules"
          onClick={close}
        >
          <Lightbulb size={16} />
          <div>
            <strong>先思考，再向提示靠近。</strong>
            <small>AI 教你写，不替你写。</small>
          </div>
        </a>
      </div>

      <p className="nav-sr" aria-live="polite">
        当前共有 {activeCount} 个选中学习入口
      </p>
    </div>
  );
}

export type { Route, NavGroup, NavLeaf };

export function getActiveNavigationGroup(route: Route): string[] {
  return [...activeGroupIds(route)];
}
