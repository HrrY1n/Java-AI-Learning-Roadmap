package com.javaroadmap.network.net_http_status;

/**
 * 教学示例：HTTP 状态码实验：200、404 与连接失败
 * 来源：计算机网络（原书第 8 版中文版）第 2 章 2.2 节
 * 用 JDK 自带的 HttpServer 在本机启动真实 HTTP 服务：
 * /health 返回 200，/missing 返回 404；服务停止后再请求 /health，
 * 得到的是连接被拒（ConnectException）——这是传输层失败，不是 HTTP 状态码。
 * 三种结果必须分开处理，这是排查服务异常的基本功。
 */
public final class App {
    private App() {
    }

    public static void main(String[] args) throws Exception {
        System.out.println("=== HTTP 状态码实验：200、404 与连接失败 ===");
        java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
        // HttpServer 绑定临时端口；/health 正常返回，/missing 返回 404
        com.sun.net.httpserver.HttpServer server = com.sun.net.httpserver.HttpServer.create(
            new java.net.InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/health", exchange -> {
            byte[] body = "ok".getBytes(java.nio.charset.StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "text/plain; charset=utf-8");
            exchange.sendResponseHeaders(200, body.length);
            exchange.getResponseBody().write(body);
            exchange.close();
        });
        server.createContext("/missing", exchange -> {
            byte[] body = "not found".getBytes(java.nio.charset.StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(404, body.length);
            exchange.getResponseBody().write(body);
            exchange.close();
        });
        server.start();
        int port = server.getAddress().getPort();
        try {
            java.net.http.HttpResponse<String> healthy = client.send(
                request("http://127.0.0.1:" + port + "/health"),
                java.net.http.HttpResponse.BodyHandlers.ofString());
            System.out.println("请求 /health  -> HTTP " + healthy.statusCode() + "（服务正常）");

            java.net.http.HttpResponse<String> missing = client.send(
                request("http://127.0.0.1:" + port + "/missing"),
                java.net.http.HttpResponse.BodyHandlers.ofString());
            System.out.println("请求 /missing -> HTTP " + missing.statusCode() + "（服务在线，但资源不存在）");
        } finally {
            server.stop(0);
        }

        // 服务已停止：TCP 三次握手都无法完成，于是抛出连接异常——连 HTTP 状态码都没有。
        try {
            client.send(request("http://127.0.0.1:" + port + "/health"),
                java.net.http.HttpResponse.BodyHandlers.ofString());
            System.out.println("服务停止后请求 /health -> 意外成功（不应发生）");
        } catch (java.net.ConnectException e) {
            System.out.println("服务停止后请求 /health -> ConnectException（连接失败，不是 404）");
        }
        System.out.println("提示：200/404 是应用层语义；ConnectException 是传输层失败。重试与告警策略应区分对待。");
        System.out.println("示例结束。请在本地独立完成练习，不要把演示输出当作生产验证。");
    }

    private static java.net.http.HttpRequest request(String url) {
        return java.net.http.HttpRequest.newBuilder(java.net.URI.create(url))
            .timeout(java.time.Duration.ofSeconds(2))
            .GET()
            .build();
    }
}
