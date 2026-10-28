package com.javaroadmap.stage03.deepdives.exceptiondesign;

import java.text.ParseException;

/**
 * 深化课 03：异常体系——什么错误用异常，什么错误不用。
 *
 * 场景：day01 演示了 try/catch 语法；src 里有 BusinessException 与 Result<T>。
 * 本课回答设计问题：同样是"学生不存在"，为什么 findById 返回 Result，
 * 而解析日期失败要抛受检异常？判据是"调用方能不能处理、该怎么处理"。
 *
 * 心智模型：
 *   受检异常（ParseException）：可预期、调用方必须表态——编译器强制你 catch。
 *   非受检异常（RuntimeException 族）：编程错误或无法现场处理——让它炸出来。
 *   返回值（Result/boolean/null+文档）：调用方"理应"处理的常规分支。
 * 关键纪律：catch 只捕你能处理的；要么处理，要么加上下文后重新抛出。
 */
public class ExceptionDesignDemo {
    public static void main(String[] args) {
        // 分支一：调用方理应处理的常规失败 -> 返回值表达，不用异常。
        System.out.println("1) " + findStudent(2));
        System.out.println("2) " + findStudent(99));

        // 分支二：可预期、无法本地处理 -> 受检异常，调用方必须表态。
        try {
            parseAge("abc");
        } catch (ParseException e) {
            System.out.println("3) 受检异常被处理：" + e.getMessage());
        }

        // 分支三：编程错误 -> 非受检异常，不捕获，让它带着完整堆栈炸出来。
        try {
            divide(10, 0);
        } catch (ArithmeticException e) {
            // 这里演示"加上下文重新抛出"而不是吞掉。真实代码里多数场景应让它直接炸。
            System.out.println("4) 非受检异常（演示捕获）：除数不能为 0");
        }
    }

    /** 返回 null+文档 or Result 是常规失败的表达方式；调用方按分支处理。 */
    static String findStudent(int id) {
        if (id == 2) {
            return "2号：小红";
        }
        return null;       // 约定：null 表示"没有这个人"，调用方必须判空（见 README 的替代方案讨论）
    }

    /** 受检异常：这个方法"可能失败"，且失败原因调用方需要知道并处理。 */
    static int parseAge(String text) throws ParseException {
        try {
            return Integer.parseInt(text);
        } catch (NumberFormatException e) {
            // 转换异常类型时必须保留原因（cause），否则排错线索丢失。
            throw new ParseException("年龄不是合法数字：" + text, 0);
        }
    }

    static int divide(int a, int b) {
        return a / b;      // b=0 抛 ArithmeticException：这是调用方的编程错误，不是"业务分支"
    }
}
