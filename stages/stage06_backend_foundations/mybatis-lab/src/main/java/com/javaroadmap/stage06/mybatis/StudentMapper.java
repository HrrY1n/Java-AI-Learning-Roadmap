package com.javaroadmap.stage06.mybatis;

import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 课 7：学生 Mapper 接口——SQL 的 Java 门面。
 *
 * 与 Stage 05 / student-api 的 StudentRepository 契约同语义（6 方法），
 * 但实现方式是"接口 + SQL 映射"：MyBatis 在运行时生成接口的实现类。
 *
 * SQL 全部写在 mapper/StudentMapper.xml（与接口同包路径，MyBatis 默认查找约定）——
 * 打开那个文件能看到本接口每条方法的 SQL 原文：SQL 可见性主线的延续。
 */
public interface StudentMapper {

    Student findById(@Param("id") int id);

    List<Student> findAll();

    /** 插入并回填数据库自增 id：useGeneratedKeys 是"MySQL 负责 id 生成"的声明。 */
    int insert(Student student);

    int updateScore(@Param("id") int id, @Param("score") int score);

    int deleteById(@Param("id") int id);

    /** 批量插入：foreach 拼 values —— 参数绑定仍是 #{} 预编译，注入防护不变。 */
    int insertBatch(@Param("batch") List<Student> batch);

    /** 与课 5 独立练习同语义的 SQL 版：按唯一学号精确查询。 */
    Student findByStudentNo(@Param("studentNo") String studentNo);
}
