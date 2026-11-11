package com.javaroadmap.stage06.lab.student;

import java.util.List;

/**
 * 统一存储契约——与 Stage 05 升级版接口逐签名一致（6 方法）。
 *
 * 课 2（JUnit）将用真实测试逐条验证本契约的行为，包括边界与异常路径。
 */
public interface StudentRepository {
    /** 保存或按 id 覆盖；与其他学生的唯一学号冲突时抛 {@link IllegalArgumentException}。 */
    void save(Student student);

    /** 按 id 查找；不存在时返回 null（调用方需要判空——课 2 会测试这一点）。 */
    Student findById(int id);

    /** 全部学生（返回的是快照副本，修改它不影响仓库内部状态）。 */
    List<Student> findAll();

    /** 更新分数；目标不存在时返回 false，分数越界由 {@link Student#setScore} 抛异常。 */
    boolean updateScore(int id, int newScore);

    /** 删除；目标不存在时返回 false。 */
    boolean deleteById(int id);

    /** 整批保存：任何一条失败都必须回滚整批（内存版用快照模拟，MySQL 版用真实事务）。 */
    void saveBatchAtomically(List<Student> batch);
}
