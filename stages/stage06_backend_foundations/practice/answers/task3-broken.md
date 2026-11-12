# 任务 3 复现场景：字段注入 + 缺失 Bean（修复前）

> 把下面的类放进 student-api 的 `src/main/java/com/javaroadmap/stage06/api/web/`，启动应用即可复现失败。

## BrokenController.java（坏代码）

```java
package com.javaroadmap.stage06.api.web;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class BrokenController {

    @Autowired   // 字段注入：依赖在构造器签名上不可见，且离开 Spring 无法 new
    private StudentService service;   // ← 假设此时 StudentService 类上没有任何注解

    @GetMapping("/api/broken")
    public String broken() {
        return service.describe();
    }
}
```

## 同时给 StudentService 摘掉注解（制造第二个错误）

把 `@Service` 注解从 StudentService 上删除——现在容器里根本没有这个 Bean。

## 复现的失败（真实报错形态）

```text
***************************
APPLICATION FAILED TO START
***************************
Description:
Field service in com.javaroadmap.stage06.api.web.BrokenController required a bean of type
'com.javaroadmap.stage06.api.web.StudentService' that could not be found.
Action:
Consider defining a bean of type 'com.javaroadmap.stage06.api.web.StudentService' in your configuration.
```

## 修复要点（对应任务 3 的 L3）

1. `StudentService` 类上加回 `@Service`（或在其上新建 @Bean 方法——两种都行，说清取舍）；
2. `BrokenController` 改为**构造器注入**，删除字段 `@Autowired`；
3. 若还需要 `describe()` 方法，给 StudentService 补一个真实方法（不要为演示造假数据）；
4. 验证：启动成功 + 一个简单的 MockMvc/启动测试通过。
