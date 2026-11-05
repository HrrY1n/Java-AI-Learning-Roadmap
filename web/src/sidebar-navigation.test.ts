import { describe, expect, it } from "vitest";
import { getActiveNavigationGroup } from "./components/SidebarNavigation";
import { catalog } from "./catalog";

describe("侧边导航分组推导", () => {
  it("首页属于主要入口", () => {
    expect(getActiveNavigationGroup({ page: "home", id: "" })).toContain("primary");
  });

  it("学习路线与主线课程属于 Java 主线", () => {
    expect(getActiveNavigationGroup({ page: "roadmap", id: "" })).toContain("mainline");
    expect(getActiveNavigationGroup({ page: "lesson", id: "day01" })).toContain("mainline");
  });

  it("专题 Hub 与深链接属于专题课程", () => {
    expect(getActiveNavigationGroup({ page: "topics", id: "" })).toContain("topics");
    expect(
      getActiveNavigationGroup({
        page: "topic",
        id: "topic-algo",
        subId: "algo-bst",
      }),
    ).toContain("topics");
  });

  it("实验室、预测归入动手实践，学习记录归入主要入口，底稿归入资料", () => {
    expect(getActiveNavigationGroup({ page: "lab", id: "scores" })).toContain("practice");
    expect(getActiveNavigationGroup({ page: "practice", id: "A1" })).toContain("practice");
    expect(getActiveNavigationGroup({ page: "review", id: "" })).toContain("primary");
    expect(getActiveNavigationGroup({ page: "document", id: "execution-plan" })).toContain("resources");
  });

  it("每个专题都有可直达的已发布首课", () => {
    for (const topic of catalog.topics) {
      const first = topic.modules
        .flatMap((module) => module.lessons)
        .find((lesson) => lesson.status === "published");
      expect(first?.id, `${topic.id} 缺少已发布课程`).toBeTruthy();
    }
  });
});
