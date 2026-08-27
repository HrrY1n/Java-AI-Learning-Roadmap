package com.javaroadmap.stage03.exceptionsio.day02fileread;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

/** 知识点：文件读取。 */
public class App {
    public static void main(String[] args) {
        Path path = Paths.get("com", "javaroadmap", "stage03", "exceptionsio", "day02fileread", "App.java");

        try {
            List<String> lines = Files.readAllLines(path, StandardCharsets.UTF_8);
            System.out.println("读取文件：" + path.toAbsolutePath());
            System.out.println("总行数：" + lines.size());

            int count = Math.min(5, lines.size());
            for (int i = 0; i < count; i++) {
                System.out.println((i + 1) + ": " + lines.get(i));
            }
        } catch (IOException e) {
            System.out.println("读取文件失败：" + e.getMessage());
        }
    }
}

