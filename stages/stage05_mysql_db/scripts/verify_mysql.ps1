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
