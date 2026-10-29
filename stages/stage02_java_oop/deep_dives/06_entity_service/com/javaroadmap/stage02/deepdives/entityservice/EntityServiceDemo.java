package com.javaroadmap.stage02.deepdives.entityservice;

/**
 * 深化课 06：Entity 与 Service 的职责边界——为什么 main 不该写业务。
 *
 * 场景：existing_course/src 里有三个分层示例（student/library/bank）。
 * 本课用最小对照实验说明分层的动机，并给出"这段代码该放哪"的判断法。
 *
 * 心智模型：
 *   Entity（如 Student）：描述"业务里有什么东西"+ 自身规则（分数 0~100）。
 *   Service（如 StudentService）：描述"业务能做什么事情"，持有并操作 Entity。
 *   main/入口：只负责接线（构造对象、调用、展示结果）。
 * 判断法：这段逻辑离开控制台程序还成立吗？成立 -> 属于业务（Entity/Service）；
 * 不成立（如打印菜单）-> 属于入口层。
 *
 * Observe：先预测输出，再运行。
 */
public class EntityServiceDemo {
    public static void main(String[] args) {
        // 入口层：组装 + 展示，不含一条业务规则。
        StudentService service = new StudentService();

        service.add(new Student("小明", 88));
        service.add(new Student("小红", 95));
        service.add(new Student("小刚", 55));

        System.out.println("1) 平均分：" + service.averageScore());
        System.out.println("2) 优秀名单：" + service.excellentNames());


        // 业务规则拒绝非法数据：规则写在 Entity 里；"如何呈现失败"属于入口层。
        try {
            service.add(new Student("老王", 150));
        } catch (IllegalArgumentException e) {
            System.out.println("3) 入口层捕获：" + e.getMessage());
        }
        System.out.println("4) 拒绝非法学生后人数：" + service.count());
    }
}

/** Entity：业务里的"东西"。字段私有 + 自身规则（呼应封装深化课）。 */
class Student {
    private String name;
    private int score;

    Student(String name, int score) {
        if (score < 0 || score > 100) {
            throw new IllegalArgumentException("分数必须在 0 到 100：" + score);
        }
        this.name = name;
        this.score = score;
    }

    boolean isExcellent() {
        return score >= 90;
    }

    String getName() {
        return name;
    }

    int getScore() {
        return score;
    }
}

/** Service：业务里的"事情"。它可以从控制台换成 Web 接口，规则不动。 */
class StudentService {
    private java.util.ArrayList<Student> students = new java.util.ArrayList<Student>();

    void add(Student student) {
        students.add(student);
    }

    int count() {
        return students.size();
    }

    double averageScore() {
        if (students.isEmpty()) {
            return 0;
        }
        int total = 0;
        for (int i = 0; i < students.size(); i++) {
            total += students.get(i).getScore();
        }
        return total * 1.0 / students.size();
    }

    // 返回"业务答案"（名单），打印留给入口层——Service 不该绑定显示方式。
    java.util.ArrayList<String> excellentNames() {
        java.util.ArrayList<String> names = new java.util.ArrayList<String>();
        for (int i = 0; i < students.size(); i++) {
            Student s = students.get(i);
            if (s.isExcellent()) {
                names.add(s.getName());
            }
        }
        return names;
    }
}
