import java.util.ArrayList;
import java.util.List;

/** 知识点：Stream 的 filter 和 map。 */
public class App {
    public static void main(String[] args) {
        List<String> names = new ArrayList<String>();
        names.add("小明");
        names.add("小红");
        names.add("张三丰");
        names.add("李四");

        System.out.println("长度大于 2 的名字：");
        names.stream()
                .filter(name -> name.length() > 2)
                .forEach(name -> System.out.println(name));

        System.out.println("添加前缀后的名字：");
        names.stream()
                .map(name -> "学生：" + name)
                .forEach(name -> System.out.println(name));
    }
}

