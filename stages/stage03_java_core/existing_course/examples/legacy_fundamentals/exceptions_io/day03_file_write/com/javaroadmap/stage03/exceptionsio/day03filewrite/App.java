package com.javaroadmap.stage03.exceptionsio.day03filewrite;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;

/** 知识点：文件写入。 */
public class App {
    public static void main(String[] args) {
        Path path = Paths.get("output.txt");
        List<String> lines = Arrays.asList(
                "第一行：今天学习 Java 文件写入",
                "第二行：Files.write 可以保存文本",
                "第三行：写完后可以打开 output.txt 查看"
        );

        try {
            Files.write(path, lines, StandardCharsets.UTF_8);
            System.out.println("写入成功：" + path.toAbsolutePath());
        } catch (IOException e) {
            System.out.println("写入失败：" + e.getMessage());
        }
    }
}

