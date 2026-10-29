# 依赖选择与体积

2026-10-30 检查 npm 发布元数据、安装包许可证、锁文件与真实构建输出。首版没有账号服务、付费 API、远程字体、图片库或第三方页面资产。所有依赖通过 package-lock 固定实际版本，用 `npm ci` 复现。

| 用途 | 选择 | 许可证 | 必要性与代价 |
| --- | --- | --- | --- |
| 界面 | React / React DOM 19.3.1 | MIT | 共享状态、交互与可维护组件；不额外引入状态管理或路由库 |
| 构建与类型 | Vite 8.3.5 / TypeScript 5.9.3 | MIT / Apache-2.0 | 严格类型、静态构建、编辑器 worker；使用已实际验证的兼容版本 |
| 样式 | Tailwind CSS 4.3.3 与 Vite 插件 | MIT | 保留构建与基础样式，大部分视觉由原创 tokens/CSS 定义，无第三方组件模板 |
| 编辑器 | Monaco 0.57.0 | MIT | 真正适合桌面输入的编辑区；安装包约102 MB，运行时只加载编辑器核心与 Java 词法定义 |
| 原文渲染 | react-markdown 10.1.0 / remark-gfm 4.0.1 | MIT | 保留 Markdown 表格、列表与链接；不启用原始 HTML，不手写易错 Markdown 解析器 |
| 阅读代码高亮 | highlight.js 11.11.1 | BSD-3-Clause | 仅注册 Java；未知语言安全显示纯文本 |
| 图标 | lucide-react 1.64.0 | ISC | 按需导入统一线性图标，不下载非授权视觉素材 |
| 数据单测 | Vitest 5.0.5 / fake-indexeddb 6.2.6 | MIT / Apache-2.0 | 校验数据边界与持久化语义；真实浏览器另测，不用模拟替代真实环境 |
| 浏览器与无障碍 | Playwright 1.64.1 / axe-core Playwright 4.14.0 | Apache-2.0 / MPL-2.0 | 真实流程、六视口截图与 WCAG 规则扫描 |

发布元数据表明 React、Monaco、Vite、Vitest、Playwright、Tailwind 与图标库仍在更新；Markdown/GFM 使用稳定版本。检查元数据不等于未来维护保证，升级时应重跑现有测试。

首次审计发现 Monaco 固定的旧 DOMPurify 存在已报告漏洞，因此通过 npm override 固定到兼容修复版本 3.4.17，而非隐藏审计提示。修正后的 `npm audit --omit=dev` 为0项漏洞；最终检查见 [验收记录](validation.md)。

生产构建初始 JavaScript 约784 kB（gzip约265 kB），包括 React、全部当前课程及来源文档。Monaco 独立懒加载 chunk 约2.70 MB（gzip约695 kB），worker约304 kB；手机默认轻量输入，不加载专业编辑器。构建仍有大 chunk 提示，未通过调大阈值掩盖。实际 Lighthouse 结果与测量条件见验收记录。

没有为 IndexedDB、哈希、源码下载、CLI 运行或备份校验增加依赖，均使用浏览器/Node 标准能力。Lighthouse 13.6.0 与 Prettier 3.6.2 仅作为此次验证/排版的临时 npm 工具，不进入产品运行时；Lighthouse 使用 Node 22.19+。

维护来源：[Monaco](https://www.npmjs.com/package/monaco-editor)、[Vite](https://www.npmjs.com/package/vite)、[React](https://www.npmjs.com/package/react)、[Playwright](https://www.npmjs.com/package/@playwright/test)。
