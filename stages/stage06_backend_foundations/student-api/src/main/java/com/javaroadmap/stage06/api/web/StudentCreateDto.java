package com.javaroadmap.stage06.api.web;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * 创建学生的请求 DTO（Data Transfer Object）。
 *
 * Bean Validation 注解在这里声明 HTTP 输入契约：@Valid 触发校验，失败由
 * ApiExceptionHandler 统一变成 400 + 字段级错误列表——业务对象 Student 不需要重复这些注解。
 */
public record StudentCreateDto(
        @NotBlank(message = "学号不能为空")
        @Pattern(regexp = "S\\d{3,}", message = "学号格式应为 S 开头加至少 3 位数字，如 S001")
        String studentNo,

        @NotBlank(message = "姓名不能为空")
        String name,

        @Min(value = 0, message = "分数不能小于 0")
        @Max(value = 100, message = "分数不能大于 100")
        Integer score,

        @Pattern(regexp = "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$|^-$", message = "邮箱格式不正确")
        String email
) {
}
