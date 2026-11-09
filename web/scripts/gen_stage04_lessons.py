import json, os

def step(label, body): return {"label": label, "body": body}

BASE='stages/stage04_java_advanced/existing_course/'
lessons=[
 {
  "id":"s04-thread-basics","title":"线程与执行流",
  "summary":"main 本身就是线程；start 才开始执行，交错顺序不可控是一切并发问题的根源。",
  "related":["s03-concurrency-basics","s04-visibility-volatile"],
  "code":BASE+"day01_thread_basics/com/javaroadmap/stage04/day01threadbasics",
  "steps":[
    step("真实场景","单线程程序在等一个大文件哈希时，用户输入完全没响应。一条执行流同一时刻只能做一件事；把“等待”和“响应用户”放进两条执行流，才能同时进行。"),
    step("为什么需要","main 方法本身就跑在一条叫 main 的线程里。new Thread(task) 创建的只是“执行计划”；start() 向调度器登记后才有第二条真正的执行流。两条流共享同一块堆内存——这是力量（共享数据方便），也是一切危险的根源（互相踩踏）。"),
    step("概念与心智模型","把线程想成“两个工人看同一张图纸干活”。调度器决定谁何时上工：交错顺序不可控、每次运行可能不同。getState() 给出生命周期快照：NEW（未 start）→ RUNNABLE → TERMINATED（跑完）。join() = “等这条流跑完我再继续”；没有它，main 可能在 worker 之前结束——但 JVM 要等所有非守护线程结束才退出。"),
    step("预测运行","先预测：main 线程名打印什么？worker 的 getState() 三次各是什么？worker 步骤 1/2/3 与“worker 已启动”的相对顺序确定吗？运行两次对比交错模式。"),
    step("修改一个条件","把 worker.start() 改成 worker.run()：任务还执行吗？在哪个线程里执行？getState() 还会经过 RUNNABLE 吗？（这道实验就是预测题 S04A1 的内容。）"),
    step("独立练习","创建两条线程分别打印 1~50 的奇数与偶数，不使用任何同步；运行三次并记录交错模式有何不同。写一句话回答：为什么“先奇后偶有序输出”做不到？"),
    step("项目迁移","Web 服务器每个请求都需要一条执行流——理解了“线程=共享内存的第二执行流、调度不可控”，才能理解为什么下一课的可见性、第三课的互斥是后端服务的日常。"),
  ]},
 {
  "id":"s04-visibility-volatile","title":"可见性与 volatile",
  "summary":"一个线程的写入，另一个线程不一定看得见；volatile 保可见性，不保原子性。",
  "related":["s04-thread-basics","s04-synchronized-mutex"],
  "code":BASE+"day02_visibility_volatile/com/javaroadmap/stage04/day02visibilityvolatile",
  "steps":[
    step("真实场景","服务收到停机信号后，后台清理线程靠一个 boolean 判断“该收工了”。如果这个写入对清理线程永远不可见，服务就停不下来——这不是假设，是真实的线上事故模式。"),
    step("为什么需要","线程可能把变量缓存在自己的工作内存（寄存器/高速缓存）。没有同步约定时，一个线程的写入何时、是否对其他线程可见是未定义的。s03 并发课的路标在此兑现：原子性之外还有可见性。"),
    step("概念与心智模型","volatile 写 = 立即冲到主存；volatile 读 = 绕过过期缓存。Java 内存模型（JMM）用 happens-before 规则定义可见性保证：对 volatile 变量的写，happens-before 后续对它的读，读方一定能看到这次写以及写之前的所有普通写。**边界**：volatile 不保证原子性——count++ 仍是读-改-写三步。"),
    step("预测运行","示例里 watcher 自旋等待 running=false：预测它会不会退出（volatile 版）。两个累加线程各加 100000 次到 volatile int：预测 count 最终值。运行三次，观察丢更新是否每次都发生。"),
    step("修改一个条件","去掉 running 的 volatile：watcher 还能退出吗？多次运行——你可能发现它“碰巧”总能退出：println 内部自带同步，会顺带刷新可见性。这正是并发 bug 最阴险的形态：加了调试输出就消失。"),
    step("独立练习","写一个程序证明“volatile 不保证原子性”：两个线程各对一个 volatile int 累加 100000 次，主线程 join 后打印差值。再解释：为什么换成原子类（AtomicInteger）的 incrementAndGet 差值就恒为 0——它用硬件级“读-改-写一条指令”取代了三步。"),
    step("项目迁移","配置热更新标志、优雅停机开关、限流开关——所有“一个线程写、多个线程读”的简单标志位都是 volatile 的主场；而计数器、累加器永远轮不到它。"),
  ]},
 {
  "id":"s04-synchronized-mutex","title":"synchronized 与互斥",
  "summary":"每个对象一把锁；临界区让读-改-写不可分割。锁错对象等于没锁。",
  "related":["s04-visibility-volatile","s04-thread-pool"],
  "code":BASE+"day03_synchronized_mutex/com/javaroadmap/stage04/day03synchronizedmutex",
  "steps":[
    step("真实场景","两个线程同时给同一账户各存 1000 次 1 元，结账时发现少了钱（s03 的演示）。银行不许“碰巧正确”——原子性必须由程序员显式保证。"),
    step("为什么需要","可见性解决“看得见”，不解决“插队”：读-改-写三步之间仍可能被另一个线程插入。互斥锁让临界区在同一时刻只有一个线程进入，三步变成不可分割的一步。"),
    step("概念与心智模型","每个 Java 对象自带一把锁（监视器锁）。synchronized(lock){ 临界区 }：进门拿锁、出门还锁，没抢到的线程在这里排队。synchronized 实例方法 = 锁 this；static synchronized = 锁 Class 对象（两者不互斥！）。锁可重入：同一线程可再次进入自己持有的锁，不会自己锁死自己。"),
    step("预测运行","示例两个版本各跑两个线程各累加 1000 次：无同步版本结果一定小于 2000 吗？（不一定——“碰巧正确”也是结果之一，所以它比出错更难排查。）synchronized 版本呢？"),
    step("修改一个条件","把 increment 里的锁从 lock 换成 otherLock：两个线程各锁各的门，竞态立刻回来。体会“锁的对象决定互斥范围”——所有线程必须抢同一把锁。"),
    step("独立练习","把示例改造成线程安全类 SafeCounter（private long value + synchronized increment()/get()），并回答：get 也需要 synchronized 吗？提示：想想可见性——不加锁的读可能读到什么？"),
    step("项目迁移","Spring 的单例 Bean 默认被所有请求线程共享——字段若可变，synchronized 或并发容器就是日常。锁粒度（锁整个方法 vs 只锁临界几行 vs 锁业务对象）直接决定吞吐量，这是后端性能调优的第一课。"),
  ]},
 {
  "id":"s04-thread-pool","title":"线程池与 Executor",
  "summary":"复用线程而不是随用随造；提交任务到队列，池内工人数量有上限。",
  "related":["s04-synchronized-mutex","s03-design-patterns"],
  "code":BASE+"day04_thread_pool/com/javaroadmap/stage04/day04threadpool",
  "steps":[
    step("真实场景","每来一个请求 new 一个 Thread 的服务，在高峰期会同时存活上千条线程：每条默认约 1MB 栈 + 大量调度开销，内存与 CPU 双双失控。"),
    step("为什么需要","线程昂贵且应复用：池 = 少量常驻工人 + 一个任务队列。任务来了不造新工人，而是排队等工人取件。"),
    step("概念与心智模型","ThreadPoolExecutor 四个核心概念：corePoolSize（常驻工人）、maximumPoolSize（工人上限）、工作队列（排队容量）、拒绝策略（全满时怎么办：抛异常/调用者自己跑/丢弃…）。提交顺序：常驻工人有空直接干 → 没空排队 → 队列满且未到上限才加人 → 全满走拒绝策略。shutdown() = 不再接新任务、跑完存量；awaitTermination 等它收尾。"),
    step("预测运行","core=2 的池提交 5 个任务（各睡 100ms）：动用几个线程？任务执行顺序由谁决定？运行示例核对 Set 里的线程名。"),
    step("修改一个条件","把 newFixedThreadPool(2) 换成 newCachedThreadPool：线程数量随任务涨（60 秒空闲回收）。想一个场景它合适、一个场景它灾难。再想：为什么工程规约常禁用 Executors.newFixedThreadPool？（提示：看它的队列参数。）"),
    step("独立练习","用 ThreadPoolExecutor(corePoolSize=2, maximumPoolSize=4, keepAliveTime=10 秒, ArrayBlockingQueue(2), AbortPolicy) 提交 8 个任务，记录每个任务由哪个线程执行、哪些被拒绝；用一句话解释“队列满才扩工人”的次序为什么反直觉。"),
    step("项目迁移","Tomcat 的工作线程池、Spring @Async 的执行器、定时任务框架——全是 ThreadPoolExecutor 的配置题。读懂这四个参数，就能读懂几乎一切 Java 服务的并发容量配置。"),
  ]},
]

os.makedirs('web/content/lessons/stage04',exist_ok=True)
for i,l in enumerate(lessons,1):
    doc={
      "id":l["id"],"stageId":"04","moduleId":"foundations","kind":"foundation",
      "title":l["title"],"summary":l["summary"],"contentState":"published",
      "relatedLessonIds":l["related"],"exerciseIds":[],
      "predictionIds":(["S04A1"] if i==1 else ["S04A2"] if i==4 else []),
      "steps":l["steps"],"bodyPath":None,"codeDirectory":l["code"],
    }
    open(f"web/content/lessons/stage04/{l['id']}.json",'w',encoding='utf-8',newline='\n').write(json.dumps(doc,ensure_ascii=False,indent=2)+'\n')
    print('wrote',l['id'])
