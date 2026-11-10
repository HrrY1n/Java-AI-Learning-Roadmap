package com.javaroadmap.stage05.day05jdbcrepository;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

public final class DbEnv {
    private DbEnv() {}

    static Connection openConnection() throws SQLException {
        Properties props = loadProperties();
        String url = resolve("JRL_MYSQL_URL", props.getProperty("url"));
        String user = resolve("JRL_MYSQL_USER", props.getProperty("user"));
        String password = resolve("JRL_MYSQL_PASSWORD", props.getProperty("password"));
        if (url == null || user == null || password == null) {
            throw new IllegalStateException(
                    "未检测到数据库连接配置。请设置环境变量 JRL_MYSQL_URL / JRL_MYSQL_USER / JRL_MYSQL_PASSWORD，"
                            + "或配置 stages/stage05_mysql_db/db.local.properties。");
        }
        return DriverManager.getConnection(url, user, password);
    }

    private static String resolve(String envKey, String propVal) {
        String env = System.getenv(envKey);
        if (env != null && !env.trim().isEmpty()) return env.trim();
        return (propVal != null && !propVal.trim().isEmpty()) ? propVal.trim() : null;
    }

    private static Properties loadProperties() {
        Properties props = new Properties();
        Path cur = Paths.get("").toAbsolutePath();
        for (int depth = 0; depth < 6 && cur != null; depth++) {
            for (Path candidate : new Path[]{
                    cur.resolve("db.local.properties"),
                    cur.resolve("stages/stage05_mysql_db/db.local.properties")
            }) {
                if (Files.isRegularFile(candidate)) {
                    try (InputStream in = Files.newInputStream(candidate)) {
                        props.load(in);
                        return props;
                    } catch (IOException e) {
                        throw new IllegalStateException("读取配置文件失败：" + candidate, e);
                    }
                }
            }
            cur = cur.getParent();
        }
        return props;
    }
}
