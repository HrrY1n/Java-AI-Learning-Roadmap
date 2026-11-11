package com.javaroadmap.stage06.mybatis;

import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.session.SqlSessionFactoryBuilder;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.InputStream;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 课 7 的"无数据库验证"：MyBatis 在 SqlSessionFactory 构建阶段就会
 * ① 解析 StudentMapper.xml（XML 语法、SQL 文本）② 把每条语句以"namespace.id"注册进 Configuration
 * ③ 校验参数/结果映射。全程不需要真实数据库连接——这是编译验证之上、真库集成之下的第二级验证。
 *
 * 注意实现细节：openSession()/执行语句都会触发数据源获取，因此本测试
 * 只通过 Configuration.hasStatement 验证绑定，绝不触碰数据库连接。
 *
 * 真实 MySQL 执行验证（查询/插入/事务）因开发环境无 Docker/MySQL 处于阻断状态，
 * 如实记录于 docs/overhaul-v2.5/07_DATABASE_INTEGRATION.md。
 */
class StudentMapperBindingTest {

    static final String NS = "com.javaroadmap.stage06.mybatis.StudentMapper";

    @Test
    @DisplayName("mybatis-config.xml 可构建 SqlSessionFactory（XML 解析 + Mapper 注册）")
    void configParsesAndRegistersMapper() throws Exception {
        try (InputStream in = getClass().getResourceAsStream("/mybatis-config.xml")) {
            assertNotNull(in, "classpath 下必须能找到 mybatis-config.xml");
            SqlSessionFactory factory = new SqlSessionFactoryBuilder().build(in);
            assertNotNull(factory, "SqlSessionFactory 构建失败即说明 XML 或绑定有误");
        }
    }

    @Test
    @DisplayName("接口的全部 7 条语句都已绑定注册（findById/findAll/findByStudentNo/insert/insertBatch/updateScore/deleteById）")
    void allSevenStatementsAreBound() throws Exception {
        try (InputStream in = getClass().getResourceAsStream("/mybatis-config.xml")) {
            SqlSessionFactory factory = new SqlSessionFactoryBuilder().build(in);
            var statements = factory.getConfiguration().getMappedStatementNames();
            for (String id : new String[]{
                    NS + ".findById", NS + ".findAll", NS + ".findByStudentNo",
                    NS + ".insert", NS + ".insertBatch",
                    NS + ".updateScore", NS + ".deleteById"}) {
                assertTrue(statements.contains(id), "缺少绑定语句：" + id);
            }
            // MyBatis 会把每条语句注册两次（全名 namespace.id + 短名 id），按全名前缀过滤后应恰为 7
            long qualified = statements.stream().filter(name -> name.startsWith(NS + ".")).count();
            assertEquals(7, qualified, "本 Mapper 应恰好注册 7 条语句");
        }
    }

    @Test
    @DisplayName("XML 中的 SQL 参数占位符使用 #{}（预编译绑定），而不是 ${} 字符串拼接")
    void placeholdersUsePrecompiledBinding() throws Exception {
        try (InputStream xml = getClass()
                .getResourceAsStream("/com/javaroadmap/stage06/mybatis/StudentMapper.xml")) {
            assertNotNull(xml);
            String mapperXml = new String(xml.readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);
            // ${} 拼接是 SQL 注入风险点：业务 Mapper 里不允许出现（排序白名单除外，本模块未用到）
            // （不经过 getBoundSql 校验：foreach 动态 SQL 需要真实参数对象，静态读原文更稳）
            assertFalse(mapperXml.contains("${"), "Mapper XML 中发现 ${} 拼接（注入风险）");
            assertTrue(mapperXml.contains("#{"), "应存在 #{} 预编译占位符");
        }
    }
}
