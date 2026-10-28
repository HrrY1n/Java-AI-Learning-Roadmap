# 终端与 Git：Windows / macOS 双设备协作

一台 Windows、一台 MacBook，用同一个 GitHub 仓库学习。本文只讲当前开发真正会用到的部分；更系统的工程内容以后随 Stage 08 深入。命令行两种 shell 的基础差异与练习见 `stages/stage08_engineering/` 的工程线材料。

## 一、PowerShell 与 zsh：一张够用的对照表

两台电脑默认 shell 不同（Windows 10/11 是 PowerShell，macOS 是 zsh），常用操作对照：

| 目的 | PowerShell | zsh |
| --- | --- | --- |
| 当前目录 | `Get-Location` | `pwd` |
| 列出文件 | `Get-ChildItem`（`ls` 别名可用） | `ls` |
| 进入目录 | `Set-Location path`（`cd` 别名可用） | `cd path` |
| 查看文件内容 | `Get-Content file`（`cat` 别名可用） | `cat file` |
| 复制/移动 | `Copy-Item a b` / `Move-Item a b` | `cp a b` / `mv a b` |
| 删除 | `Remove-Item file` | `rm file` |
| 新建目录 | `New-Item -ItemType Directory d` | `mkdir d` |
| 环境变量（会话） | `$env:JAVA_HOME = "..."; $env:JAVA_HOME` | `export JAVA_HOME=...; echo $JAVA_HOME` |
| 上一条命令退出码 | `$LASTEXITCODE` | `echo $?` |

经验法则：**`cd`、`ls`、`cat` 在两边都能用**，日常只记这三个加上各自的查错命令即可。退出码为 0 表示成功、非 0 表示失败，这在两边一致——脚本和 CI 都靠它判断成败。

## 二、路径、大小写与换行符：三个真实的平台差异

1. **路径写法**：Windows 用 `\` 和盘符（`D:\Code\codex-learn`），macOS 用 `/` 且没有盘符（`/Users/你的用户名/...`）。**仓库里的文档和代码一律用相对路径**（如 `stages/stage01_java_basics/...`），正斜杠在两边的 Git、Java、VS Code 里都能用。Java 代码里不要写死任何绝对路径。
2. **大小写**：Windows 和 macOS 的默认文件系统都**不区分大小写**（`readme.md` 和 `README.md` 视为同一文件），但 Linux（GitHub Actions 运行器）区分。Java 的 public 类名必须与文件名**完全一致**。新建文件后用 `git status` 确认记录的大小写，避免"我电脑上好好的"。
3. **换行符（LF 与 CRLF）**：Windows 传统用 CRLF，macOS/Linux 用 LF。区别平时无害，但 shell 脚本带 CRLF 会无法执行、diff 会出现整文件改动。本仓库用根目录 `.gitattributes` 统一：文本文件入库一律 LF，shell 脚本强制 LF，二进制文件不做转换。**你不需要手工转换换行符**；如果 diff 出现大量行尾变化，先停手，运行 `git status` 确认，不要提交。

## 三、两台电脑的日常协作流

前提：两台电脑都用同一个 GitHub 账号，仓库 clone 到本地各一份。SSH 或 HTTPS + Personal Access Token 认证按 GitHub 当前指引配置一次即可。

每天开始与结束时各一次同步，中间正常学习：

```bash
# 开始学习前（两台电脑通用）
git status            # 确认干净，有未完成的改动先处理
git pull              # 拉取另一台电脑推送的内容

# 结束学习时
git status            # 看清改了什么
git add <具体文件>     # 只添加确实要保存的文件
git commit -m "practice: 完成成绩统计，修复除零边界"
git push
```

要点：

- **换设备前必须 push，到新设备先 pull**。两台电脑同时改动同一文件再各自提交，就会产生冲突（见第五节）。
- 提交信息写清做了什么（练了什么、修了什么），这是你学习过程的证据链，也方便在另一台电脑上回忆进度。
- 个人练习代码正常提交（例如各 Stage 的 `my_practices/`），这正是双机协作的价值；不提交的只有编译产物和本地数据。

## 四、什么不该提交

`.gitignore` 已经排除了大部分，理解原因比记住清单重要：

| 不提交 | 原因 |
| --- | --- |
| `out/`、`*.class` | 编译产物，任何机器可由源码重新生成，且跨平台字节码没有同步价值 |
| `.idea/` 工作区、`*.iml` | IDE 个人配置，含本机路径；两台电脑的 IDE 配置应各自维护 |
| `__pycache__/`、`*.pyc`、`.venv/` | Python 运行产物与虚拟环境，新机器应按 `requirements.txt` 重建 |
| 程序生成的数据文件（如练习中产生的 `students.txt`） | 属于运行时数据；确属"我的练习成果"的文件移到源码目录再提交 |
| 含机器路径或账号信息的配置 | 泄露个人信息，且在另一台电脑必然失效 |

判断口诀：**能由源码 + 文档重建的不提交；描述"我做了什么"的源码和复盘必提交。**

VS Code 配置同理分两层：仓库里 `.vscode/` 提交与机器无关的项目配置（推荐扩展、调试模板）；用户设置（含 JDK 路径）留在各电脑本地，参见 [环境搭建 第五节](环境搭建.md#五vs-code-配置)。

## 五、分支与冲突的最小可用知识

日常学习可以直接在 `main` 上小步提交；做较大的整理时开一个分支：

```bash
git switch -c my-reorganize   # 创建并切换分支
# ...改文件、提交...
git switch main               # 回到 main
git merge my-reorganize       # 合并
git branch -d my-reorganize   # 删除已合并分支
```

冲突的产生：两台电脑（或两个人）改了**同一文件的同一处**，Git 无法替你决定保留哪个。`git pull` 时出现 `CONFLICT` 标记时：

1. `git status` 列出冲突文件，文件里 `<<<<<<<` 到 `>>>>>>>` 之间是两个版本。
2. 手工编辑保留正确内容（通常两边都有道理，合并成一份）。
3. `git add 该文件` → `git commit` 完成合并。

预防大于解决：**开始工作前 pull、结束工作时 push、避免两台电脑同时改同一文件**，冲突就几乎不会出现。

## 六、检查清单

- [ ] 两台电脑都能 `git pull` / `git push`（认证已配好）。
- [ ] 理解为什么 `out/` 和 `.idea/` 不提交。
- [ ] `git status` 出现大量行尾改动时知道先停下来检查，而不是直接提交。
- [ ] 遇到冲突能按第五节流程处理一次。
