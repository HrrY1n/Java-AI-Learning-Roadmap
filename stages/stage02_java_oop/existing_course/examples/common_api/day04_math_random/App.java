import java.util.Random;

/** 知识点：Math 与 Random。 */
public class App {
    public static void main(String[] args) {
        System.out.println("最大值：" + Math.max(10, 20));
        System.out.println("绝对值：" + Math.abs(-5));
        System.out.println("四舍五入：" + Math.round(3.6));

        Random random = new Random();
        int number = random.nextInt(100) + 1;
        System.out.println("1 到 100 的随机数：" + number);
    }
}

