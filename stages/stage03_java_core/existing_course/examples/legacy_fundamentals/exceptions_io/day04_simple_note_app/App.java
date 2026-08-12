import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.List;

/** 知识点：简单记事本。 */
public class App {
    public static void main(String[] args) {
        Path path = Paths.get("notes.txt");
        String note = "今天学习了 Java 文件读写。";

        try {
            Files.write(
                    path,
                    java.util.Arrays.asList(note),
                    StandardCharsets.UTF_8,
                    StandardOpenOption.CREATE,
                    StandardOpenOption.APPEND
            );

            List<String> notes = Files.readAllLines(path, StandardCharsets.UTF_8);
            System.out.println("当前全部笔记：");
            for (String line : notes) {
                System.out.println("- " + line);
            }
        } catch (IOException e) {
            System.out.println("记事本操作失败：" + e.getMessage());
        }
    }
}

