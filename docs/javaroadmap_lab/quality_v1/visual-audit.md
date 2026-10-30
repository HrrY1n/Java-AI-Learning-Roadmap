# 视觉审计与截图索引

2026-10-30，沿用原设计系统，源码变更仅涉及预测路由和本地运行说明。本次没有重做配色、课程结构、全站组件或动效。

## 可获取的证据

- [最终代码的完整PR视觉包](https://github.com/HrrY1n/Java-AI-Learning-Roadmap/actions/runs/41001811538/artifacts/12953334932)：下载 `lab-visual-1`，解压后打开 `gallery.html`，点击图可看原尺寸。含日志、HTML/JSON、audit JSON与77张PNG；14天保留，约9.26MB。
- [同一提交的核心报告与构建包](https://github.com/HrrY1n/Java-AI-Learning-Roadmap/actions/runs/41001811538)：`lab-core-ubuntu-latest-1`、`lab-core-windows-latest-1`、`lab-core-macos-latest-1`均为21/21；`lab-dist-*`是成功构建的静态文件，不是部署。
- [已实际下载核验的远端视觉包](https://github.com/HrrY1n/Java-AI-Learning-Roadmap/actions/runs/41000873506/artifacts/12953910413)：代码 `f2bb7f5`，视觉系统与最终测试提交一致，14/14通过，77图，约9.26MB。Git不显示忽略资源，不等于截图丢失。
- [真实失败 trace / 截图 / 日志包](https://github.com/HrrY1n/Java-AI-Learning-Roadmap/actions/runs/41000873506/artifacts/12953626056)：Ubuntu核心失败的已下载证据，显示返回的Monaco正常、测试模式选择时序有误；是修前失败记录，不能作为通过报告。

本机独立输出位于 `.audit-work/lab_quality_20261030/`，均不进 Git：

| 目录 / 文件 | 内容 |
|---|---|
| `before/` | 第一轮31项、完整77图、axe/溢出JSON与gallery |
| `final/` | 第二轮35项、完整77图、gallery与JSON；此后扩展闭环另有最终核心报告 |
| `final-core/` | 最终21核心生产浏览器报告，含真实下载/JDK/失败导入/复盘 |
| `visual-ci/` | 实际下载解压的远端77图及报告，桌面/手机contact图用于并排审查 |
| `manual/local-run-before.jpg`、`manual/local-run-after.jpg` | 同一Edge窗口本地运行区的修订前后实际截图 |
| `mac-failure/`、`ubuntu-failure/` | 实际下载的修前失败上下文、trace、截图与报告 |
| `gate-probes/` | 可逆负向门禁日志与退出码 |

## 77张截图命名

| 对象 | 文件名 | 数量 |
|---|---|---|
| 首页、路线、阅读、实验室、复盘、预测 | `{home,roadmap,lesson,lab,review,prediction}-{宽度}-{light,dark}.png` | 72 |
| 课程提示 | `tutor-{1440,390}-{light,dark}.png` | 4 |
| 手机实际编辑区域 | `lab-editor-390-light.png` | 1 |

六视口为1440×900、1280×800、1024×768、768×1024、390×844、360×760。图片是视口截图，长页需滚动；手机编辑区另图证明高度，不能以首屏看不到编辑器误认为不存在。导师截图只展示主动解锁的L1/L2。

## 八项人工判断

实际查看本机前后两轮截图、远端桌面/手机双主题contact图及导师/手机编辑原尺寸。自动工具仅辅助确认溢出、对比度等规则。

| 维度 | 检查结果与动作 |
|---|---|
| 排版 | 中文正文、代码与英文标签区分稳定，标题与段落节奏可读；未缩小正文。辅助英文不承载唯一关键信息，Safari字体待测 |
| 留白 | 阅读列、右侧目录与页边距一致；桌面编辑器为大面积工作区；手机按任务纵向排布，保持编辑高度 |
| 信息层级 | 修前并列两条运行路径，容易重复编译；修后强调下载→单条CLI→导入，可选命令折叠，成绩统计去掉多余输入文件 |
| 代码区 | 桌面Monaco宽高足够，手机textarea及语法预览可用；长命令在代码框内部横向滚动，页面不横向溢出 |
| 色彩 | 暖白/石墨与深海主题语义一致，暗色不简单反相；提示、错误同时有文字，无需全局换色 |
| 微交互 | 保存/失败、提示逐级展开、抽屉关闭回焦、键盘标签切换有自动与实际操作依据；减少动态时transition为0。未做真人长期晕动评估 |
| 响应式 | 六视口双主题页面无文档水平溢出；手机底栏、提示抽屉与编辑器分别截图；实际iPhone软键盘/安全区待人工确认 |
| 原创性/一致性 | 原有书页式学习区与开发工作区共用J/标识、细线、色阶和字体节奏；无需为“换样子”增加装饰或改卡片模板。此为设计判断，非奖项认证 |

未发现未解决的严重视觉缺陷。自动化不代表实际低端手机/读屏器全覆盖。没有新增本轮Lighthouse分数。

## 修前/修后与复现

修前 `71e4e2f`：成绩统计→本地运行，同时给javac、java与CLI，且数组题也提示准备输入。修后 `f2bb7f5`：推荐一条CLI、成绩题只需expected、手动命令折叠。两张 `manual/` JPG在同一Edge窗口捕获，未修改网页内容。

复现全套：检出目标提交，在 `web/` 按 [CI说明](ci.md)安装并构建，设置独立 `LAB_ARTIFACT_DIR` 后执行 `npx playwright test e2e/visual.spec.ts`。使用 `CI=true` 验证生产preview；确认5173未被其他服务占用，不并行启动两组同端口测试。

复现局部：分别检出上述修前/修后提交并构建，以同一浏览器视口访问 `#/lab/scores`，点击“本地运行”后截图；新来源/端口用于QA，先备份个人记录。批量脚本为 [`visual.spec.ts`](../../../web/e2e/visual.spec.ts)，报告直接生成，无需把PNG加入Git。
