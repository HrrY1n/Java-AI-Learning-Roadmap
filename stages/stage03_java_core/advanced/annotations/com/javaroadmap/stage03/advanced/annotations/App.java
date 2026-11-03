package com.javaroadmap.stage03.advanced.annotations;

import java.lang.reflect.Method;

/**
 * 注解基础：定义注解、使用注解、运行时读取注解。
 * 对应《On Java 8》第 23 章（注解）。
 */
public class App {

    // RetentionPolicy.RUNTIME 让注解在运行期可读，配合反射使用
    @java.lang.annotation.Retention(java.lang.annotation.RetentionPolicy.RUNTIME)
    @interface Retry {
        int times() default 3;
    }

    static class Job {
        @Retry(times = 5)
        void syncRemote() {
        }

        void localOnly() {
        }
    }

    public static void main(String[] args) throws Exception {
        Job job = new Job();
        for (Method method : job.getClass().getDeclaredMethods()) {
            if (method.isAnnotationPresent(Retry.class)) {
                Retry retry = method.getAnnotation(Retry.class);
                System.out.println(method.getName() + " 需要重试 " + retry.times() + " 次");
            } else {
                System.out.println(method.getName() + " 未标注 Retry");
            }
        }
        System.out.println("要点：注解本身不执行逻辑，价值在于被工具或框架读取。");
    }
}
