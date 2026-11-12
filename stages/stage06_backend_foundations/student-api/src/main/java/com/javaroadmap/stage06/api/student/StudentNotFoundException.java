package com.javaroadmap.stage06.api.student;

/**
 * 业务异常：请求的学生不存在。由 Service 抛出（Repository 返回 null 的"哑信号"
 * 在这一层翻译成有业务含义的异常），最终映射为 HTTP 404。
 */
public class StudentNotFoundException extends RuntimeException {
    public StudentNotFoundException(int id) {
        super("学生不存在：" + id);
    }
}
