import { useState } from "react";
import {
  Layers,
  BookOpen,
  Smartphone,
  Monitor,
  CheckCircle2,
  Binary,
  Sparkles,
} from "lucide-react";

export function DesignPrototypeView() {
  const [activePlan, setActivePlan] = useState<"plan-a" | "plan-b">("plan-b");
  const [activeScreen, setActiveScreen] = useState<string>("desktop-home");

  const screens = [
    { id: "desktop-home", label: "1. 桌面首页" },
    { id: "mobile-home", label: "2. 移动端首页" },
    { id: "java-tracks", label: "3. Java主线目录" },
    { id: "algo-topics", label: "4. 算法专题目录" },
    { id: "git-topics", label: "5. Git专题目录" },
    { id: "lesson-reading", label: "6. 正文阅读页" },
    { id: "global-search", label: "7. 全局搜索界面" },
    { id: "learning-records", label: "8. 学习记录入口" },
  ];

  return (
    <div className="prototype-container">
      {/* 顶部横幅 */}
      <div className="proto-header">
        <div className="proto-badge">
          <Sparkles size={14} />
          <span>V1.4-A 视觉与交互规范 · 双原型比对与选型论证</span>
        </div>
        <h1 className="proto-title">Fumadocs / Starlight / shadcn 设计模式双原型</h1>
        <p className="proto-subtitle">
          依据工业级技术文档与学习平台设计规范，打造「方案一：专业文档阅读式」与「方案二：学习工作台与专题融合式」两套真实交互模型，全量覆盖
          8 大关键交互场景。
        </p>

        {/* 方案切换 Tabs */}
        <div className="proto-plan-selector">
          <button
            type="button"
            className={`proto-plan-btn ${activePlan === "plan-a" ? "active" : ""}`}
            onClick={() => setActivePlan("plan-a")}
          >
            <div className="plan-name">方案一：专业文档阅读式布局 (Docs-Centric)</div>
            <div className="plan-sub">借鉴 Fumadocs / Starlight，以多级技术文档树为中枢</div>
          </button>
          <button
            type="button"
            className={`proto-plan-btn ${activePlan === "plan-b" ? "active" : ""}`}
            onClick={() => setActivePlan("plan-b")}
          >
            <div className="plan-name">
              方案二：学习工作台与专题融合式布局 (Hybrid Workbench) ★ 默认胜出
            </div>
            <div className="plan-sub">5 大支柱体系，兼具研读、实验、打卡与多设备自适应</div>
          </button>
        </div>

        {/* 8 大场景切换 */}
        <div className="proto-screens-tabs">
          {screens.map((sc) => (
            <button
              key={sc.id}
              type="button"
              className={`proto-screen-btn ${activeScreen === sc.id ? "active" : ""}`}
              onClick={() => setActiveScreen(sc.id)}
            >
              {sc.label}
            </button>
          ))}
        </div>
      </div>

      {/* 原型预览主视窗 */}
      <div className="proto-viewport-wrapper">
        <div className="proto-viewport-bar">
          <div className="proto-dots">
            <span className="dot red" />
            <span className="dot yellow" />
            <span className="dot green" />
          </div>
          <div className="proto-url-bar">
            {activePlan === "plan-a"
              ? "https://javaroadmap.lab/docs/v1.4-alpha/docs-centric"
              : "https://javaroadmap.lab/workbench/v1.4-hybrid-system"}
          </div>
          <span className="proto-device-tag">
            {activeScreen === "mobile-home" ? (
              <>
                <Smartphone size={13} /> 390px 移动端视口
              </>
            ) : (
              <>
                <Monitor size={13} /> 1440px 桌面宽屏
              </>
            )}
          </span>
        </div>

        <div className={`proto-screen-body ${activeScreen === "mobile-home" ? "is-mobile" : ""}`}>
          <PrototypeScreenRenderer plan={activePlan} screen={activeScreen} />
        </div>
      </div>

      {/* 五维选型论证表格 */}
      <div className="proto-evaluation-section">
        <div className="section-title">
          <h2>
            <Layers size={18} />
            <span>五维客观评估与选型决策结论</span>
          </h2>
        </div>

        <div className="eval-table-wrapper">
          <table className="eval-table">
            <thead>
              <tr>
                <th>评估维度</th>
                <th>方案一：专业文档阅读式 (Docs-Centric)</th>
                <th>方案二：学习工作台与专题融合式 (Hybrid)</th>
                <th>评估结论</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>1. 信息架构清晰度</strong></td>
                <td>深度树状层级，查阅单点知识方便，但练习和打卡藏在最底层，缺乏整体任务心流。</td>
                <td><strong>5 大支柱一目了然</strong>：工作台（当前在哪）、主线与专题（学什么）、实验室（动手练）、记录（沉淀）。</td>
                <td><span className="eval-winner">方案二胜出</span></td>
              </tr>
              <tr>
                <td><strong>2. 阅读沉浸体验</strong></td>
                <td>右侧 TOC 大纲常驻，排版呼吸感强，长篇连读非常流畅。</td>
                <td>同样具备面包屑、TOC、右栏可折叠设计，并提供全屏阅读沉浸模式。</td>
                <td><span className="eval-tie">持平</span></td>
              </tr>
              <tr>
                <td><strong>3. 移动端操作便捷度</strong></td>
                <td>依赖深层抽屉折叠菜单，切换大类别（如从 Stage 01 跳到 Git 专题）需要多级返回。</td>
                <td><strong>原生 App 级底部 5 支柱固定导航</strong>，配合上弹半屏 Sheet，单手切换触达率 100%。</td>
                <td><span className="eval-winner">方案二胜出</span></td>
              </tr>
              <tr>
                <td><strong>4. 长期扩展性</strong></td>
                <td>当后续追加算法 15 章、Git 10 章及操作系统时，单一左侧树滚动深度超过 80 项，负荷极高。</td>
                <td><strong>专题独立为 Hub 体系</strong>，分类清晰（已发布 / 持续建设 / 资料索引），主线与专题相互解耦。</td>
                <td><span className="eval-winner">方案二胜出</span></td>
              </tr>
              <tr>
                <td><strong>5. 视觉一致性与工程规范</strong></td>
                <td>遵循 Fumadocs 规范，中规中矩。</td>
                <td>延续暖纸（Warm Paper）设计语言，使用 shadcn 极简边框与统一 Lucide SVG，无花哨 Emoji。</td>
                <td><span className="eval-tie">持平</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="eval-summary-card">
          <CheckCircle2 size={20} className="text-success" />
          <div className="eval-summary-text">
            <strong>决策选型结论：</strong>
            JavaRoadmap Lab V1.4 全面采用「<strong>方案二：学习工作台与专题目录融合式布局</strong>」作为正式生产实施方案，并在正式前端中无缝运行。两套原型的设计规范均已在 <code>docs/javaroadmap_lab/v1.4_design_proposals.md</code> 中归档存证。
          </div>
        </div>
      </div>
    </div>
  );
}

// 模拟渲染 8 大场景具体界面
function PrototypeScreenRenderer({
  plan,
  screen,
}: {
  plan: "plan-a" | "plan-b";
  screen: string;
}) {
  if (screen === "desktop-home") {
    return plan === "plan-a" ? (
      <div className="proto-mock-docs-home">
        <header className="mock-docs-header">
          <div className="mock-brand">JavaRoadmap Docs</div>
          <div className="mock-nav-links">
            <span className="mock-nav-link active">文档库</span>
            <span className="mock-nav-link">API 参考</span>
            <span className="mock-nav-link">更新日志</span>
          </div>
          <div className="mock-search-bar">⌘K 全局快速检索...</div>
        </header>
        <div className="mock-docs-hero">
          <h1>高质量 Java 全栈与计算机科学文档库</h1>
          <p>从语法、面向对象到系统底层的一站式权威指南，基于真实工程实践提炼。</p>
          <div className="mock-docs-cards">
            <div className="mock-card">
              <h3>Java 核心主线</h3>
              <p>Stage 01 ~ 03 核心语法、内存与集合。</p>
            </div>
            <div className="mock-card">
              <h3>Hello 算法专题</h3>
              <p>复杂度、链表、树堆图与算法策略。</p>
            </div>
            <div className="mock-card">
              <h3>Pro Git 工程指南</h3>
              <p>三大空间、分支变迁与协作规范。</p>
            </div>
          </div>
        </div>
      </div>
    ) : (
      <div className="proto-mock-workbench-home">
        <header className="mock-workbench-header">
          <div className="mock-brand">JavaRoadmap Lab V1.4</div>
          <div className="mock-pillars">
            <span className="mock-pillar active">学习工作台</span>
            <span className="mock-pillar">主线课程</span>
            <span className="mock-pillar">专题学习</span>
            <span className="mock-pillar">编程实验室</span>
            <span className="mock-pillar">学习记录</span>
          </div>
          <div className="mock-search-btn">⌘K 检索</div>
        </header>
        <div className="mock-wb-body">
          <div className="mock-task-card">
            <span className="tag">CURRENT 当前学习</span>
            <h2>Stage 02 · 面向对象基础：构造方法与 this 关键字</h2>
            <div className="mock-action-row">
              <button type="button" className="mock-btn primary">继续研读代码</button>
              <button type="button" className="mock-btn">进入对应编程实验</button>
            </div>
          </div>
          <div className="mock-wb-grid">
            <div className="mock-stat-tile">
              <div className="num">19</div>
              <div className="lbl">已掌握主线课时</div>
            </div>
            <div className="mock-stat-tile">
              <div className="num">8</div>
              <div className="lbl">Hello 算法已学</div>
            </div>
            <div className="mock-stat-tile">
              <div className="num">5</div>
              <div className="lbl">Pro Git 沙箱实战</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "mobile-home") {
    return plan === "plan-a" ? (
      <div className="proto-mock-mobile-a">
        <div className="mock-mobile-top">
          <span>☰</span>
          <strong>JavaRoadmap Docs</strong>
          <span>🔍</span>
        </div>
        <div className="mock-mobile-content">
          <div className="mock-m-hero">全栈系统文档库</div>
          <div className="mock-tree-folder">▸ 1. Java 核心主线</div>
          <div className="mock-tree-folder">▸ 2. Hello 算法专题</div>
          <div className="mock-tree-folder">▸ 3. Pro Git 工程指南</div>
        </div>
      </div>
    ) : (
      <div className="proto-mock-mobile-b">
        <div className="mock-mobile-top">
          <strong>JavaRoadmap Lab</strong>
          <span className="mock-search-icon">🔍</span>
        </div>
        <div className="mock-mobile-content">
          <div className="mock-current-pill">正在学习：Stage 02 构造方法</div>
          <div className="mock-mobile-cards">
            <div className="mock-m-card">主线：Java 面向对象 (6/6)</div>
            <div className="mock-m-card">专题：Hello 算法 (8 门已发布)</div>
            <div className="mock-m-card">专题：Pro Git 实践 (5 门已发布)</div>
          </div>
        </div>
        {/* 原生 App 级底部 5 支柱 */}
        <div className="mock-bottom-bar">
          <div className="mock-tab active">工作台</div>
          <div className="mock-tab">主线</div>
          <div className="mock-tab">专题</div>
          <div className="mock-tab">实验</div>
          <div className="mock-tab">记录</div>
        </div>
      </div>
    );
  }

  if (screen === "java-tracks") {
    return (
      <div className="proto-mock-split-view">
        <aside className="mock-sidebar">
          <div className="sidebar-group-title">Stage 01 语法与结构 (已掌握)</div>
          <div className="sidebar-item">Day 01 输出与变量 ✓</div>
          <div className="sidebar-item">Day 02 数据类型与运算符 ✓</div>
          <div className="sidebar-item">Day 04 循环结构与累加 ✓</div>
          <div className="sidebar-group-title">Stage 02 面向对象基础 (进行中)</div>
          <div className="sidebar-item active">s02-class-basics 类与对象基础</div>
          <div className="sidebar-item">s02-constructor-this 构造方法</div>
          <div className="sidebar-item">s02-encapsulation-why 为什么需要封装</div>
        </aside>
        <main className="mock-main-content">
          <div className="mock-doc-header">
            <span className="mock-bc">主线课程 &gt; Stage 02 &gt; 类与对象基础</span>
            <h1>类与对象基础：从结构体到微型服务提供者</h1>
          </div>
          <p className="mock-p">
            面向对象不仅是语法上的 class 声明，更是一种职责划分心智模型。《On Java 8》原著指出：每个对象都应当被视为向系统提供特定服务的服务提供者。
          </p>
          <div className="mock-code-box">
            <code>package com.javaroadmap.stage02.day01classobject;</code>
          </div>
        </main>
      </div>
    );
  }

  if (screen === "algo-topics") {
    return (
      <div className="proto-mock-split-view">
        <aside className="mock-sidebar">
          <div className="sidebar-group-title">复杂度分析 (已发布)</div>
          <div className="sidebar-item active">algo-complexity-eval 效率评估</div>
          <div className="sidebar-item">algo-time-complexity 大 O 阶梯</div>
          <div className="sidebar-group-title">线性数据结构 (已发布)</div>
          <div className="sidebar-item">algo-array 数组连续内存</div>
          <div className="sidebar-item">algo-linkedlist 单向链表设计</div>
          <div className="sidebar-item">algo-queue 环形队列实现</div>
          <div className="sidebar-group-title">树与图 (持续建设中)</div>
          <div className="sidebar-item disabled">二叉树遍历与递归 (规划)</div>
        </aside>
        <main className="mock-main-content">
          <div className="mock-doc-header">
            <span className="mock-bc">专题学习 &gt; Hello 算法 &gt; 复杂度分析</span>
            <h1>算法效率评估与渐近复杂度</h1>
            <span className="mock-tag">来源：《Hello 算法》第 2 章 2.1 节 (P.24)</span>
          </div>
          <div className="mock-vis-box">
            [交互观察：数据规模 n=16 时，O(1) 仅需 1 次，而 O(n²) 需 256 次运算]
          </div>
          <p className="mock-p">
            为什么不能用跑表计时？因为硬件波动与常数干扰。渐近复杂度让我们抓住数据规模增长时的主要矛盾。
          </p>
        </main>
      </div>
    );
  }

  if (screen === "git-topics") {
    return (
      <div className="proto-mock-split-view">
        <aside className="mock-sidebar">
          <div className="sidebar-group-title">1. 起步与核心模型 (已发布)</div>
          <div className="sidebar-item active">git-intro-basics 初始化与三空间</div>
          <div className="sidebar-item">git-record-changes 暂存与原子提交</div>
          <div className="sidebar-group-title">2. 分支与合并策略 (已发布)</div>
          <div className="sidebar-item">git-branch-create-merge 快进与三方合并</div>
          <div className="sidebar-item">git-remote-collab 裸仓库协作</div>
          <div className="sidebar-group-title">3. 高级工具与安全 (持续建设中)</div>
          <div className="sidebar-item disabled">rebase 变基与 cherry-pick (规划)</div>
        </aside>
        <main className="mock-main-content">
          <div className="mock-doc-header">
            <span className="mock-bc">专题学习 &gt; Pro Git &gt; 起步与核心模型</span>
            <h1>Git 快照流与三大工作区数据流转</h1>
            <span className="mock-tag">来源：《Pro Git》第 1 章 1.3 节 (P.33)</span>
          </div>
          <div className="mock-vis-box">
            [实操命令流转：工作目录 (Working) ➔ 暂存区 (Index) ➔ 版本历史 (HEAD)]
          </div>
          <div className="mock-cmd-card">
            <code>$ git status -s</code>
            <p>观察文件从未追踪（??）到已暂存（A）的状态迁移。</p>
          </div>
        </main>
      </div>
    );
  }

  if (screen === "lesson-reading") {
    return (
      <div className="proto-mock-split-view">
        <main className="mock-reader-full">
          <div className="mock-reader-nav">
            <span className="mock-crumb">Stage 01 变量与内存 &gt; Day 05 数组基础</span>
            <button type="button" className="mock-mark-btn">标记掌握 ✓</button>
          </div>
          <h2>数组基础与连续内存寻址</h2>
          <p>
            数组是内存中一块连续分配的物理空间。在 Java 中，数组本身是一个堆上的对象实体，变量持有指向该实体的引用。
          </p>
          <div className="mock-onjava-card">
            <strong>📚《On Java 8》原著延伸阅读（第 3 章 P.41）：</strong>
            <p>
              原书深度指出：对象数组存储的是连续的引用指针，而不是对象实体本身。理解这一点对于避免空指针异常（NPE）至关重要。
            </p>
            <span className="mock-diff-badge">现代 JDK 演进：Java 10 引入 var，局部变量可类型推断</span>
          </div>
        </main>
      </div>
    );
  }

  if (screen === "global-search") {
    return (
      <div className="proto-mock-dialog-backdrop">
        <div className="mock-dialog">
          <div className="mock-dialog-input">
            🔍 <span>复杂度</span>
          </div>
          <div className="mock-dialog-list">
            <div className="mock-dialog-item active">
              <Binary size={14} />
              <div>
                <strong>算法效率评估与渐近复杂度</strong>
                <div className="sub">Hello 算法 · 复杂度分析 · P.24</div>
              </div>
            </div>
            <div className="mock-dialog-item">
              <Binary size={14} />
              <div>
                <strong>常见时间复杂度与大 O 阶梯</strong>
                <div className="sub">Hello 算法 · 复杂度分析 · P.34</div>
              </div>
            </div>
            <div className="mock-dialog-item">
              <BookOpen size={14} />
              <div>
                <strong>CSAPP：程序的机器级表示</strong>
                <div className="sub">权威教材索引 · 1122页 · 待接入</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "learning-records") {
    return (
      <div className="proto-mock-records-view">
        <div className="records-summary-row">
          <div className="rec-tile">
            <div className="val">19</div>
            <div className="lab">已读主线课时</div>
          </div>
          <div className="rec-tile">
            <div className="val">13</div>
            <div className="lab">已掌握专题课时</div>
          </div>
          <div className="rec-tile">
            <div className="val">100%</div>
            <div className="lab">Stage 01 达成率</div>
          </div>
        </div>
        <div className="backup-controls-mock">
          <button type="button" className="mock-btn primary">导出无损学习备份 (JSON)</button>
          <button type="button" className="mock-btn">导入历史备份数据</button>
        </div>
      </div>
    );
  }

  return null;
}
