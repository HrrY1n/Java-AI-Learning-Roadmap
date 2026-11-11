package com.javaroadmap.stage06.lab.http;

import com.javaroadmap.stage06.lab.student.InMemoryStudentRepository;
import com.javaroadmap.stage06.lab.student.Student;
import com.javaroadmap.stage06.lab.student.StudentRepository;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 课 3：用 JDK 自带的 HttpServer 手写一个最小的学生 HTTP 服务。
 *
 * 目的不是让你以后手写生产服务器（那是 Spring Boot 的职责），而是把"框架到底替你做了什么"
 * 拆开看清楚：一个 HTTP 交互 = 请求行（方法 + 路径）+ 请求头 + 请求体；响应 = 状态码 + 头 + 体。
 * 手写一遍后，课 4 的 Spring MVC 注解才知道各自对应这里的哪几行代码。
 *
 * 运行方式：
 *   java ... com.javaroadmap.stage06.lab.http.StudentHttpServer        → 启动在 8080，等待请求
 *   java ... com.javaroadmap.stage06.lab.http.StudentHttpServer --selftest
 *       → 起临时端口、用 JDK HttpClient 打自己的接口、打印结果后退出（可进入自动回归）
 */
public class StudentHttpServer {

    private final StudentRepository repository;
    private HttpServer server;

    public StudentHttpServer(StudentRepository repository) {
        this.repository = repository;
    }

    public static void main(String[] args) throws IOException, InterruptedException {
        StudentHttpServer app = new StudentHttpServer(new InMemoryStudentRepository());
        app.seed();
        if (args.length > 0 && "--selftest".equals(args[0])) {
            System.out.println(app.runSelfTest());
            return;
        }
        app.start(8080);
        System.out.println("学生 HTTP 服务已启动：http://127.0.0.1:8080/api/students（Ctrl+C 停止）");
    }

    /** 预置两名学生，让 GET 立即有内容可看。 */
    void seed() {
        repository.save(new Student(1, "S001", "小明", 88, "ming@school.cn"));
        repository.save(new Student(2, "S002", "小红", 95, "-"));
    }

    public int start(int port) throws IOException {
        server = HttpServer.create(new InetSocketAddress(port), 0);
        // 请求分发：一个 context 绑定一条资源路径——Spring 的 @GetMapping 本质上就是这张表的语法糖
        server.createContext("/api/students", this::handleStudents);
        server.start();
        return server.getAddress().getPort();
    }

    public void stop() {
        if (server != null) {
            server.stop(0);
        }
    }

    private void handleStudents(HttpExchange exchange) throws IOException {
        try {
            // 解析请求行：方法 + 路径。URL 里多余的 / 与查询串都要自己处理
            URI uri = exchange.getRequestURI();
            String path = uri.getPath().replaceAll("/+$", "");
            String method = exchange.getRequestMethod();

            if ("GET".equals(method) && "/api/students".equals(path)) {
                respond(exchange, 200, toJson(repository.findAll()));
                return;
            }
            // 资源路径 /api/students/{id}：手工从路径里"抠"出 id——框架的路由参数替换的就是这段
            if ("GET".equals(method) && path.matches("/api/students/\\d+")) {
                int id = Integer.parseInt(path.substring(path.lastIndexOf('/') + 1));
                Optional<Student> found = Optional.ofNullable(repository.findById(id));
                if (found.isPresent()) {
                    respond(exchange, 200, toJson(found.get()));
                } else {
                    // 状态码语义：404 = 资源不存在，而不是 500（服务器没错，是找的东西没有）
                    respond(exchange, 404, "{\"error\":\"学生不存在\",\"id\":" + id + "}");
                }
                return;
            }
            // 分发兜底：/api/students 前缀下已知资源 + 不支持的方法 → 405。
            // context 按前缀注册，到达本 handler 的请求必然以 /api/students 开头——
            // 完全未知路径由 JDK 默认 handler 直接 404，不会进入这里（实测）。
        } catch (Exception e) {
            // 分发器的兜底异常处理：绝不吞掉根因——状态码 500 + 消息透传给调用方排查
            respond(exchange, 500, "{\"error\":\"" + e.getClass().getSimpleName() + "\"}");
        } finally {
            exchange.close();
        }
    }

    /** 把学生列表拼成 JSON 数组（手写转义，体会 Jackson 替你挡掉的部分）。 */
    static String toJson(List<Student> students) {
        return students.stream().map(StudentHttpServer::toJson).collect(Collectors.joining(",", "[", "]"));
    }

    static String toJson(Student s) {
        return "{\"id\":" + s.getId()
                + ",\"studentNo\":\"" + escape(s.getStudentNo()) + "\""
                + ",\"name\":\"" + escape(s.getName()) + "\""
                + ",\"score\":" + s.getScore()
                + ",\"email\":\"" + escape(s.getEmail()) + "\"}";
    }

    static String escape(String text) {
        return text.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    private void respond(HttpExchange exchange, int status, String json) throws IOException {
        byte[] body = json.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
        exchange.sendResponseHeaders(status, body.length);
        try (OutputStream out = exchange.getResponseBody()) {
            out.write(body);
        }
    }

    /**
     * 自验证：随机端口起服务 → JDK HttpClient 请求自己的三个端点 → 拼成可断言的文本后停止。
     * 该方法让 HTTP 课程同样可以进入自动回归（verify_stage06.sh）。
     */
    String runSelfTest() throws IOException, InterruptedException {
        int port = start(0); // 端口 0 = 由操作系统分配空闲端口
        HttpClient client = HttpClient.newHttpClient();
        StringBuilder report = new StringBuilder();
        try {
            report.append(request(client, port, "/api/students", "GET"));
            report.append(request(client, port, "/api/students/1", "GET"));
            report.append(request(client, port, "/api/students/999", "GET"));
        } finally {
            stop();
        }
        return report.toString();
    }

    private String request(HttpClient client, int port, String path, String method)
            throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + port + path)).build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
        return "GET " + path + " → " + response.statusCode() + " " + response.body() + "\n";
    }
}
