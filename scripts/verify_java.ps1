# 跨平台 Java 课程验证脚本（PowerShell 5.1+；bash 版见 verify_java.sh，两者语义一致）。
# 用法：在仓库根目录执行  powershell -ExecutionPolicy Bypass -File scripts\verify_java.ps1
$ErrorActionPreference = 'Continue'

$RepoRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Manifest = Join-Path $RepoRoot 'scripts\verify_manifest.tsv'
$TimeoutSeconds = 30

foreach ($tool in @('javac', 'java')) {
    if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) {
        Write-Host "错误：找不到 $tool，请先阅读 docs/环境搭建.md"
        exit 2
    }
}

Write-Host "== 环境信息 =="
Write-Host "OS: $([System.Environment]::OSVersion.VersionString)"
& javac -version
& java -version 2>&1 | Select-Object -First 1
Write-Host ""

function Remove-CleanupPaths([string]$SrcRoot, [string]$List) {
    if ($List -eq '-') { return }
    foreach ($p in ($List -split ';')) {
        if ($p) {
            $full = Join-Path $SrcRoot $p
            if (Test-Path -LiteralPath $full) {
                Remove-Item -LiteralPath $full -Recurse -Force
            }
        }
    }
}

function Get-JavaTool([string]$Name) {
    return (Get-Command $Name -ErrorAction SilentlyContinue).Source
}

$JavacExe = Get-JavaTool 'javac'
$JavaExe = Get-JavaTool 'java'
$Total = 0; $Passed = 0; $Failed = 0
$WorkDir = Join-Path ([System.IO.Path]::GetTempPath()) ("java-verify-" + [System.Guid]::NewGuid().ToString('N').Substring(0, 8))
New-Item -ItemType Directory -Path $WorkDir | Out-Null

$Lines = [System.IO.File]::ReadAllLines($Manifest)
foreach ($line in $Lines) {
    if (-not $line -or $line.StartsWith('#')) { continue }

    $cols = $line -split "`t"
    if ($cols.Count -lt 5) { continue }
    $root = $cols[0]; $fqcn = $cols[1]; $StdinFix = $cols[2]; $Cleanup = $cols[3]
    $Expects = @($cols[4..($cols.Count - 1)])

    $Total++
    $label = "[$Total] $fqcn"
    $SrcRoot = Join-Path $RepoRoot $root

    if (-not (Test-Path -LiteralPath $SrcRoot)) {
        Write-Host "FAIL $label —— 源码根不存在：$root"
        $Failed++
        continue
    }

    # 运行前清理：避免上次遗留的数据文件影响本次结果
    Remove-CleanupPaths $SrcRoot $Cleanup

    # 编译源码根下全部 .java（与文档命令一致：-encoding UTF-8 -d out）
    $Sources = @(Get-ChildItem -LiteralPath $SrcRoot -Recurse -Filter *.java | ForEach-Object { $_.FullName })
    $OutDir = Join-Path $SrcRoot 'out'
    & $JavacExe -encoding UTF-8 -d $OutDir @Sources 2>&1 | Out-File -FilePath (Join-Path $WorkDir 'javac_err.txt') -Encoding UTF8
    if ($LASTEXITCODE -ne 0) {
        Write-Host "FAIL $label —— 编译失败："
        Get-Content (Join-Path $WorkDir 'javac_err.txt') -Tail 15
        $Failed++
        continue
    }

    # 运行：工作目录 = 源码根；交互程序从 fixture 提供输入；30 秒超时防菜单死等
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = $JavaExe
    $psi.Arguments = "-Dstdout.encoding=UTF-8 -Dstderr.encoding=UTF-8 -Dfile.encoding=UTF-8 -cp out $fqcn"
    $psi.WorkingDirectory = $SrcRoot
    $psi.UseShellExecute = $false
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true
    $psi.RedirectStandardInput = ($StdinFix -ne '-')
    $psi.StandardOutputEncoding = [System.Text.Encoding]::UTF8
    $psi.StandardErrorEncoding = [System.Text.Encoding]::UTF8

    $proc = [System.Diagnostics.Process]::Start($psi)
    $outTask = $proc.StandardOutput.ReadToEndAsync()
    $errTask = $proc.StandardError.ReadToEndAsync()

    if ($StdinFix -ne '-') {
        $fixturePath = Join-Path $RepoRoot ("scripts\" + $StdinFix)
        $bytes = [System.IO.File]::ReadAllBytes($fixturePath)
        $proc.StandardInput.BaseStream.Write($bytes, 0, $bytes.Length)
        $proc.StandardInput.BaseStream.Flush()
        $proc.StandardInput.Close()
    }

    $timedOut = $false
    if (-not $proc.WaitForExit($TimeoutSeconds * 1000)) {
        $timedOut = $true
        # java 可能经 Oracle javapath 垫片再启动真实 JVM：Kill 只能杀掉垫片，
        # 真实 JVM 会存活并持有输出管道，导致 ReadToEndAsync 永不结束。必须整树终止。
        & taskkill /PID $proc.Id /T /F 2>&1 | Out-Null
        try { $proc.WaitForExit(5000) | Out-Null } catch { }
    }
    # 有界等待读取完成（正常路径下进程已退出，管道立即关闭）
    $waited = 0
    while ((-not $outTask.IsCompleted -or -not $errTask.IsCompleted) -and $waited -lt 50) {
        Start-Sleep -Milliseconds 100
        $waited++
    }
    $stdout = if ($outTask.IsCompleted) { $outTask.GetAwaiter().GetResult() } else { "" }
    $stderrText = if ($errTask.IsCompleted) { $errTask.GetAwaiter().GetResult() } else { "" }

    Remove-CleanupPaths $SrcRoot $Cleanup

    if ($timedOut) {
        Write-Host "FAIL $label —— 运行超时（${TimeoutSeconds}s），可能存在死循环或菜单等待"
        $Failed++
        continue
    }
    if ($proc.ExitCode -ne 0) {
        Write-Host "FAIL $label —— 运行失败（exit=$($proc.ExitCode)）："
        ($stderrText -split "`n") | Select-Object -First 15 | ForEach-Object { Write-Host $_ }
        $Failed++
        continue
    }

    $missing = ""
    foreach ($exp in $Expects) {
        if (-not $exp) { continue }
        if (-not $stdout.Contains($exp)) { $missing = "$missing 「$exp」" }
    }

    if (-not $missing) {
        Write-Host "PASS $label"
        $Passed++
    } else {
        Write-Host "FAIL $label —— 输出缺少：$missing"
        Write-Host "---- 实际输出前 15 行 ----"
        ($stdout -split "`n") | Select-Object -First 15 | ForEach-Object { Write-Host $_ }
        $Failed++
    }
}

Remove-Item -LiteralPath $WorkDir -Recurse -Force -ErrorAction SilentlyContinue
Write-Host ""
Write-Host "== 结果：$Passed 通过 / $Failed 失败 / 共 $Total 项 =="
if ($Failed -gt 0) { exit 1 } else { exit 0 }
