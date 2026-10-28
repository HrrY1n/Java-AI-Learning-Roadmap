# 课程验证脚本

一组不依赖 Maven/Gradle 的轻量验证入口：逐条编译、运行仓库里的 Java 课程程序并校验输出，用于防止参考示例在改动后悄悄坏掉。两个脚本语义完全一致，任选其一：

```powershell
# Windows PowerShell
powershell -ExecutionPolicy Bypass -File scripts\verify_java.ps1
```

```bash
# macOS / Windows Git Bash
bash scripts/verify_java.sh
```

环境要求只有 JDK 17+（本机 JDK 25 已验证；macOS 使用系统自带 bash 3.2 即可运行）。

## 它做什么

1. 读取 `verify_manifest.tsv` 清单，每一行 = 一节课：**源码根目录 → 编译该目录全部 `.java`（`javac -encoding UTF-8 -d out`）→ 在源码根目录运行指定 FQCN → 校验输出包含预期子串 → 删除 `out/` 与程序生成的文件**。
2. 交互程序从 `fixtures/` 提供标准输入（例如菜单脚本 `1\n2\n0`），避免程序无限等待人工输入；每次运行有 30 秒超时，死循环会被识别为失败。
3. 运行后清理一切生成物（`out/`、`data/`、`notes.txt`、`output.txt`），仓库不会留下编译产物。
4. 结尾输出 `N 通过 / M 失败`，失败时退出码为 1（可接 CI）。

manifest 每列含义见文件头注释；修改课程输出后同步更新对应行。Windows 上脚本强制要求输出 UTF-8（`-Dstdout.encoding=UTF-8`），否则中文预期会因控制台 GBK 而误报——这正是 [跨平台问题排查](../docs/跨平台问题排查.md) 第 7 条记录的问题。

## 有意不验证的内容

- `existing_course/answers/`：练习参考答案，供完成后对照；不作为参考实现的回归对象，也不应提前阅读。
- 各 Stage 的 `my_practices/`（个人练习）：你的代码可能长期处于未完成状态，验证脚本不应把它当作失败。个人练习的验证方式是练习文档里给出的手工验收清单。
- 故意设置的思考题输出（如"先预测再运行"）：教学价值在于你自己跑出来的结果。

通过验证只说明**参考代码能编译、能运行、输出符合记录**；它不代表掌握了知识，也不改变 [真实学习进度](../真实学习进度.md) 的任何状态。

## 平台说明（诚实边界）

- Windows 11 + JDK 25：`verify_java.sh`（Git Bash）与 `verify_java.ps1`（PowerShell 5.1）均已实际运行，40/40 通过。
- macOS：脚本已按 bash 3.2（macOS 自带版本）编写，但**作者只在 Windows 上运行过**；macOS 无 `timeout` 命令时脚本自动降级为直接运行（清单中的交互程序在输入耗尽后都会自然结束，不会挂死）。`.ps1` 需 UTF-8 BOM（已带），macOS 上请用 `.sh` 版。
- GitHub Actions 工作流见 `.github/workflows/verify.yml`，它会在 Windows 与 macOS 运行器上执行同一脚本；第一次推送后请在 Actions 页面确认真实结果。
