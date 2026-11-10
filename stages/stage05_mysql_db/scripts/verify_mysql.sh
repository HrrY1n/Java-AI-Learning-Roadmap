#!/usr/bin/env bash
# Stage 05 MySQL 隔离实测验证脚本（支持 macOS / Linux / Git Bash）
# 用法示例：
#   JRL_MYSQL_URL="jdbc:mysql://127.0.0.1:3307/javaroadmap_lab_test?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=UTF-8" \
#   JRL_MYSQL_USER=root JRL_MYSQL_PASSWORD=你的测试密码 \
#   JRL_MYSQL_JAR=/path/to/mysql-connector-j-8.4.0.jar \
#   bash stages/stage05_mysql_db/scripts/verify_mysql.sh
set -euo pipefail

STAGE_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REPO_ROOT="$(cd "$STAGE_ROOT/../.." && pwd)"
JAR="${JRL_MYSQL_JAR:-$REPO_ROOT/.audit-work/lib/mysql-connector-j-8.4.0.jar}"

if [ ! -f "$JAR" ]; then
    echo "错误：找不到 MySQL Connector/J 驱动 JAR：$JAR"
    echo "请下载 mysql-connector-j-8.4.0.jar 并通过环境变量 JRL_MYSQL_JAR 指定路径。"
    exit 2
fi

# ---- 环境前置检查（只读探测；本脚本永不启动 Docker Desktop 或任何容器）----
# 从 JRL_MYSQL_URL 提取 host:port（jdbc:mysql://host:port/db?...）
DB_HOST="$(printf '%s' "${JRL_MYSQL_URL:-}" | sed -n 's|^jdbc:mysql://\([^/:?]*\):\([0-9]*\).*|\1|p')"
DB_PORT="$(printf '%s' "${JRL_MYSQL_URL:-}" | sed -n 's|^jdbc:mysql://\([^/:?]*\):\([0-9]*\).*|\2|p')"
if [ -z "$DB_HOST" ] || [ -z "$DB_PORT" ]; then
    echo "错误：无法从 JRL_MYSQL_URL 解析 host:port（当前值：${JRL_MYSQL_URL:-<未设置>}）"
    exit 2
fi
if ! (exec 3<>"/dev/tcp/$DB_HOST/$DB_PORT") 2>/dev/null; then
    echo "错误：数据库端口不可达：$DB_HOST:$DB_PORT"
    if command -v docker >/dev/null 2>&1; then
        CONTAINER_STATE="$(docker ps --filter name=jrl-mysql --format '{{.Names}} {{.Status}}' 2>/dev/null || true)"
        if [ -z "$CONTAINER_STATE" ]; then
            echo "提示：jrl-mysql 容器未在运行（docker ps 只读查询结果为空）。"
        else
            echo "提示：容器状态：$CONTAINER_STATE（可能刚启动，等待几秒后重试）"
        fi
    fi
    echo "请手动确认 Docker Desktop 与 jrl-mysql 容器已启动后重试——本脚本按设计永不自动启动 Docker。"
    exit 2
fi
exec 3>&- 2>/dev/null || true
echo "数据库端口可达：$DB_HOST:$DB_PORT"

WORK_DIR="$(mktemp -d)"
trap 'rm -rf "$WORK_DIR"' EXIT
OUT_DIR="$WORK_DIR/out"
mkdir -p "$OUT_DIR"

# Git Bash 下转换为 Windows 原生分隔符与路径，macOS/Linux 直接使用 : 与原路径
SEP=":"
OUT_NATIVE="$OUT_DIR"
JAR_NATIVE="$JAR"
if command -v cygpath >/dev/null 2>&1; then
    SEP=";"
    OUT_NATIVE="$(cygpath -w "$OUT_DIR")"
    JAR_NATIVE="$(cygpath -w "$JAR")"
fi

echo "== 1. 编译 Stage 05 全部 5 课 + 6 阶段演进项目（原生 javac） =="
find "$STAGE_ROOT/existing_course" -name "*.java" -type f -print0 | xargs -0 \
    javac -encoding UTF-8 -d "$OUT_NATIVE"
echo "编译通过。"

run_jdbc() {
    local fqcn="$1"
    echo ""
    echo "== 运行 $fqcn =="
    java -Dstdout.encoding=UTF-8 -Dstderr.encoding=UTF-8 -Dfile.encoding=UTF-8 \
        -cp "${OUT_NATIVE}${SEP}${JAR_NATIVE}" "$fqcn"
}

run_jdbc com.javaroadmap.stage05.day01sqlconstraints.App
run_jdbc com.javaroadmap.stage05.day02relationalmodeling.App
run_jdbc com.javaroadmap.stage05.day03transactionsacid.App
run_jdbc com.javaroadmap.stage05.day04indexesexplain.App
run_jdbc com.javaroadmap.stage05.day05jdbcrepository.App
run_jdbc com.javaroadmap.stage05.student.StudentEvolutionDemo

echo ""
echo "== 全部 Stage 05 MySQL 课程与 6 阶段连续项目实测通过 =="
