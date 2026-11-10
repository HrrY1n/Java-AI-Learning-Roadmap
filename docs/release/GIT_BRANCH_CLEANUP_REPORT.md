# GIT_BRANCH_CLEANUP_REPORT（分支与 worktree 收敛 · 2026-11-10）

> 删除依据：真实提交关系（`git merge-base --is-ancestor` / `git log --not origin/main` 核验）+ 无开放 PR 依赖（`gh pr list --state open` 为空）。全部本地删除使用 **`git branch -d`**（安全删除，未使用 `-D`）；worktree 使用 **`git worktree remove`**（未使用 `--force`）。

## 一、远端分支

| 分支 | 核验 | 操作 |
| --- | --- | --- |
| `codex/deep-overhaul-v2.3` | ee94b33 经 merge commit `f6e6924` 完整进入 main（`git log origin/v2.3 --not origin/main` 为空 = 零独有提交）；无其他开放 PR | ✅ 已删除（`git push origin --delete`） |
| `main` | 保留（f6e6924） | — |

删除后远端仅剩 `main`（`origin/HEAD → origin/main`）。

## 二、本地分支

| 分支 | 终态提交 | 核验 | 操作 |
| --- | --- | --- | --- |
| `codex/deep-overhaul-v2.3` | ee94b33 | main 的祖先（ff 可达） | ✅ `git branch -d` 成功 |
| `codex/deep-overhaul-v2.2` | 32ecf59 | 同上 | ✅ `-d` 成功 |
| `codex/deep-overhaul-v2.1` | ea1898a | 同上 | ✅ `-d` 成功 |
| `codex/deep-overhaul`（V2.0） | fb9e267 | 同上 | ✅ `-d` 成功 |
| `codex/v19-visual-design-lab` | 943f6cc | **`git merge-base --is-ancestor` 判定不在 main 中**（独立视觉实验成果，git branch -d 会自然拒绝） | ⛔ 按保留规则保留 |
| `main` | f6e6924（= origin/main） | — | 当前检出 |

收敛后本地分支：`main` + `codex/v19-visual-design-lab`（唯一未合并独立成果）。**历史提交未丢失**：全部 46 个三代提交经 merge commit 永久进入 main 历史可追溯。

## 三、Worktree 收敛

| worktree | 核验 | 操作 |
| --- | --- | --- |
| `D:\Code\codex-learn` | 主工作区，已切换到 main @f6e6924，干净（仅 3 个受保护用户文件） | 保留 |
| `C:\Users\Administrator\AppData\Local\Temp\jrl-v23-clean`（@2c57010 detached，本任务系列创建的验证树） | tracked 无修改、无未跟踪非忽略文件 | ✅ `git worktree remove` 成功（Git 注册剪除） |

**物理目录收尾**：`git worktree remove` 后物理目录因遗留 node 进程（PID 55912，核验命令行 = 该目录内遗留的 `vite preview --port 4173`，为本任务系列早期验证链残留）锁定删除失败——按纪律先核验命令行确属本项目遗留进程后终止，再删除目录成功（**345 MB 释放**）。未使用 `worktree remove --force`。

## 四、分支图（收敛后）

```text
* f6e6924 (HEAD -> main, origin/main) Merge pull request #11
|\
| * ee94b33 V2.4 终态（补交 11/12/13）
| * ...46 提交完整保留（V2.0 R1-R10 + V2.1 ×10 + V2.2 ×13 + V2.3 ×7 + V2.4 ×5）
|/
* 6c3ca91 发布前 main（Logo Kit 上站）
```
