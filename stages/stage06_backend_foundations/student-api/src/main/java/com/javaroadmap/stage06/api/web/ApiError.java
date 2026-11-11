package com.javaroadmap.stage06.api.web;

import java.util.Map;

/**
 * 统一错误响应：所有非 2xx 响应都长这个形状——消费者只需写一次错误处理逻辑。
 * fieldErrors 只在参数校验失败（400）时出现。
 */
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
