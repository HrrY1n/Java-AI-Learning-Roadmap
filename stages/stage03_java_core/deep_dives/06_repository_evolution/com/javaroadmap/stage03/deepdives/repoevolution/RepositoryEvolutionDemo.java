package com.javaroadmap.stage03.deepdives.repoevolution;

import java.util.ArrayList;
import java.util.List;

/**
 * 深化课 06：Repository 演进——从"数组版学生管理"到可替换的存储。
 *
 * 场景：Stage 01 用数组存学生，Stage 02 用 ArrayList，Stage 03 出现了
 * StudentRepository 接口 + 内存/文件两个实现。本课重走这条演进路，
 * 回答：接口这一步到底买到了什么？
 *
 * 心智模型：Service 只认接口（"有一个能存取学生的东西"），
 * 不关心里面是数组、List 还是文件。存储方式 = 可替换的零件。
 *
 * Observe：先预测输出，再运行；重点看两种实现给出的结果是否一致。
 */
public class RepositoryEvolutionDemo {
    public static void main(String[] args) {
        // 演进第一步：Service 依赖接口，不依赖任何具体存储。
        runWith(new ListStudentRepository());

        // 演进第二步：换一个实现，业务代码（runWith 及以下）一行不改。
        runWith(new AlwaysEmptyRepository());
    }

    // 这段"业务流程"对存储一无所知——它只按 StudentRepository 的约定办事。
    static void runWith(StudentRepository repository) {
        StudentService service = new StudentService(repository);
        service.enroll(new Student("小明", 88));
        service.enroll(new Student("小红", 95));
        System.out.println("人数：" + service.count()
                + "，2号：" + service.findNameById(2)
                + "，平均分：" + service.averageScore());
    }
}

/** 存储的约定：能存、能按 id 查、能列出全部。与 src 里的 StudentRepository 同构。 */
interface StudentRepository {
    void save(Student student);

    Student findById(int id);

    List<Student> findAll();
}

/** 实现一：内存 List 版（Stage 02 的水平）。 */
class ListStudentRepository implements StudentRepository {
    private List<Student> students = new ArrayList<Student>();

    @Override
    public void save(Student student) {
        students.add(student);
    }

    @Override
    public Student findById(int id) {
        for (int i = 0; i < students.size(); i++) {
            if (students.get(i).getId() == id) {
                return students.get(i);
            }
        }
        return null;
    }

    @Override
    public List<Student> findAll() {
        return new ArrayList<Student>(students);
    }
}

/** 实现二：一个"永远为空"的假仓库，用于演示替换与测试价值。 */
class AlwaysEmptyRepository implements StudentRepository {
    @Override
    public void save(Student student) {
        // 什么都不存：故意违反约定，看 Service 的表现——这正是测试会抓住的契约问题
    }

    @Override
    public Student findById(int id) {
        return null;
    }

    @Override
    public List<Student> findAll() {
        return new ArrayList<Student>();
    }
}

class Student {
    private static int nextId = 1;
    private int id;
    private String name;
    private int score;

    Student(String name, int score) {
        this.id = nextId++;
        this.name = name;
        this.score = score;
    }

    int getId() {
        return id;
    }

    String getName() {
        return name;
    }

    int getScore() {
        return score;
    }
}

class StudentService {
    private StudentRepository repository;

    StudentService(StudentRepository repository) {
        this.repository = repository;      // 组合（深化课 04）：Service "有一个" 仓库
    }

    void enroll(Student student) {
        repository.save(student);
    }

    int count() {
        return repository.findAll().size();
    }

    String findNameById(int id) {
        Student s = repository.findById(id);
        return s == null ? "(不存在)" : s.getName();
    }

    double averageScore() {
        List<Student> all = repository.findAll();
        if (all.isEmpty()) {
            return 0;
        }
        int total = 0;
        for (int i = 0; i < all.size(); i++) {
            total += all.get(i).getScore();
        }
        return total * 1.0 / all.size();
    }
}
