/** 知识点：if 判断与 switch 选择。 */
public class App {
    public static void main(String[] args) {
        int score = 95;

        if (score >= 90) {

            System.out.println("perfect");

        } else if (score >= 60) {
  
            System.out.println("及格");

        } else {

            System.out.println("不及格");
        }


        int day = 3;

        switch (day) {

            case 1:
                System.out.println("星期一");

                break;

            case 2:
                System.out.println("星期二");
                break;

            case 3:
                System.out.println("星期三");
                break;

            default:
                System.out.println("其他日期");
                break;
        }
    }
}
