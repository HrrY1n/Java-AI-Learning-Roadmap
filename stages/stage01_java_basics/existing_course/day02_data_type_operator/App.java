/** 知识点：数据类型与运算符。 */
public class App {
    public static void main(String[] args) {
        int a = 10;
        int b = 3;

        // 演示加、减、乘、除和取余运算；两个 int 相除，结果仍然是 int。
        System.out.println("a + b = " + (a + b));
        System.out.println("a - b = " + (a - b));
        System.out.println("a * b = " + (a * b));
        System.out.println("a / b = " + (a / b));
        System.out.println("a % b = " + (a % b));

        // 分别演示小数、布尔值和单个字符。
        double price = 19.9;
        boolean isAdult = true;
        char level = 'A';

        System.out.println("价格：" + price);
        System.out.println("是否成年：" + isAdult);
        System.out.println("等级：" + level);
        // 比较运算的结果是 boolean 值。
        System.out.println("a 是否大于 b：" + (a > b));
    }
}
