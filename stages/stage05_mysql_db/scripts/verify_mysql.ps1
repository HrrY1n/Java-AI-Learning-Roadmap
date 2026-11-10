# Stage 05 MySQL 隔离实测验证脚本（Windows PowerShell）
# 用法示例：
#   $env:JRL_MYSQL_URL="jdbc:mysql://127.0.0.1:3307/javaroadmap_lab_test?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=UTF-8"
#   $env:JRL_MYSQL_USER="root"
#   $env:JRL_MYSQL_PASSWORD="你的测试密码"
#   $env:JRL_MYSQL_JAR="C:\path\to\mysql-connector-j-8.4.0.jar"
#   powershell -ExecutionPolicy Bypass -File stages\stage05_mysql_db\scripts\verify_mysql.ps1

$ErrorActionPreference = "Stop"
$StageRoot = Split-Path -Parent $PSScriptRoot
$RepoRoot = Resolve-Path (Join-Path $StageRoot "..\..")
$Jar = if ($env:JRL_MYSQL_JAR) { $env:JRL_MYSQL_JAR } else { Join-Path $RepoRoot ".audit-work\lib\mysql-connector-j-8.4.0.jar" }

if (-not (Test-Path $Jar)) {
    Write-Error "找不到 MySQL Connector/J 驱动 JAR：$Jar`n请设置 `$env:JRL_MYSQL_JAR 指向下载的驱动文件。"
    exit 2
}

# ---- 环境前置检查（只读探测；本脚本永不启动 Docker Desktop 或任何容器）----
$DbHostPort = $null
if ($env:JRL_MYSQL_URL -match '^jdbc:mysql://([^/:?]+):(\d+)') { $DbHostPort = @{ Host = $Matches[1]; Port = [int]$Matches[2] } }
if (-not $DbHostPort) {
    Write-Host ("错误：无法从 JRL_MYSQL_URL 解析 host:port（当前值：{0}）" -f ($(if ($env:JRL_MYSQL_URL) { $env:JRL_MYSQL_URL } else { "<未设置>" })))
    exit 2
}
$Tcp = New-Object System.Net.Sockets.TcpClient
try {
    $Connect = $Tcp.BeginConnect($DbHostPort.Host, $DbHostPort.Port, $null, $null)
    $Success = $Connect.AsyncWaitHandle.WaitOne(3000, $false)
    if (-not $Success -or -not $Tcp.Connected) { throw "port-unreachable" }
} catch {
    Write-Host ("错误：数据库端口不可达：{0}:{1}" -f $DbHostPort.Host, $DbHostPort.Port)
    if (Get-Command docker -ErrorAction SilentlyContinue) {
        $Running = (& docker ps --filter "name=jrl-mysql" --format "{{.Names}} {{.Status}}" 2>$null)
        if (-not $Running) {
            Write-Host "提示：jrl-mysql 容器未在运行（docker ps 只读查询结果为空）。"
        } else {
            Write-Host ("提示：容器状态：{0}（可能刚启动，等待几秒后重试）" -f $Running)
        }
    }
    Write-Host "请手动确认 Docker Desktop 与 jrl-mysql 容器已启动后重试——本脚本按设计永不自动启动 Docker。"
    exit 2
} finally { $Tcp.Close() }
Write-Host ("数据库端口可达：{0}:{1}" -f $DbHostPort.Host, $DbHostPort.Port)

$OutDir = Join-Path ([System.IO.Path]::GetTempPath()) ("jrl-s05-" + [System.Guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $OutDir | Out-Null

try {
    $JavaFiles = Get-ChildItem -Path (Join-Path $StageRoot "existing_course") -Filter "*.java" -Recurse | ForEach-Object { $_.FullName }
    & javac -encoding UTF-8 -d $OutDir $JavaFiles
    if ($LASTEXITCODE -ne 0) { throw "javac 编译失败" }

    $Classpath = "$OutDir;$Jar"
    $Entries = @(
        "com.javaroadmap.stage05.day01sqlconstraints.App",
        "com.javaroadmap.stage05.day02relationalmodeling.App",
        "com.javaroadmap.stage05.day03transactionsacid.App",
        "com.javaroadmap.stage05.day04indexesexplain.App",
        "com.javaroadmap.stage05.day05jdbcrepository.App",
        "com.javaroadmap.stage05.student.StudentEvolutionDemo"
    )
    foreach ($Fqcn in $Entries) {
        Write-Host "`n== 运行 $Fqcn =="
        & java '-Dstdout.encoding=UTF-8' '-Dstderr.encoding=UTF-8' '-Dfile.encoding=UTF-8' -cp $Classpath $Fqcn
        if ($LASTEXITCODE -ne 0) { throw "运行失败：$Fqcn" }
    }
    Write-Host "`n== 全部 Stage 05 MySQL 课程与 6 阶段连续项目实测通过 =="
} finally {
    if (Test-Path $OutDir) { Remove-Item -Recurse -Force $OutDir }
}
