/** 知识点：循环。 */
public class App {
    public static void main(String[] args) {
        for (int i = 1; i <= 5; i++) {
            System.out.println("for 循环：" + i);
        }

        int sum = 0;
        for (int i = 1; i <= 100; i++) {
            sum = sum + i;
        }
        System.out.println("1 到 100 的和：" + sum);

        int count = 3;
        while (count > 0) {

            System.out.println("while 倒计时：" + count);

            count--;
        }

        int jian = 5;

        while (jian > 0){

            System.out.println("递减："+ jian );
            
            jian --;
        }
    }
}
