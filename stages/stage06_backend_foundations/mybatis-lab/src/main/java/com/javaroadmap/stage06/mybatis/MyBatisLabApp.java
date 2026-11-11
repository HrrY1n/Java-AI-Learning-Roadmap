package com.javaroadmap.stage06.mybatis;

import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.session.SqlSessionFactoryBuilder;

import java.io.InputStream;

/**
 * 课 7 演示入口：不连接任何数据库，构建 SqlSessionFactory 并打印已绑定的语句清单。
 * 运行：./mvnw compile exec:java -Dexec.mainClass=com.javaroadmap.stage06.mybatis.MyBatisLabApp
 * 真库运行验证的状态见仓库 docs/overhaul-v2.5/07_DATABASE_INTEGRATION.md（当前为环境阻断，未执行）。
 */
public class MyBatisLabApp {

    public static void main(String[] args) throws Exception {
        try (InputStream in = MyBatisLabApp.class.getResourceAsStream("/mybatis-config.xml")) {
            SqlSessionFactory factory = new SqlSessionFactoryBuilder().build(in);
            System.out.println("MyBatis 配置解析成功，已绑定语句：");
            factory.getConfiguration().getMappedStatementNames().stream()
                    .filter(name -> name.startsWith(StudentMapper.class.getName() + "."))
                    .sorted()
                    .forEach(name -> System.out.println("  " + name));
            System.out.println("真实 MySQL 集成测试：环境阻断中（未执行，不冒充通过）。");
        }
    }
}