package com.javaroadmap.stage02.otherpkg;

import com.javaroadmap.stage02.day07staticvisibility.Student;

/**
 * 跨包非子类调用方：只能访问 Student 的 public 成员，无法使用包私有类。
 */
public class ExternalCaller {
    public static String inspectFromOtherPackage(Student target) {
        // 只有 public 成员（score、describe()）跨包可用；
        // target.gradeNote（protected）与 target.internalTag（包私有）在此处均不可访问，
        // 包私有类 PackageOnlyHelper 在此处也无法 import。
        return "跨包普通类读 public 成员：score=" + target.score + ", 描述=" + target.describe();
    }
}
