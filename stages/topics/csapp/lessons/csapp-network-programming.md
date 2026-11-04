# 套接字编程：本机回环的 TCP echo

## 1. Scenario：从一个具体问题出发
服务端收不到请求，或客户端读不完连接就关闭。

## 2. Why：为什么这个问题值得系统理解
套接字是进程间网络通信接口；字节流没有消息边界，必须显式设计协议和关闭语义。

## 3. Concept：核心概念
服务端绑定端口并接受连接；客户端连接后读写。回环地址适合实验。TCP 是字节流，UDP 是数据报，二者不能简单互换。

## 4. Mental Model：把机制装进一张图
`bind/listen/accept` 建立服务；`connect` 建立客户端；读写直到协议约定结束。

## 5. Minimal Code：最小示例
```java
try (java.net.ServerSocket server = new java.net.ServerSocket(0);
     Socket client = new Socket("127.0.0.1", server.getLocalPort());
     java.net.Socket accepted = server.accept()) {
    client.getOutputStream().write("ping\n".getBytes(StandardCharsets.UTF_8));
}
```

## 6. Observe：先预测，再运行
先运行源码，预测客户端发送的 `ping` 是否会自动回显；再看服务端实际读取结果。

## 7. Modify：只改一个有意义的条件
把服务端改成读取一行后原样返回；再观察客户端如何判断响应结束。

## 8. Exercise：独立完成
实现本机 TCP echo：客户端发送一行，服务端返回一行，双方用临时端口并在 finally 中关闭。

## 9. Real Usage：联系 Java 与工程实践
调试 REST、RPC 和数据库连接时，先确认协议边界、编码、超时与关闭，而不是只看 URL。

## 来源与出处
《CSAPP, 3rd Global Edition》Chapter 11（PDF 第 954-1008 页）。
