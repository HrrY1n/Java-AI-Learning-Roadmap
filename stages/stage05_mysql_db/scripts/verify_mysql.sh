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
