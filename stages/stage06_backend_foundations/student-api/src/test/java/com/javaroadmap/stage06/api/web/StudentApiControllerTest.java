package com.javaroadmap.stage06.api.web;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * REST API 契约测试：RANDOM_PORT 起真实应用（内嵌 Tomcat），用 TestRestTemplate 走真 HTTP。
 * 这一屏就是"Spring Boot 应用启动测试 + REST 契约测试"——状态码、错误体形状、
 * Location 头全部按线上行为断言，而不是 mock 出来的假响应。
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class StudentApiControllerTest {

    @Autowired
    private TestRestTemplate http;

    @Autowired
    private com.javaroadmap.stage06.api.student.InMemoryStudentRepository repository;

    @BeforeEach
    void resetRepository() {
        // Spring 单例 Bean 的状态会跨测试存活：每条用例前重置，保证 id 从 1 开始、断言可确定
        repository.clear();
    }

    private HttpEntity<Map<String, Object>> json(Map<String, Object> body) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return new HttpEntity<>(body, headers);
    }

    private Map<String, Object> createStudent(String studentNo, String name, Object score, String email) {
        return Map.of("studentNo", studentNo, "name", name, "score", score, "email", email);
    }

    @Test
    @DisplayName("POST 创建 → 201 + Location + 响应体回显业务字段")
    void createReturns201WithLocation() {
        var response = http.postForEntity("/api/students",
                json(createStudent("S001", "小明", 88, "ming@school.cn")), Map.class);

        assertEquals(201, response.getStatusCode().value());
        assertNotNull(response.getHeaders().getLocation());
        assertEquals("/api/students/1", response.getHeaders().getLocation().getPath());
        assertEquals("S001", response.getBody().get("studentNo"));
        assertEquals(88, response.getBody().get("score"));
    }

    @Test
    @DisplayName("GET 列表包含已创建的学生；GET 单个 → 200；GET 不存在 → 404 + 统一错误体")
    void getAndNotFound() {
        http.postForEntity("/api/students", json(createStudent("S010", "小红", 95, "-")), Map.class);

        var list = http.getForEntity("/api/students", List.class);
        assertEquals(200, list.getStatusCode().value());
        assertTrue(list.getBody().size() >= 1);

        var found = http.getForEntity("/api/students/1", Map.class);
        assertEquals(200, found.getStatusCode().value());

        var missing = http.getForEntity("/api/students/999", Map.class);
        assertEquals(404, missing.getStatusCode().value());
        assertEquals("Not Found", missing.getBody().get("error"));
        assertEquals("学生不存在：999", missing.getBody().get("message"));
    }

    @Test
    @DisplayName("参数校验失败 → 400 + fieldErrors 逐字段说明（姓名空/分数 150/邮箱格式错）")
    void validationFailuresReturn400WithFieldErrors() {
        var bad = http.postForEntity("/api/students",
                json(createStudent("", "小明", 150, "not-an-email")), Map.class);

        assertEquals(400, bad.getStatusCode().value());
        assertEquals("请求参数校验失败", bad.getBody().get("message"));
        @SuppressWarnings("unchecked")
        Map<String, String> fieldErrors = (Map<String, String>) bad.getBody().get("fieldErrors");
        assertTrue(fieldErrors.containsKey("studentNo"), "空学号应有字段级错误");
        assertTrue(fieldErrors.containsKey("score"), "150 分应有字段级错误");
        assertTrue(fieldErrors.containsKey("email"), "非法邮箱应有字段级错误");
    }

    @Test
    @DisplayName("学号冲突 → 409 Conflict")
    void duplicateStudentNoReturns409() {
        http.postForEntity("/api/students", json(createStudent("S020", "小明", 60, "-")), Map.class);

        var conflict = http.postForEntity("/api/students",
                json(createStudent("S020", "冒名者", 70, "-")), Map.class);

        assertEquals(409, conflict.getStatusCode().value());
        assertEquals("Conflict", conflict.getBody().get("error"));
    }

    @Test
    @DisplayName("PUT 修改分数与邮箱 → 200；PUT 不存在 → 404")
    void updateAndMissing() {
        http.postForEntity("/api/students", json(createStudent("S030", "小刚", 70, "-")), Map.class);

        var updated = http.exchange("/api/students/1", HttpMethod.PUT,
                new HttpEntity<>(Map.of("score", 88, "email", "x@school.cn")), Map.class);
        assertEquals(200, updated.getStatusCode().value());
        assertEquals(88, updated.getBody().get("score"));

        var missing = http.exchange("/api/students/999", HttpMethod.PUT,
                new HttpEntity<>(Map.of("score", 88)), Map.class);
        assertEquals(404, missing.getStatusCode().value());
    }

    @Test
    @DisplayName("DELETE → 204 无响应体；再 GET → 404")
    void deleteReturns204Then404() {
        http.postForEntity("/api/students", json(createStudent("S040", "小雪", 90, "-")), Map.class);

        var deleted = http.exchange("/api/students/1", HttpMethod.DELETE, null, Void.class);
        assertEquals(204, deleted.getStatusCode().value());

        var gone = http.getForEntity("/api/students/1", Map.class);
        assertEquals(404, gone.getStatusCode().value());
    }

    @Test
    @DisplayName("路径参数不是数字 → 400（类型不匹配不许变 500）")
    void badPathParameterReturns400() {
        var bad = http.getForEntity("/api/students/not-a-number", Map.class);
        assertEquals(400, bad.getStatusCode().value());
        assertEquals("Bad Request", bad.getBody().get("error"));
    }
}
