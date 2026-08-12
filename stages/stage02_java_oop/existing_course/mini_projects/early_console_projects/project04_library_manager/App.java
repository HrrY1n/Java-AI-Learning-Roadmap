import java.util.ArrayList;
import java.util.Scanner;

/** 项目：简单图书管理。 */
public class App {
    public static void main(String[] args) {
        ArrayList<Book> books = new ArrayList<Book>();
        Scanner scanner = new Scanner(System.in);

        while (true) {
            System.out.println();
            System.out.println("=== 简单图书管理 ===");
            System.out.println("1. 添加图书");
            System.out.println("2. 查看图书");
            System.out.println("0. 退出");
            System.out.print("请选择：");

            int choice = scanner.nextInt();

            if (choice == 1) {
                System.out.print("请输入书名：");
                String title = scanner.next();
                System.out.print("请输入作者：");
                String author = scanner.next();
                books.add(new Book(title, author));
                System.out.println("添加成功");
            } else if (choice == 2) {
                if (books.size() == 0) {
                    System.out.println("暂无图书");
                } else {
                    for (int i = 0; i < books.size(); i++) {
                        books.get(i).show();
                    }
                }
            } else if (choice == 0) {
                System.out.println("程序结束");
                break;
            } else {
                System.out.println("没有这个选项");
            }
        }

        scanner.close();
    }
}

