# Stage 04 预测与修改练习集

用法：先写预测再运行；答案集中在 [answers.md](answers.md)，做完至少 2 题再看。预测题片段均自包含：复制到一个 `.java` 文件即可编译运行（类名与文件名一致）。

## A. 预测题

### S04A1 start 与 run 的区别
```java
public class StartVsRunDemo {
    public static void main(String[] args) {
        Runnable task = () -> System.out.println(
                "执行线程：" + Thread.currentThread().getName());
        new Thread(task, "fake").run();
        new Thread(task, "worker").start();
    }
}
```
预测两行输出分别是哪个线程名。为什么 fake 也"执行"了任务——它真的并发吗？
参考：[线程与执行流](../existing_course/day01_thread_basics/)

### S04A2 线程池的并发上限
```java
import java.util.HashSet;
import java.util.Set;
import java.util.TreeSet;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

public class PoolConcurrencyDemo {
    public static void main(String[] args) throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(2);
        Set<String> names = new HashSet<>();
        for (int i = 1; i <= 5; i++) {
            pool.execute(() -> {
                synchronized (names) {
                    names.add(Thread.currentThread().getName());
                }
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            });
        }
        pool.shutdown();
        pool.awaitTermination(10, TimeUnit.SECONDS);
        System.out.println("出现过的执行者：" + new TreeSet<>(names));
        System.out.println("不同执行者数量：" + names.size());
    }
}
```
预测"出现过的执行者"一行有哪几个名字、共几个。5 个任务为什么不需要 5 条线程？
参考：[线程池与 Executor](../existing_course/day04_thread_pool/)

## B. 修改题

### S04B1 丢更新的对照
在 `day02_visibility_volatile` 的示例上，把两个累加线程换成 AtomicInteger（`count.incrementAndGet()`），预测最终值是否恒为 200000；再回答：volatile 版丢的更新去哪了？

### S04B2 锁的粒度
在 `day03_synchronized_mutex` 的示例上，把 increment 的锁换成 `otherLock`，预测"必然 2000"还成立吗？运行验证后，用一句话总结锁对象与互斥范围的关系。

---

完成后回到各课"独立练习"完成编程任务。
