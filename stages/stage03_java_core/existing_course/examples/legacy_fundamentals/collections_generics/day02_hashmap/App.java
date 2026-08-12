import java.util.HashMap;

/** 知识点：HashMap。 */
public class App {
    public static void main(String[] args) {
        HashMap<String, Integer> scores = new HashMap<String, Integer>();

        scores.put("小明", 90);
        scores.put("小红", 95);
        scores.put("小刚", 82);

        System.out.println("小明的分数：" + scores.get("小明"));

        if (scores.containsKey("小红")) {
            System.out.println("找到了小红");
        }

        for (String name : scores.keySet()) {
            System.out.println(name + " -> " + scores.get(name));
        }
    }
}

