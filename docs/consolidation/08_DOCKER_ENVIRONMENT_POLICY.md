# 08 · Docker 环境使用纪律（任务书第六节落地）

## 一、调查结论（R0 完成，证据见 00 第三节）

1. **仓库脚本零 Docker 引用**——`verify_mysql.sh/.ps1` 只编译 Java + 环境变量注入 JDBC 连接；npm test / Java 回归 / 构建 / Playwright 全部不依赖也不启动 Docker。
2. **历史启动动作全部来自 AI 会话人工决策**：V2.2 会话创建容器 `jrl-mysql-v22`（2026-11-10 15:30）+ 启动 Docker Desktop；V2.3 会话再次启动做终态复验。仅此一个容器，两代复用（无重复建设）。
3. **Docker Desktop `autoStart: false`**，不会随开机自启。

## 二、纪律规则（即日生效）

| 场景 | 规则 |
| --- | --- |
| npm test / Java 回归 / 构建 / Playwright / 内容生成 | **永不**启动或要求 Docker |
| Stage05 真库集成验证 | 先执行前置检查清单；环境未运行则**记录条件不足并继续其他工作**，不得自行启动 |
| 启动 Docker Desktop 或创建新容器 | **必须项目所有者明确批准** |
| 删除镜像/容器/卷、`docker system prune`、破坏现有库数据 | **一律禁止** |
| 本轮自建临时资源 | 记录并在任务结束时安全收尾（本轮未新建任何容器/卷） |

**前置检查清单（跑 DB 测试前）**：① Docker 引擎是否已运行（`docker info` 只读探测）；② 目标容器是否已运行（`docker ps` 只读）；③ 端口/库名与 `JRL_MYSQL_URL` 是否一致；④ 复用现有环境优先；⑤ 未运行 → 记录并跳过，不启动。

## 三、脚本前置检查实施（方案 ii）

`verify_mysql.sh` 与 `verify_mysql.ps1` 增加只读前置检查（本轮实施）：
1. 对 `JRL_MYSQL_URL` 的 host:port 做 TCP 探活（bash `/dev/tcp` / PS `TcpClient.BeginConnect` 异步探测）——不调用 docker 命令；
2. 仅当 TCP 失败且 `docker` CLI 在 PATH 时，执行**只读** `docker ps --filter name=jrl-mysql --format` 生成定向提示（"容器未运行：请手动 `docker start jrl-mysql-v22` 并确认 Docker Desktop 已启动后重试"）——查询 daemon 不会拉起 Docker Desktop；
3. 输出显式声明"本脚本永不启动 Docker Desktop"；
4. 探测的 host:port 即取自 JRL_MYSQL_URL 本身，保证探测目标与连接目标一致。

## 四、8GB 内存设备（MacBook Air）约束

- MySQL 容器常驻约 400–600 MB；Docker Desktop + IDE + 浏览器同跑吃紧（`stages/stage05_mysql_db/README.md` 已有提示）。
- 避免无意义并行：全量 E2E（workers=1）与 Java 回归不并行跑；DB 验证集中安排、用后 `docker stop`（不删除）。
- CI 承担跨平台验证（免本机多 OS 并行）。
