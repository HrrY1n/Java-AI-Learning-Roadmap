#!/usr/bin/env bash
# 跨平台 Java 课程验证脚本（bash 版；PowerShell 版见 verify_java.ps1，两者语义一致）。
# 用法：在仓库根目录执行  bash scripts/verify_java.sh
# 行为：读取 scripts/verify_manifest.tsv，逐条编译、运行、校验输出子串并清理产物。
# macOS 自带 bash 3.2 也可运行（未使用 bash 4 特性）。
set -u

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MANIFEST="$REPO_ROOT/scripts/verify_manifest.tsv"
TIMEOUT_SECONDS=30

if ! command -v javac >/dev/null 2>&1 || ! command -v java >/dev/null 2>&1; then
    echo "错误：找不到 javac 或 java，请先阅读 docs/环境搭建.md"
    exit 2
fi

echo "== 环境信息 =="
echo "OS: $(uname -s) $(uname -m)"
echo "javac: $(javac -version 2>&1)"
echo "java: $(java -version 2>&1 | head -n 1)"
echo ""

WORK_DIR="$(mktemp -d)"
trap 'rm -rf "$WORK_DIR"' EXIT

# 清单先剥离 CR 再读取：即使检出配置把该文件转成 CRLF，也不会把 \r 带进断言列。
# （.gitattributes 已强制 *.tsv eol=lf，这里是第二道保险。）
MANIFEST="$WORK_DIR/manifest.tsv"
tr -d '\r' < "$REPO_ROOT/scripts/verify_manifest.tsv" > "$MANIFEST"

TOTAL=0
PASSED=0
FAILED=0

cleanup_paths() {
    # $1=源码根  $2=清理清单（;-分隔，相对源码根；"-" 表示无）
    root="$1"
    list="$2"
    [ "$list" = "-" ] && return 0
    IFS=';' read -r -a paths <<< "$list"
    for p in "${paths[@]}"; do
        if [ -n "$p" ]; then
            rm -rf "${root:?}/$p"
        fi
    done
}

while IFS=$'\t' read -r root fqcn stdin_fix cleanup expects_rest || [ -n "${root:-}" ]; do
    case "$root" in
        ''|'#'*) continue ;;
    esac

    TOTAL=$((TOTAL + 1))
    label="[$TOTAL] $fqcn"
    src_root="$REPO_ROOT/$root"

    if [ ! -d "$src_root" ]; then
        echo "FAIL $label —— 源码根不存在：$root"
        FAILED=$((FAILED + 1))
        continue
    fi

    # 运行前清理：避免上次遗留的数据文件影响本次结果
    cleanup_paths "$src_root" "$cleanup"

    # 编译源码根下全部 .java（与文档命令一致：-encoding UTF-8 -d out）
    find "$src_root" -name '*.java' -type f -print0 | xargs -0 \
        javac -encoding UTF-8 -d "$src_root/out" 2> "$WORK_DIR/javac_err.txt"
    if [ $? -ne 0 ]; then
        echo "FAIL $label —— 编译失败："
        tail -n 15 "$WORK_DIR/javac_err.txt"
        cleanup_paths "$src_root" "$cleanup"
        FAILED=$((FAILED + 1))
        continue
    fi

    # 运行：工作目录 = 源码根；交互程序从 fixture 提供输入。
    # 后台启动 + 轮询等待，超时时整树终止：java 可能经 Oracle javapath 垫片
    # 再启动真实 JVM，timeout/kill 只能杀掉垫片，真实 JVM 会变成孤儿继续运行。
    stdout_file="$WORK_DIR/stdout.txt"
    stderr_file="$WORK_DIR/stderr.txt"
    redirect_in="/dev/null"
    if [ "$stdin_fix" != "-" ]; then
        redirect_in="$REPO_ROOT/scripts/$stdin_fix"
    fi

    ( cd "$src_root" && exec java -Dstdout.encoding=UTF-8 -Dstderr.encoding=UTF-8 -Dfile.encoding=UTF-8 -cp out "$fqcn" \
        < "$redirect_in" ) > "$stdout_file" 2> "$stderr_file" &
    java_pid=$!
    waited=0
    while kill -0 "$java_pid" 2>/dev/null && [ "$waited" -lt "$TIMEOUT_SECONDS" ]; do
        if sleep 0.1 2>/dev/null; then
            waited=$((waited + 1))
        else
            # 极少数平台不支持小数 sleep：退化为 1 秒粒度
            sleep 1
            waited=$((waited + 10))
        fi
    done

    timed_out=0
    if kill -0 "$java_pid" 2>/dev/null; then
        timed_out=1
        case "$(uname -s)" in
            *MINGW*|*MSYS*|*CYGWIN*)
                # Git Bash：把 MSYS pid 换算成 Windows pid 后整树终止（含 javapath 垫片的真实 JVM）
                win_pid="$(ps -W | awk -v p="$java_pid" '$1 == p { print $4; exit }')"
                [ -n "$win_pid" ] && taskkill //PID "$win_pid" //T //F >/dev/null 2>&1
                ;;
        esac
        kill "$java_pid" 2>/dev/null
        sleep 1
    fi
    wait "$java_pid" 2>/dev/null
    run_rc=$?

    if [ "$timed_out" -eq 1 ]; then
        echo "FAIL $label —— 运行超时（${TIMEOUT_SECONDS}s），可能存在死循环或菜单等待"
        FAILED=$((FAILED + 1))
        cleanup_paths "$src_root" "$cleanup"
        continue
    fi

    if [ $run_rc -ne 0 ]; then
        echo "FAIL $label —— 运行失败（exit=$run_rc）："
        tail -n 15 "$stderr_file"
        FAILED=$((FAILED + 1))
        cleanup_paths "$src_root" "$cleanup"
        continue
    fi

    # 校验预期输出子串
    IFS=$'\t' read -r -a expects <<< "$expects_rest"
    missing=""
    all_ok=1
    for exp in "${expects[@]}"; do
        [ -z "$exp" ] && continue
        if ! grep -qF -- "$exp" "$stdout_file"; then
            all_ok=0
            missing="$missing 「$exp」"
        fi
    done

    cleanup_paths "$src_root" "$cleanup"

    if [ $all_ok -eq 1 ]; then
        echo "PASS $label"
        PASSED=$((PASSED + 1))
    else
        echo "FAIL $label —— 输出缺少：$missing"
        echo "---- 实际输出前 15 行 ----"
        head -n 15 "$stdout_file"
        FAILED=$((FAILED + 1))
    fi
done < "$MANIFEST"


echo ""
echo "== 结果：$PASSED 通过 / $FAILED 失败 / 共 $TOTAL 项 =="
[ $FAILED -eq 0 ]
