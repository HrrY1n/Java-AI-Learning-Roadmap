# DOCKER_RESOURCE_REPORT（Docker 资源 · 2026-11-10）

> 引擎状态：**运行中**（29.9.3）——本轮未启动、未重启 Docker Desktop，全部为只读盘点；未执行任何 prune。

## 一、容器

| 容器 | 状态 | 处置 |
| --- | --- | --- |
| `jrl-mysql-v22`（mysql:8.0，端口 3307→3306） | Exited (255)（合并前 4 小时自然退出，非本轮操作） | **保留**。合并后的发布内容不含 Stage05 代码变更，无需真库复验；需要时可 `docker start jrl-mysql-v22` 即时复用 |

无其他容器，无重复资源。

## 二、镜像与卷（`docker system df` 实测）

| 资源 | TOTAL | ACTIVE | SIZE |
| --- | --- | --- | --- |
| Images | 2 | 1 | 1.101 GB（`mysql:8.0` 1.1 GB；`hello-world:latest` 25.9 kB 为来历不明的旧测试镜像——**保留**，删除与否交所有者，价值极低） |
| Containers | 1 | 0 | 32.77 kB（100% reclaimable=容器元数据，随容器保留） |
| Local Volumes | 1 | 1 | 211.6 MB（MySQL 测试库数据卷——**保留，不删除**） |
| Build Cache | 0 | 0 | 0B |

## 三、使用检查

- 容器 Exited、无进程占用；3307 端口无监听。
- 未删除容器/镜像/卷；未执行 `docker system prune`；未启动 Docker Desktop。
- 本轮发布全流程（合并/部署/线上验证/清理）**零 Docker 依赖**——与"普通测试永不启动 Docker"纪律一致。

## 四、后续建议

- 若长期不再进行 Stage05 真库复验：`docker rm jrl-mysql-v22` + 删除卷可回收 ~1.3 GB（**需所有者批准**，卷内为测试库数据）。
- `hello-world:latest` 可随手 `docker rmi hello-world`（25.9 kB）。
