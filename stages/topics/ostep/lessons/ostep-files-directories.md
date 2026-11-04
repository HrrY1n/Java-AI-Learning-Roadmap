# 文件、目录、硬链接与 fsync

## 1. Scenario：从一个具体问题出发
写文件后立刻断电，数据可能丢失；硬链接删除一个名字后文件仍在。

## 2. Why：为什么这个问题值得系统理解
文件系统通过目录项、inode 和延迟写提高性能，但也带来持久化语义。

## 3. Concept：核心概念
文件是字节序列，目录是名字到 inode 的映射；硬链接共享 inode，符号链接保存路径。`fsync` 强制落盘。Java `Files` 提供跨平台抽象，但默认不保证 fsync。

## 4. Mental Model：把机制装进一张图
`路径 -> 目录项 -> inode -> 数据块`。

## 5. Minimal Code：最小示例
```java
Files.writeString(path, text, StandardOpenOption.CREATE);
// 需要强持久化时，Java 侧要显式使用 FileChannel.force() 等底层通道。
```

## 6. Observe：先预测，再运行
创建一个硬链接（Windows 需注意文件系统支持），删除原路径后通过新链接读取内容。

## 7. Modify：只改一个有意义的条件
把写文件改成 `FileChannel.force(true)`，比较普通写入与强制刷新的耗时趋势。

## 8. Exercise：独立完成
实现 `atomicReplace(path, text)`：写临时文件、校验大小、必要时 force，再原子移动。

## 9. Real Usage：联系 Java 与工程实践
配置写入、导出和日志必须明确是否需要崩溃一致性。

## 来源与出处
《操作系统导论》（本地中文版）第 39 章（PDF 第 356-371 页）。
