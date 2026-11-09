# 05 · 算法代码质量升级报告（V2.1-P4）

## 处置原则（任务书：不为纯函数而机械重构）

逐文件判断"算法逻辑/结果返回/输出展示"的边界，只动确有混写的三处；适合教学的简单结构（heapSort 原地排序、noncomparisonsort 分桶演示等）一律保留。

## 改动（提交 ceeb37f）

| 文件 | 改动 | 输出 |
|---|---|---|
| knapsack/App.java | `knapsack01Table()` 返回完整 DP 表（纯）；`knapsack01()` 取最后一格（纯）；打表移到 main | 逐字节不变（diff 为空） |
| edit_distance/App.java | `editDistanceTable()`（纯）+ `editDistance()`（纯）；打表移到 main | 逐字节不变 |
| selection_heapsort/App.java | `selectionSort()` 纯化；新增 `selectionSortRounds()` 逐轮快照（入口层打印"第 r 轮选出 rounds[r][r]"） | 逐字节不变 |

算法核心现在可独立测试：`knapsack01Table(weights, values, cap)[n][cap]`、`editDistance("horse","ros") == 3`——不再需要捕获 stdout 验证。

## 同步与验证

- topics.json 三课 `code` 字段与 markdown 内嵌块同步为落盘源码（源码严格一致门禁：topic-content + algo-semantics 21/21）。
- `verify_java.sh` 103/103（manifest 子串断言不变——因输出逐字节保持）。
- 修改前后输出以 /tmp 沙箱 diff 验证（`ALL OUTPUTS IDENTICAL`）。

## 未动清单（有意保留）

- noncomparisonsort：分桶打表是其教学本体（桶排序"看得见"），保持现状。
- heapSort/mergeSort/binary search 等本就是纯函数。
- backtracking 系列的打印是回溯树的观察窗口，抽离反而伤教学。
