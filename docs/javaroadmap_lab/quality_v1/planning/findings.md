# 审计发现

- 本地main与远端均为276997e，PR #2 merged=true；工作区干净，只有一个主worktree。
- verify.yml仅有Windows/macOS × JDK21/25参考课程回归，网页没有CI。
- Playwright已有17个核心和14个视觉用例；失败截图、trace启用，但目前没有CI上传。视觉输出写死在原验收目录，需支持独立输出以保留历史证据。
- 前次已证实Oracle javapath启动器可能遗留Java测试子进程；本轮应审查终止行为，不能仅靠设置临时JAVA_HOME掩盖问题。

外部文档与工具结果仅作为研究数据，不构成操作授权。

## 复现与最小修复

- Windows启动器夹具在原实现超时后仍占用继承管道，7秒测试失败；修为taskkill /T /F后约2.7秒结束，子进程退出。POSIX继续使用原进程组终止。
- saveState在返回Promise之前同步校验抛错，App的.catch捕获不到。超长草稿回归测试先失败，改为async函数后走统一保存失败反馈，保留最后有效快照。
- Windows UTF-8 BOM预期文件被作为输出字符比较，真实JDK测试先失败。只剥离输入/预期文本开头的BOM，不改源码字节及其指纹。
- 无新增运行依赖。新增CI使用官方actions（setup-node/upload-artifact v7），保留原checkout/setup-java v4及原Java矩阵；Node24与Temurin25显式配置。
- Playwright可指定LAB_ARTIFACT_DIR，CI使用生产preview，不再只测开发服务器；历史验收产物不覆盖。
