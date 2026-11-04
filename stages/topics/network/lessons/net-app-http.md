# HTTP 应用层：请求、状态与连接语义

## 1. Scenario：从一个具体问题出发
同一个接口用连接池后更快，但你不确定 HTTP 连接何时复用。

## 2. Why：为什么这个问题值得系统理解
HTTP 语义决定请求/响应模型、状态码、缓存和连接生命周期。

## 3. Concept：核心概念
HTTP 是客户端-服务器协议。持续连接可复用 TCP 连接；头部描述内容类型、缓存、条件请求和身份。同一章的其他应用模式同源：SMTP 用推送中转传递邮件，P2P 用对等节点分担分发负载——传输介质都是 TCP，差别在应用层语义。Java `HttpClient` 抽象连接并支持 HTTP/1.1 与 HTTP/2。

## 4. Mental Model：把机制装进一张图
`请求方法 + 路径 + 头 + 体 -> 状态码 + 头 + 体`；连接由客户端/服务端和版本决定。

## 5. Minimal Code：最小示例
```java
HttpClient client = HttpClient.newHttpClient();
HttpRequest request = HttpRequest.newBuilder(URI.create("http://127.0.0.1:<port>/health")).GET().build();
HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
System.out.println(response.statusCode()); // 本机服务的真实应答，而不是猜出来的状态码
```

## 6. Observe：先预测，再运行
先预测三种请求的结果差异，再运行本课配套的 HTTP 状态码实验（下一节代码课）：本机 `/health` 返回 200、`/missing` 返回 404、服务停止后再请求得到 `ConnectException`。注意：连接失败时根本没有 HTTP 应答，不是“404 的一种”。

## 7. Modify：只改一个有意义的条件
把 GET 改成 HEAD 或增加 `If-None-Match`，观察服务器支持时状态码变化。

## 8. Exercise：独立完成
实现 `healthCheck(String baseUrl)`：设置超时、只允许本机或已配置主机、读取状态码与体。

## 9. Real Usage：联系 Java 与工程实践
REST 客户端、网关和缓存策略都要明确幂等性、重试与超时。

## 来源与出处
《计算机网络：自顶向下方法（原书第 8 版中文版）》第 2 章 2.1-2.3 节（印刷页 53-81，PDF 第 72-100 页）。
