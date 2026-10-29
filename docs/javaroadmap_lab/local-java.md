# 本地 Java 运行与验证

网站编辑器提供 Java 高亮、草稿保存和源码下载。浏览器内没有 JVM；页面不会伪造运行、编译成功或测试结果。

验证脚本只在你手动运行 CLI 时启动本机 JDK，不监听网络端口。它以你的本机权限运行 Java，超时和输出限制用于终止常见错误，**不是安全沙箱**。只运行你理解并信任的源码；不要把这个工具改成公开执行接口。

## 1. 准备源码和预期结果

在实验室选择练习并独立实现，下载 Java 文件到仓库外的个人目录。下载不改变 `my_practices/`。记录源码中的 `package` 和 `public class`；编译、运行时必须使用这个身份。

在同一目录用 UTF-8 创建 `expected.txt`：这是你**运行前**推导的完整标准输出，不要将实际输出复制进去以制造通过。交互练习另建 `input.txt`，按读取顺序每行填写一个输入。输入和预期文件开头的UTF-8 BOM会作为文本编码标记移除，避免Windows编辑器的BOM混入第一项数据；不会移除行首空格或改写Java源码字节。源码中的数组写死时，先改数据再导出新源码，每个版本各自验证。

脚本按完整输出精确比较，仅归一 Windows/Mac 换行、行末空格及一个最终换行。前导空格、内部空行、提示语和结果行都参与比较。菜单/计算器若打印输入提示，预期文件也要包含这些提示。不要使用包含匹配代替行为检查。

## 2. Windows

先在仓库的 `web/` 目录运行 `npm run content`（`npm run dev` 和 `npm run build` 也会生成目录）。以下文件名以成绩统计练习的下载身份为例；以实际下载文件为准。

```powershell
java -version
javac -version

node scripts/verify-practice.mjs --exercise scores --source "$env:USERPROFILE\Downloads\ScoreStatistics.java" --expect-file "$env:USERPROFILE\Downloads\expected.txt" --label "五个正常成绩" --evidence "$env:USERPROFILE\Downloads\scores-normal.evidence.json"
```

输入型练习：

```powershell
node scripts/verify-practice.mjs --exercise calculator --source "$env:USERPROFILE\Downloads\SimpleCalculator.java" --input-file "$env:USERPROFILE\Downloads\input.txt" --expect-file "$env:USERPROFILE\Downloads\expected.txt" --label "除数为零" --evidence "$env:USERPROFILE\Downloads\calculator-zero.evidence.json"
```

如果系统 Java 启动器异常，将 `JAVA_HOME` 设置为你实际安装的 JDK 根目录，再执行。脚本优先使用 `JAVA_HOME/bin/java` 和 `javac`；不自动修改系统环境。

## 3. macOS

在仓库的 `web/` 目录执行：

```bash
java -version
javac -version
npm run content
node scripts/verify-practice.mjs --exercise scores --source "$HOME/Downloads/ScoreStatistics.java" --expect-file "$HOME/Downloads/expected.txt" --label "五个正常成绩" --evidence "$HOME/Downloads/scores-normal.evidence.json"
```

输入型题加上 `--input-file "$HOME/Downloads/input.txt"`。macOS 可以用 `/usr/libexec/java_home` 查找已安装 JDK，将输出设为 `JAVA_HOME`。macOS 命令经过语义检查，是否实际运行见[验收记录](validation.md)。

## 4. 导回真实执行记录

脚本复制源码到系统临时目录，以 UTF-8 编译并运行；不修改原源码。每个 Java 运行最多 5 秒，编译最多 20 秒，每条输出流最多 64 KiB，结束后清理临时目录。Windows超时通过系统taskkill终止本次进程树（包括JDK启动器的真实JVM），macOS终止本次进程组；自行脱离进程树或进程组的程序仍不构成可靠隔离，只运行自己的学习代码。未知练习、包名/类名不匹配、无效UTF-8和缺失JDK都会明确报错。

输出证据包含源码精确 UTF-8 字节的 SHA-256、JDK 版本、实际命令、输入、预期、真实 stdout/stderr、退出码和断言结果。脚本不覆盖已有证据文件；重复测试请换文件名或省略 `--evidence` 生成唯一文件。

返回实验室导入 `.evidence.json`。网站只在题目 ID 和当前草稿的 SHA-256 都相同时接收记录。之后编辑草稿，旧证据仍可复盘，但只对应旧版本。

这些是本地可编辑的自测记录，没有签名或远程可信认证。哈希绑定源码，不证明作者身份、独立性，也不能防止人为修改 JSON 后重新计算哈希。

## 验证范围

- 每次 CLI 验证你提供的**这一组输入与预期**，`allPassed` 只指该记录内案例，不代表整道练习完成。
- 成绩统计：正常数组、单元素、空数组必须分别修改、运行并保留记录；脚本不会擅自重写数组。
- 计算器：按练习清单覆盖四则运算、浮点误差、不支持运算符、非数字和除零；使用独立输入/预期文件逐次验证。
- 循环菜单：自己设计包含两次正常操作、非法数字、非数字、退出的完整会话，核对全部输出。
- 方法重构：分别保存重构前后的源码，用同一预期文件验证两版；方法职责和 main 行数仍需自己 Review。

参考代码回归 `scripts/verify_java.*` 与个人练习是两条独立路径。参考回归不会生成学生练习证据，网站也不会修改[真实学习进度](../../真实学习进度.md)。
