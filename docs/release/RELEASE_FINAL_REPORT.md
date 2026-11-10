# RELEASE_FINAL_REPORT（V2.4 正式发布 · 2026-11-10）

> 全部数字来自真实命令输出（gh / git / docker / df / 实测脚本）；证据日志在 `.audit-work/v24/`（gitignored）。

## 一、发布前后 SHA

| 项 | SHA |
| --- | --- |
| 发布前 main | `6c3ca91` |
| 发布前 PR #11 head（= V2.4 终态） | `ee94b33` |
| **Merge commit（发布后 main）** | **`f6e6924c81b8a2bb2347650d3bccde96bbcae246`** |
| 后续测试修复（PR #12） | `893baeb` → merge `2f7e052e`（最终 main SHA，见下） |
| 合并时间 | 2026-11-10T22:15:29Z |

## 二、PR 合并

- 链接：https://github.com/HrrY1n/Java-AI-Learning-Roadmap/pull/11
- 实际策略：**Merge Commit**（`gh pr merge 11 --merge`，完整保留 46 提交三代历史；未绕过任何保护规则）
- 合并前动作：PR 标题/说明更新为 V2.4 正式版（移除 Draft 期"勿合并"文案）、Draft → Ready for review
- 合并前最终检查：Java 108/108、npm test 80/80、typecheck/构建/内容幂等/check:build 通过、E2E 69/69、Pages smoke 10/10、Registry 113 IDs 零变更、IndexedDB 兼容零改动——全部对应 `ee94b33` 代码树（干净检出实测 + CI 六项对 ee94b33 全绿）
- `gh pr view` 复核：`state=MERGED`、`mergeable=MERGEABLE→CLEAN`（合并前）

## 三、GitHub Actions 结果（main push @f6e6924）

| 工作流 | run | 结果 |
| --- | --- | --- |
| verify（Java win+mac） | 42912866791 | ✅ success（1m43s） |
| JavaRoadmap Lab（web-core ×3 OS + web-visual） | 42912866643 | ✅ **success**（ubuntu/windows 一次通过；macos 首次执行 v14 键盘无障碍用例抖动一次，`rerun --failed` 后通过；web-visual 按 `if: github.event_name != 'push'` 设计在 push 事件 skip，其完整执行证据见 PR #11 的 ee94b33 run 42902633303） |
| Deploy JavaRoadmap Lab Pages | 42912866557 | ✅ success（3m39s）：**build=success, deploy=success, smoke=success** |

## 四、线上部署验证（https://hrry1n.github.io/Java-AI-Learning-Roadmap/）

Playwright 实访 10 项全部通过，**零 console 错误 / 零 4xx / 零页面异常**：

1. 首页 hero 正常渲染 ✅
2. Stage01 课程（day03 条件分支）✅
3. Stage04 并发课（s04-synchronized-mutex）✅
4. Stage04 练习（lab/s04-safe-counter，V2.4 新契约"实际累加线程"在线上可见）✅
5. Stage05 数据库课（s05-jdbc-dao）✅
6. Git 专题（branch-create-merge，含"建议学习时点"chips）✅
7. 算法专题（binary-tree，chips 同时显示 Stage 01/03）✅
8. 深色模式切换（live-dark.png 截图）✅
9. 搜索正文命中（"IndexedDB" 9 条结果）✅
10. 移动端 390px 零横向溢出 ✅

## 五、本地 main 状态（合并后）

- `git rev-parse HEAD` = `origin/main` = `f6e6924`（ff-only 快进同步）
- `git status`：仅 3 个受保护用户未跟踪文件（rar 27,885 B / zip 37,840 B / 截图 540K 逐字节原样）
- 分支收敛与 worktree 收尾：见 `GIT_BRANCH_CLEANUP_REPORT.md`
- 磁盘与 Docker：见 `LOCAL_DISK_CLEANUP_REPORT.md` / `DOCKER_RESOURCE_REPORT.md`

## 六、遗留问题

1. Stage06 课程路线已定稿待开发（docs/consolidation/04）。
2. E2E CI 覆盖 37/69（方案 B）；全量扩面待所有者决策。
3. Stage05 真库容器 `jrl-mysql-v22`（Exited）与镜像/卷保留未动，需要时可直接 `docker start` 复验。
4. **macos 抖动根因修复（PR #12，已合并）**：后续两次 main push（f6e6924 首跑 + a3ceb98）中同一用例（v14-topics:409 搜索弹窗键盘无障碍）在 macos 上再现失败，确认为系统性竞态而非偶发——`showModal` autofocus 与 Tab 链的渲染竞态。修复：弹窗重开后 Tab 链前锚定初始焦点（PR #12 `893baeb`，本地 5/5 稳定，CI macos 实测通过 2m34s）。合并后 main（2f7e052）三工作流全绿：verify 2m1s / Pages 3m19s（同内容重部署）/ web-core 6m37s（macos 首跑即过）。
