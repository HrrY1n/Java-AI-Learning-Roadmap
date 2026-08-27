package com.javaroadmap.stage02.commonapi.day03datetime;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/** 知识点：日期与时间。 */
public class App {
    public static void main(String[] args) {
        LocalDate today = LocalDate.now();
        LocalDate tomorrow = today.plusDays(1);

        System.out.println("今天：" + today);
        System.out.println("明天：" + tomorrow);

        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        System.out.println("当前时间：" + now.format(formatter));
    }
}

