# 任务 6 复现场景：状态码全错的 Controller（修复前）

> 把下面的类放进 student-api（与正式 Controller 路由**错开**：/api/broken-students），
> 配套测试 task6-tests.md 会逐条断言正确状态码——先跑红，再修复。

## BrokenStudentController.java（坏代码）

```java
package com.javaroadmap.stage06.api.web;

import org.springframework.web.bind.annotation.*;

/**
 * 三个状态码错误：创建给 200、缺失给 500（吞了业务语义）、学号冲突给 500。
 * 分层倒是"看起来"没错——所以失败全是语义级，只有契约测试能抓到。
 */
@RestController
@RequestMapping("/api/broken-students")
public class BrokenStudentController {

    private final StudentService service;

    public BrokenStudentController(StudentService service) {
        this.service = service;
    }

    @PostMapping
    public StudentResponse create(@RequestBody StudentCreateDto dto) {
        return service.create(dto);          // 错误 1：成功返回 200，应为 201 + Location
    }

    @GetMapping("/{id}")
    public StudentResponse get(@PathVariable String id) {
        // 错误 2：id 转换失败抛 NumberFormatException → 未映射 → 500；且未处理"不存在"
        return service.get(Integer.parseInt(id));
    }

    @PostMapping("/{id}/duplicate")
    public StudentResponse duplicate(@PathVariable int id) {
        var existing = service.get(id);
        return service.create(new StudentCreateDto(
                existing.studentNo(), "冒名者", 60, "-"));   // 错误 3：学号冲突应为 409，未捕获 → 500
    }
}
```

## 修复目标

1. create → `ResponseEntity.status(HttpStatus.CREATED).location(...)` 返回 201；
2. get → `@PathVariable int id` 让 Spring 做类型转换（配合 ApiExceptionHandler 的
   `MethodArgumentTypeMismatchException` 分支 → 400）+ Service 的 NotFound → 404；
3. duplicate → 学号冲突由 Repository 的 `DuplicateStudentNoException` 自然抛出 →
   ApiExceptionHandler 已映射 409（确认该分支存在即可，不需要 try/catch）。
