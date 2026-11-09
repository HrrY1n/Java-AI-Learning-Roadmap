package com.javaroadmap.stage02.day07staticvisibility;

/**
 * 知识点：static 成员、可见性四档与对象的一生。
 *
 * 心智模型：
 *   实例字段是"每个对象一份的随身物品"，static 字段是"整个类共用的公告栏"；
 *   可见性是"谁能碰它"的门牌规则：private 只有本类、默认（包私有）同包、
 *   protected 同包+子类、public 任何人。
 *
 * Observe：先预测两处 createdCount 的值，再运行核对。
 * Modify：把 createdCount 的 static 去掉（编译错误：构造器里访问不到"类级"字段——它变成了每个对象各自的）。
 */
public class App {
    public static void main(String[] args) {
        // static 字段属于类本身：还没有任何对象时它就已经存在。
        System.out.println("创建前累计人数：" + Student.createdCount);

        Student a = new Student("小明", 88);
        Student b = new Student("小红", 95);
        System.out.println("创建两人后累计人数：" + Student.createdCount);
        System.out.println("名单：" + a.describe() + "、" + b.describe());

        // 对象的一生：new 出生 → 被引用期间可达 → 引用消失后不可达 → GC 择机回收。
        // 程序没有"删除对象"的按钮；a 置为 null 只是撤走一个引用。
        a = null;
        // createdCount 不减：它统计的是"出生过多少"，回收不回滚历史。
        System.out.println("a 撤走引用后累计人数仍是：" + Student.createdCount);

        // static 方法属于类：用类名调用，不需要任何实例。
        System.out.println("调用类级方法：" + Student.passLine());
    }
}

/**
 * 包私有类（没有 public 修饰）：同包内可用，包外不可见——
 * 本仓库每个示例目录都是一个独立包，这正是"默认可见性"的日常用法。
 */
class Student {
    /** static：全类共享一份的计数器；非 final，因为它随构造递增。 */
    static int createdCount = 0;

    /** private：只有 Student 自己能直接读写——外部要经 describe() 读。 */
    private final String name;
    private int score;

    Student(String name, int score) {
        this.name = name;
        this.score = score;
        createdCount++;
    }

    String describe() {
        return name + "/" + score;
    }

    /** static 方法里没有"当前对象"：只能访问 static 成员，不能读 name 这样的实例字段。 */
    static String passLine() {
        return "及格线 60（static 方法属于类，读不到实例字段）";
    }
}
