package com.javaroadmap.stage02.earlyprojects.project04librarymanager;

/** 项目类：Book。 */
public class Book {
    private String title;
    private String author;

    public Book(String title, String author) {
        this.title = title;
        this.author = author;
    }

    public void show() {
        System.out.println("书名：" + title + "，作者：" + author);
    }
}

