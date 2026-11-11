# 12 · 回归与 CI 报告（V2.5 · 终态 `300feb1`）

## 一、远端 CI（PR #14 · 三系统全绿）

Run 43069270389（`300feb1`，R14 修复后）：

| Job | 结果 |
| --- | --- |
| verify-java (macos-latest, JDK 25) | ✅ 2m0s（**含 verify_stage06 三工程 mvnw 测试**——P0 chmod 修复的 macOS 实测） |
| verify-java (windows-latest, JDK 25) | ✅ 2m40s |
| web-core (ubuntu-latest)（typecheck/npm test/build/E2E 72） | ✅ 2m19s |
| web-core (windows-latest) | ✅ 4m43s |
| web-core (macos-latest) | ✅（E2E 72 用例，含 macOS 键盘容错修复后的 v14-topics） |
| web-visual | ✅ 2m1s |

## 二、本地干净检出终态回归（worktree @`300feb1`，全新 npm ci）

见 `.audit-work/v25/final-regression.log`：npm ci / npm test / typecheck / build / check:build / 内容幂等 / E2E（CI=1 全新 preview）/ Pages smoke / 链接 / **verify_stage06 三工程**——结果以日志为准。

## 三、主工作区本地证据（开发期实测）

- maven-lab 12/12 · student-api 14/14（含 Spring Boot 真启动 + 真 HTTP 契约）· mybatis-lab 3/3（无 DB 绑定验证）
- `bash scripts/verify_stage06.sh` → 三工程 PASS
- npm test 80/0（含 registry 稳定 ID 门禁、create-lesson 门禁、内容一致性）
- E2E 72/72（含新增 stage06 课程自动进入 sidebar/课程遍历）

## 四、已知偶发（记录在案）

1. macOS 无头 Chromium 的 Tab-跳过按钮平台行为（PR #13/14 两层容错后稳定）与教材索引点击的 hover 重渲染循环（鼠标移出修复）——均为测试基建问题，非产品代码缺陷。
2. ubuntu runner 一次 apt 装 Chromium 失败（infra，重跑即过）。
