import java.util.ArrayList;
import java.util.Scanner;

/** 项目：学生成绩管理。 */
public class App {
    public static void main(String[] args) {
        ArrayList<Student> students = new ArrayList<Student>();
        Scanner scanner = new Scanner(System.in);

        while (true) {
            System.out.println();
            System.out.println("=== 学生成绩管理 ===");
            System.out.println("1. 添加学生");
            System.out.println("2. 查看学生");
            System.out.println("3. 计算平均分");
            System.out.println("0. 退出");
            System.out.print("请选择：");

            int choice = scanner.nextInt();

            if (choice == 1) {
                System.out.print("请输入姓名：");
                String name = scanner.next();
                System.out.print("请输入分数：");
                int score = scanner.nextInt();
                students.add(new Student(name, score));
                System.out.println("添加成功");
            } else if (choice == 2) {
                for (int i = 0; i < students.size(); i++) {
                    students.get(i).show();
                }
            } else if (choice == 3) {
                showAverage(students);
            } else if (choice == 0) {
                System.out.println("程序结束");
                break;
            } else {
                System.out.println("没有这个选项");
            }
        }

        scanner.close();
    }

    public static void showAverage(ArrayList<Student> students) {
        if (students.size() == 0) {
            System.out.println("还没有学生数据");
            return;
        }

        int sum = 0;
        for (int i = 0; i < students.size(); i++) {
            sum = sum + students.get(i).getScore();
        }

        double average = sum * 1.0 / students.size();
        System.out.println("平均分：" + average);
    }
}

