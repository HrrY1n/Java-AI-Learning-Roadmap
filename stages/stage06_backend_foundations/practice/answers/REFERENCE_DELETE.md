# 课 3 独立练习参考实现：DELETE /api/students/{id}

> 用途：完成自己的实现并验证后对照。先自己写——直接抄会失去本练习的全部价值。

## 分发器新增分支（插入位置：GET 单个分支之后、405 兜底之前）

```java
if ("DELETE".equals(method) && path.matches("/api/students/\\d+")) {
    int id = Integer.parseInt(path.substring(path.lastIndexOf('/') + 1));
    if (repository.deleteById(id)) {
        // 204 No Content：成功且无响应体——sendResponseHeaders 的第二个参数传 -1 表示无体
        exchange.sendResponseHeaders(204, -1);
        return;
    }
    respond(exchange, 404, "{\"error\":\"学生不存在\",\"id\":" + id + "}");
    return;
}
```

## selftest 新增两行（放在 GET 999 之后）

```java
report.add(request(client, port, "/api/students/1", "DELETE"));   // → 204
report.add(request(client, port, "/api/students/1", "GET"));      // → 404（删除后再查）
```

其中 `request` 方法当前固定拼 `GET` 前缀——把方法名作为参数传入（或把返回行改为
`method + " " + path + " → " + ...`）。

## 预期 selftest 输出（新增两行）

```text
DELETE /api/students/1 → 204
GET /api/students/1 → 404 {"error":"学生不存在","id":1}
```

## 与 Spring 版的对照（课 4 复习点）

| 手写版本 | Spring 版 |
| --- | --- |
| `"DELETE".equals(method) && path.matches(...)` | `@DeleteMapping("/api/students/{id}")` |
| `sendResponseHeaders(204, -1)` | `ResponseEntity.noContent().build()` |
| 404 手工分支 | `StudentNotFoundException` → `@ExceptionHandler` → 404 |
