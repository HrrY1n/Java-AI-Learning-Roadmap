package com.javaroadmap.stage02.day07staticvisibility;

/**
 * 公共学生类：跨包可见性、static 初始化块与对象生命周期演示载体。
 * 顶层类只能用 public 或不写修饰符（包私有）；不能给顶层类写 private 或 protected。
 */
public class Student {
    /** static 字段属于类：在类首次加载/初始化时执行 static {} 块。 */
    public static int createdCount;

    static {
        // 类初始化块只在类首次加载时执行一次，早于任何对象构造。
        createdCount = 0;
        System.out.println("[类初始化] Student static 块已执行");
    }

    /** private：仅本类内部可直接读写。 */
    private final String name;
    /** protected：同包可访问；跨包时只有子类通过自身引用能访问，不能通过父类实例跨包直接访问。 */
    protected String gradeNote;
    /** 默认（包私有，无修饰符）：仅同包可见，跨包（哪怕是子类）也无法直接读写。 */
    int internalTag = 100;
    /** public：同包与跨包都可访问。 */
    public int score;

    public Student(String name, int score) {
        this.name = name;
        this.score = score;
        this.gradeNote = score >= 60 ? "合格" : "待加强";
        createdCount++;
    }

    public String describe() {
        return name + "/" + score + "(" + gradeNote + ")";
    }

    public static String passLine() {
        return "及格线 60（static 方法属于类，读不到实例字段）";
    }
}

/**
 * 包私有顶层类（不写 public）：只有同包内的 App 能使用；otherpkg 中无法 import 或实例化它。
 */
class PackageOnlyHelper {
    static String packageTip() {
        return "包私有类只在 day07staticvisibility 同包内可见";
    }
}
