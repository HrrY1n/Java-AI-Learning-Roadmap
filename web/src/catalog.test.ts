import { describe, expect, it } from "vitest";
import { resolveSourcePath, sourceHref } from "./catalog";

describe("源课程导航", () => {
  it("映射课程与文档，并拒绝损坏和非网页协议", () => {
    expect(
      sourceHref(
        "../../deep_dives/02_integer_division/README.md",
        "stages/stage01_java_basics/existing_course/exercises/basic_syntax_exercises.md",
      ),
    ).toBe("#/lesson/deep02");
    expect(sourceHref("学习执行计划.md", "README.md")).toBe(
      "#/document/execution-plan",
    );
    expect(sourceHref("https://example.com/a", "README.md")).toBe(
      "https://example.com/a",
    );
    for (const input of [
      "javascript:alert(1)",
      "data:text/html,test",
      "file:///secret",
      "//evil.test",
      "foo%ZZ.md",
    ]) {
      expect(resolveSourcePath(input, "README.md")).toBe("");
      expect(sourceHref(input, "README.md")).toBe("#/home");
    }
  });
});
