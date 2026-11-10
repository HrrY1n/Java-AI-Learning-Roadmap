# 可靠数据传输与 TCP 语义

## 1. Scenario：从一个具体问题出发
在调用第三方支付或提交订单接口时，客户端等了 2 秒发生 `SocketTimeoutException`（读取超时）。此时你的业务代码如果直接开启“重试 3 次”，真的安全吗？明明底层的 **TCP** 协议号称“可靠数据传输”，为什么业务请求还是可能被服务器执行两次，导致用户被扣两次款？

## 2. Why：为什么这个问题值得系统理解
底层的 IP 网络层只提供“尽力而为（Best-Effort）”服务：数据包在路由器之间可能**丢失、损坏、重复或乱序到达**。TCP 在不可靠的 IP 之上通过协议状态机向上层提供“按序、无差错、不丢失的字节流”，这是《计算机网络》第 3.4–3.5 节最核心的架构奇迹。
然而，**TCP 的“可靠”只针对“当前存活的这一条连接上的字节流”**。一旦超时断开重连，新连接对旧连接上一无所知；而且 TCP 的确认（ACK）只是说“对端内核协议栈收到了字节”，**不代表对端业务应用已经把数据库写完**。分清传输层可靠与业务层幂等，是后端接口不写错的基本功。

## 3. Concept：核心概念

### 可靠数据传输（RDT）协议的四块基石（3.4 节）
1. **差错检测（Checksum）**：用校验和识别比特翻转损坏。
2. **接收方反馈（ACK / NAK）**：明确告诉发送方收到到了哪一段；TCP 采用**累计确认（Cumulative ACK）**——回复 `ACK = N` 表示序号 `< N` 的所有字节都已按序收齐，我现在期待收序号 `N`。
3. **序号（Sequence Number）与去重**：为每个数据块编号。**如果回程 ACK 在网络中丢失，发送方超时重传同一分组，接收方靠序号识别出这是重复包，立即丢弃副本、不重复交给上层应用，同时补回一次 ACK！**
4. **定时器与超时重传（RTO）**：发送后启动定时器，超时未收到 ACK 即重传；若连续收到 **3 次冗余 ACK（Triple Duplicate ACK）**，说明后面的包都到了只有中间某个包丢了，**不等 RTO 到期立刻触发快速重传（Fast Retransmit）**。

### 流水线、滑动窗口与流量控制（3.4–3.5 节）
停等协议（发一个等一个 ACK）在高延迟链路上信道利用率极低。流水线允许发送方同时有多个已发出未确认的分组在网络中飞行：
- **GBN（回退 N 步） vs SR（选择重传）**：GBN 接收端缓存简单但重传代价大；TCP 结合两者特征——使用累计确认，但接收端会缓存乱序到达的正确分段（配合 SACK 选项）。
- **流量控制（Flow Control）**：接收端在每次回复的报文头里带上剩余可用缓冲区大小 **`rwnd`（接收窗口）**，强迫发送方保证“已发送未确认字节 <= `rwnd`”，防止发送太快把接收方缓冲区打满丢包。

### Java Socket 超时与业务幂等分界
Java `Socket` 暴露两类完全不同的超时：
- **`socket.connect(endpoint, timeoutMs)`**：TCP 三次握手建链超时（连接一个本地未监听端口会直接快速抛 `ConnectException`，而连一个丢弃 SYN 包的黑洞 IP 会等到超时）。
- **`socket.setSoTimeout(readTimeoutMs)`**：连接已经建立后，`InputStream.read()` 等待对端数据的阻塞超时（抛 `SocketTimeoutException`）。**注意**：读取超时时，请求字节可能早已送达服务端且服务端已经写库成功，只是回包慢了——如果此时应用盲目重发一次新请求而没有业务层**幂等键（Idempotency Key）**去重，必然导致重复下单/重复扣款！

## 4. Mental Model：把机制装进一张图
```text
[TCP 可靠层] 发送 seq=1 ──(ACK 途中丢失)──▶ 超时重传 seq=1 ──▶ 接收端识别重复 seq=1（只丢弃+补 ACK，不重复交付）
     │
     ▼ （如果读超时断开后应用另起新连接重发请求，TCP 序号重新开始，传输层管不到这里！）
[业务应用层] 客户端带 idempotencyKey="req-8801" ──▶ 服务端查已处理集合/唯一索引 ──▶ 拦截重复下单
```

## 5. Minimal Code：最小示例
`stages/topics/network/examples/net_reliable_tcp/.../App.java` 用确定性状态机模拟了“ACK 丢失重传去重”、“乱序触发重复 ACK（快速重传依据）”以及“连接超时重连时业务幂等键拦截”三段完整过程：
```java
if (seq == expectedSeq) {
    deliveredToApp.add(seq);
    expectedSeq++;
    rwndBytes = Math.max(0, rwndBytes - payloadBytes);
} else if (seq < expectedSeq) {
    System.out.println("  [接收端] 收到重复分组 seq=" + seq + " -> 传输层去重丢弃，重发累计 ACK=" + expectedSeq);
}
```

## 6. Observe：先预测，再运行
先预测三件事再运行 `stages/topics/network/examples/net_reliable_tcp/com/javaroadmap/network/net_reliable_tcp/App.java`：① 当 `seq=1` 的 ACK 丢失重传到达接收端后，`deliveredToApp` 里会不会出现两个 `1`？② 乱序发 `seq=3` 时接收端回复的累计 `ACK` 是几？③ 客户端携带相同 `"req-8801"` 第二次调用 `createOrder` 会成功扣款还是被拦截？

## 7. Modify：只改一个有意义的条件
1. 在 `TcpReceiverSim` 中增加接收缓冲区上限判断（当 `rwndBytes < payloadBytes` 时模拟缓冲区满拒绝新包并通告 `rwnd=0`），观察流量控制如何保护接收端。
2. 尝试去掉 `IdempotentOrderService` 的 `processedKeys.add(idempotencyKey)` 检查再跑第 4 段——亲眼看到即使底层 `TcpReceiverSim` 完美去重了，上层“超时重连重发”依然造成二次下单。

## 8. Exercise：独立完成
1. 在独立代码副本中给 `TcpReceiverSim` 补上**乱序缓冲（模拟简化版 SR + SACK）**：当 `seq=3` 提前到达时暂存进乱序缓冲区，等 `seq=2` 补齐后一次按序交付 `[2, 3]` 并把 `expectedSeq` 直接推进到 `4`。
2. 为你的支付/订单场景写一段注释：说明 `connectTimeout`、`readTimeout` 与数据库唯一幂等键各自承担哪一层的保护职责。

## 9. Real Usage：联系 Java 与工程实践
真实后端调用下游 HTTP/RPC 服务时，**只有只读查询（GET）可以无条件重试**；涉及资金、创建订单、扣减库存的写接口，必须在请求头或参数里携带全局唯一请求 ID（幂等键），并配合 MySQL `UNIQUE KEY`（Stage 05 所学的 `1062` 冲突拦截）或 Redis 去重锁实现业务幂等——“TCP 可靠”绝不等于“业务重发安全”。

## 来源与出处
《计算机网络：自顶向下方法（原书第 8 版中文版）》第 3.4-3.5 节（印刷页 131-167，PDF 第 150-186 页）。
