# 崩溃一致性：FSCK 与预写日志

## 1. Scenario：从一个具体问题出发
更新元数据和数据之间断电，文件系统可能指向错误块。

## 2. Why：为什么这个问题值得系统理解
多块写入不是原子操作；崩溃一致性要求协议先保证可恢复。

## 3. Concept：核心概念
FSCK 崩溃后扫描修复；日志先记录意图，再提交检查点，再应用变更。元数据日志常见折衷。

## 4. Mental Model：把机制装进一张图
`journal(TX begin, write, commit) -> checkpoint -> data`。

## 5. Minimal Code：最小示例
```java
// 教学模拟：两阶段提交动作
static List<String> journalWrite(String oldBlock, String newBlock) {
    return List.of("BEGIN", "WRITE " + newBlock, "COMMIT", "CHECKPOINT");
}
```

## 6. Observe：先预测，再运行
先预测只写数据块、只写元数据块、两者之间断电的结果，再运行模拟器查看日志序列。

## 7. Modify：只改一个有意义的条件
把日志改成元数据日志，比较恢复时需要检查的内容。

## 8. Exercise：独立完成
实现一个纯内存日志模拟器，支持“崩溃后按日志恢复”；明确标注不是真实文件系统。

## 9. Real Usage：联系 Java 与工程实践
数据库 WAL、Redis AOF 和可靠写入流程都依赖类似思想。

## 来源与出处
《操作系统导论》（本地中文版）第 42 章（PDF 第 394-409 页）。
