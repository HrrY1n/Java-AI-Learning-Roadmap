# 分页、页表与 TLB

## 1. Scenario：从一个具体问题出发
顺序遍历大数组通常比随机遍历更快，除了局部性还有地址转换原因。

## 2. Why：为什么这个问题值得系统理解
分页把虚拟内存切成固定页；TLB 缓存最近页表项，减少地址转换成本。

## 3. Concept：核心概念
虚拟地址拆分为虚拟页号和页内偏移；页表把虚拟页映射到物理帧。TLB 缓存映射，多级页表节省空间但增加间接层次。

## 4. Mental Model：把机制装进一张图
`VPN -> TLB / 页表 -> PFN + offset -> 物理地址`。

## 5. Minimal Code：最小示例
```java
int PAGE_BITS = 12;
long virtual = 0x1234_5678L;
long vpn = virtual >>> PAGE_BITS;
long offset = virtual & ((1L << PAGE_BITS) - 1);
```

## 6. Observe：先预测，再运行
先用十六进制输出 VPN 和 offset，再验证二者拼回原地址。

## 7. Modify：只改一个有意义的条件
把 `PAGE_BITS` 改为 20，观察同样地址下 VPN 与偏移的变化。

## 8. Exercise：独立完成
实现 `splitVirtualAddress(virtual, pageBits)`，并用注释说明这是教学模型，不代表真实多级页表。

## 9. Real Usage：联系 Java 与工程实践
分析内存映射、大页和顺序 I/O 性能时，用分页模型解释趋势。

## 来源与出处
《操作系统导论》（本地中文版）第 18-20 章（PDF 第 146-179 页）。
