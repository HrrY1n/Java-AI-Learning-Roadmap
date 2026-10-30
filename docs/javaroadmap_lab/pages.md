# GitHub Pages 发布与线上验收

正式地址：[JavaRoadmap Lab](https://hrry1n.github.io/Java-AI-Learning-Roadmap/)。这是静态网站；Java仍在本人JDK运行，草稿与备份保存在浏览器，不随部署上传。

## 发布流程

独立工作流 [pages.yml](../../.github/workflows/pages.yml) 在main推送或手动运行时执行。只有 `refs/heads/main` 且 `github.ref_protected` 为真才允许构建；GitHub的 `github-pages` 环境精确允许main、0个标签。原PR与Java/网站CI保留，未修改main规则或bypass。

1. Ubuntu配置Node24与Temurin25，执行 `npm ci`、类型检查、31项单元/工具测试、生产构建、构建资源检查与Chromium核心E2E。
2. 通过后用官方 `upload-pages-artifact@v4` 上传 **web/dist**；不上传仓库根目录或CLI。只有独立deploy job拥有 `pages: write` 与 `id-token: write`，用 `configure-pages@v5` / `deploy-pages@v4` 发布到 `github-pages` 环境。
3. 发布后另起无Pages写权限的smoke job，访问部署Action返回的正式HTTPS URL；先核对 `deployment.json` 的公开提交SHA，再执行桌面与手机模拟Chromium测试。
4. 验证日志、JSON、HTML、失败trace与25张代表截图以 `pages-preflight-*` / `pages-online-*` Artifact保存14天。部署成功与线上冒烟分别看deploy、smoke job；Workflow文件存在不代表上线成功。

默认 `base: './'` 保持，页面使用Hash导航。动态导入与Monaco worker经Vite打包，参考JSON按相对BASE_URL按需加载；不需要为课程设置404重写或改绝对根路径。`deployment.json`只含提交SHA与公开run ID，不含密钥或用户数据。

## 复现线上检查

在 `web/` 执行（不需要JDK来访问线上网站）：

```text
npm ci
npm run content
npx playwright install chromium
npm run test:pages
```

脚本默认访问上面的正式地址，不启动本地服务器。独立配置为 [playwright.pages.config.ts](../../web/playwright.pages.config.ts)，用例为 [pages.spec.ts](../../web/smoke/pages.spec.ts)，不会混入本地core/visual。`LAB_SITE_URL`可指定同版本预览地址，`LAB_EXPECTED_SHA`可要求准确的部署提交，`LAB_ARTIFACT_DIR`指定独立输出目录；设置环境变量遵循当前Shell语法。

测试使用独立浏览器上下文，QA代码保留TODO，只验证编辑/保存/下载/导入；不会实现学习者的成绩统计算法。覆盖首页、14阶段地图、课程目录与13课、Monaco/worker、手机轻量编辑、预测/主题持久化、草稿刷新恢复、参考延迟加载、Java下载与备份导入导出。检查页面溢出、同站HTTP错误、控制台和JavaScript异常；没有假stdout或自动完成标记。

Worker检查通过应用现有的 `MonacoEnvironment.getWorker` 工厂显式启动打包Worker，验证子路径URL和实际运行上下文后终止QA实例。精简编辑器没有加载建议贡献；这不表示已提供Java语义补全或JDK运行。

## Windows、MacBook与iPhone使用

直接在浏览器打开HTTPS地址，无需安装Node/JDK即可阅读、预测、写草稿与备份。运行Java仍需在可信电脑上的本地JDK/CLI。手机截图是390×844 Chromium模拟，**不是iPhone Safari实机验收**；个人Mac GUI、Safari软键盘、文件选择器、读屏及长期存储回收另按[人工表](quality_v1/manual-checklist.md)核对。

本地地址和Pages域名属于不同浏览器存储来源。迁移前在旧地址“数据与备份→导出完整备份”，在新站“选择备份文件→核对→确认合并”。Windows/Mac/iPhone间同样通过文件主动迁移；不会自动跨设备同步。IndexedDB按协议、域名、端口隔离，URL路径本身不构成隔离。保留原文件；清站点数据或浏览器回收可能丢失本地记录。

## 仓库设置与更新

- [Settings → Pages](https://github.com/HrrY1n/Java-AI-Learning-Roadmap/settings/pages)：Source为GitHub Actions；github.io默认域名强制HTTPS。
- [Settings → Environments](https://github.com/HrrY1n/Java-AI-Learning-Roadmap/settings/environments)：`github-pages`只允许main，不能扩大到全部分支或标签来解决发布失败。
- 后续改动按正常PR通过检查并合并main后自动重新构建、部署和线上验收；手动重发可在Actions选择 `Deploy JavaRoadmap Lab Pages` → Run workflow → main。
- 若需要回退，使用正常PR恢复到已验证版本，再由main发布；不强推、不关闭保护、不把dist提交到源码分支。

官方依据：[自定义Pages工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。实际部署SHA、运行URL与测试结果以对应Actions/Deployment及线上报告为准，不能用本文代替真实验收。
