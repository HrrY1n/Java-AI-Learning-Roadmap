# DNS、CDN 与名称解析

## 1. Scenario：从一个具体问题出发
域名解析成功但服务仍超时；或者不同地区访问不同节点。

## 2. Why：为什么这个问题值得系统理解
DNS 决定“找谁”，CDN 决定“从哪里取”，两者都会影响可用性和延迟。

## 3. Concept：核心概念
DNS 是分层的名称解析系统，记录类型包括 A/AAAA、CNAME、NS 等。CDN 根据位置和负载选择边缘节点；P2P 分发则让对等节点互为来源，两者都在“从哪里取”上做优化。Java `InetAddress` 只做名称解析，不等于 HTTP 请求成功。

## 4. Mental Model：把机制装进一张图
`域名 -> 缓存/递归解析 -> 权威服务器 -> IP -> 边缘节点`。

## 5. Minimal Code：最小示例
```java
InetAddress address = InetAddress.getByName("localhost");
System.out.println(address.getHostAddress());
```

## 6. Observe：先预测，再运行
解析 `localhost` 与一个公开域名，比较返回地址和是否可解析。

## 7. Modify：只改一个有意义的条件
把域名换成不存在的主机，观察 `UnknownHostException`。

## 8. Exercise：独立完成
实现 `resolveLocalHost()` 并输出地址；解释为什么不建议在生产代码中硬编码外部域名。

## 9. Real Usage：联系 Java 与工程实践
多区域部署、故障切换和缓存 TTL 都要理解 DNS 行为。

## 来源与出处
《计算机网络：自顶向下方法（原书第 8 版中文版）》第 2 章 2.4-2.6 节（印刷页 81-101，PDF 第 100-121 页）。
