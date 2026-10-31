import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import {
  createInitialState,
  exportBackup,
  importEvidence,
  loadState,
  mergeBackup,
  saveState,
  validateBackup,
  validateEvidence,
  type Evidence,
} from "./learning-store";
import { sha256 } from "./services";

const early = "2026-10-29T08:00:00.000Z";
const late = "2026-10-30T08:00:00.000Z";
function evidence(): Evidence {
  return {
    id: "run-1",
    exerciseId: "exercise1",
    sourceHash: "a".repeat(64),
    createdAt: late,
    origin: "local-jdk",
    command:
      "javac -encoding UTF-8 -d out App.java && java -cp out lab.exercise1.App",
    javaVersion: "javac 25",
    cases: [
      {
        label: "正常",
        input: "",
        expected: "402",
        stdout: "402\r\n",
        stderr: "",
        exitCode: 0,
        passed: true,
        match: "exact",
      },
    ],
    allPassed: true,
  };
}

describe("版本化备份验证", () => {
  it("完整数据可往返且不会保留可变引用", () => {
    const source = createInitialState();
    source.drafts.exercise1 = { code: "// 我的代码\n", updatedAt: early };
    source.lessons.day01 = { read: true, position: 0.4, updatedAt: early };
    source.evidence = [evidence()];
    const restored = validateBackup(
      JSON.parse(exportBackup(source)) as unknown,
    );
    expect(restored).toEqual(source);
    restored.drafts.exercise1!.code = "改变";
    expect(source.drafts.exercise1!.code).toBe("// 我的代码\n");
  });
  it("拒绝未来版本、缺字段、坏日期与越界值", () => {
    expect(() =>
      validateBackup({ ...createInitialState(), schemaVersion: 2 }),
    ).toThrow("版本");
    expect(() => validateBackup({ schemaVersion: 1 })).toThrow("字段");
    expect(() =>
      validateBackup({
        ...createInitialState(),
        updatedAt: "2026-02-31T00:00:00Z",
      }),
    ).toThrow("日期");
    expect(() =>
      validateBackup({ ...createInitialState(), hints: { exercise1: 5 } }),
    ).toThrow("范围");
    expect(() =>
      validateBackup({
        ...createInitialState(),
        lessons: { day01: { read: true, position: 101, updatedAt: early } },
      }),
    ).toThrow("范围");
    expect(() =>
      validateBackup({
        ...createInitialState(),
        drafts: {
          exercise1: { code: "a".repeat(1_000_001), updatedAt: early },
        },
      }),
    ).toThrow("过长");
  });
  it("拒绝危险键、原型对象、重复证据和超量条目", () => {
    const poisoned = JSON.parse(exportBackup(createInitialState())) as Record<
      string,
      unknown
    >;
    poisoned.hints = JSON.parse('{"__proto__":2}') as unknown;
    expect(() => validateBackup(poisoned)).toThrow("保留字段");
    expect(() =>
      validateBackup(Object.create({ schemaVersion: 1 }) as unknown),
    ).toThrow("对象类型");
    expect(() =>
      validateBackup({
        ...createInitialState(),
        evidence: [evidence(), evidence()],
      }),
    ).toThrow("重复");
    expect(() =>
      validateBackup({
        ...createInitialState(),
        hints: Object.fromEntries(
          Array.from({ length: 501 }, (_, index) => [`e${index}`, 1]),
        ),
      }),
    ).toThrow("过多");
  });
  it("合并保留较新草稿、合并记录、累积提示而不重复证据", () => {
    const current = createInitialState();
    current.updatedAt = late;
    current.theme = "dark";
    current.drafts.exercise1 = { code: "当前", updatedAt: late };
    current.hints.exercise1 = 3;
    current.evidence = [evidence()];
    const incoming = createInitialState();
    incoming.updatedAt = early;
    incoming.drafts.exercise1 = { code: "旧备份", updatedAt: early };
    incoming.drafts.exercise2 = { code: "另一题", updatedAt: early };
    incoming.hints.exercise1 = 1;
    incoming.referenceViews.exercise1 = early;
    incoming.evidence = [evidence()];
    const merged = mergeBackup(current, incoming);
    expect(merged.drafts.exercise1!.code).toBe("当前");
    expect(merged.drafts.exercise2!.code).toBe("另一题");
    expect(merged.hints.exercise1).toBe(3);
    expect(merged.theme).toBe("dark");
    expect(merged.evidence).toHaveLength(1);
    expect(merged.referenceViews.exercise1).toBe(early);
    expect(current.drafts.exercise2).toBeUndefined();
  });
  it("相同验证 ID 的内容冲突时取消合并", () => {
    const a = createInitialState();
    const b = createInitialState();
    a.evidence = [evidence()];
    b.evidence = [{ ...evidence(), command: "different" }];
    expect(() => mergeBackup(a, b)).toThrow("内容冲突");
  });
});

describe("实测记录关联", () => {
  it("拒绝与实际输出或退出码矛盾的结果", () => {
    const input = evidence();
    input.cases[0]!.stdout = "错误";
    expect(() => validateEvidence(input)).toThrow("不一致");
    input.cases[0]!.stdout = "402";
    input.cases[0]!.exitCode = 1;
    expect(() => validateEvidence(input)).toThrow("不一致");
    input.cases[0]!.passed = false;
    expect(() => validateEvidence(input)).toThrow("总体");
    input.allPassed = false;
    expect(validateEvidence(input).allPassed).toBe(false);
  });
  it("只关联相同练习与源码指纹，修改草稿后必须重跑", async () => {
    const input = evidence();
    input.sourceHash = await sha256("我的源码\n");
    expect(await importEvidence(input, "exercise1", "我的源码\n")).toEqual(
      input,
    );
    await expect(
      importEvidence(input, "exercise2", "我的源码\n"),
    ).rejects.toThrow("另一道练习");
    await expect(
      importEvidence(input, "exercise1", "我的源码\r\n"),
    ).rejects.toThrow("指纹");
  });
  it("保留 Windows unsigned 32-bit 失败退出码，并拒绝空的包含断言", () => {
    const input = evidence();
    input.cases[0]!.exitCode = 4_294_967_295;
    input.cases[0]!.passed = false;
    input.allPassed = false;
    expect(validateEvidence(input).cases[0]!.exitCode).toBe(4_294_967_295);
    input.cases[0]!.match = "contains";
    input.cases[0]!.expected = "";
    expect(() => validateEvidence(input)).toThrow("不能为空");
  });
});

describe("IndexedDB 持久化", () => {
  beforeEach(async () => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase("javaroadmap-lab");
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });
  it("首次载入为空；串行保存后恢复最后快照", async () => {
    const first = await loadState();
    expect(first.drafts).toEqual({});
    first.drafts.exercise1 = { code: "第一次", updatedAt: early };
    const a = saveState(first);
    first.drafts.exercise1.code = "第二次";
    const b = saveState(first);
    await Promise.all([a, b]);
    expect((await loadState()).drafts.exercise1!.code).toBe("第二次");
  });
  it("损坏快照不会自动覆盖，读失败后保留原值", async () => {
    const request = indexedDB.open("javaroadmap-lab", 1);
    request.onupgradeneeded = () =>
      request.result.createObjectStore("learning");
    const database = await new Promise<IDBDatabase>((resolve) => {
      request.onsuccess = () => resolve(request.result);
    });
    await new Promise<void>((resolve) => {
      const transaction = database.transaction("learning", "readwrite");
      transaction
        .objectStore("learning")
        .put({ schemaVersion: 999 }, "snapshot");
      transaction.oncomplete = () => resolve();
    });
    database.close();
    await expect(loadState()).rejects.toThrow("版本");
    await expect(loadState()).rejects.toThrow("版本");
  });
  it("检测另一标签的更新，拒绝静默覆盖", async () => {
    const state = await loadState();
    await saveState(state);
    const request = indexedDB.open("javaroadmap-lab", 1);
    const database = await new Promise<IDBDatabase>((resolve) => {
      request.onsuccess = () => resolve(request.result);
    });
    await new Promise<void>((resolve) => {
      const transaction = database.transaction("learning", "readwrite");
      transaction.objectStore("learning").put("another-tab", "revision");
      transaction.oncomplete = () => resolve();
    });
    database.close();
    await expect(saveState(state)).rejects.toThrow("另一标签页");
  });
  it("无效的新快照返回可捕获的保存失败，保留最后有效草稿", async () => {
    const state = await loadState();
    state.drafts.scores = { code: "// 保留的草稿", updatedAt: late };
    await saveState(state);
    const invalid = {
      ...state,
      drafts: { scores: { code: "x".repeat(1_000_001), updatedAt: late } },
    };
    await expect(saveState(invalid)).rejects.toThrow("过长");
    expect((await loadState()).drafts.scores?.code).toBe("// 保留的草稿");
  });
});

describe("V1.1 学习数据兼容性（V1.2 内容架构不得破坏）", () => {
  // 这份备份模拟 V1.1（main@36046ee）时期真实导出的结构：
  // 课程/草稿/提示/预测/复盘/证据/参考查看全部以稳定 ID 为键。
  const v11Backup = {
    schemaVersion: 1,
    updatedAt: late,
    theme: "dark",
    lastLessonId: "day05",
    lessons: {
      day01: { read: true, position: 0.42, updatedAt: early },
      day05: { read: true, position: 0.1, updatedAt: late },
      deep02: { read: false, position: 0, updatedAt: early },
    },
    drafts: {
      scores: { code: "public class ScoreStatistics { }", updatedAt: late },
    },
    hints: { scores: 2, calculator: 1 },
    predictions: {
      A1: { answer: "3 / 1\n3.5", correct: true, attempts: 1, updatedAt: early },
      A5: { answer: "99", correct: true, attempts: 2, updatedAt: late },
    },
    reflections: {
      scores: {
        error: "空数组越界",
        understanding: "max 应初始化为 scores[0]",
        nextStep: "补空数组分支",
        needsReview: true,
        updatedAt: late,
      },
    },
    evidence: [
      {
        id: "run-scores-1",
        exerciseId: "scores",
        sourceHash: "a".repeat(64),
        createdAt: late,
        origin: "local-jdk",
        command: "java -cp out com.javaroadmap.lab.stage01.scores.ScoreStatistics",
        javaVersion: "25.0.3",
        cases: [
          {
            label: "正常成绩",
            input: "{88, 92, 67, 100, 55}",
            expected: "总分：402",
            stdout: "总分：402\n平均分：80.4",
            stderr: "",
            exitCode: 0,
            passed: true,
            match: "contains",
          },
        ],
        allPassed: true,
      },
    ],
    referenceViews: { "reference-01": late },
  };

  it("V1.1 备份可直接通过 V1.2 校验，逐字段保留", () => {
    const state = validateBackup(v11Backup);
    expect(state.lessons.day05?.read).toBe(true);
    expect(state.drafts.scores?.code).toContain("ScoreStatistics");
    expect(state.hints.scores).toBe(2);
    expect(state.predictions.A5?.correct).toBe(true);
    expect(state.reflections.scores?.needsReview).toBe(true);
    expect(state.evidence[0].exerciseId).toBe("scores");
    expect(state.referenceViews["reference-01"]).toBe(late);
  });

  it("导出 → 再导入的往返不丢失任何 V1.1 记录", () => {
    const exported = exportBackup(validateBackup(v11Backup));
    const roundTrip = validateBackup(JSON.parse(exported));
    expect(roundTrip).toEqual(validateBackup(v11Backup));
  });

  it("V1.2 新增课程后，V1.1 记录与新 ID 记录可以在合并中共存", () => {
    const current = validateBackup(v11Backup);
    const incoming = {
      ...validateBackup(v11Backup),
      updatedAt: late,
      lessons: {
        ...v11Backup.lessons,
        "s02-oop-encapsulation": {
          read: true,
          position: 0.5,
          updatedAt: late,
        },
      },
      hints: { ...v11Backup.hints, "s02-guard": 3 },
    };
    const merged = mergeBackup(current, incoming);
    expect(merged.lessons.day01?.read).toBe(true);
    expect(merged.lessons["s02-oop-encapsulation"]?.position).toBe(0.5);
    expect(merged.hints["s02-guard"]).toBe(3);
    expect(merged.hints.scores).toBe(2);
  });
});
