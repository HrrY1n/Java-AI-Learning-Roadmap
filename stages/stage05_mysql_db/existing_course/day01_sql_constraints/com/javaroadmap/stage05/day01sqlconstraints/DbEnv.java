package com.javaroadmap.stage05.day01sqlconstraints;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

/**
 * 数据库连接配置读取器：只从环境变量或本地忽略文件 db.local.properties 读取，
 * 源码绝不写死任何真实密码。未配置时明确报错引导，不伪装成功。
 */
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
                            + "或将 stages/stage05_mysql_db/db.local.properties.example 复制为 db.local.properties。");
        }
        return DriverManager.getConnection(url, user, password);
    }

    private static String resolve(String envKey, String propVal) {
        String env = System.getenv(envKey);
        if (env != null && !env.trim().isEmpty()) {
            return env.trim();
        }
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
                        throw new IllegalStateException("读取本地数据库配置文件失败：" + candidate, e);
                    }
                }
            }
            cur = cur.getParent();
        }
        return props;
    }
}
