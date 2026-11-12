# 任务 6 验收测试（不得修改——这是修复的验收标准）

> 复制到 `src/test/java/com/javaroadmap/stage06/api/web/BrokenStudentControllerTest.java`
> 与 task6-broken.md 的坏 Controller 同仓运行。任务完成的定义：本文件全部断言通过，且本文件未改动。

```java
package com.javaroadmap.stage06.api.web;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class BrokenStudentControllerTest {

    @Autowired
    private TestRestTemplate http;

    @Autowired
    private com.javaroadmap.stage06.api.student.InMemoryStudentRepository repository;

    @BeforeEach
    void reset() {
        repository.clear();
    }

    private HttpEntity<Map<String, Object>> json(Map<String, Object> body) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return new HttpEntity<>(body, headers);
    }

    private Map<String, Object> dto(String no, String name, Object score) {
        return Map.of("studentNo", no, "name", name, "score", score, "email", "-");
    }

    @Test
    @DisplayName("修复 1：创建成功必须返回 201 + Location（坏代码是 200）")
    void createReturns201() {
        var r = http.postForEntity("/api/broken-students", json(dto("S060", "小明", 60)), Map.class);
        assertEquals(201, r.getStatusCode().value());
        assertNotNull(r.getHeaders().getLocation());
        assertTrue(r.getHeaders().getLocation().getPath().startsWith("/api/broken-students/"));
    }

    @Test
    @DisplayName("修复 2a：路径 id 不是数字 → 400（坏代码是 500 NumberFormatException）")
    void badIdReturns400() {
        var r = http.getForEntity("/api/broken-students/abc", Map.class);
        assertEquals(400, r.getStatusCode().value());
        assertEquals("Bad Request", r.getBody().get("error"));
    }

    @Test
    @DisplayName("修复 2b：缺失 id → 404 统一错误体（坏代码是 500）")
    void missingReturns404() {
        http.postForEntity("/api/broken-students", json(dto("S061", "小红", 70)), Map.class);
        var r = http.exchange("/api/broken-students/999", org.springframework.http.HttpMethod.GET,
                null, Map.class);
        assertEquals(404, r.getStatusCode().value());
        assertEquals("Not Found", r.getBody().get("error"));
    }

    @Test
    @DisplayName("修复 3：学号冲突 → 409（坏代码是 500）")
    void duplicateReturns409() {
        http.postForEntity("/api/broken-students", json(dto("S062", "小刚", 80)), Map.class);
        var dup = http.postForEntity("/api/broken-students/1/duplicate", null, Map.class);
        assertEquals(409, dup.getStatusCode().value());
        assertEquals("Conflict", dup.getBody().get("error"));
    }
}
```

## 提示（按需逐条阅读）

1. 修复 1 用 `ResponseEntity.status(HttpStatus.CREATED).location(URI.create(...))`——Location 的 id 来自 service.create 返回的 response。
2. 修复 2 的关键是把 `@PathVariable String id` 改成 `int id`（Spring 自动转换 + 已有 400 映射）并把"不存在"翻译成 `StudentNotFoundException`。
3. 修复 3 不需要写任何 try/catch——确认 `DuplicateStudentNoException → 409` 分支存在于 ApiExceptionHandler（课 6 已给出）。
4. `duplicate` 端点拿到现有学生后用**同一学号**再 create——Repository 会抛类型化异常，让映射层工作。
