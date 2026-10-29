import { describe, expect, it } from "vitest";
import {
  checkPrediction,
  courseTutor,
  localExecutor,
  normalizeOutput,
  sha256,
  unconfiguredModelTutor,
} from "./services";

describe("确定性输出比较", () => {
  it("仅归一平台换行、行末空格和末尾一次换行", () => {
    expect(normalizeOutput("3 / 1  \r\n3.5\t\r\n")).toBe("3 / 1\n3.5");
    expect(checkPrediction("3 / 1\r\n3.5\n", "3 / 1\n3.5")).toBe(true);
    expect(checkPrediction(" 3 / 1\n3.5", "3 / 1\n3.5")).toBe(false);
    expect(checkPrediction("3 / 1\n\n3.5", "3 / 1\n3.5")).toBe(false);
    expect(checkPrediction("3 / 1\n3.5\n\n", "3 / 1\n3.5")).toBe(false);
  });
  it("Unicode 源码指纹由 UTF-8 字节决定", async () => {
    expect(await sha256("你好 Java")).toBe(
      "81c187f3c2b740c70bfd56df1b1fc3ae6bca75e0948803259c4f25a8eeabf5a3",
    );
    expect(await sha256("a\n")).not.toBe(await sha256("a\r\n"));
  });
});

describe("诚实的服务能力", () => {
  it("没有执行器和模型时明确拒绝调用", async () => {
    expect(localExecutor.available).toBe(false);
    await expect(
      localExecutor.run({ exerciseId: "exercise1", source: "", input: "" }),
    ).rejects.toThrow("本地 JDK");
    expect(unconfiguredModelTutor.available).toBe(false);
    await expect(
      unconfiguredModelTutor.respond({
        lessonId: "day01",
        mode: "hint",
        question: "提示",
      }),
    ).rejects.toThrow("课程提示");
  });
  it("课程提示只返回请求等级，Debug 与 Review 给验证动作而不重写代码", () => {
    expect(courseTutor.mode).toBe("course");
    expect(courseTutor.hint(["理解", "知识", "结构", "调试"], 2)).toBe("知识");
    expect(() => courseTutor.hint([], 4)).toThrow("尚无");
    expect(courseTutor.debug("ArrayIndexOutOfBoundsException")).toHaveLength(5);
    expect(courseTutor.review().map((item) => item.priority)).toEqual([
      "P0",
      "P1",
      "P2",
      "P3",
      "P4",
    ]);
  });
});
