package com.javaroadmap.stage06.api.web;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.Map;

/**
 * 统一错误响应：所有非 2xx 响应都长这个形状——消费者只需写一次错误处理逻辑。
 * fieldErrors 只在参数校验失败（400）时出现：其余错误经 of() 工厂得到 null，
 * NON_NULL 序列化直接省略该键，而不是给消费者一个含义不明的 null 字段。
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiError(
        int status,
        String error,
        String message,
        Map<String, String> fieldErrors
) {
    public static ApiError of(int status, String error, String message) {
        return new ApiError(status, error, message, null);
    }
}
