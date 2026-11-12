package com.javaroadmap.stage06.api.web;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST 控制器：只做"HTTP ↔ Java"翻译。
 * 对比课 3 的手写分发器——@GetMapping("/api/students/{id}") 就是那张 if-else 路由表的注解化。
 */
@RestController
@RequestMapping("/api/students")
public class StudentApiController {

    private final StudentService service;

    public StudentApiController(StudentService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<StudentResponse> create(@Valid @RequestBody StudentCreateDto dto) {
        StudentResponse created = service.create(dto);
        // 201 Created + Location：REST 语义里"新资源在哪"要明确告诉客户端
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .location(java.net.URI.create("/api/students/" + created.id()))
                .body(created);
    }

    @GetMapping
    public List<StudentResponse> list() {
        return service.list();
    }

    @GetMapping("/{id}")
    public StudentResponse get(@PathVariable int id) {
        return service.get(id);
    }

    @PutMapping("/{id}")
    public StudentResponse update(@PathVariable int id, @Valid @RequestBody StudentUpdateDto dto) {
        return service.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        service.delete(id);
        // 204 No Content：删除成功后没有响应体可给，204 就是"成功且无内容"的标准表达
        return ResponseEntity.noContent().build();
    }
}
