package com.javaroadmap.stage02.library;

/** 图书业务类。 */
public class LibraryService {
    private Book[] books = new Book[10];
    private int size = 0;

    public void addBook(Book book) {
        if (size >= books.length) {
            System.out.println("图书数量已满。");
            return;
        }
        books[size] = book;
        size++;
    }

    public void printAllBooks() {
        for (int i = 0; i < size; i++) {
            books[i].printInfo();
        }
    }

    public void borrowBook(int id) {
        Book book = findById(id);
        if (book == null) {
            System.out.println("没有找到这本书。");
            return;
        }
        if (book.isBorrowed()) {
            System.out.println("这本书已经借出。");
            return;
        }
        book.borrow();
        System.out.println("借书成功。");
    }

    public void returnBook(int id) {
        Book book = findById(id);
        if (book == null) {
            System.out.println("没有找到这本书。");
            return;
        }
        book.giveBack();
        System.out.println("还书成功。");
    }

    private Book findById(int id) {
        for (int i = 0; i < size; i++) {
            if (books[i].getId() == id) {
                return books[i];
            }
        }
        return null;
    }
}

