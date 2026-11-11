# 13 · 遗留问题（V2.5 · 如实声明）

## 一、环境阻断（需要所有者授权才能解除）

1. **MyBatis 真实 MySQL 集成测试未执行**：Docker 引擎未运行（纪律：不擅自启动 Docker Desktop）。当前验证等级 = 编译 + 解析 + 语句绑定 + `#{}` 注入静态检查（无数据库第二级验证）。解除路径与登记表见 `07_DATABASE_INTEGRATION.md`。
2. **Stage06 真库路径**（`application-mysql.properties` + `@SpringBootTest` MySQL profile）未建：等真库环境就绪后按 07 文档手册操作，同一套契约测试复跑即可。

## 二、教学范围的有意边界（非缺陷）

1. 认证、日志框架配置、Docker 部署、Redis：按 consolidation/04 路线留待后续 Stage。
2. `InMemoryStudentRepository.nextId` 非并发安全、id 复用：已在课 5 正文与 Service javadoc 如实声明；并发安全版是 Stage 04 任务 7 的实践主题。
3. `MyBatisLabApp` 只演示"无数据库的绑定验证"——真库演示等环境就绪。
4. Stage06 不配 Web 预测题/判题练习（stdout 比对判题器不适用工程任务）：练习走本地工程任务模式（06 文档）。

## 三、测试基建已知事项

1. macOS 无头 Chromium 两类平台行为已有两层容错（Tab-跳过按钮 → programmatic focus 驱动；教材索引 hover 重渲染 → 鼠标移出）。若未来再出现新的 macos 抖动形态，按同一"分类失败形态"模式扩展。
2. E2E CI 覆盖 72 用例（ubuntu/windows/macos 三系统跑全量）——比 V2.4 的方案 B 又进了一步；仍不是"全部用例上全部 OS"（visual 只在 ubuntu）。
3. `.mvn/wrapper/maven-wrapper.properties` 固定 Maven 3.9.9：升级时改一行 distributionUrl。

## 四、上一轮随分支携带的修正

11 个非 Stage06 文件的精度修正（stage01/03/04/05 措辞收敛，来自 V2.4 审计收尾）随 V2.5 提交进入历史——QA 已核验"方向正确无破坏"，清单见 10 文档 §二。
