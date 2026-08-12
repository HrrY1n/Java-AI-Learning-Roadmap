package com.javaroadmap.stage02.library;

/** 图书实体类。 */
public class Book {
    private int id;
    private String title;
    private String author;
    private boolean borrowed;

    public Book(int id, String title, String author) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.borrowed = false;
    }

    public int getId() {
        return id;
    }

    public boolean isBorrowed() {
        return borrowed;
    }

    public void borrow() {
        borrowed = true;
    }

    public void giveBack() {
        borrowed = false;
    }

    public void printInfo() {
        String status = borrowed ? "已借出" : "可借阅";
        System.out.println("编号：" + id + "，书名：" + title + "，作者：" + author + "，状态：" + status);
    }
}

