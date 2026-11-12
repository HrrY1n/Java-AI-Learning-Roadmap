#!/usr/bin/env bash
# Stage 06 后端工程回归：用各工程自带的 Maven Wrapper 跑真实测试（JUnit + Spring Boot 启动 + REST 契约）。
# Wrapper 会自动下载官方 Maven 3.9.9 到 ~/.m2/wrapper——不需要系统安装 Maven，也不会碰系统 Java 配置。
# 用法：bash scripts/verify_stage06.sh
set -euo pipefail
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FAILED=()

run_maven_tests() {
    local project="$1"
    echo "== Stage06 Maven 测试：$project =="
    if (cd "$REPO_ROOT/stages/stage06_backend_foundations/$project" && ./mvnw -q test); then
        echo "PASS: $project"
    else
        echo "FAIL: $project"
        FAILED+=("$project")
    fi
}

run_maven_tests "maven-lab"
run_maven_tests "student-api"
run_maven_tests "mybatis-lab"   # 无数据库验证级：SqlSessionFactory 解析 + 语句绑定 + #{} 注入检查

echo ""
if [ "${#FAILED[@]}" -gt 0 ]; then
    echo "== Stage06 Maven 回归：${#FAILED[@]} 个工程失败：${FAILED[*]} =="
    exit 1
fi
echo "== Stage06 Maven 回归：全部通过 =="
