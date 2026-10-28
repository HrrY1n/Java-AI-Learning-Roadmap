# 深化课 03：封装——为什么字段要 private

对应示例：`com/javaroadmap/stage02/deepdives/encapsulation/EncapsulationDemo.java`

**运行后你会看到什么**：两行输出，第一行余额是 **-500**（合法但荒谬），第二行经过规则校验。看完本文你应该能回答"封装到底在防什么"并反驳"private 字段 + getter/setter = 封装"的机械写法。

## 场景

day03 写过 `account.deposit(50)`。不封装也可以跑：字段全 public，`account.balance = 100` 直接赋值。那为什么几乎所有规范都要求 private？——因为**系统的规模会变大，而规则会变多**。

## 必须理解

**封装的本质：把"哪些地方可以改这个状态"从全程序收缩到类内部的几个方法里。**

对照公开字段版，三个具体损失：

1. **规则无处安放**。"余额不能为负"写在 `UnsafeAccount` 的哪个方法里？——哪都写不了，因为字段可以直接赋值。每个调用点都得自觉检查，检查代码散落满地，漏一处就是线上 bug。
2. **非法状态存活期无限长**。`balance = -500` 这行之后到下次使用之前，程序一直带着错误数据运行。
3. **实现被焊死**。明天想给每次存款加一条日志、把 double 换成整数"分"存储——公开字段意味着全项目所有直接访问点一起改；封装意味着只改类内部，调用方无感知。

**心智模型**：类是"带前台的服务窗口"。private 字段是库房，public 方法是前台。客人不能自己进库房翻钱（直接赋值），必须经前台办理（方法），前台才能验证身份、记账、拒收假钞。

## 理解原理：getter/setter 不等于封装

机械地为每个字段生成 `getXxx/setXxx`，等于把字段换了个名义继续公开——`setBalance(-500)` 依然合法。**判断封装是否有效，看 set 方法里有没有"守门"**：

```java
public void setScore(int score) {
    if (score < 0 || score > 100) throw new IllegalArgumentException(...);  // 这才是封装
    this.score = score;
}
```

甚至很多字段**不该有 setter**：余额只应通过 `deposit/withdraw` 改变，`getBalance()` 保留只读出口即可。**先问"这个状态允许哪些变化"，变化方式就是方法名**——这是建模的入口，比背"字段私有+getter/setter"重要得多。

**Observe（先预测再运行）**：预测两段输出；然后把 `SafeAccount` 的 `balance` 临时改成 public，尝试在 main 里写 `safe.balance = -1;`——体会"编译期就被拦下"与"运行时才报错"的差别。

## 动手：修改一个条件

1. 给 `SafeAccount` 增加需求"每次存款超过 1000 要提示大额存入"：改动只发生在哪几行？对照公开字段版需要动多少处？
2. 把 `withdraw` 改成"透支上限 500"：规则仍在类内，调用方 `EncapsulationDemo` 一行不用改——这就是"实现可替换"的雏形。

## 常见错误

- 所有字段 private 后无脑生成全套 getter/setter：等于没封装。
- getter 返回可变对象的内部引用（本阶段是字段为引用类型时才出现，Stage 03 集合里会真实踩到）。
- 在方法之间通过 public 字段"顺手"传数据：那是在绕过自己刚建的窗口。

## 独立练习

在 `my_practices/` 写 `VendingMachine`：私有字段 `stock`（库存）与 `income`（收入）；公开方法只有 `insertCoin(int cents)`（不足 300 拒绝并提示）、`dispense()`（库存为 0 拒绝）、`getStock()`、`getIncome()`。规则：一罐 300 分，投币不足不出货不找零，出货时库存减一、收入加 300。自检：连续投币 2 次（600）→ dispense → stock 减 1、income=300；直接调 `getIncome()` 前 income 应始终无法被外部改写（类里**不提供** setIncome）。

## 与后面学习的联系

- Stage 03 的 `FileStudentRepository` 把"读写规则"收拢在一个类里，是同一思想用在 IO 上。
- Stage 06 Spring 的实体校验（`@Min(0)` 等注解）就是"构造器/方法把关"的声明式版本。
- 封装的边界意识在 [Entity/Service 职责](../06_entity_service/README.md) 中继续：哪个类"拥有"哪个状态。
