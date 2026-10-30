# JavaRoadmap Lab

**Learn · Build · Understand**

本地优先的 Java 学习工作台。围绕当前 Stage 01，把仓库课程、预测与修改、独立编程、课程提示和真实运行复盘串起来。网站不自动修改真实学习进度，不把参考实现算作独立完成。

## 环境与启动

需要 Node.js **22.12 或更新版本**及 npm。阅读、预测、编辑、备份不依赖 JDK 或外部 API；本地运行自己的 Java 需要可用的 JDK，课程继续采用完整 `public static void main(String[] args)` 与显式包声明。

从仓库根目录执行。

Windows PowerShell：

```powershell
Set-Location web
npm ci
npm run dev
```

macOS Terminal：

```bash
cd web
npm ci
npm run dev
```

浏览器打开终端显示的地址，默认是 [http://127.0.0.1:5173](http://127.0.0.1:5173)。开发服务仅监听本机；端口被占用会明确失败，可以关闭占用服务或使用 `npm run dev -- --port 5174`。换端口会换浏览器存储来源，先导出学习备份。按 `Ctrl+C` 停止服务。

`npm ci` 按锁文件安装，不需要模型密钥或账号。`dev` 会先读取仓库生成课程数据；原文改变后重新运行 `npm run content`，需要时刷新页面。

## 一次学习怎么进行

1. 工作台从[学习执行计划](../学习执行计划.md)展示当前任务；“继续学习”恢复上次课程与阅读位置。
2. 阅读 day01–day06 或相关概念深化课，先预测再到本地运行原例；“已阅读”只是阅读记录。
3. 进入“输出预测”填写真实输出，网站按确定答案判断；“条件修改”保留你的预测、观察与复盘。
4. 实验室从 TODO 骨架开始，自己写核心逻辑。草稿自动存到当前浏览器，看到保存成功后再关闭页面。
5. 卡住时逐级打开 L1–L4 课程提示；Debug 与 Review 是内置引导，界面标明未接入真实 AI。
6. 下载 Java 源码，按[本地运行指南](../docs/javaroadmap_lab/local-java.md)用 JDK 执行并导入实测记录；复盘页区分阅读、尝试、提示、参考查看与所列案例结果。

桌面默认 Monaco，手机默认轻量文本输入，可切换语法预览。编辑器提供 Java 语法高亮，**没有 Java 语言服务器、语义补全、编译器或浏览器 JVM**。完整参考源码需要明确确认后加载，不会替换草稿；查看会记录，历史参考的边界缺口另有说明。

## 备份与 Windows / Mac 迁移

打开顶部“数据与备份”，选择“导出完整备份”。文件包含代码草稿、课程位置、提示等级、预测作答、复盘、实测记录与主题。

在另一台设备用相同项目版本启动网站，选择备份文件，核对数量与时间后确认“合并”或“替换”。合并保留同项较新版本；发生同名草稿差异时会提示，重要版本应先分别备份。替换操作会先触发下载当前记录备份，请保留下载文件。

数据存储在当前站点来源的 IndexedDB 中，不随 Git 同步，不自动跨浏览器或跨设备同步。清理站点数据、隐私模式结束或换端口都可能使当前记录不可见。损坏和不兼容版本会拒绝导入；保存失败会明确提示，当前页面内容仍可导出保护。完整规则见[数据与服务边界](../docs/javaroadmap_lab/data-and-services.md)。

## 构建、测试与预览

以下命令均在 `web/` 运行：

```text
npm run typecheck
npm test
npm run test:e2e
npm run build
npm run check:build
npm run preview
```

首次运行浏览器测试时，若 Playwright 提示缺少浏览器，执行 `npx playwright install chromium`；系统浏览器或额外引擎的实际使用方式以 Playwright 配置和[验收记录](../docs/javaroadmap_lab/validation.md)为准。Java CLI 测试需要 `java` 与 `javac`；缺少 JDK 时相关测试的真实状态应保留在测试报告中。

`npm test` 覆盖数据、服务、内容转换与本地验证工具；`test:e2e` 覆盖实际浏览器流程。`build` 先生成内容并执行严格 TypeScript 检查，再生成 `dist/`。生产预览默认是 [http://127.0.0.1:4173](http://127.0.0.1:4173)。请通过 HTTP 服务访问，不直接双击 `dist/index.html`。

`check:build`检查构建后的相对入口资源、Monaco/worker及懒加载参考文件。网站CI在Ubuntu、Windows、macOS显式配置Node24和Temurin25，运行核心浏览器测试；PR另运行完整视觉扫描。失败日志、截图与trace通过Artifact保留。配置、实测结果与追加main必需检查的步骤见[V1.0质量验收](../docs/javaroadmap_lab/quality_v1/README.md)。

默认浏览器报告仍写入原验收产物目录；新一轮验收应设置独立`LAB_ARTIFACT_DIR`避免覆盖历史。设置`CI=true`时测试生产preview，先执行build；原命令顺序适用于默认开发模式。工具和E2E需要真实JDK；推荐JAVA_HOME指向完整JDK，运行原课程脚本时还应让PATH优先解析到同一JDK。

原 Java 课程回归仍从仓库根执行：

```powershell
powershell -ExecutionPolicy Bypass -File scripts\verify_java.ps1
```

```bash
bash scripts/verify_java.sh
```

参考课程回归不生成学生练习证据。具体已经执行的环境、命令、截图与限制见[验收记录](../docs/javaroadmap_lab/validation.md)，此处的可运行命令不代表已经在每种操作系统上实测。

## 静态部署

本次不自动部署公网。部署时在包含完整仓库课程资产的检出目录内，以 `web/` 为构建工作目录执行 `npm ci`、`npm run build`，把 `web/dist/` 作为静态站点根目录上传。不要上传源码树中的用户备份、草稿、证据、`node_modules/` 或系统环境文件。

Vite 使用 `base: './'`，页面使用 `#/...` 哈希导航；可以部署到域名根路径或例如 `/lab/` 的静态子目录，无需为课程路由配置服务端重写。保留整个 `dist/` 的相对目录结构，包括编辑器 worker、chunks 和 `reference/`。静态构建已包含当时的课程快照；仓库课程更新后需要重新构建。

新站点来源拥有新的本地存储空间，上线前先从旧地址导出备份，到新地址主动导入。正式托管建议使用 HTTPS，使浏览器指纹计算与下载等能力可用。Java 验证 CLI 留在本机，不能作为静态托管服务器的执行接口。

## 维护入口与范围

- [交付文档索引](../docs/javaroadmap_lab/README.md)：设计、架构、内容、数据与验收。
- [课程接入](../docs/javaroadmap_lab/content.md)：13 课、4 编程题、8 预测、4 修改，原资产只维护一次。
- [架构](../docs/javaroadmap_lab/architecture.md)：本地数据、内容生成与可替换服务的边界。
- [设计系统](../docs/javaroadmap_lab/design.md)：视觉方向、主题、排版与响应式规则。

`web/.gitignore` 排除依赖、构建、生成课程 JSON、参考资源、测试输出、缓存、环境文件和备份/证据 JSON。只提交源码、配置、锁文件和正式交付文档；课程和个人练习仍按仓库原结构维护。

当前外部能力边界：在线 Java 沙箱、真实模型调用、云同步与多用户账号没有启用。执行器与导师接口已分离；接入需要受控后端、隔离执行、认证、限流与费用控制，密钥不得进入前端源码或 `VITE_*` 环境变量。
