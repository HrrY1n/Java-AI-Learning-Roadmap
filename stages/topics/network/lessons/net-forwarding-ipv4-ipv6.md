# 网络层转发：路由器、IPv4、IPv6 与 NAT

## 1. Scenario：从一个具体问题出发
服务在容器内可达，外部访问不了；NAT 或地址规划可能是原因。

## 2. Why：为什么这个问题值得系统理解
网络层负责主机到主机的转发；地址、路由表和 NAT 决定可达性。

## 3. Concept：核心概念
IPv4/IPv6 有不同地址长度和头部；路由器按最长前缀匹配转发；NAT 重写地址/端口。IPv6 需要显式地址与双栈支持。

## 4. Mental Model：把机制装进一张图
`目的 IP -> 路由表最长前缀 -> 输出接口`。

## 5. Minimal Code：最小示例
```java
InetAddress local = InetAddress.getLocalHost();
System.out.println(local.getHostAddress());
```

## 6. Observe：先预测，再运行
打印本机地址，并区分回环、私有和公网地址。

## 7. Modify：只改一个有意义的条件
尝试绑定 `127.0.0.1` 与 `0.0.0.0`，观察服务可见范围（只在本机/本机网络实验）。

## 8. Exercise：独立完成
写一个地址分类器：给定 IPv4 地址输出 loopback、private 或 public；说明它不是完整路由器实现。

## 9. Real Usage：联系 Java 与工程实践
容器网络、防火墙规则和双栈部署都依赖网络层语义。

## 来源与出处
《计算机网络：自顶向下方法（原书第 8 版中文版）》第 4 章（印刷页 198-239，PDF 第 217-266 页）。
