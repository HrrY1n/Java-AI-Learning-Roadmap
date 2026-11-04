# 链路层：差错检测、MAC、交换机与以太网

## 1. Scenario：从一个具体问题出发
同一交换机下两台机器通信正常，跨网段却失败。

## 2. Why：为什么这个问题值得系统理解
链路层负责相邻节点间帧传输，MAC 寻址和交换机学习与 IP 路由不同。

## 3. Concept：核心概念
链路层提供成帧、差错检测、介质访问和本地交付；ARP 把 IP 映射到 MAC；交换机学习 MAC 地址表。

## 4. Mental Model：把机制装进一张图
`IP 决定下一跳 -> ARP 解析 MAC -> 帧在链路上传输`。

## 5. Minimal Code：最小示例
```java
NetworkInterface nic = NetworkInterface.getByInetAddress(InetAddress.getLocalHost());
byte[] mac = nic.getHardwareAddress();
```

## 6. Observe：先预测，再运行
打印本机网卡名称和硬件地址（若环境允许），注意这不是远程 MAC。

## 7. Modify：只改一个有意义的条件
在纸上维护一张交换机 MAC 表：主机 A→B、B→A、C→A 三帧依次到达，写出每帧之后表的内容与转发/泛洪决策，观察“未知单播泛洪”何时变成“已知单播转发”。

## 8. Exercise：独立完成
实现教学版交换机表：输入帧的 src/dst，输出学习表变化和转发行为。

## 9. Real Usage：联系 Java 与工程实践
虚拟化网络、VLAN 和云安全组排错需要理解二层与三层边界。

## 来源与出处
《计算机网络：自顶向下方法（原书第 8 版中文版）》第 6 章（印刷页 294-340，PDF 第 313-367 页）。
