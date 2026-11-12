package com.javaroadmap.stage06.api.web;

/**
 * 学生响应 DTO：对外暴露的稳定形状。领域对象 Student 的内部演变（新增字段、改构造器）
 * 不应直接冲击 API 消费者——这层 record 就是隔离带。
 */
public record StudentResponse(
        int id,
        String studentNo,
        String name,
        int score,
        String email
) {
    public static StudentResponse from(com.javaroadmap.stage06.api.student.Student student) {
        return new StudentResponse(
                student.getId(),
                student.getStudentNo(),
                student.getName(),
                student.getScore(),
                student.getEmail());
    }
}
