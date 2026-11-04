import { useState } from "react";
import {
  Binary,
  GitBranch,
  ArrowRight,
  RotateCcw,
  Plus,
  Minus,
  Layers,
} from "lucide-react";

interface VisualizerProps {
  type: string;
}

// 按专题课程传入的 type 分派交互演示；未知 type 返回空内容而非渲染错误组件。
export function TopicVisualizer({ type }: VisualizerProps) {
  if (type === "complexity-ladder") {
    return <ComplexityLadderDemo />;
  }
  if (type === "array-addressing") {
    return <ArrayAddressingDemo />;
  }
  if (type === "linkedlist-pointer") {
    return <LinkedListPointerDemo />;
  }
  if (type === "circular-queue") {
    return <CircularQueueDemo />;
  }
  if (type === "git-three-trees") {
    return <GitThreeTreesDemo />;
  }
  if (type === "git-merge-tree") {
    return <GitMergeTreeDemo />;
  }
  return null;
}

// 1. 算法：大 O 复杂度阶梯与算力对比
// 柱长采用 log₁₀(运算次数) 等比缩放（明确标注对数刻度）：
// 数值之间相差数十亿倍时线性刻度只能把小值压成 0 宽度，
// 对数刻度保证"柱长差相同 = 数量级差相同"，且任何数值都不会被钳成 100%。
function ComplexityLadderDemo() {
  const [n, setN] = useState<number>(16);

  const tiers: Array<{ name: string; calc: number; color: string; logVal?: number }> = [
    { name: "常数阶 O(1)", calc: 1, color: "#0d9488" },
    { name: "对数阶 O(log n)", calc: Math.max(1, Math.round(Math.log2(n))), color: "#059669" },
    { name: "线性阶 O(n)", calc: n, color: "#2563eb" },
    { name: "线性对数阶 O(n log n)", calc: Math.round(n * Math.log2(n)), color: "#d97706" },
    { name: "平方阶 O(n²)", calc: n * n, color: "#ea580c" },
    // 2ⁿ 用 n·log₁₀2 精确求对数，n=64 也不会溢出或截断
    { name: "指数阶 O(2ⁿ)", calc: Math.pow(2, n), color: "#e11d48", logVal: n * Math.log10(2) },
  ];

  const formatCount = (v: number) =>
    v < 1_000_000
      ? v.toLocaleString("en-US")
      : `≈10^${Math.log10(v).toFixed(1)}`;
  const logVals = tiers.map((t) => t.logVal ?? Math.log10(Math.max(1, t.calc)));
  const maxLog = Math.max(...logVals);

  return (
    <div className="visualizer-card">
      <div className="visualizer-header">
        <div className="visualizer-title">
          <Binary size={16} />
          <span>交互观察：大 O 渐近复杂度增长断崖（数据规模 n = {n}）</span>
          <span className="ladder-scale-badge">对数刻度 log₁₀</span>
        </div>
        <div className="visualizer-controls">
          {[4, 8, 16, 32, 64].map((val) => (
            <button
              key={val}
              type="button"
              className={`vis-btn ${n === val ? "active" : ""}`}
              aria-pressed={n === val}
              onClick={() => setN(val)}
            >
              n={val}
            </button>
          ))}
        </div>
      </div>

      <div className="ladder-bars">
        {tiers.map((tier, i) => {
          const barWidth = Math.max(2, (logVals[i] / maxLog) * 100);
          return (
            <div key={tier.name} className="ladder-row">
              <span className="ladder-label">{tier.name}</span>
              <div className="ladder-track">
                <div
                  className="ladder-fill"
                  style={{ width: `${barWidth}%`, backgroundColor: tier.color }}
                />
              </div>
              <span className="ladder-val">{formatCount(tier.calc)} 次</span>
            </div>
          );
        })}
      </div>
      <div className="visualizer-foot">
        💡 柱长按 log₁₀(运算次数) 等比缩放——柱长差相同即数量级差相同，用于同屏对比相差数十亿倍的数值，具体次数以右侧数字为准。切换 n 观察：常数与对数阶几乎不动，平方阶稳定右移，指数阶 2ⁿ 一骑绝尘（n=64 时约 1.8×10¹⁹ 次——不是计算机"无法计算"，而是要在可感知的极长时间内才逐步完成）。这正是算法优化的决定性意义。
      </div>
    </div>
  );
}

// 2. 算法：数组连续内存寻址演算
function ArrayAddressingDemo() {
  const [index, setIndex] = useState<number>(2);
  const baseAddress = 1000;
  const elementSize = 4; // int 占 4 字节
  const targetAddress = baseAddress + index * elementSize;

  const cells = [
    { i: 0, val: 20 },
    { i: 1, val: 40 },
    { i: 2, val: 60 },
    { i: 3, val: 80 },
    { i: 4, val: 100 },
  ];

  return (
    <div className="visualizer-card">
      <div className="visualizer-header">
        <div className="visualizer-title">
          <Layers size={16} />
          <span>连续内存寻址推导（简化教学模型）：Target = Base + Index × Size</span>
        </div>
      </div>

      <div className="memory-slots" role="group" aria-label="数组内存槽位，点击或用 Tab+Enter 选择下标">
        {cells.map((cell) => {
          const addr = baseAddress + cell.i * elementSize;
          const isTarget = cell.i === index;
          return (
            <button
              key={cell.i}
              type="button"
              className={`memory-slot ${isTarget ? "active-slot" : ""}`}
              aria-pressed={isTarget}
              aria-label={`下标 ${cell.i}，模拟地址 0x${addr.toString(16).toUpperCase()}`}
              onClick={() => setIndex(cell.i)}
            >
              <div className="slot-addr">模拟地址 0x{addr.toString(16).toUpperCase()}</div>
              <div className="slot-val">{cell.val}</div>
              <div className="slot-idx">下标 [{cell.i}]</div>
            </button>
          );
        })}
      </div>

      <div className="addressing-formula">
        <span>寻址演算：</span>
        <code>0x{baseAddress.toString(16).toUpperCase()} + ({index} × {elementSize})</code>
        <ArrowRight size={14} />
        <strong className="target-addr-badge">
          模拟地址 0x{targetAddress.toString(16).toUpperCase()} (耗时 O(1))
        </strong>
      </div>
      <div className="visualizer-foot">
        💡 核心机制：CPU 能够通过单次加法与乘法在 O(1) 常数时间内定位任何下标，这是数组成为最基础线性结构的物理根基。图中地址是便于理解的模拟示意值，并非真实物理内存地址；JVM 的实际内存布局由运行时决定。
      </div>
    </div>
  );
}

// 3. 算法：单向链表节点重排
function LinkedListPointerDemo() {
  const [step, setStep] = useState<number>(0);

  const stepsInfo = [
    {
      title: "初始状态",
      desc: "Node(1) 的 next 指向 Node(3)。现在准备插入 Node(2)。",
    },
    {
      title: "第一步：安全挂载新节点",
      desc: "执行 node2.next = node1.next。Node(2) 现在指向 Node(3)。(若先执行 node1.next = node2 则会导致 Node(3) 丢失！)",
    },
    {
      title: "第二步：前驱节点指向新节点",
      desc: "执行 node1.next = node2。链表完成平滑接入：1 -> 2 -> 3。(全过程耗时 O(1))",
    },
  ];

  return (
    <div className="visualizer-card">
      <div className="visualizer-header">
        <div className="visualizer-title">
          <Binary size={16} />
          <span>动态交互：单向链表 O(1) 插入指针流转（当前步骤 {step + 1}/3）</span>
        </div>
        <div className="visualizer-controls">
          <button
            type="button"
            className="vis-btn"
            disabled={step === 0}
            onClick={() => setStep((s) => s - 1)}
          >
            上一步
          </button>
          <button
            type="button"
            className="vis-btn active"
            disabled={step === 2}
            onClick={() => setStep((s) => s + 1)}
          >
            下一步
          </button>
          <button type="button" className="vis-btn" onClick={() => setStep(0)}>
            <RotateCcw size={12} />
          </button>
        </div>
      </div>

      <div className="linkedlist-diagram">
        <div className="ll-node">
          <div className="ll-val">Node(1)</div>
          <div className="ll-pointer">next</div>
        </div>
        <div className="ll-arrow">
          <ArrowRight size={20} className={step === 2 ? "arrow-redirect" : ""} />
        </div>
        {step >= 1 && (
          <div className="ll-node insert-node">
            <div className="ll-val">Node(2) [新插]</div>
            <div className="ll-pointer">next ➔ 3</div>
          </div>
        )}
        <div className="ll-arrow">
          <ArrowRight size={20} />
        </div>
        <div className="ll-node">
          <div className="ll-val">Node(3)</div>
          <div className="ll-pointer">next ➔ null</div>
        </div>
      </div>

      <div className="step-explain-box">
        <strong>{stepsInfo[step].title}：</strong>
        <span>{stepsInfo[step].desc}</span>
      </div>
    </div>
  );
}

// 4. 算法：环形队列模运算（预留空位法演示）
function CircularQueueDemo() {
  const [capacity] = useState(6);
  const [items, setItems] = useState<Array<number | null>>([10, 20, 30, null, null, null]);
  const [front, setFront] = useState(0);
  const [rear, setRear] = useState(3);
  const [nextVal, setNextVal] = useState(40);

  const enqueue = () => {
    if ((rear + 1) % capacity === front) return; // 满：预留空位法判满
    const newItems = [...items];
    newItems[rear] = nextVal;
    setItems(newItems);
    setRear((r) => (r + 1) % capacity);
    setNextVal((v) => v + 10);
  };

  const dequeue = () => {
    if (front === rear) return; // 空
    const newItems = [...items];
    newItems[front] = null;
    setItems(newItems);
    setFront((f) => (f + 1) % capacity);
  };

  const isFull = (rear + 1) % capacity === front;
  const isEmpty = front === rear;

  return (
    <div className="visualizer-card">
      <div className="visualizer-header">
        <div className="visualizer-title">
          <Layers size={16} />
          <span>环形队列（预留空位法演示）：指针模运算 (p + 1) % {capacity}</span>
        </div>
        <div className="visualizer-controls">
          <button
            type="button"
            className="vis-btn"
            disabled={isFull}
            onClick={enqueue}
          >
            <Plus size={12} /> 入队 Enqueue
          </button>
          <button
            type="button"
            className="vis-btn"
            disabled={isEmpty}
            onClick={dequeue}
          >
            <Minus size={12} /> 出队 Dequeue
          </button>
        </div>
      </div>

      <div className="queue-slots-row">
        {items.map((val, idx) => {
          const isFront = idx === front;
          const isRear = idx === rear;
          return (
            <div key={idx} className={`q-slot ${val !== null ? "occupied" : "empty"}`}>
              <div className="q-idx">[{idx}]</div>
              <div className="q-val">{val ?? "-"}</div>
              <div className="q-pointers">
                {isFront && <span className="p-badge p-front">front</span>}
                {isRear && <span className="p-badge p-rear">rear</span>}
              </div>
            </div>
          );
        })}
      </div>
      <div className="visualizer-foot">
        💡 状态：front = {front}，rear = {rear}。{isEmpty ? "【队列为空】" : ""}{" "}
        {isFull ? "【队列已满】" : ""}。出队后 front 槽位可以循环复用，彻底消除了普通数组的“假溢出”缺陷。
        本演示采用「预留空位法」判满（牺牲一格，{capacity} 个槽位最多存 {capacity - 1} 个元素）；
        配套 Java 源码采用的是「size 计数法」（{capacity} 个槽位可存满 {capacity} 个元素，空队列操作抛异常而非返回 -1），
        两者都是正确的环形队列实现，但不是同一份实现，对比时请注意区分。
      </div>
    </div>
  );
}

// 5. Git：三大工作区流转模型
function GitThreeTreesDemo() {
  const [state, setState] = useState<"working" | "staged" | "committed">("working");

  return (
    <div className="visualizer-card">
      <div className="visualizer-header">
        <div className="visualizer-title">
          <GitBranch size={16} />
          <span>Git 快照核心心智模型：三大空间数据流转</span>
        </div>
        <div className="visualizer-controls">
          <button
            type="button"
            className={`vis-btn ${state === "working" ? "active" : ""}`}
            aria-pressed={state === "working"}
            onClick={() => setState("working")}
          >
            1. 编辑文件
          </button>
          <button
            type="button"
            className={`vis-btn ${state === "staged" ? "active" : ""}`}
            aria-pressed={state === "staged"}
            onClick={() => setState("staged")}
          >
            2. git add
          </button>
          <button
            type="button"
            className={`vis-btn ${state === "committed" ? "active" : ""}`}
            aria-pressed={state === "committed"}
            onClick={() => setState("committed")}
          >
            3. git commit
          </button>
        </div>
      </div>

      <div className="three-trees-grid">
        <div className={`tree-column ${state === "working" ? "highlight-col" : ""}`}>
          <div className="tree-col-title">工作目录 (Working Dir)</div>
          <div className="tree-col-desc">沙盒环境，物理磁盘上的真实文件</div>
          <div className="tree-file">README.md (已修改)</div>
        </div>
        <div className="tree-flow-arrow">
          <ArrowRight size={18} />
          <code>git add</code>
        </div>
        <div className={`tree-column ${state === "staged" ? "highlight-col" : ""}`}>
          <div className="tree-col-title">暂存区 (Index / Stage)</div>
          <div className="tree-col-desc">准备提交的快照索引，构建原子提交流</div>
          <div className="tree-file">
            {state !== "working" ? "README.md (暂存中)" : "(空)"}
          </div>
        </div>
        <div className="tree-flow-arrow">
          <ArrowRight size={18} />
          <code>git commit</code>
        </div>
        <div className={`tree-column ${state === "committed" ? "highlight-col" : ""}`}>
          <div className="tree-col-title">版本库 (HEAD History)</div>
          <div className="tree-col-desc">持久化不可变快照对象库 (SHA-1/256)</div>
          <div className="tree-file">
            {state === "committed" ? "Commit: a1b2c3d" : "HEAD 处于原位置"}
          </div>
        </div>
      </div>
    </div>
  );
}

// 6. Git：分支与合并 DAG 拓扑图
function GitMergeTreeDemo() {
  const [mergeType, setMergeType] = useState<"fast-forward" | "three-way">("fast-forward");

  return (
    <div className="visualizer-card">
      <div className="visualizer-header">
        <div className="visualizer-title">
          <GitBranch size={16} />
          <span>分支合并拓扑对比：快进合并 (FF) vs 三方合并 (3-Way)</span>
        </div>
        <div className="visualizer-controls">
          <button
            type="button"
            className={`vis-btn ${mergeType === "fast-forward" ? "active" : ""}`}
            aria-pressed={mergeType === "fast-forward"}
            onClick={() => setMergeType("fast-forward")}
          >
            Fast-Forward (快进合并)
          </button>
          <button
            type="button"
            className={`vis-btn ${mergeType === "three-way" ? "active" : ""}`}
            aria-pressed={mergeType === "three-way"}
            onClick={() => setMergeType("three-way")}
          >
            Three-Way Merge (三方合并)
          </button>
        </div>
      </div>

      <div className="merge-dag-diagram">
        {mergeType === "fast-forward" ? (
          <div className="dag-flow">
            <span className="dag-node">C0</span>
            <span className="dag-line">───</span>
            <span className="dag-node">C1</span>
            <span className="dag-line">───</span>
            <span className="dag-node highlight-node">C2 (feature / main 指针直接前移)</span>
          </div>
        ) : (
          <div className="dag-split-flow">
            <div className="dag-branch-row">
              <span className="dag-node">C1</span>
              <span className="dag-line">───</span>
              <span className="dag-node">C2 (main)</span>
              <span className="dag-line">───────┐</span>
            </div>
            <div className="dag-merge-target">
              <span className="dag-node merge-commit">C4 (合并提交，含两个 Parent 指针)</span>
            </div>
            <div className="dag-branch-row">
              <span className="dag-node">C1</span>
              <span className="dag-line">───</span>
              <span className="dag-node">C3 (feature)</span>
              <span className="dag-line">──┘</span>
            </div>
          </div>
        )}
      </div>
      <div className="visualizer-foot">
        💡 原理差异：{mergeType === "fast-forward" ? "当目标分支没有发生新的分叉分化时，Git 仅需将 main 指针直接移到最新 commit 上，无需创建新的合并对象。" : "当两分支各自分化前行时，Git 寻找共同祖先（C1）进行三方合并，并生成拥有两个父节点的独立合并提交（C4）。"}
      </div>
    </div>
  );
}
