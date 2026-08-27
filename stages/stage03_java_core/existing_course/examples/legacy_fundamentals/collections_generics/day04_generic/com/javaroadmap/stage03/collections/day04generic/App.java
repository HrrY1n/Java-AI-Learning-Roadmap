package com.javaroadmap.stage03.collections.day04generic;

/** 知识点：泛型。 */
public class App {
    public static void main(String[] args) {
        Box<String> nameBox = new Box<String>();
        nameBox.setValue("Java 学习");
        System.out.println(nameBox.getValue());

        Box<Integer> scoreBox = new Box<Integer>();
        scoreBox.setValue(100);
        System.out.println(scoreBox.getValue());
    }
}

class Box<T> {
    private T value;

    public void setValue(T value) {
        this.value = value;
    }

    public T getValue() {
        return value;
    }
}

