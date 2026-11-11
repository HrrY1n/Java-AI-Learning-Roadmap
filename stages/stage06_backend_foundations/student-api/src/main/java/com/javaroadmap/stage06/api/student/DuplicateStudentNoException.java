package com.javaroadmap.stage06.api.student;

/**
 * 业务异常：唯一学号冲突。类型化的意义——@RestControllerAdvice 可以按类型映射 HTTP 409，
 * 而不必解析异常消息字符串（Stage 05 的 InMemory 抛裸 IllegalArgumentException 的演进点，课 6 正文）。
 */
public class DuplicateStudentNoException extends RuntimeException {
    public DuplicateStudentNoException(String studentNo) {
        super("学号已存在：" + studentNo);
    }
}
