import { normalizeOutput, sha256 } from "./services";

type Dated = { updatedAt: string };
export type EvidenceCase = {
  label: string;
  input: string;
  expected: string;
  stdout: string;
  stderr: string;
  exitCode: number;
  passed: boolean;
  match: "exact" | "contains";
};
export type Evidence = {
  id: string;
  exerciseId: string;
  sourceHash: string;
  createdAt: string;
  origin: "local-jdk";
  command: string;
  javaVersion: string;
  cases: EvidenceCase[];
  allPassed: boolean;
};
export type LearningState = {
  schemaVersion: 1;
  updatedAt: string;
  theme: "light" | "dark" | "system";
  lastLessonId: string | null;
  lessons: Record<string, Dated & { read: boolean; position: number }>;
  drafts: Record<string, Dated & { code: string }>;
  hints: Record<string, number>;
  predictions: Record<
    string,
    Dated & { answer: string; correct: boolean; attempts: number }
  >;
  reflections: Record<
    string,
    Dated & {
      error: string;
      understanding: string;
      nextStep: string;
      needsReview: boolean;
    }
  >;
  evidence: Evidence[];
  referenceViews: Record<string, string>;
};

const DB_NAME = "javaroadmap-lab";
const STORE_NAME = "learning";
const STATE_KEY = "snapshot";
const REVISION_KEY = "revision";
const MAX_ITEMS = 500;
const BAD_KEYS = new Set(["__proto__", "prototype", "constructor"]);
let loadedRevision: string | null | undefined;

export function createInitialState(): LearningState {
  return {
    schemaVersion: 1,
    updatedAt: new Date().toISOString(),
    theme: "system",
    lastLessonId: null,
    lessons: {},
    drafts: {},
    hints: {},
    predictions: {},
    reflections: {},
    evidence: [],
    referenceViews: {},
  };
}

function invalid(message: string): never {
  throw new Error(`学习记录无效：${message}`);
}

function object(value: unknown, label: string): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value))
    invalid(`${label}应为对象`);
  const proto: unknown = Object.getPrototypeOf(value);
  if (proto !== Object.prototype && proto !== null)
    invalid(`${label}对象类型不受支持`);
  const result = value as Record<string, unknown>;
  if (Object.keys(result).some((key) => BAD_KEYS.has(key)))
    invalid(`${label}包含保留字段`);
  return result;
}

function fields(
  value: unknown,
  keys: readonly string[],
  label: string,
): Record<string, unknown> {
  const result = object(value, label);
  if (
    Object.keys(result).length !== keys.length ||
    keys.some((key) => !Object.hasOwn(result, key))
  )
    invalid(`${label}字段不完整或含未知字段`);
  return result;
}

function string(value: unknown, label: string, max = 20_000): string {
  if (
    typeof value !== "string" ||
    value.length > max ||
    value.includes("\u0000")
  )
    invalid(`${label}不是有效文本或过长`);
  return value;
}

function id(value: unknown, label: string): string {
  const result = string(value, label, 128);
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(result) || BAD_KEYS.has(result))
    invalid(`${label}格式不正确`);
  return result;
}

function date(value: unknown, label: string): string {
  const result = string(value, label, 40);
  const parts =
    /^(\d{4})-(\d{2})-(\d{2})T([01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,6})?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.exec(
      result,
    );
  if (!parts || !Number.isFinite(Date.parse(result)))
    invalid(`${label}日期不正确`);
  const year = Number(parts[1]);
  const month = Number(parts[2]);
  const day = Number(parts[3]);
  const calendar = new Date(Date.UTC(year, month - 1, day));
  if (
    year < 1970 ||
    calendar.getUTCFullYear() !== year ||
    calendar.getUTCMonth() !== month - 1 ||
    calendar.getUTCDate() !== day
  )
    invalid(`${label}日期不正确`);
  return result;
}

function boolean(value: unknown, label: string): boolean {
  if (typeof value !== "boolean") invalid(`${label}应为布尔值`);
  return value;
}

function number(
  value: unknown,
  label: string,
  min: number,
  max: number,
  integer = false,
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < min ||
    value > max ||
    (integer && !Number.isInteger(value))
  )
    invalid(`${label}数值超出范围`);
  return value;
}

function record<T>(
  value: unknown,
  label: string,
  parse: (item: unknown) => T,
): Record<string, T> {
  const input = object(value, label);
  if (Object.keys(input).length > MAX_ITEMS) invalid(`${label}条目过多`);
  return Object.fromEntries(
    Object.entries(input).map(([key, item]) => [id(key, label), parse(item)]),
  );
}

export function validateEvidence(input: unknown): Evidence {
  const value = fields(
    input,
    [
      "id",
      "exerciseId",
      "sourceHash",
      "createdAt",
      "origin",
      "command",
      "javaVersion",
      "cases",
      "allPassed",
    ],
    "验证记录",
  );
  const sourceHash = string(value.sourceHash, "源码指纹", 64);
  if (!/^[0-9a-f]{64}$/.test(sourceHash)) invalid("源码指纹应为 SHA-256");
  if (value.origin !== "local-jdk") invalid("验证来源不受支持");
  if (
    !Array.isArray(value.cases) ||
    value.cases.length === 0 ||
    value.cases.length > 50
  )
    invalid("验证用例为空或过多");
  const cases: EvidenceCase[] = value.cases.map((item: unknown) => {
    const c = fields(
      item,
      [
        "label",
        "input",
        "expected",
        "stdout",
        "stderr",
        "exitCode",
        "passed",
        "match",
      ],
      "用例",
    );
    if (c.match !== "exact" && c.match !== "contains")
      invalid("输出比较方式不受支持");
    const match = c.match;
    const expected = string(c.expected, "预期输出", 100_000);
    if (match === "contains" && normalizeOutput(expected).length === 0)
      invalid("包含断言的预期输出不能为空");
    const stdout = string(c.stdout, "标准输出", 100_000);
    const exitCode = number(
      c.exitCode,
      "退出码",
      -2_147_483_648,
      4_294_967_295,
      true,
    );
    const passed = boolean(c.passed, "用例结果");
    const actualPassed =
      exitCode === 0 &&
      (match === "exact"
        ? normalizeOutput(stdout) === normalizeOutput(expected)
        : normalizeOutput(stdout).includes(normalizeOutput(expected)));
    if (passed !== actualPassed) invalid("用例结果与输出/退出码不一致");
    return {
      label: string(c.label, "用例名称", 200),
      input: string(c.input, "用例输入", 100_000),
      expected,
      stdout,
      stderr: string(c.stderr, "错误输出", 100_000),
      exitCode,
      passed,
      match,
    };
  });
  const allPassed = boolean(value.allPassed, "全部通过");
  if (allPassed !== cases.every((c) => c.passed))
    invalid("总体结果与用例结果不一致");
  return {
    id: id(value.id, "验证记录 ID"),
    exerciseId: id(value.exerciseId, "练习 ID"),
    sourceHash,
    createdAt: date(value.createdAt, "验证时间"),
    origin: "local-jdk",
    command: string(value.command, "运行命令", 4_000),
    javaVersion: string(value.javaVersion, "JDK 版本", 2_000),
    cases,
    allPassed,
  };
}

export async function importEvidence(
  input: unknown,
  exerciseId: string,
  currentCode: string,
): Promise<Evidence> {
  const evidence = validateEvidence(input);
  if (evidence.exerciseId !== exerciseId)
    throw new Error("这份验证记录属于另一道练习。");
  if (evidence.sourceHash !== (await sha256(currentCode)))
    throw new Error(
      "源码指纹与当前草稿不一致。请恢复实际运行的源码，或重新运行当前版本。",
    );
  return evidence;
}

export function validateBackup(input: unknown): LearningState {
  const value = object(input, "备份");
  if (value.schemaVersion !== 1)
    invalid("备份版本不受支持，请保留原文件并使用兼容版本恢复");
  fields(
    value,
    [
      "schemaVersion",
      "updatedAt",
      "theme",
      "lastLessonId",
      "lessons",
      "drafts",
      "hints",
      "predictions",
      "reflections",
      "evidence",
      "referenceViews",
    ],
    "备份",
  );
  if (
    value.theme !== "light" &&
    value.theme !== "dark" &&
    value.theme !== "system"
  )
    invalid("主题不受支持");
  if (!Array.isArray(value.evidence) || value.evidence.length > MAX_ITEMS)
    invalid("验证记录过多或格式错误");
  const evidence = value.evidence.map(validateEvidence);
  if (new Set(evidence.map((item) => item.id)).size !== evidence.length)
    invalid("存在重复的验证记录 ID");
  const state: LearningState = {
    schemaVersion: 1,
    updatedAt: date(value.updatedAt, "更新时间"),
    theme: value.theme,
    lastLessonId:
      value.lastLessonId === null
        ? null
        : id(value.lastLessonId, "最后课程 ID"),
    lessons: record(value.lessons, "课程", (item) => {
      const row = fields(item, ["read", "position", "updatedAt"], "课程");
      return {
        read: boolean(row.read, "阅读状态"),
        position: number(row.position, "阅读位置", 0, 1),
        updatedAt: date(row.updatedAt, "阅读时间"),
      };
    }),
    drafts: record(value.drafts, "草稿", (item) => {
      const row = fields(item, ["code", "updatedAt"], "草稿");
      return {
        code: string(row.code, "源码", 1_000_000),
        updatedAt: date(row.updatedAt, "草稿时间"),
      };
    }),
    hints: record(value.hints, "提示", (item) =>
      number(item, "提示等级", 0, 4, true),
    ),
    predictions: record(value.predictions, "预测题", (item) => {
      const row = fields(
        item,
        ["answer", "correct", "attempts", "updatedAt"],
        "预测题",
      );
      return {
        answer: string(row.answer, "预测答案"),
        correct: boolean(row.correct, "预测结果"),
        attempts: number(row.attempts, "作答次数", 1, 100_000, true),
        updatedAt: date(row.updatedAt, "作答时间"),
      };
    }),
    reflections: record(value.reflections, "复盘", (item) => {
      const row = fields(
        item,
        ["error", "understanding", "nextStep", "needsReview", "updatedAt"],
        "复盘",
      );
      return {
        error: string(row.error, "错误记录"),
        understanding: string(row.understanding, "理解记录"),
        nextStep: string(row.nextStep, "下一步"),
        needsReview: boolean(row.needsReview, "复习标记"),
        updatedAt: date(row.updatedAt, "复盘时间"),
      };
    }),
    evidence,
    referenceViews: record(value.referenceViews, "参考查看", (item) =>
      date(item, "查看时间"),
    ),
  };
  if (new TextEncoder().encode(JSON.stringify(state)).byteLength > 10_000_000)
    invalid("备份超过 10 MB，请分别保留原始文件");
  return state;
}

export function exportBackup(state: LearningState): string {
  return JSON.stringify(validateBackup(state), null, 2);
}

function mergeDated<T extends Dated>(
  current: Record<string, T>,
  incoming: Record<string, T>,
): Record<string, T> {
  const merged = { ...current };
  for (const [key, value] of Object.entries(incoming)) {
    const existing = merged[key];
    if (
      !existing ||
      Date.parse(value.updatedAt) > Date.parse(existing.updatedAt)
    )
      merged[key] = value;
  }
  return merged;
}

export function mergeBackup(
  currentInput: LearningState,
  incomingInput: LearningState,
): LearningState {
  const current = validateBackup(currentInput);
  const incoming = validateBackup(incomingInput);
  const newest =
    Date.parse(incoming.updatedAt) > Date.parse(current.updatedAt)
      ? incoming
      : current;
  const evidence = new Map(current.evidence.map((item) => [item.id, item]));
  for (const item of incoming.evidence) {
    const existing = evidence.get(item.id);
    if (existing && JSON.stringify(existing) !== JSON.stringify(item))
      throw new Error(
        "同一验证 ID 的内容冲突，已取消导入；请分别保留两份备份。",
      );
    evidence.set(item.id, item);
  }
  const hints = { ...current.hints };
  for (const [key, level] of Object.entries(incoming.hints))
    hints[key] = Math.max(hints[key] ?? 0, level);
  const referenceViews = { ...current.referenceViews };
  for (const [key, timestamp] of Object.entries(incoming.referenceViews)) {
    if (
      !referenceViews[key] ||
      Date.parse(timestamp) > Date.parse(referenceViews[key])
    )
      referenceViews[key] = timestamp;
  }
  return validateBackup({
    schemaVersion: 1,
    updatedAt: new Date().toISOString(),
    theme: newest.theme,
    lastLessonId: newest.lastLessonId,
    lessons: mergeDated(current.lessons, incoming.lessons),
    drafts: mergeDated(current.drafts, incoming.drafts),
    hints,
    predictions: mergeDated(current.predictions, incoming.predictions),
    reflections: mergeDated(current.reflections, incoming.reflections),
    evidence: Array.from(evidence.values()),
    referenceViews,
  });
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!globalThis.indexedDB) {
      reject(
        new Error(
          "浏览器未提供 IndexedDB，无法保存。请使用受支持的浏览器并允许站点存储。",
        ),
      );
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    let blocked = false;
    request.onupgradeneeded = () =>
      request.result.createObjectStore(STORE_NAME);
    request.onerror = () =>
      reject(
        new Error("无法打开本地学习数据库。请检查隐私模式与站点存储权限。"),
      );
    request.onblocked = () => {
      blocked = true;
      reject(
        new Error(
          "数据库升级被其他页面阻挡，请关闭其他 JavaRoadmap Lab 标签后重试。",
        ),
      );
    };
    request.onsuccess = () => {
      const database = request.result;
      if (blocked) {
        database.close();
        return;
      }
      database.onversionchange = () => database.close();
      resolve(database);
    };
  });
}

export async function loadState(): Promise<LearningState> {
  const database = await openDatabase();
  try {
    const { input, revision } = await new Promise<{
      input: unknown;
      revision: string | null;
    }>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(STATE_KEY);
      const revisionRequest = store.get(REVISION_KEY);
      transaction.oncomplete = () =>
        resolve({
          input: request.result as unknown,
          revision:
            typeof revisionRequest.result === "string"
              ? revisionRequest.result
              : null,
        });
      transaction.onerror = () =>
        reject(new Error("读取本地学习记录失败。原记录未被覆盖。"));
      transaction.onabort = () =>
        reject(new Error("读取本地学习记录中断。原记录未被覆盖。"));
    });
    const state =
      input === undefined ? createInitialState() : validateBackup(input);
    loadedRevision = revision;
    return state;
  } finally {
    database.close();
  }
}

let saveQueue: Promise<void> = Promise.resolve();

export async function saveState(state: LearningState): Promise<void> {
  const snapshot = validateBackup(state);
  const pending = saveQueue
    .catch(() => undefined)
    .then(async () => {
      const database = await openDatabase();
      try {
        await new Promise<void>((resolve, reject) => {
          const transaction = database.transaction(STORE_NAME, "readwrite");
          const store = transaction.objectStore(STORE_NAME);
          const request = store.get(REVISION_KEY);
          const nextRevision = crypto.randomUUID();
          request.onsuccess = () => {
            const revision =
              typeof request.result === "string" ? request.result : null;
            if (loadedRevision !== undefined && loadedRevision !== revision) {
              reject(
                new Error(
                  "另一标签页已更新学习记录。请先导出当前内容，再刷新并合并备份，避免覆盖另一页的修改。",
                ),
              );
              transaction.abort();
              return;
            }
            store.put(snapshot, STATE_KEY);
            store.put(nextRevision, REVISION_KEY);
          };
          transaction.oncomplete = () => {
            loadedRevision = nextRevision;
            resolve();
          };
          transaction.onerror = () =>
            reject(
              new Error("自动保存失败，请立即导出备份并检查浏览器存储空间。"),
            );
          transaction.onabort = () =>
            reject(
              new Error(
                "自动保存中断。上一次保存的记录仍保留，请导出当前内容。",
              ),
            );
        });
      } finally {
        database.close();
      }
    });
  saveQueue = pending;
  return pending;
}
