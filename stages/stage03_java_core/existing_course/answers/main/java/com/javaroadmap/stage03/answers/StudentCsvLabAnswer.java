package com.javaroadmap.stage03.answers;

import java.util.Scanner;

/**
 * 练习"email 持久化（CSV 解析）"参考答案：单行坏数据不拖垮整个仓库。
 *
 * 每行自成一个事务：字段数校验 → 数字解析（单独捕获 NumberFormatException）
 * → 成功打印 / 失败计入坏行。split(",", -1) 与 split(",") 的差异在于
 * 是否保留尾部的空字段——本题字段数必须精确为 4，用 -1 才能如实反映。
 */
public class StudentCsvLabAnswer {

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int okCount = 0;
        int badCount = 0;
        while (scanner.hasNextLine()) {
            String line = scanner.nextLine().trim();
            if (parseLine(line)) {
                okCount++;
            } else {
                badCount++;
            }
        }
        System.out.println("共 " + okCount + " 条，坏行 " + badCount + " 条");
        scanner.close();
    }

    /** 返回该行是否为一条合法学生记录；坏行打印集中在这一处。 */
    static boolean parseLine(String rawLine) {
        String[] fields = rawLine.split(",", -1);
        if (fields.length != 4) {
            System.out.println("坏行：" + rawLine);
            return false;
        }
        try {
            int id = Integer.parseInt(fields[0].trim());
            String name = fields[1].trim();
            int score = Integer.parseInt(fields[2].trim());
            String email = fields[3].trim();
            System.out.println("读取：" + id + ":" + name + "/" + score + "/" + email);
            return true;
        } catch (NumberFormatException e) {
            System.out.println("坏行：" + rawLine);
            return false;
        }
    }
}
