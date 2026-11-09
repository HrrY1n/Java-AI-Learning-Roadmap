# 02 · Git 专题课程升级报告（V2.1-P2）

## 定位：四节薄课各自要解决的真实问题

第一轮审计：git-record-changes(636 字符)、git-history-diff(492)、git-tag(467)、git-stash(499) 缺「先预测」节与真实输出。V2.1 按 F 类教材课模板扩写，每课扩至 1580-1933 字符；**全部 git 命令在 `/tmp/gitlesson` 沙箱实测**，未触碰正式仓库。

| 课 | 补齐的教学问题 | 沙箱实测的关键证据 |
|---|---|---|
| record-changes | status -s 两列状态机与 diff 分水岭；Conventional Commits 的 scope/`!`/BREAKING CHANGE | `A  README.md` → ` M README.md`（空格+M=工作区改了、暂存区没动）；类型后 `!` 与正文 `BREAKING CHANGE:` 的语义 |
| history-diff | diff 三模式"比较谁和谁"；空 diff ≠ 没改动 | add 前 `git diff` 有补丁、`--staged` 为空；add 后正好反转（两侧输出均实测） |
| tag | 轻量 vs 附注的本质（对象类型）；push 不跟随；签名路标 | `cat-file -t`：lite=commit、annotated=tag；`git show v1.0` 的 Tagger/Date/说明头；`--follow-tags` 只带附注标签 |
| stash | 栈语义与编号漂移；pop 的"成功才删除"合同；stash branch 后悔药 | `Saved working directory and index state On master: 试验性改动`；pop 遇本地改动 `error: ...would be overwritten... Aborting` 且 list 保留条目 |

每课结构：场景 → 机制 → **先预测，再运行**（实测输出）→ 常见错误与恢复 → 独立操作 → 项目迁移 → 来源（页码对齐 bookReference：2.6=PDF 62-66、7.3=244-252、2.3=48-55）。

## 其他修复

- git-merge-conflict 练习 `mkdir /tmp/git-sandbox` → 「任意空目录」（Windows cmd/PowerShell 无 /tmp）。
- 来源页码三处对齐 bookReference 元数据（原先文字引用错章/错页）。

## 兼容性

- 课程 ID/学习记录零变化；gitSteps 步进器未动；git-lab.test.mjs 16 沙箱场景全过；topic-content 门禁 11/11。
