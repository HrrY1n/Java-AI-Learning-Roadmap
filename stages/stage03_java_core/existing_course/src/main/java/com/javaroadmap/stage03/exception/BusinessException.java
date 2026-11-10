package com.javaroadmap.stage03.exception;

/**
 * 业务异常：表示明确违反业务规则的受控失败，区别于底层 IO/系统故障。
 * 同时提供带 Throwable cause 的构造器，避免异常转换时丢失原始上下文堆栈。
 */
public class BusinessException extends RuntimeException {
    public BusinessException(String message) {
        super(message);
    }

    public BusinessException(String message, Throwable cause) {
        super(message, cause);
    }
}
