package com.javaroadmap.stage03.deepdives.utf8io;

import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * 深化课 04：UTF-8 与文件 IO——"字符"如何变成磁盘上的"字节"。
 *
 * 场景：day02/day03 读写文件都带了 StandardCharsets.UTF_8。本课解释：
 * 为什么必须显式指定？字符集不匹配时数据如何损坏？路径相对谁解析？
 *
 * 心智模型：文件里只有字节。字符集是"字节<->字符"的翻译表。
 *   写入：字符 --编码表--> 字节；读取：字节 --同一张编码表--> 字符。
 *   两张表不一致 => 乱码或异常。数据不坏的前提：全程同一张表。
 *
 * Observe：预测每段输出；注意 file.encoding 在两台电脑上的可能差异。
 */
public class Utf8IoDemo {
    public static void main(String[] args) throws IOException {
        System.out.println("1) 默认字符集：" + Charset.defaultCharset());

        Path path = Paths.get("utf8_demo.txt");          // 相对路径：相对"进程启动目录"，不是源码目录！

        // 写入：明确用 UTF-8 编码。中文"Java"与"小红"在 UTF-8 下分别占 4 与 6 个字节。
        Files.write(path, "小红,95".getBytes(StandardCharsets.UTF_8));

        byte[] raw = Files.readAllBytes(path);
        System.out.println("2) 文件字节数：" + raw.length + "（\"小红,95\" 是 7 个字符）");

        // 用同一张表读回：字符完好。
        String text = new String(raw, StandardCharsets.UTF_8);
        System.out.println("3) UTF-8 读回：" + text);

        // 用错误的表读回：不报错，但内容已损坏——乱码是"翻译错误"，不是"数据错误"。
        String wrong = new String(raw, java.nio.charset.Charset.forName("GBK"));
        System.out.println("4) 用 GBK 读同一份字节：" + wrong);

        // 逐行读的规范写法：显式字符集 + try-with-resources 自动关闭。
        try (java.io.BufferedReader reader = Files.newBufferedReader(path, StandardCharsets.UTF_8)) {
            System.out.println("5) 按行读第一行：" + reader.readLine());
        }   // reader 在这里自动 close，即使中途抛异常也关闭——手工 close 可能被异常跳过

        Files.delete(path);                              // 测试数据清理，避免仓库残留
        System.out.println("6) 演示文件已删除");
    }
}
