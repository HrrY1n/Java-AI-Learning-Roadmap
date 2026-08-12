/** 知识点：Lambda 表达式。 */
public class App {
    public static void main(String[] args) {
        Calculator calculator = (a, b) -> a + b;

        int result = calculator.add(10, 20);
        System.out.println("结果：" + result);
    }
}

interface Calculator {
    int add(int a, int b);
}

