package com.javaroadmap.stage03.answers;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;

/** 文件持久化练习参考答案。 */
public class StudentFileAnswer {
    public static void main(String[] args) throws IOException {
        Path path = Paths.get("data", "answer-students.txt");
        Files.createDirectories(path.getParent());

        List<String> lines = Arrays.asList(
                "1,小明,90",
                "2,小红,95"
        );

        Files.write(path, lines, StandardCharsets.UTF_8);

        List<String> savedLines = Files.readAllLines(path, StandardCharsets.UTF_8);
        for (String line : savedLines) {
            System.out.println(line);
        }
    }
}

