/** 项目类：Student。 */
public class Student {
    private String name;
    private int score;

    public Student(String name, int score) {
        this.name = name;
        this.score = score;
    }

    public int getScore() {
        return score;
    }

    public void show() {
        System.out.println("姓名：" + name + "，分数：" + score);
    }
}

