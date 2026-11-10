package com.javaroadmap.stage02.otherpkg;

import com.javaroadmap.stage02.day07staticvisibility.Student;

/**
 * 跨包子类：验证 JLS §6.6.2 的 protected 精确语义。
 */
public class SubStudent extends Student {
    public SubStudent(String name, int score) {
        super(name, score);
    }

    public String readProtectedViaSub() {
        // 合法：在跨包子类内部，通过子类自身（this / SubStudent 引用）访问继承来的 protected 成员。
        String viaSelf = this.gradeNote;

        // 取消下面注释会编译报错！即使在子类内部，也不能通过"父类引用"访问父类的 protected 成员：
        // Student base = new Student("测试", 80);
        // String viaParent = base.gradeNote;  // error: gradeNote has protected access in Student

        // 取消下面注释也会编译报错：包私有成员对跨包子类同样不可见！
        // int tag = this.internalTag;
        return "跨包子类读 protected 成功：" + viaSelf;
    }
}
