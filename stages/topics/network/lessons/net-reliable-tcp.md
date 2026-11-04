# 可靠数据传输与 TCP 语义

## 1. Scenario：从一个具体问题出发
连接超时后是否应该立即重试？重试是否可能重复提交？

## 2. Why：为什么这个问题值得系统理解
TCP 解决丢包、乱序和流量控制，但不会替应用实现幂等。

## 3. Concept：核心概念
可靠协议用序号、确认、超时和重传；流水线提高吞吐。TCP 还有流量控制与状态机；Java Socket 只暴露字节流。

## 4. Mental Model：把机制装进一张图
`发送 seq -> 接收 ack -> 超时重传 -> 接收方按序重组`。

## 5. Minimal Code：最小示例
```java
Socket socket = new Socket();
socket.connect(new InetSocketAddress("127.0.0.1", port), 1000);
socket.setSoTimeout(2000);
```

## 6. Observe：先预测，再运行
连接不存在的本地端口，预测是立即拒绝还是等待超时。

## 7. Modify：只改一个有意义的条件
把连接超时改为 100ms 或读取超时改为 1ms，观察不同异常。

## 8. Exercise：独立完成
实现 `connectWithTimeout`，区分连接失败、读取超时和正常结束；再说明业务层为什么仍需要幂等键。

## 9. Real Usage：联系 Java 与工程实践
支付、下单和上传必须设计幂等重试；TCP 可靠不等于业务安全。

## 来源与出处
《计算机网络：自顶向下方法（原书第 8 版中文版）》第 3.4-3.5 节（印刷页 131-167，PDF 第 150-186 页）。
