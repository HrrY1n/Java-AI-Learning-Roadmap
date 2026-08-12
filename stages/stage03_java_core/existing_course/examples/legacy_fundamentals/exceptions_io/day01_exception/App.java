/** 知识点：异常处理。 */
public class App {
    public static void main(String[] args) {
        int a = 10;
        int b = 0;

        try {
            int result = a / b;
            System.out.println("结果：" + result);
        } catch (ArithmeticException e) {
            System.out.println("发生错误：除数不能为 0");
        } finally {
            System.out.println("异常演示结束");
        }
    }
}

