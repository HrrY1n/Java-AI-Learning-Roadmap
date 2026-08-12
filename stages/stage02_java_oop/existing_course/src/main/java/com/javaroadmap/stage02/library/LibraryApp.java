package com.javaroadmap.stage02.library;

/** 图书管理系统入口。 */
public class LibraryApp {
    public static void main(String[] args) {
        LibraryService service = new LibraryService();

        service.addBook(new Book(1, "Java 入门", "张老师"));
        service.addBook(new Book(2, "MySQL 基础", "李老师"));

        System.out.println("=== 初始图书 ===");
        service.printAllBooks();

        service.borrowBook(1);

        System.out.println("=== 借书后 ===");
        service.printAllBooks();

        service.returnBook(1);

        System.out.println("=== 还书后 ===");
        service.printAllBooks();
    }
}

