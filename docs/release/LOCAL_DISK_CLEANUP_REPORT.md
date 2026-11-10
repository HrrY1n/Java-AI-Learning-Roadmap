# LOCAL_DISK_CLEANUP_REPORT（本地磁盘清理 · 2026-11-10）

> 范围：仅本项目及其专属临时环境；未触碰其他项目目录、系统级缓存、Downloads/桌面/文档。

## 一、统计（清理前实测）

| 区域 | 大小 | 性质 |
| --- | --- | --- |
| 仓库整体（不含 node_modules） | ~120 MB（.git 41M + 内容与文档） | 保留 |
| `web/node_modules` | 544 MB | **保留**（在用依赖） |
| `web/dist` | 8 MB | 保留（preview 目标，可 4 秒再生） |
| `.audit-work/` | 209 MB | **保留**（审计证据：含 2026-10-30 所有者历史材料 144 MB、V1.9/V2.3/V2.4 证据 37 MB、MySQL 驱动 2.5 MB） |
| `docs/javaroadmap_lab/artifacts` | 13 MB | 保留（含被交付文档引用的截图） |
| `/tmp/jrl-v23-clean`（worktree） | 345 MB（node_modules 312M + dist 8M） | **已删除**（合并后按 7.3 规则收尾） |
| `/tmp/gitsb`、`/tmp/journey-a`、`/tmp/v23r1`、临时脚本/日志 | ~1.0 MB | **已删除**（上一轮发布准备任务，归属已核验） |
| 系统级 npm-cache 358 MB / ms-playwright 1.4 GB | — | **未触碰**（系统级，需所有者决策） |

## 二、本轮清理明细（全部为本任务系列自建、证据已归档）

| 路径 | 大小 | 核验 |
| --- | --- | --- |
| `/tmp/jrl-v23-clean/`（worktree 目录，Git 注册已先剪除） | **345 MB** | detached @2c57010、tracked 零修改、无未跟踪非忽略文件、无用户文件；删除前发现并终止遗留 `vite preview` 进程（PID 55912，命令行核验为本目录残留） |
| `/tmp/gitsb/`（7 个 Git 沙箱） | 975 KB | R2 教学实验，输出已写入课程内容 |
| `/tmp/journey-a/`、`/tmp/v23r1/` | 18 KB | 路径验证副本/临时编译输出 |
| `/tmp/` 下本轮验证脚本与日志 14 项 | ~200 KB | 正式日志已存 `.audit-work/v23|v24/` |

## 三、清理前后空间对比

| 时点 | C 盘可用 |
| --- | --- |
| 清理前（发布准备轮实测） | 225,701,584 KB |
| 第一批清理（/tmp 临时项 ~1 MB）后 | 225,702,396 KB |
| worktree 目录删除后（本轮实测） | **225,986,892 KB** |
| **累计释放** | **~346 MB**（全部来自本任务系列自建的临时 worktree 与临时文件） |

## 四、保留清单（防误删备忘）

`docs/consolidation/`、`docs/overhaul-v2.1|v2.2|v2.3/`、`docs/release/`、`docs/overhaul-v2.1.rar`、`docs/overhaul-v2.zip`、`docs/javaroadmap_lab/v1.4_screenshots/`、`.codex/hooks.json`、`.audit-work/`、`.idea/`、用户练习与个人资料——**逐项原样，未做任何改动**。

## 五、Windows 临时文件说明

仅处理了 `/tmp`（Git Bash 映射的本项目临时区）中可明确归属本任务系列的条目；TEMP 其余内容、Downloads、桌面、系统恢复点均未触碰。
