package com.javaroadmap.stage06.api.web;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;

/**
 * 修改学生的请求 DTO：学号与姓名注册后不可变（业务规则，课 5 正文），
 * 因此 PUT 只接受 score 与 email——比"一个 DTO 包打天下"更贴近真实业务的契约设计。
 */
public record StudentUpdateDto(
        @Min(value = 0, message = "分数不能小于 0")
        @Max(value = 100, message = "分数不能大于 100")
        Integer score,

        @Pattern(regexp = "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$|^-$", message = "邮箱格式不正确")
        String email
) {
}
