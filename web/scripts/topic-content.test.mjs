import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { generateCatalog } from "./generate-content.mjs";

const catalog = await generateCatalog({ write: false });
const normalizeNewlines = (text) => text.trim().split(String.fromCharCode(13, 10)).join(String.fromCharCode(10));

test("V1.4 专题数据架构：包含 5 大专题并正确区分已发布与仅有资料状态", () => {
  assert.ok(Array.isArray(catalog.topics));
  assert.equal(catalog.topics.length, 5);

  const topicIds = catalog.topics.map((t) => t.id);
  assert.deepEqual(topicIds, [
    "topic-algo",
    "topic-git",
    "topic-csapp",
    "topic-ostep",
    "topic-network",
  ]);

  const algoTopic = catalog.topics.find((t) => t.id === "topic-algo");
  const gitTopic = catalog.topics.find((t) => t.id === "topic-git");
  const csappTopic = catalog.topics.find((t) => t.id === "topic-csapp");
  const ostepTopic = catalog.topics.find((t) => t.id === "topic-ostep");
  const netTopic = catalog.topics.find((t) => t.id === "topic-network");

  assert.equal(algoTopic.status, "published");
  assert.equal(gitTopic.status, "published");
  // 门禁：新书已有可学课程，但专题整体仍保持“建设中”，不得冒充全书建成。
  assert.equal(csappTopic.status, "building");
  assert.equal(ostepTopic.status, "building");
  assert.equal(netTopic.status, "building");
});

test("V1.4 《Hello 算法》专题：首批已发布课程包含完整教学结构与有效 Java 源码", () => {
  const algoTopic = catalog.topics.find((t) => t.id === "topic-algo");
  const publishedLessons = algoTopic.modules.flatMap((m) =>
    m.lessons.filter((l) => l.status === "published"),
  );

  assert.equal(publishedLessons.length, 29);
  // 全部 9 个模块均已上线，不再有建设中/规划占位
  for (const module of algoTopic.modules) {
    assert.equal(module.status, "published", `${module.id} 应已上线`);
    assert.ok(module.lessons.length > 0, `${module.id} 不应为空模块`);
  }
  assert.equal(algoTopic.modules.length, 9);

  // V1.7 补齐课程：双端队列、BST/平衡树、建堆 Top-K、二分边界、
  // 选择/堆排序、非比较排序、子集和、背包、编辑距离
  for (const id of [
    "algo-deque",
    "algo-bst",
    "algo-balanced-tree",
    "algo-heap-topk",
    "algo-binary-boundary",
    "algo-selection-heapsort",
    "algo-non-comparison-sort",
    "algo-backtracking-subset",
    "algo-dp-knapsack",
    "algo-edit-distance",
  ]) {
    const lesson = publishedLessons.find((l) => l.id === id);
    assert.ok(lesson, `缺少 V1.7 补齐课程 ${id}`);
    if (lesson.kind === "code") {
      assert.match(lesson.packageName, /^com\.javaroadmap\.algo\./);
    }
  }
  // 背包课必须给出四种策略的适用边界对照（分治/回溯/DP/贪心）
  const knapsack = publishedLessons.find((l) => l.id === "algo-dp-knapsack");
  assert.match(knapsack.markdown, /分数背包/, "背包课应对照可切分的分数背包");
  assert.match(knapsack.markdown, /贪心/, "背包课应说明贪心的适用分界");

  for (const lesson of publishedLessons) {
    // 来源追溯
    assert.ok(lesson.bookReference, `${lesson.id} 必须包含原书引用`);
    assert.equal(lesson.bookReference.bookTitle, "Hello 算法");
    assert.ok(
      lesson.bookReference.pdfPageStart > 0 &&
        lesson.bookReference.pdfPageEnd >= lesson.bookReference.pdfPageStart,
      `${lesson.id} PDF 页码非法`,
    );

    // 教学结构完整性
    assert.match(lesson.markdown, /业务场景|需要解决的问题/);
    assert.match(lesson.markdown, /为什么/);
    assert.match(lesson.markdown, /来源|出处/);

    // Java 源码规范
    if (lesson.kind === "code") {
      assert.ok(lesson.code, `${lesson.id} 缺少 Java 源码`);
      assert.match(lesson.packageName, /^com\.javaroadmap\.algo\./);
      assert.match(lesson.code, /package com\.javaroadmap\.algo\./);
      assert.match(lesson.code, /public class /);
    }
  }
});

test("V1.4 算法教学审查：杜绝无依据耗时断言，公式严谨且明确操作前提与边界", () => {
  const algoTopic = catalog.topics.find((t) => t.id === "topic-algo");
  const publishedLessons = algoTopic.modules.flatMap((m) =>
    m.lessons.filter((l) => l.status === "published"),
  );

  for (const lesson of publishedLessons) {
    // 门禁 1：严禁无实验依据的主观断言（如十亿次约一秒、公式仅一纳秒）
    assert.doesNotMatch(lesson.markdown, /十亿次循环约一秒/);
    assert.doesNotMatch(lesson.markdown, /仅需 1 纳秒/);

    // 门禁 2：严禁公式符号损坏或变量丢失（如未闭合的 $ 的、缺失 O 的 (n)$ 与 (1)$）
    assert.doesNotMatch(lesson.markdown, /(?:规模|长度为)\s*\$\s*的/);
    assert.doesNotMatch(lesson.markdown, /\s\(n\)\$/);
    assert.doesNotMatch(lesson.markdown, /\s\(1\)\$/);
  }

  // 门禁 3：数组操作前提与边界审查
  const arrayLesson = publishedLessons.find((l) => l.id === "algo-array");
  assert.ok(arrayLesson);
  assert.match(arrayLesson.markdown, /下标|索引/, "数组随机访问必须指出依赖数字下标前提");
  assert.match(arrayLesson.markdown, /按值查找/, "数组必须辨析已知下标 O(1) 与按值查找 O(n)");
  assert.match(arrayLesson.markdown, /扩容|移动/, "数组插入必须指出数据后移与扩容边界");

  // 门禁 4：链表操作前提审查
  const listLesson = publishedLessons.find((l) => l.id === "algo-linkedlist");
  assert.ok(listLesson);
  assert.match(listLesson.markdown, /前驱节点/, "链表 O(1) 插入必须明确指出持有前驱节点指针的前提");
  assert.match(listLesson.markdown, /O\(n\)|遍历/, "链表必须指明查找目标位置依然需要 O(n) 遍历");

  // 门禁 5：栈与队列边界审查
  const stackLesson = publishedLessons.find((l) => l.id === "algo-stack");
  assert.ok(stackLesson);
  assert.match(stackLesson.markdown, /空栈|溢出/, "栈必须包含空栈或容量溢出边界说明");

  const queueLesson = publishedLessons.find((l) => l.id === "algo-queue");
  assert.ok(queueLesson);
  assert.match(queueLesson.markdown, /假溢出/, "队列必须阐述普通数组假溢出原因");
  assert.match(queueLesson.markdown, /队空|队满/, "队列必须阐明队空与队满判别边界");
});

test("V1.4 源码同步门禁：已发布算法课程代码与 stages/topics/algorithms 源码严格一致", () => {
  const fileMap = {
    "algo-complexity-eval": "stages/topics/algorithms/complexity/com/javaroadmap/algo/complexity/App.java",
    "algo-iteration-recursion": "stages/topics/algorithms/recursion/com/javaroadmap/algo/recursion/App.java",
    "algo-time-complexity": "stages/topics/algorithms/big_o/com/javaroadmap/algo/bigo/App.java",
    "algo-space-complexity": "stages/topics/algorithms/space/com/javaroadmap/algo/space/App.java",
    "algo-array": "stages/topics/algorithms/array/com/javaroadmap/algo/array/App.java",
    "algo-linkedlist": "stages/topics/algorithms/linkedlist/com/javaroadmap/algo/linkedlist/App.java",
    "algo-stack": "stages/topics/algorithms/stack/com/javaroadmap/algo/stack/App.java",
    "algo-queue": "stages/topics/algorithms/queue/com/javaroadmap/algo/queue/App.java",
    "algo-deque": "stages/topics/algorithms/deque/com/javaroadmap/algo/deque/App.java",
    "algo-bst": "stages/topics/algorithms/bst/com/javaroadmap/algo/bst/App.java",
    "algo-balanced-tree": "stages/topics/algorithms/avl/com/javaroadmap/algo/avl/App.java",
    "algo-heap-topk": "stages/topics/algorithms/heap_topk/com/javaroadmap/algo/heaptopk/App.java",
    "algo-binary-boundary": "stages/topics/algorithms/binary_boundary/com/javaroadmap/algo/binaryboundary/App.java",
    "algo-selection-heapsort": "stages/topics/algorithms/selection_heapsort/com/javaroadmap/algo/selectionheapsort/App.java",
    "algo-non-comparison-sort": "stages/topics/algorithms/non_comparison_sort/com/javaroadmap/algo/noncomparisonsort/App.java",
    "algo-backtracking-subset": "stages/topics/algorithms/subset_sum/com/javaroadmap/algo/subsetsum/App.java",
    "algo-dp-knapsack": "stages/topics/algorithms/knapsack/com/javaroadmap/algo/knapsack/App.java",
    "algo-edit-distance": "stages/topics/algorithms/edit_distance/com/javaroadmap/algo/editdistance/App.java",
  };

  const algoTopic = catalog.topics.find((t) => t.id === "topic-algo");
  const publishedLessons = algoTopic.modules.flatMap((m) =>
    m.lessons.filter((l) => l.status === "published"),
  );

  for (const lesson of publishedLessons) {
    if (fileMap[lesson.id]) {
      const repoRoot = path.resolve("..");
      const filePath = path.join(repoRoot, fileMap[lesson.id]);
      const actualContent = fs
        .readFileSync(filePath, "utf-8")
        .trim()
        .replace(/\r\n/g, "\n");
      const expectedContent = (lesson.code || "")
        .trim()
        .replace(/\r\n/g, "\n");
      assert.equal(
        expectedContent,
        actualContent,
        `${lesson.id} 的 code 属性与实际落盘源码不一致`,
      );
    }
  }
});

test("V1.4 《Pro Git》专题：首批课程包含真实 Git 行为、状态输出与命令流转", () => {
  const gitTopic = catalog.topics.find((t) => t.id === "topic-git");
  const publishedLessons = gitTopic.modules.flatMap((m) =>
    m.lessons.filter((l) => l.status === "published"),
  );

  assert.equal(publishedLessons.length, 19);
  // 全部 5 个 Git 模块均已上线
  for (const module of gitTopic.modules) {
    assert.equal(module.status, "published", `${module.id} 应已上线`);
    assert.ok(module.lessons.length > 0, `${module.id} 不应为空模块`);
  }
  assert.equal(gitTopic.modules.length, 5);

  for (const lesson of publishedLessons) {
    assert.equal(lesson.kind, "command-lab");
    assert.ok(lesson.bookReference, `${lesson.id} 缺少原书引用`);
    assert.match(lesson.bookReference.bookTitle, /Pro Git/);
    assert.ok(
      lesson.bookReference.pdfPageStart > 0 &&
        lesson.bookReference.pdfPageEnd >= lesson.bookReference.pdfPageStart,
    );

    // Git 命令步进数据
    assert.ok(Array.isArray(lesson.gitSteps) && lesson.gitSteps.length > 0);
    for (const step of lesson.gitSteps) {
      assert.ok(step.command.startsWith("git "));
      assert.ok(step.explanation.length > 0);
      assert.ok(step.repoStateBefore.length > 0);
      assert.ok(step.repoStateAfter.length > 0);
    }

    // 门禁：不硬塞 Java main 方法
    assert.equal(lesson.code, undefined);
    assert.equal(lesson.packageName, undefined);
  }

  // 严谨 Git 初始行为校验
  const introLesson = publishedLessons.find((l) => l.id === "git-intro-basics");
  assert.ok(introLesson);
  const initStep = introLesson.gitSteps.find((s) => s.command === "git init");
  assert.ok(initStep);
  assert.match(initStep.explanation, /Unborn|符号引用/, "必须严谨说明初始分支指针未真正创建");
  assert.match(initStep.explanation, /index/, "必须明确说明暂存区索引文件在 init 时尚未创建");

  const statusStep = introLesson.gitSteps.find((s) => s.command === "git status");
  assert.ok(statusStep);
  assert.match(statusStep.repoStateAfter, /No commits yet/, "必须体现真实 Git 初始状态文案");

  // 补齐课程的覆盖清单：冲突、撤销、stash、标签、rebase/cherry-pick、协作、考古、内部原理
  const expectedNewLessons = [
    "git-merge-conflict",
    "git-undo-recover",
    "git-stash",
    "git-tag",
    "git-rebase-cherry-pick",
    "git-collab-workflow",
    "git-history-archaeology",
    "git-internals-basics",
  ];
  for (const id of expectedNewLessons) {
    const lesson = publishedLessons.find((l) => l.id === id);
    assert.ok(lesson, `缺少补齐课程 ${id}`);
    assert.ok(lesson.gitSteps.length >= 3, `${id} 应包含完整的命令步进数据`);
  }

  // V1.7 补齐课程：忽略规则、交互式暂存、交互式变基、worktree、子模块、钩子与 rerere
  const expectedV17Lessons = [
    "git-ignore-basics",
    "git-interactive-staging",
    "git-rebase-interactive",
    "git-worktree",
    "git-submodules-basics",
    "git-hooks-automation",
  ];
  for (const id of expectedV17Lessons) {
    const lesson = publishedLessons.find((l) => l.id === id);
    assert.ok(lesson, `缺少 V1.7 补齐课程 ${id}`);
    assert.ok(lesson.gitSteps.length >= 3, `${id} 应包含完整的命令步进数据`);
    for (const s of lesson.gitSteps) {
      assert.ok(s.command.startsWith("git "), `${id} 步进命令必须以 git 开头`);
    }
  }
  // 忽略规则课必须如实说明“已跟踪文件不受新增规则影响”这一陷阱
  const ignoreLesson = publishedLessons.find((l) => l.id === "git-ignore-basics");
  assert.match(
    ignoreLesson.markdown,
    /忽略规则只对[“"]未跟踪[”"]文件生效|不会让已跟踪文件停止被跟踪/,
    "忽略课必须点出已跟踪文件陷阱",
  );
  assert.match(ignoreLesson.markdown, /rm --cached/, "忽略课必须给出停止跟踪的正解");
  // 撤销课必须覆盖 reset 三种模式的影响范围
  const undo = publishedLessons.find((l) => l.id === "git-undo-recover");
  assert.match(undo.markdown, /--soft/, "撤销课应覆盖 reset --soft");
  assert.match(undo.markdown, /--mixed/, "撤销课应覆盖 reset --mixed");
  // worktree 课必须强调保护其他会话的工作区
  const worktree = publishedLessons.find((l) => l.id === "git-worktree");
  assert.match(worktree.markdown, /不要动其他|只处理自己创建|其他会话/, "worktree 课必须说明保护其他工作区");

  // 危险操作必须在课程中如实警示，且步进命令不得包含破坏性写法
  const undoLesson = publishedLessons.find((l) => l.id === "git-undo-recover");
  assert.match(undoLesson.markdown, /reset --hard/, "撤销课必须如实说明 reset --hard 的破坏性");
  const conflictLesson = publishedLessons.find((l) => l.id === "git-merge-conflict");
  assert.match(conflictLesson.markdown, /<<<<<<< /, "冲突课必须展示真实冲突标记");
  const rebaseLesson = publishedLessons.find((l) => l.id === "git-rebase-cherry-pick");
  assert.match(rebaseLesson.markdown, /只变基私有提交|黄金法则/, "rebase 课必须写明黄金法则");
  for (const lesson of publishedLessons) {
    for (const step of lesson.gitSteps) {
      assert.doesNotMatch(step.command, /push --force|push -f/, "步进命令禁止强推");
    }
  }
});

test("三本系统教材：新专题课程来源于仓库 Markdown，未完成状态不被虚报", () => {
  const expected = {
    "topic-csapp": {
      count: 14,
      modules: [
        "csapp-overview",
        "csapp-data-representation",
        "csapp-machine-code",
        "csapp-processor-performance",
        "csapp-system-services",
        "csapp-network-concurrency",
      ],
      required: [
        "csapp-system-tour",
        "csapp-bits-integers",
        "csapp-floating-point",
        "csapp-machine-representation",
        "csapp-control-procedures",
        "csapp-processor-pipeline",
        "csapp-program-optimization",
        "csapp-memory-hierarchy",
        "csapp-linking",
        "csapp-exceptional-control-flow",
        "csapp-virtual-memory",
        "csapp-system-io",
        "csapp-network-programming",
        "csapp-concurrency",
      ],
    },
    "topic-ostep": {
      count: 17,
      modules: [
        "ostep-cpu-virtualization",
        "ostep-memory-virtualization",
        "ostep-concurrency",
        "ostep-persistence",
      ],
      required: [
        "ostep-os-virtualization",
        "ostep-process-api",
        "ostep-cpu-scheduling",
        "ostep-address-space-api",
        "ostep-address-translation",
        "ostep-paging-tlb",
        "ostep-swap-replacement",
        "ostep-threads-races",
        "ostep-locks-atomics",
        "ostep-condition-semaphores",
        "ostep-concurrency-bugs",
        "ostep-io-devices-raid",
        "ostep-files-directories",
        "ostep-file-systems",
        "ostep-crash-consistency",
        "ostep-data-integrity",
        "ostep-distributed-files",
      ],
    },
    "topic-network": {
      count: 12,
      modules: [
        "net-overview",
        "net-application",
        "net-transport",
        "net-network-layer",
        "net-link-mobility-security",
      ],
      required: [
        "net-internet-overview",
        "net-app-http",
        "net-dns-cdn",
        "net-http-status-lab",
        "net-udp-tcp-sockets",
        "net-reliable-tcp",
        "net-congestion-control",
        "net-forwarding-ipv4-ipv6",
        "net-routing-control-plane",
        "net-link-layer",
        "net-wireless-mobile",
        "net-security-tls",
      ],
    },
  };

  for (const [topicId, spec] of Object.entries(expected)) {
    const topic = catalog.topics.find((item) => item.id === topicId);
    assert.ok(topic, `缺少 ${topicId}`);
    assert.equal(topic.status, "building", `${topicId} 应保持建设状态`);
    assert.deepEqual(
      topic.modules.map((item) => item.id),
      spec.modules,
      `${topicId} 模块目录错误`,
    );
    const lessons = topic.modules.flatMap((item) => item.lessons);
    assert.equal(lessons.length, spec.count, `${topicId} 课程数错误`);
    for (const id of spec.required) {
      const lesson = lessons.find((item) => item.id === id);
      assert.ok(lesson, `${topicId} 缺少课程 ${id}`);
      assert.equal(lesson.status, "published", `${id} 必须是可学习状态`);
      assert.ok(lesson.sourcePath?.startsWith("stages/topics/"), `${id} 必须有仓库 Markdown 来源`);
      assert.ok(
        ["now", "next", "advanced"].includes(lesson.priority ?? ""),
        `${id} 必须有导航优先级`,
      );
      assert.ok(lesson.markdown.length > 600, `${id} 正文过短`);
      for (const heading of [
        "Scenario：从一个具体问题出发",
        "Why：为什么这个问题值得系统理解",
        "Concept：核心概念",
        "Mental Model：把机制装进一张图",
        "Minimal Code：最小示例",
        "Observe：先预测，再运行",
        "Modify：只改一个有意义的条件",
        "Exercise：独立完成",
        "Real Usage：联系 Java 与工程实践",
        "来源与出处",
      ]) {
        assert.ok(lesson.markdown.includes(heading), `${id} 缺少教学段落 ${heading}`);
      }
      assert.ok(lesson.bookReference, `${id} 缺少原书引用`);
      assert.ok(
        lesson.bookReference.pdfPageStart > 0 &&
          lesson.bookReference.pdfPageEnd >= lesson.bookReference.pdfPageStart,
        `${id} 页码非法`,
      );
      assert.match(lesson.markdown, /PDF 第 \d+-\d+ 页/, `${id} 正文缺少 PDF 页码`);

      if (lesson.kind === "code") {
        assert.ok(lesson.code, `${id} 缺少 Java 源码`);
        assert.ok(lesson.codePath?.startsWith("stages/topics/"), `${id} 缺少源码路径`);
        assert.match(lesson.packageName, /^com\.javaroadmap\.(csapp|ostep|network)\./);
        const source = fs.readFileSync(path.resolve("..", lesson.codePath), "utf8");
        assert.equal(
          normalizeNewlines(lesson.code),
          normalizeNewlines(source),
          `${id} 网站源码与落盘示例不一致`,
        );
      }
    }
  }
});

test("三本系统教材配套示例：关键行为在源码中真实可观察", () => {
  const topicLessonSource = (topicId, lessonId) => {
    const topic = catalog.topics.find((item) => item.id === topicId);
    const lesson = topic.modules.flatMap((m) => m.lessons).find((l) => l.id === lessonId);
    assert.ok(lesson, `缺少课程 ${lessonId}`);
    assert.equal(lesson.kind, "code", `${lessonId} 应为代码课`);
    return lesson.code;
  };

  // CSAPP Ch11：TCP 必须真实回显（读一行 -> 原样写回 -> 客户端读回显），
  // 不允许退回“只发送不写回”的半成品。
  const echo = topicLessonSource("topic-csapp", "csapp-network-programming");
  assert.match(echo, /readLine/, "TCP 示例必须读取一行");
  assert.match(echo, /serverOut\.write|accepted\.getOutputStream\(\)\.write/, "服务端必须写回应答");
  assert.match(echo, /回显/, "必须验证客户端读到的回显");

  // CSAPP Ch12：必须同时呈现竞态与原子修复，而不是只提交一个线程池任务。
  const concurrency = topicLessonSource("topic-csapp", "csapp-concurrency");
  assert.match(concurrency, /plainCounter\+\+/, "必须有普通递增的竞态示范");
  assert.match(concurrency, /AtomicInteger/, "必须有原子对照");
  assert.match(concurrency, /期望 200000/, "必须写出期望值与不确定性的对比");

  // CSAPP Ch6：必须同时测量行优先与列优先访问。
  const memory = topicLessonSource("topic-csapp", "csapp-memory-hierarchy");
  assert.match(memory, /行遍历/, "必须有行遍历计时");
  assert.match(memory, /列遍历/, "必须有列遍历计时");

  // OSTEP 调度：必须实现 FIFO/SJF/RR 三种策略并输出周转/响应指标。
  const scheduling = topicLessonSource("topic-ostep", "ostep-cpu-scheduling");
  for (const keyword of ["FIFO", "SJF", "RR", "周转", "响应"]) {
    assert.ok(scheduling.includes(keyword), `调度示例缺少 ${keyword}`);
  }

  // OSTEP 崩溃一致性：必须枚举崩溃点并区分 COMMIT 前后的恢复结果。
  const crash = topicLessonSource("topic-ostep", "ostep-crash-consistency");
  assert.match(crash, /COMMIT/, "必须有日志提交点");
  assert.match(crash, /丢弃/, "必须有未提交时丢弃恢复");
  assert.match(crash, /重放/, "必须有已提交时重放恢复");

  // OSTEP 条件变量：必须真实阻塞（offer 探测 + put 阻塞），而不是单线程放取。
  const semaphore = topicLessonSource("topic-ostep", "ostep-condition-semaphores");
  assert.match(semaphore, /offer\(/, "必须用 offer 探测队列已满");
  assert.match(semaphore, /阻塞/, "必须显式说明阻塞行为");

  // 网络：UDP/TCP 对照必须包含真实 UDP receive；HTTP 实验必须区分 200/404/连接失败。
  const udpTcp = topicLessonSource("topic-network", "net-udp-tcp-sockets");
  assert.match(udpTcp, /DatagramPacket/, "必须有 UDP 数据报");
  assert.match(udpTcp, /receiver\.receive|incoming\.getLength|receive\(/, "UDP 必须真实接收");
  const httpStatus = topicLessonSource("topic-network", "net-http-status-lab");
  assert.match(httpStatus, /200/, "HTTP 实验必须有 200");
  assert.match(httpStatus, /404/, "HTTP 实验必须有 404");
  assert.match(httpStatus, /ConnectException/, "HTTP 实验必须区分连接失败");
});

test("三本系统教材：页码修正由 PDF 书签核对驱动且不被回退", () => {
  const lessonRef = (topicId, lessonId) => {
    const topic = catalog.topics.find((item) => item.id === topicId);
    return topic.modules.flatMap((m) => m.lessons).find((l) => l.id === lessonId).bookReference;
  };
  // 以下页码均已用本机原书 PDF 数字书签核对（2.1 起于 71、3.1 起于 203、第 2 章起于 18）。
  const bits = lessonRef("topic-csapp", "csapp-bits-integers");
  assert.equal(bits.pdfPageStart, 71, "CSAPP 2.1 节起于 PDF 71，不是章首页 68");
  assert.equal(bits.pdfPageEnd, 145, "2.1-2.3 结束于 2.4 起点边界 145");
  const machine = lessonRef("topic-csapp", "csapp-machine-representation");
  assert.equal(machine.pdfPageStart, 203, "CSAPP 3.1 节起于 PDF 203");
  const osVirtual = lessonRef("topic-ostep", "ostep-os-virtualization");
  assert.equal(osVirtual.pdfPageStart, 18, "OSTEP 第 2 章起于 PDF 18");
  const statusLab = lessonRef("topic-network", "net-http-status-lab");
  assert.equal(statusLab.pdfPageStart, 82, "网络 2.2 节起于 PDF 82");
  assert.equal(statusLab.pdfPageEnd, 95);
  assert.equal(statusLab.printPage, "63-76");
});

test("三本系统教材索引：使用实际版本目录和物理页码，不把部分上线虚报为全书建成", () => {
  assert.equal(catalog.booksIndex.length, 6);
  const byId = Object.fromEntries(catalog.booksIndex.map((b) => [b.id, b]));
  assert.equal(byId["book-csapp"].totalPages, 1122);
  assert.equal(byId["book-ostep"].totalPages, 498);
  assert.equal(byId["book-network"].totalPages, 505);
  for (const id of ["book-csapp", "book-ostep", "book-network"]) {
    assert.equal(byId[id].status, "integrated-topic", `${id} 应表示已建专题而非完成掌握`);
  }
  const chapters = Object.fromEntries(
    byId["book-network"].keyChapters.map((item) => [item.chapter, item.pdfPages]),
  );
  assert.equal(chapters["第 1 章"], "20-72", "网络第 1 章 PDF 起始页必须为 20");
  assert.equal(chapters["第 8 章"], "417-473");
  const csappChapters = Object.fromEntries(
    byId["book-csapp"].keyChapters.map((item) => [item.chapter, item.pdfPages]),
  );
  assert.equal(csappChapters["Chapter 1"], "38-66");
  assert.equal(csappChapters["Chapter 12"], "1008-1078");
});

test("V1.4 《On Java 8》补充关联：全部关联对应有效课程并标注现代 JDK 差异", () => {
  assert.ok(Array.isArray(catalog.onJavaLinks));
  // 覆盖全部 45 节已发布主线课程（Stage 01×13 + Stage 02×14 + Stage 03×18）
  assert.equal(catalog.onJavaLinks.length, 45);

  const validStageIds = new Set(catalog.stages.map((s) => s.id));
  const validLessonIds = new Set(catalog.lessons.map((l) => l.id));

  for (const link of catalog.onJavaLinks) {
    assert.ok(validStageIds.has(link.stageId), `非法 stageId: ${link.stageId}`);
    assert.ok(
      validLessonIds.has(link.lessonId),
      `非法 lessonId: ${link.lessonId}`,
    );
    assert.ok(link.bookChapter.startsWith("第"));
    assert.ok(link.pdfPages.length > 0);
    assert.ok(
      ["full-overlap", "extension", "gap-supplement", "advanced"].includes(
        link.overlapType,
      ),
    );
    assert.ok(link.rationale.length > 10);
  }

  // 核对关键章节真实页码
  const encapsulation = catalog.onJavaLinks.find(
    (l) => l.lessonId === "s02-encapsulation-basics",
  );
  assert.ok(encapsulation);
  assert.equal(encapsulation.pdfPages, "173-185", "封装章节起点必须对应真实 PDF 第 173 页");
});

test("V1.4 外部教材库索引：完整收录 6 本教材元数据", () => {
  assert.ok(Array.isArray(catalog.booksIndex));
  assert.equal(catalog.booksIndex.length, 6);

  const bookIds = catalog.booksIndex.map((b) => b.id);
  assert.deepEqual(bookIds, [
    "book-hello-algo",
    "book-pro-git",
    "book-on-java-8",
    "book-csapp",
    "book-ostep",
    "book-network",
  ]);

  for (const book of catalog.booksIndex) {
    assert.ok(book.totalPages > 100);
    assert.ok(Array.isArray(book.keyChapters) && book.keyChapters.length > 0);
    assert.ok(
      ["integrated-core", "integrated-topic", "indexed-future"].includes(
        book.status,
      ),
    );
  }
});
