/** 知识点：另一个多态子类。 */
public class Cat extends Animal {
    public Cat(String name) {
        super(name);
    }

    @Override
    public void eat() {
        System.out.println(name + " 正在吃鱼");
    }

    public void catchMouse() {
        System.out.println(name + " 正在抓老鼠");
    }
}

