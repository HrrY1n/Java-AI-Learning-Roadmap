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
     java.net.Socket client = new java.net.Socket("127.0.0.1", server.getLocalPort());
     java.net.Socket accepted = server.accept()) {
    // 客户端写一行；TCP 是字节流，必须约定行分隔符作为消息边界
    client.getOutputStream().write("ping\n".getBytes(StandardCharsets.UTF_8));
    // 服务端：读一行并“原样写回”——这才是回显，而不是只读取
    String line = new java.io.BufferedReader(new java.io.InputStreamReader(
        accepted.getInputStream(), StandardCharsets.UTF_8)).readLine();
    accepted.getOutputStream().write((line + "\n").getBytes(StandardCharsets.UTF_8));
    // 客户端：读取回显，验证双向通路
    System.out.println(new java.io.BufferedReader(new java.io.InputStreamReader(
        client.getInputStream(), StandardCharsets.UTF_8)).readLine());
}
```

## 6. Observe：先预测，再运行
先预测：只发送、不写回的“echo”能证明双向通路吗？再运行源码，核对三行输出（发送、收到、回显）是否一致。最后把服务端的写回语句注释掉，再运行一次——客户端 `readLine()` 会一直阻塞，这正说明回显必须由服务端显式完成。

## 7. Modify：只改一个有意义的条件
把服务端改成读取一行后原样返回；再观察客户端如何判断响应结束。

## 8. Exercise：独立完成
实现本机 TCP echo：客户端发送一行，服务端返回一行，双方用临时端口并在 finally 中关闭。

## 9. Real Usage：联系 Java 与工程实践
调试 REST、RPC 和数据库连接时，先确认协议边界、编码、超时与关闭，而不是只看 URL。

## 来源与出处
《CSAPP, 3rd Global Edition》Chapter 11（PDF 第 954-1008 页）。
