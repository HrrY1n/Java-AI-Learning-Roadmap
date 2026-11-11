package com.javaroadmap.stage06.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Student Management API 的启动入口。
 *
 * @SpringBootApplication = 三个注解的合成：
 *   @SpringBootConfiguration（本类是配置类）、
 *   @EnableAutoConfiguration（按 classpath 自动装配——课 4 的核心话题）、
 *   @ComponentScan（扫描本包及子包，把 @Service/@Repository 等注册为 Bean）。
 */
@SpringBootApplication
public class StudentApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(StudentApiApplication.class, args);
    }
}
