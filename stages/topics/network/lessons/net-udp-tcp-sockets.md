# UDP 与 TCP：数据报、字节流和套接字

## 1. Scenario：从一个具体问题出发
日志上报用 UDP，支付请求用 TCP；为什么不能互换？

## 2. Why：为什么这个问题值得系统理解
UDP 简单低延迟但不保证送达；TCP 提供可靠字节流，但需要连接与重传成本。

## 3. Concept：核心概念
UDP 有目的端口和数据报，应用负责可靠性。TCP 建立连接、确认、重传并按序交付。Java `DatagramSocket` 与 `Socket` 分别对应。

## 4. Mental Model：把机制装进一张图
UDP 是“寄信”，TCP 是“长对话”。

## 5. Minimal Code：最小示例
```java
// UDP：发送到接收方实际绑定的端口；send 之后没有会话、没有确认
try (DatagramSocket receiver = new DatagramSocket(0);
     DatagramSocket sender = new DatagramSocket()) {
    receiver.setSoTimeout(2000); // 数据报可能丢失，靠超时兜底
    sender.send(new DatagramPacket(payload, payload.length,
        InetAddress.getByName("127.0.0.1"), receiver.getLocalPort()));
    receiver.receive(new DatagramPacket(buffer, buffer.length));
}
// TCP 对照：ServerSocket.accept 建立连接后按字节流读写
```

## 6. Observe：先预测，再运行
先预测两个协议的差异会在输出里如何体现，再运行示例核对：UDP 段展示“发送即结束、收到才打印”，TCP 段展示“先 accept、再按字节流读到一行”。回环上 UDP 通常可达，但那不是协议保证——真实网络里它可能永远收不到。

## 7. Modify：只改一个有意义的条件
把 TCP 客户端发送内容改成多行，观察服务端如何需要协议分隔符。

## 8. Exercise：独立完成
分别实现本机 UDP 发送器和 TCP echo；说明各自适合的业务和必须补上的可靠性策略。

## 9. Real Usage：联系 Java 与工程实践
遥测、游戏和 DNS 常用 UDP；支付、文件传输和管理接口常用 TCP/TLS。

## 来源与出处
《计算机网络：自顶向下方法（原书第 8 版中文版）》第 2.7 节与第 3.1-3.3 节（印刷页 102-129，PDF 第 121-150 页）。
