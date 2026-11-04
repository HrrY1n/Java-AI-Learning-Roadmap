# 系统级 I/O 与 Java 文件流

## 1. Scenario：从一个具体问题出发
文件复制小文件没问题，大文件或异常路径却出现句柄泄漏和半成品。

## 2. Why：为什么这个问题值得系统理解
I/O 不只是读写字符串；缓冲、阻塞、错误传播和资源关闭都影响正确性。

## 3. Concept：核心概念
操作系统用文件描述符表示打开文件。Java `InputStream/OutputStream` 包装底层通道；缓冲流减少系统调用；try-with-resources 负责关闭。

## 4. Mental Model：把机制装进一张图
`Java 流 -> 缓冲区 -> 通道/文件描述符 -> 操作系统文件`。

## 5. Minimal Code：最小示例
```java
try (var input = Files.newInputStream(source);
     var output = Files.newOutputStream(target)) {
    input.transferTo(output);
}
```

## 6. Observe：先预测，再运行
先复制一个小文件并校验字节数；再故意指向不存在的源，观察异常与资源关闭。

## 7. Modify：只改一个有意义的条件
把无缓冲复制改成 `BufferedInputStream`，或把目标改成已存在文件，比较覆盖语义。

## 8. Exercise：独立完成
实现 `safeCopy(Path source, Path target)`：目标父目录必须存在、复制后校验大小、失败时清理半成品。

## 9. Real Usage：联系 Java 与工程实践
日志、导入导出和上传下载都应处理编码、异常、原子替换与句柄释放。

## 来源与出处
《CSAPP, 3rd Global Edition》Chapter 10（PDF 第 926-954 页）。
