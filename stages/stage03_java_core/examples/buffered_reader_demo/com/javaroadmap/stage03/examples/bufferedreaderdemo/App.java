package com.javaroadmap.stage03.examples.bufferedreaderdemo;

import java.io.BufferedReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * 参考示例（AI 生成，非课程必做）：BufferedReader 的流式逐行读取，
 * 与 s03-file-read 课程主示例 Files.readAllLines 的一次性读入对照。
 *
 * readAllLines：把全部行读进 List&lt;String&gt;，简单直观，但行数极大时占用内存；
 * BufferedReader：一次只保留当前行，处理完即可丢弃，内存占用与文件大小无关。
 */
public class App {
    public static void main(String[] args) {
        Path path = Paths.get("com", "javaroadmap", "stage03", "examples", "bufferedreaderdemo", "App.java");
        int lineCount = 0;

        // try-with-resources：无论正常结束还是中途抛异常，reader 都会被自动关闭
        try (BufferedReader reader = Files.newBufferedReader(path, StandardCharsets.UTF_8)) {
            String line;
            while ((line = reader.readLine()) != null) { // readLine 返回 null 表示读到文件末尾
                lineCount++;
                if (lineCount <= 3) {
                    System.out.println(lineCount + ": " + line);
                }
            }
            System.out.println("流式读取完成，总行数：" + lineCount);
        } catch (IOException e) {
            System.out.println("读取文件失败：" + e.getMessage());
        }
    }
}
