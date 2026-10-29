import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const repoRoot = path.resolve(webRoot, "..");
const stageRoot = "stages/stage01_java_basics";
const exerciseSource = `${stageRoot}/existing_course/exercises/basic_syntax_exercises.md`;
const predictionSource = `${stageRoot}/practice/predict_and_modify.md`;

const foundations = [
  {
    id: "day01",
    directory: "day01_output_variable",
    title: "输出与变量",
    summary: "从一张个人信息卡开始，让数据有名字，让程序有输出。",
    deep: ["deep01"],
    exercises: ["scores"],
    predictions: ["A2"],
    steps: [
      [
        "真实场景",
        "为命令行个人信息卡保存姓名、年龄和城市，并把它们打印出来。",
      ],
      [
        "为什么需要",
        "直接重复打印文字难以维护。变量给数据一个名字，信息变化时可以只改定义处。",
      ],
      [
        "概念与心智模型",
        "变量像一个带类型标签的格子；String 保存文本，int 保存整数。println 把表达式的值交给标准输出。package 与类名共同组成类的完整地址。",
      ],
      [
        "预测运行",
        "先预测下面源码会打印几行，每行有哪些内容；再用本课给出的 javac / java 命令运行，对照你的预测。",
      ],
      [
        "修改一个条件",
        "仅修改 age 的值，再次编译运行。预测哪些输出会变；跳过编译时又会看到什么？",
      ],
      [
        "独立练习",
        "新建自己的 Java 类，输出一件商品的名称、单价与数量。核心逻辑由你填写，不复制参考代码。",
      ],
      [
        "项目迁移",
        "以后请求中的参数、数据库中的字段都需要名字与类型。现在先练习让变量名表达它保存的含义。",
      ],
    ],
  },
  {
    id: "day02",
    directory: "day02_data_type_operator",
    title: "数据类型与运算符",
    summary: "同样一个除号，为什么平均分会少掉小数？",
    deep: ["deep02"],
    exercises: ["scores", "calculator"],
    predictions: ["A1", "A2", "A7"],
    steps: [
      ["真实场景", "把三次测验成绩汇总成平均分，结果却少了小数。"],
      [
        "为什么需要",
        "Java 根据操作数的类型决定计算方式。看起来正确的表达式，也可能在运行时悄悄丢失信息。",
      ],
      [
        "概念与心智模型",
        "把运算符看作只认类型标签的机器：int / int 仍是 int；先有 double 参与，才能在除法时保留小数。取余 % 与商 / 回答不同问题。",
      ],
      [
        "预测运行",
        "运行前写出 a / b 与 a % b 的结果。再观察比较运算的结果类型，以及 char 与 String 的区别。",
      ],
      [
        "修改一个条件",
        "仅把 int b = 3 改成 double b = 3.0。逐行比较含 b 的表达式：数值、显示的小数点与结果类型分别有没有变化？",
      ],
      [
        "独立练习",
        "用一组不能整除的数据计算平均值，并用自己的话解释转换发生在除法之前与之后的差异。",
      ],
      [
        "项目迁移",
        "后续计算成绩、价格与比例都会碰到类型选择。金额的精确表示属于后续工程问题，当前先识别整数截断。",
      ],
    ],
  },
  {
    id: "day03",
    directory: "day03_if_switch",
    title: "条件分支",
    summary: "把“满足什么条件，做什么事”写成清晰的决策路径。",
    deep: ["deep07"],
    exercises: ["calculator", "menu"],
    predictions: ["A8"],
    steps: [
      ["真实场景", "根据成绩打印评价，并把菜单选项映射成不同的操作。"],
      [
        "为什么需要",
        "程序不能对所有输入做同一件事。分支把业务规则转成可验证的条件与路径。",
      ],
      [
        "概念与心智模型",
        "if-else 从上到下寻找第一个满足条件的分支；switch 按值选择入口。把每条路径想成一条需要单独验证的道路。",
      ],
      [
        "预测运行",
        "先预测 score 为 95、day 为 3 时会走哪些分支。运行后说明为什么其他分支没有执行。",
      ],
      [
        "修改一个条件",
        "只把 score 改成 60，再改成 59；比较 >= 60 与 > 60 的边界。另一次实验只删除一个 break，观察 switch 的变化。",
      ],
      [
        "独立练习",
        "实现年龄判断或月份到季节的转换；自己选择 if 或 switch，并补一组非法输入。",
      ],
      [
        "项目迁移",
        "输入校验、权限检查、库存判断都依赖分支。先检查失败条件，再继续计算，可以避免无效数据流入后续步骤。",
      ],
    ],
  },
  {
    id: "day04",
    directory: "day04_loop",
    title: "循环与边界",
    summary: "起点、终点、步进：写循环之前，先回答这三个问题。",
    deep: ["deep05"],
    exercises: ["scores", "menu"],
    predictions: ["A3", "A4"],
    steps: [
      ["真实场景", "打印一段连续数字，并求 1 到 100 的和。"],
      [
        "为什么需要",
        "重复写一百次既难维护也容易遗漏。循环把相同操作和变化的状态分开。",
      ],
      [
        "概念与心智模型",
        "循环条件是一道每轮都要经过的闸门。先确定第一轮、最后一轮和步进；while 还要确认状态每轮都向结束靠近。",
      ],
      [
        "预测运行",
        "先写出两个倒计时的第一项、最后一项与打印次数，再预测求和的结果。运行时只对比，不把运行成功当作独立掌握。",
      ],
      [
        "修改一个条件",
        "只把一个 <= 改成 <，预测少处理哪一项。再单独尝试 continue，观察它是否跳过 for 的步进。",
      ],
      [
        "独立练习",
        "输出一段范围内的偶数。写下起点、终点、步进，再补“范围为空”和“只有一个数”的验证。",
      ],
      [
        "项目迁移",
        "菜单、批量计算和数组遍历都用循环。边界推理会在双指针、滑动窗口与分页处理中反复使用。",
      ],
    ],
  },
  {
    id: "day05",
    directory: "day05_array",
    title: "数组与遍历",
    summary: "把一组成绩放在一起，理解长度、下标与累计状态。",
    deep: ["deep03", "deep02"],
    exercises: ["scores", "refactor"],
    predictions: ["A5", "A8"],
    steps: [
      ["真实场景", "老师给出一组成绩，需要总分与平均分。"],
      [
        "为什么需要",
        "分别创建 score1、score2 很难遍历。数组让同类型的一组数据共享一个名字，并通过下标访问。",
      ],
      [
        "概念与心智模型",
        "数组像一排连续的格子；length 是格子的数量，合法下标从 0 到 length - 1。遍历时累计 sum，最后再根据类型规则求平均值。",
      ],
      [
        "预测运行",
        "先笔算源码中四个分数的总分与平均分。预测最后一个合法下标，再运行核对。",
      ],
      [
        "修改一个条件",
        "只把第一个成绩从 90 改成 60；预测总分与平均分分别变化多少。另一次实验把数组改为空，定位最先发生的问题。",
      ],
      [
        "独立练习",
        "进入成绩统计练习，自己设计求和、最值、计数的方法。空数组的处理位置由你决定，并解释理由。",
      ],
      [
        "项目迁移",
        "固定数据集合适合用数组建立直觉；后续 List 会管理可变数量，但遍历、判空与边界仍然适用。",
      ],
    ],
  },
  {
    id: "day06",
    directory: "day06_method",
    title: "方法与职责",
    summary: "参数进、返回值出，让 main 只负责串起流程。",
    deep: ["deep04", "deep06"],
    exercises: ["scores", "refactor"],
    predictions: ["A6"],
    steps: [
      [
        "真实场景",
        "问候、相加、求较大值都挤在 main 中，修改其中一件事时很难确认影响范围。",
      ],
      [
        "为什么需要",
        "方法为一段有独立含义的行为命名。调用方可以关注目标，方法内部负责计算细节。",
      ],
      [
        "概念与心智模型",
        "把方法看作“参数进、返回值出”的小工具。void 不返回结果；有返回值的方法通过 return 把结果交回调用处。局部变量只在所属作用域里有效。",
      ],
      [
        "预测运行",
        "先沿着 main 中的调用顺序写出输出。区分 result 的赋值、方法的返回值与直接打印这三件事。",
      ],
      [
        "修改一个条件",
        "只改变 add 的一个实参，预测哪些行会变。再尝试不接收返回值，观察计算与输出是否是一回事。",
      ],
      [
        "独立练习",
        "进入方法拆分练习，先冻结重构前的输出，再自己拆分职责。用一句不含“然后”的话描述每个方法。",
      ],
      [
        "项目迁移",
        "以后 Controller、Service 与 Repository 也通过参数与返回值合作。当前先练习清晰的职责与可验证的输入输出。",
      ],
    ],
  },
];

const deepMetadata = [
  [
    "01_main_and_jvm",
    "main 与 JVM",
    "从源码、字节码到程序入口，分清编译与运行。",
    ["day01"],
    ["scores"],
    [],
  ],
  [
    "02_integer_division",
    "整数除法与类型转换",
    "转换的位置，决定小数是在计算前保留还是已经丢失。",
    ["day02", "day05"],
    ["scores", "calculator"],
    ["A1", "A7"],
  ],
  [
    "03_array_memory",
    "数组、下标与内存",
    "用连续格子的模型解释越界、别名与最值初始化。",
    ["day05"],
    ["scores"],
    ["A5", "A8"],
  ],
  [
    "04_argument_passing",
    "Java 只有值传递",
    "复制数值与复制地址，如何影响方法外的状态？",
    ["day06"],
    ["refactor"],
    ["A6"],
  ],
  [
    "05_loop_bounds",
    "循环边界",
    "用起点、终点、步进定位差一错误。",
    ["day04"],
    ["menu"],
    ["A3", "A4"],
  ],
  [
    "06_method_scope",
    "方法、作用域与职责",
    "局部变量、返回值和“一次只做一件事”的拆分判断。",
    ["day06"],
    ["refactor", "scores"],
    ["A6"],
  ],
  [
    "07_scanner_input",
    "Scanner 与非法输入",
    "坏记号没有被消费，为什么会形成重复报错？",
    ["day03"],
    ["calculator", "menu"],
    [],
  ],
];

const exerciseMetadata = [
  {
    id: "scores",
    className: "ScoreStatistics",
    lessonIds: [
      "day02",
      "day04",
      "day05",
      "day06",
      "deep02",
      "deep03",
      "deep06",
    ],
    referenceFiles: ["ScoreStatisticsAnswer.java", "method.java"],
    todo: "独立完成成绩统计。先选择空数组的处理位置，再拆分求和、最值与计数方法。",
    note: "数组在源码中定义，下面各组输入需要分别修改数组后重新编译运行。历史参考代码未覆盖本题全部要求（例如空数组与方法拆分），仅用于比较。",
    cases: [
      [
        "normal",
        "正常成绩",
        "{88, 92, 67, 100, 55}",
        "总分：402\n平均分：80.4\n最高分：100\n最低分：55\n及格人数：4",
      ],
      [
        "boundary",
        "单元素",
        "{100}",
        "总分：100\n平均分：100.0\n最高分：100\n最低分：100\n及格人数：1",
      ],
      ["invalid", "空数组", "{}", "暂无成绩数据"],
    ],
  },
  {
    id: "calculator",
    className: "SimpleCalculator",
    lessonIds: ["day02", "day03", "deep02", "deep07"],
    referenceFiles: ["SimpleCalculatorAnswer.java"],
    todo: "独立读取并校验输入，完成四则运算。选择 if 或 switch 并写下理由。",
    note: "本练习以题干“非法输入提示后正常结束”为准。原 L3 提示和 Scanner 深化课演示的是重新询问策略，属于另一种交互设计。历史参考没有处理全部非法输入，不是本题验收答案。",
    cases: [
      ["normal", "除法", "6\n/\n3\n", "结果：2.0"],
      ["normal", "加法", "2\n+\n3\n", "结果：5.0"],
      ["normal", "乘法", "6\n*\n3\n", "结果：18.0"],
      ["boundary", "浮点数", "0.1\n+\n0.2\n", "结果：0.30000000000000004"],
      ["invalid", "除数为零", "5\n/\n0\n", "除数不能为 0"],
      ["invalid", "非数字", "abc\n+\n3\n", "请输入数字"],
      ["invalid", "不支持的运算符", "7\n%\n2\n", "暂不支持这个运算符：%"],
    ],
  },
  {
    id: "menu",
    className: "LearningMenu",
    lessonIds: ["day03", "day04", "deep05", "deep07"],
    referenceFiles: ["loop.java"],
    todo: "独立设计菜单循环、非法输入处理与退出流程。不要让坏记号留在输入中。",
    note: "题干要求非法数字与非数字输入都反馈后回到菜单，不应由“只接受0–2”的读取方法静默吞掉非法项。历史参考会因非数字输入抛异常，需要你独立补齐边界。",
    cases: [
      [
        "normal",
        "正常会话",
        "1\n2\n0\n",
        "两次正常操作分别得到反馈，随后打印“程序结束。”并退出。",
      ],
      ["invalid", "非法数字", "9\n0\n", "没有这个选项，请重新输入\n程序结束。"],
      [
        "invalid",
        "非数字",
        "abc\n0\n",
        "提示非法输入并回菜单；下一次输入0正常退出，不能崩溃或卡死。",
      ],
      [
        "boundary",
        "完整重定向会话",
        "1\n2\n9\nabc\n0\n",
        "两次正常操作、非法数字、非数字均有反馈，最终退出。",
      ],
    ],
  },
  {
    id: "refactor",
    className: "ScoreRefactor",
    lessonIds: ["day06", "deep04", "deep06"],
    referenceFiles: ["method.java"],
    todo: "先保留重构前的实现与输出，再独立拆分方法；记录及格线的归属选择。",
    note: "本题需要对比你自己的两个版本；没有唯一方法划分。原 L3 的 PASS_LINE 常量只是一种方案，及格线作为参数、常量或由哪个方法持有，都由你选择并解释。历史 method.java 可比较职责，但它不包含重构前版本与空数组验证。",
    cases: [
      [
        "normal",
        "行为一致",
        "{88, 92, 67, 100, 55}",
        "重构前后使用相同数据，标准输出逐字符一致。",
      ],
      [
        "boundary",
        "及格线变化",
        "把及格线60改成70",
        "记录两个版本分别修改几处，并解释规则归属。",
      ],
      [
        "invalid",
        "空数组回归",
        "{}",
        "两版均按练习1要求输出“暂无成绩数据”，不越界。",
      ],
    ],
  },
];

const stagePrerequisites = {
  "01": "已安装 JDK；会在命令行进入目录并运行 java / javac。",
  "02": "Stage 01 的变量、分支、循环、数组与方法基础。",
  "03": "Stage 02 的对象、封装、接口与职责划分。",
  "04": "Stage 03 之后随主线并行补齐；不阻塞 MySQL。",
  "05": "Java Core 基础；准备项目 A 的业务与数据约束。",
  "06": "Stage 05 的数据模型、SQL 与事务基础。",
  "07": "Stage 06 的 REST 业务闭环；先识别真实缓存或会话需求。",
  "08": "随主线持续积累；从当前 Git、编译与排错开始。",
  "09": "项目 A 稳定 MVP；后续按真实需求加固。",
  10: "建议项目 A 稳定后系统投入；先 Python 核心语法，再工程与 FastAPI。",
  11: "Python 函数、模块、class、typing、异常、环境与基础测试。",
  12: "可测试的真实 LLM 调用层、结构化输出与可靠性基础。",
  13: "可评测的 LLM、工具与 RAG；先受控单 Agent。",
  14: "Java 业务系统与 Python AI Service 的渐进联调能力。",
};

async function readSource(sourcePath) {
  const absolute = path.resolve(repoRoot, sourcePath);
  if (!absolute.startsWith(`${repoRoot}${path.sep}`))
    throw new Error(`Source escapes repository: ${sourcePath}`);
  return (await readFile(absolute, "utf8")).replace(/\r\n/g, "\n");
}

async function javaFiles(directory) {
  const found = [];
  for (const entry of await readdir(path.resolve(repoRoot, directory), {
    withFileTypes: true,
  })) {
    const relative = `${directory}/${entry.name}`;
    if (entry.isDirectory()) found.push(...(await javaFiles(relative)));
    else if (entry.name.endsWith(".java")) found.push(relative);
  }
  return found.sort();
}

function javaIdentity(code, sourcePath) {
  const packageName = code.match(/^package\s+([\w.]+);/m)?.[1];
  const className = code.match(/public\s+class\s+(\w+)/)?.[1];
  if (!packageName || !className)
    throw new Error(`Missing Java package or public class: ${sourcePath}`);
  return { packageName, className };
}

export function sections(markdown, level) {
  const heading = new RegExp(`^${"#".repeat(level)} ([^\\n]+)\\n`, "gm");
  const matches = [...markdown.matchAll(heading)];
  return matches.map((match, index) => ({
    title: match[1].trim(),
    body: markdown
      .slice(
        match.index + match[0].length,
        matches[index + 1]?.index ?? markdown.length,
      )
      .trim(),
  }));
}

function cleanTitle(markdown) {
  return markdown.match(/^# (.+)$/m)?.[1].replace(/`/g, "") ?? "学习资料";
}

async function buildLessons() {
  const lessons = [];
  for (const metadata of foundations) {
    const directory = `${stageRoot}/existing_course/${metadata.directory}`;
    const [codePath] = await javaFiles(directory);
    const code = await readSource(codePath);
    lessons.push({
      id: metadata.id,
      kind: "foundation",
      title: metadata.title,
      summary: metadata.summary,
      sourcePath: codePath,
      markdown: "",
      code,
      codePath,
      ...javaIdentity(code, codePath),
      relatedLessonIds: metadata.deep,
      exerciseIds: metadata.exercises,
      predictionIds: metadata.predictions,
      steps: metadata.steps.map(([label, body]) => ({ label, body })),
    });
  }
  for (const [
    index,
    [
      directoryName,
      title,
      summary,
      relatedLessonIds,
      exerciseIds,
      predictionIds,
    ],
  ] of deepMetadata.entries()) {
    const directory = `${stageRoot}/deep_dives/${directoryName}`;
    const sourcePath = `${directory}/README.md`;
    const [codePath] = await javaFiles(directory);
    const code = await readSource(codePath);
    lessons.push({
      id: `deep${String(index + 1).padStart(2, "0")}`,
      kind: "deep-dive",
      title,
      summary,
      sourcePath,
      markdown: await readSource(sourcePath),
      code,
      codePath,
      ...javaIdentity(code, codePath),
      relatedLessonIds,
      exerciseIds,
      predictionIds,
      steps: [],
    });
  }
  return lessons;
}

async function buildExercises() {
  const source = await readSource(exerciseSource);
  const statements = sections(source.split("## 渐进提示")[0], 2).filter(
    (section) => section.title.startsWith("练习 "),
  );
  const hintSections = sections(source.split("## 渐进提示")[1], 3);
  if (
    statements.length !== exerciseMetadata.length ||
    hintSections.length !== exerciseMetadata.length
  ) {
    throw new Error(
      "Exercise source structure changed; review statement and hint mapping.",
    );
  }
  return exerciseMetadata.map((metadata, index) => {
    const packageName = `com.javaroadmap.lab.stage01.${metadata.id}`;
    const hints = [
      ...hintSections[index].body.matchAll(
        /^- \*\*L[1-4][^*]*\*\*[：:]?\s*(.+)$/gm,
      ),
    ].map((match) => match[1].trim());
    if (hints.length !== 4)
      throw new Error(`Expected four graded hints for ${metadata.id}.`);
    const className = metadata.className;
    return {
      id: metadata.id,
      title: statements[index].title.replace(/^练习 \d+[：:]\s*/, ""),
      sourcePath: exerciseSource,
      markdown: statements[index].body.replace(/\n---\s*$/, "").trim(),
      hints,
      starterCode: `package ${packageName};\n\npublic class ${className} {\n    public static void main(String[] args) {\n        // TODO: ${metadata.todo}\n    }\n}\n`,
      className,
      packageName,
      lessonIds: metadata.lessonIds,
      note: metadata.note,
      cases: metadata.cases.map(
        ([kind, label, input, expected], caseIndex) => ({
          id: `${metadata.id}-${caseIndex + 1}`,
          label,
          input,
          expected,
          kind,
        }),
      ),
      referencePaths: metadata.referenceFiles.map(
        (file) =>
          `${stageRoot}/existing_course/answers/main/java/com/javaroadmap/stage01/answers/${file}`,
      ),
    };
  });
}

async function buildPredictionsAndModifications() {
  const source = await readSource(predictionSource);
  const answers = sections(
    await readSource(`${stageRoot}/practice/answers.md`),
    2,
  );
  const answerMap = new Map(
    answers.map((section) => [section.title, section.body]),
  );
  const lessonMap = {
    A1: ["day02", "deep02"],
    A2: ["day01", "day02"],
    A3: ["day04", "deep05"],
    A4: ["day04", "deep05"],
    A5: ["day05", "deep03"],
    A6: ["day06", "deep04"],
    A7: ["day02", "deep02"],
    A8: ["day03", "day05", "deep03"],
    B1: ["day02", "deep02"],
    B2: ["day05"],
    B3: ["day03", "day04", "deep05"],
    B4: ["day03", "deep07"],
  };
  const predictions = [];
  const modifications = [];
  for (const section of sections(source, 3)) {
    const id = section.title.match(/^([AB]\d+)/)?.[1];
    if (!id) continue;
    const body = section.body.split("\n## ")[0].trim();
    if (id.startsWith("A")) {
      const answerBody = answerMap.get(id);
      const textBlocks = [
        ...(answerBody ?? "").matchAll(/```text\n([\s\S]*?)```/g),
      ].map((match) => match[1].trimEnd());
      const code = body.match(/```java\n([\s\S]*?)```/)?.[1].trimEnd();
      if (!code || !textBlocks[0])
        throw new Error(`Prediction or answer missing for ${id}.`);
      const explanation = answerBody.includes("为什么：")
        ? answerBody.split("为什么：")[1].trim()
        : answerBody.replace(/```text\n[\s\S]*?```/g, "").trim();
      predictions.push({
        id,
        title: section.title.replace(/^A\d+\s*/, ""),
        sourcePath: predictionSource,
        code,
        prompt: body.replace(/```java\n[\s\S]*?```\n?/, "").trim(),
        answer: textBlocks[0],
        explanation,
        lessonIds: lessonMap[id],
        ...(id === "A3" ? { modifiedAnswer: textBlocks[1] } : {}),
      });
    } else {
      const notes = {
        B1: "当前源码 b 为 int；改为 double 后，含 b 的加减乘除和取余的结果类型与显示都可能变化。历史答案“其余行不变”不够准确，请逐行对照真实输出。",
        B2: "以 day05 当前源码数组 {90,85,76,100} 为准；不要把结构化练习的另一组成绩数据混进来。",
        B3: "当前 MenuDemoApp 的退出分支使用 return，不是题干所说的 break。先确认实际退出语句；可在自己的副本中比较 return 与 break 对 while/switch 的影响。",
      };
      modifications.push({
        id,
        title: section.title.replace(/^B\d+\s*/, ""),
        sourcePath: predictionSource,
        markdown: body.split("\n---")[0].trim(),
        lessonIds: lessonMap[id],
        ...(notes[id] ? { note: notes[id] } : {}),
        referencePaths:
          id === "B3"
            ? [
                `${stageRoot}/existing_course/src/main/java/com/javaroadmap/stage01/console/MenuDemoApp.java`,
              ]
            : id === "B4"
              ? [
                  `${stageRoot}/existing_course/src/main/java/com/javaroadmap/stage01/console/SimpleCalculatorApp.java`,
                ]
              : [],
      });
    }
  }
  if (predictions.length !== 8 || modifications.length !== 4)
    throw new Error("Expected 8 predictions and 4 modifications.");
  return { predictions, modifications };
}

async function buildStages() {
  const roadmap = await readSource("统一学习路线.md");
  const progress = await readSource("真实学习进度.md");
  const progressRows = new Map();
  for (const line of progress.split("\n")) {
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());
    const match = cells[0]?.match(/^(\d{2})\s+(.+)$/);
    if (match)
      progressRows.set(match[1], { title: match[2], status: cells[1] });
  }
  const mapSection = roadmap
    .split("## 统一 14 Stage 知识地图")[1]
    ?.split("\n未开始的阶段")[0];
  if (!mapSection) throw new Error("Authoritative roadmap table not found.");
  const stages = [];
  for (const line of mapSection.split("\n")) {
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());
    const id = cells[0]?.match(/^(?:\[)?(\d{2})(?:\])?/)?.[1];
    if (!id) continue;
    const progressRow = progressRows.get(id);
    if (!progressRow)
      throw new Error(`Missing learning status for Stage ${id}.`);
    const sourcePath = cells[0].match(/\]\(([^)]+)\)/)?.[1];
    stages.push({
      id,
      title: progressRow.title,
      scope: cells[1],
      status: progressRow.status,
      materialState: cells[2],
      ...(sourcePath ? { sourcePath } : {}),
      prerequisites: stagePrerequisites[id],
      evidence: cells[3],
    });
  }
  if (stages.length !== 14)
    throw new Error("Authoritative roadmap must contain 14 stages.");
  return stages;
}

async function buildDocuments(stages, lessons) {
  const sources = [
    ["execution-plan", "学习执行计划.md"],
    ["roadmap-source", "统一学习路线.md"],
    ["progress-source", "真实学习进度.md"],
    ["stage01-guide", `${stageRoot}/README.md`],
    ["teaching-rules", "docs/教学协作细则.md"],
    ["environment", "docs/环境搭建.md"],
    ["troubleshooting", "docs/跨平台问题排查.md"],
    ["lab-local-java", "docs/javaroadmap_lab/local-java.md"],
    ["lab-user-guide", "web/README.md"],
    ["lab-delivery", "docs/javaroadmap_lab/README.md"],
    ["lab-design", "docs/javaroadmap_lab/design.md"],
    ["lab-architecture", "docs/javaroadmap_lab/architecture.md"],
    ["lab-content", "docs/javaroadmap_lab/content.md"],
    ["lab-data-services", "docs/javaroadmap_lab/data-and-services.md"],
    ["lab-validation", "docs/javaroadmap_lab/validation.md"],
    ["lab-dependencies", "docs/javaroadmap_lab/dependencies.md"],
    ["lab-task-plan", "docs/javaroadmap_lab/planning/task_plan.md"],
    ["lab-findings", "docs/javaroadmap_lab/planning/findings.md"],
    ["lab-progress", "docs/javaroadmap_lab/planning/progress.md"],
    ["stage01-warmup", `${stageRoot}/supplemental_exercises.md`],
    ["stage01-notes", `${stageRoot}/existing_course/notes.md`],
    ["stage01-summary", `${stageRoot}/existing_course/summary.md`],
    ["stage01-mistakes", `${stageRoot}/existing_course/mistakes.md`],
  ];
  for (const stage of stages) {
    if (stage.id !== "01" && stage.sourcePath)
      sources.push([`stage${stage.id}-guide`, stage.sourcePath]);
  }
  for (const lesson of lessons.filter((lesson) => lesson.kind === "deep-dive"))
    sources.push([`${lesson.id}-source`, lesson.sourcePath]);
  sources.push(
    ["exercises-source", exerciseSource],
    ["predictions-source", predictionSource],
  );
  return await Promise.all(
    sources.map(async ([id, sourcePath]) => {
      let markdown = await readSource(sourcePath);
      // Hints remain gated in the laboratory rather than leaking through the source-document route.
      if (sourcePath === exerciseSource)
        markdown = markdown.split("## 渐进提示")[0].trim();
      return { id, title: cleanTitle(markdown), sourcePath, markdown };
    }),
  );
}

export async function generateCatalog({ write = true } = {}) {
  const lessons = await buildLessons();
  const exercises = await buildExercises();
  const { predictions, modifications } =
    await buildPredictionsAndModifications();
  const stages = await buildStages();
  const documents = await buildDocuments(stages, lessons);
  const plan = await readSource("学习执行计划.md");
  const currentSection = plan.split("## CURRENT")[1]?.split("## NEXT")[0] ?? "";
  const currentTasks = [...currentSection.matchAll(/^\d+\.\s+(.+)$/gm)].map(
    (match) => match[1],
  );
  const referenceSources = [
    ...new Set([
      ...exercises.flatMap((exercise) => exercise.referencePaths),
      `${stageRoot}/practice/answers.md`,
      ...(await javaFiles(`${stageRoot}/existing_course/src/main/java`)),
      ...(await javaFiles(`${stageRoot}/mini_project`)),
    ]),
  ];
  const references = referenceSources.map((sourcePath, index) => ({
    sourcePath,
    url: `reference/reference-${String(index + 1).padStart(2, "0")}.json`,
  }));
  const catalog = {
    lessons,
    exercises,
    predictions,
    modifications,
    stages,
    documents,
    currentTasks,
    references,
  };
  if (write) {
    await mkdir(path.join(webRoot, "src/generated"), { recursive: true });
    await mkdir(path.join(webRoot, "public/reference"), { recursive: true });
    await writeFile(
      path.join(webRoot, "src/generated/catalog.json"),
      `${JSON.stringify(catalog, null, 2)}\n`,
      "utf8",
    );
    for (const reference of references) {
      await writeFile(
        path.join(webRoot, "public", reference.url),
        `${JSON.stringify(
          {
            sourcePath: reference.sourcePath,
            language: reference.sourcePath.endsWith(".java")
              ? "java"
              : "markdown",
            content: await readSource(reference.sourcePath),
          },
          null,
          2,
        )}\n`,
        "utf8",
      );
    }
  }
  return catalog;
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const catalog = await generateCatalog();
  console.log(
    `Content: ${catalog.lessons.length} lessons, ${catalog.exercises.length} exercises, ${catalog.predictions.length} predictions, ${catalog.stages.length} stages.`,
  );
}
