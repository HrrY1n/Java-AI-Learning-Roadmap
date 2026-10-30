# 网站CI与合并门禁

## 检查范围

`.github/workflows/web.yml`与原`verify.yml`独立。原Windows/macOS × JDK21/25 Java参考回归不改动。

网站工作流在PR、main推送和手动执行时运行；不同时给同一分支push再跑重复矩阵。完整视觉在PR与手动执行中运行，main push只跑核心矩阵。

`web-core`在Ubuntu、Windows、macOS分别运行：

1. 官方setup-node配置Node24及基于`web/package-lock.json`的npm下载缓存（不缓存node_modules）。
2. 官方setup-java显式配置Temurin25，`JAVA_HOME`由Action设置，工具测试不依赖Runner偶然存在的Java。
3. `npm ci` → `npm run typecheck` → `npm test` → `npm run build` → `npm run check:build`。
4. 安装该锁文件版本的Chromium及操作系统依赖，运行`npx playwright test e2e/core.spec.ts`。
5. Playwright在CI中使用构建后的生产preview，禁止残留`test.only`，不复用其他开发服务器。没有continue-on-error或测试跳过伪通过。

`check:build`核对HTML相对JS/CSS/图标资源、Monaco懒加载chunk、编辑器worker和10个参考JSON。它不部署产物。

默认Bash步骤由GitHub以`-e -o pipefail`运行，`tee`不会吞掉npm/Playwright的失败退出码。任务超时15分钟，仅`contents: read`，不读取密钥，不使用`pull_request_target`。

## 原始证据与复现

每个核心任务上传`lab-core-操作系统-运行次数`，包含命令日志、Playwright HTML/JSON、失败截图和trace。失败后仍执行上传；文件缺失会提示，不能把“没有截图”解释为通过。成功核心任务另上传`lab-dist-操作系统`，可下载完整相对路径静态产物。

原始测试证据保留14天，dist保留7天。GitHub运行日志另由仓库Actions保留策略管理。Artifact只包含专用测试输出目录和dist，不上传依赖、环境文件、个人备份或学习目录。测试源码与证据都是标明身份的临时QA夹具，不属于学习者完成记录。

完整视觉任务`web-visual`初始纳入PR和手动执行：六视口×双主题×六页面、导师桌面/手机双主题、axe与溢出检查。实测成本与最终是否保持PR自动执行见[质量报告](report.md)。可以从Actions选择此工作流与分支后手动运行；新工作流的手动入口以合并到默认分支后GitHub的实际可见性为准。

本地等价执行（在`web/`；先确认JAVA_HOME指向真实JDK）：

```text
npm ci
npm run typecheck
npm test
npm run build
npm run check:build
npx playwright install chromium
npx playwright test
```

本轮独立输出：PowerShell使用`$env:LAB_ARTIFACT_DIR='../.audit-work/lab_quality_20261030/final'`；macOS使用`export LAB_ARTIFACT_DIR='../.audit-work/lab_quality_20261030/final'`。设置`CI=true`时须先build，浏览器测试将访问生产preview；否则默认启动开发服务器。报告用`npx playwright show-report <输出目录>/playwright-report`，trace用`npx playwright show-trace <trace.zip>`打开。

## 将网站检查追加为main必需检查

本轮不修改现有保护，不删除原四项Java检查，也不设置bypass。CI失败会明确标红；**只有把网站检查追加到保护规则后，它们才会成为GitHub合并按钮的强制门禁**。

仓库Settings → Rules → Rulesets → `main-safe-integration` → Require status checks to pass → Add checks。保留所有原条目，追加以下三个来自GitHub Actions的名称：

- `web-core (ubuntu-latest)`
- `web-core (windows-latest)`
- `web-core (macos-latest)`

如要求视觉也阻止合并，在确认其PR成本后再追加`web-visual`。保持Active、精确main、空bypass、Require PR、现有审批策略与严格最新基线，不取消禁止删除/强推。只选择已在该PR实跑成功的准确检查名，避免新增永远不会执行的门禁。保存后核对原四项与新增三项同时存在；这项保护设置由仓库所有者批准后执行。

正式PR地址、运行记录、Artifact实际可下载状态和负向门禁验证见[质量报告](report.md)。
