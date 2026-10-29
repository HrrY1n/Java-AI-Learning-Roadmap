export function normalizeOutput(output: string): string {
  // 只忽略平台换行、行尾空格及最后一次换行；缩进和内部空行仍有意义。
  return output
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[\t ]+$/g, ""))
    .join("\n")
    .replace(/\n$/, "");
}

export function checkPrediction(actual: string, expected: string): boolean {
  return normalizeOutput(actual) === normalizeOutput(expected);
}

export async function sha256(source: string): Promise<string> {
  const bytes = new TextEncoder().encode(source);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash), (value) =>
    value.toString(16).padStart(2, "0"),
  ).join("");
}

export interface ExecutionRequest {
  exerciseId: string;
  source: string;
  input: string;
  signal?: AbortSignal;
}

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  sourceHash: string;
}

export interface JavaExecutor {
  mode: "local" | "sandbox";
  available: boolean;
  run(request: ExecutionRequest): Promise<ExecutionResult>;
}

export const localExecutor: JavaExecutor = {
  mode: "local",
  available: false,
  async run() {
    throw new Error(
      "尚未配置在线 Java 沙箱。请下载源码，在本地 JDK 运行后导入验证记录。",
    );
  },
};

export type HintLevel = 1 | 2 | 3 | 4;
export type ReviewItem = {
  priority: "P0" | "P1" | "P2" | "P3" | "P4";
  label: string;
  prompt: string;
};

export interface TutorService {
  mode: "course" | "model";
  available: boolean;
  hint(hints: readonly string[], level: HintLevel): string;
  debug(error: string): string[];
  review(): ReviewItem[];
}

export interface ModelTutorService {
  available: boolean;
  respond(request: {
    lessonId: string;
    mode: "hint" | "debug" | "review";
    level?: HintLevel;
    question: string;
    source?: string;
    error?: string;
    signal?: AbortSignal;
  }): Promise<{ text: string; provider: string }>;
}

export const unconfiguredModelTutor: ModelTutorService = {
  available: false,
  async respond() {
    throw new Error(
      "尚未配置真实 AI 服务。当前可使用课程提示、Debug 引导与 Review 清单。",
    );
  },
};

export const courseTutor: TutorService = {
  mode: "course",
  available: true,
  hint(hints, level) {
    const hint = hints[level - 1];
    if (!hint) throw new Error(`本题尚无 L${level} 课程提示。`);
    return hint;
  },
  debug(error) {
    return [
      `读错误：${error.trim() ? "从你记录的错误中" : "先粘贴真实错误，再"}找出类型、消息和第一个自己类名的行号。`,
      "定位：缩小到一个方法、循环或分支，打印最少的中间值。",
      "假设：写出两种可能原因，按可能性排序。",
      "验证：每个原因配一组最小输入或一行打印，一次只改一个条件。",
      "复盘：用一句话解释修复为何有效，再用原输入和一个边界输入重新运行。",
    ];
  },
  review() {
    return [
      {
        priority: "P0",
        label: "功能错误",
        prompt:
          "正常输入的结果正确吗？是否存在崩溃或错误状态？记下文件与行号。",
      },
      {
        priority: "P1",
        label: "边界问题",
        prompt: "空数组、零、非法输入和输入耗尽时会怎样？亲自运行一组验证。",
      },
      {
        priority: "P2",
        label: "可读性",
        prompt: "每个方法能否用一句话说明职责？命名是否表达这个职责？",
      },
      {
        priority: "P3",
        label: "设计取舍",
        prompt:
          "校验由 main 还是统计方法负责？说明你的选择和调用方需要知道什么。",
      },
      {
        priority: "P4",
        label: "代码风格",
        prompt: "package 与目录一致吗？缩进、编码、类名是否遵循当前课程约定？",
      },
    ];
  },
};
