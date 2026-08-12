/** 知识点：方法。 */
public class App {
    public static void main(String[] args) {
        sayHello("小明");

        // 调用 add 方法计算 10 + 20，并把返回值保存到 result 变量中。
        int result = add(10, 20);
        System.out.println("10 + 20 = " + result);

        System.out.println("较大值：" + max(8, 15));
    }

    // void 表示这个方法不返回结果。
    public static void sayHello(String name) {
        System.out.println("你好，" + name);
    }

    public static int add(int a, int b) {
        // return 把计算结果返回给调用位置。
        return a + b;
    }

    public static int max(int a, int b) {
        if (a > b) {
            return a;
        }
        return b;
    }
}
