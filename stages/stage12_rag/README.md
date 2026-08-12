# Stage 12：RAG

状态：**生成示例较多，尚未学习**　优先级：**P0-AI**

## 为什么要学

RAG 是最终知识库平台的 AI 核心，但必须从可解释的检索流水线开始。本阶段将原来分散的“最小 RAG、向量检索、网页、API、评测”合并成一条证据链。

## 前置知识

- 完成真实 LLM messages、结构化输出、调用可靠性和基础评测；Tool Calling 对后续 Agent 重要，但不是基础 RAG 的硬前置。
- 能编写可测试的 Python 模块和 FastAPI 服务。

## 必须掌握（P0）

- 文档解析、清洗、chunk、overlap、metadata。
- Embedding、向量数据库、相似度与 Top-k。
- Retriever、过滤、Reranker、Query Rewrite。
- Prompt 组装、引用、拒答与 RAG Pipeline。
- 文档/索引版本、增量更新、删除和权限边界。
- 离线数据集、检索指标、回答质量与回归评测。

## 了解即可（P1）

- Hybrid Search、父子文档、查询路由、缓存与增量索引。

## 暂时不用深入（P2）

- 大规模分布式向量集群、多模态 RAG、复杂 Graph RAG。

## 现有内容怎么用

- `examples/minimal_rag/`：关键词重叠检索与 mock 回答，只用于理解最小流水线。
- `examples/vector_retrieval/`：TF-IDF/cosine fallback 和 FAISS 容器；不等同于真实 embedding/生产向量库。
- `examples/streamlit_demo/`：只保留最终网页 mini-project，作为 UI 参考。
- `examples/evaluation/`：简单 substring 引用命中规则和报告；不等同于完整评测体系。
- `career_materials/legacy_resume_draft.md`：历史生成草稿，未达到本阶段验收前禁止直接写进简历。

## 教学与练习

1. 先手写最小检索，解释每一步输入输出。
2. TODO：接入真实 embedding 与一个向量数据库，保存 metadata。
3. TODO：加入过滤、reranker 与 query rewrite，并做消融对比。
4. TODO：实现文档版本、增量更新与删除，验证旧索引不会继续被检索。
5. TODO：建立 20 条以上带期望引用/拒答条件的评测集。
6. TODO：评估 retrieval recall、引用正确性、回答相关性和拒答，形成可重复回归。
7. Review：按解析、召回、精排、生成、引用分类失败样本，不用“换更大模型”掩盖检索问题。

## 常见错误

- 把 TF-IDF 叫作 embedding 模型，把文件内列表叫作向量数据库。
- 只展示一个成功问题，没有评测集和失败样本。
- chunk 固定拍脑袋，metadata 丢失，回答没有引用。
- 直接套框架链，不会解释 Retriever/Reranker 的输入输出。
- 只会全量重建索引，不处理更新、删除、版本或文档权限。

## 面试重点

- chunk size/overlap 的取舍。
- 召回、精排和生成的错误如何区分。
- 向量检索与关键词检索、reranker、query rewrite。
- RAG 评测、数据泄漏、引用与拒答。

## 完成标准

- [ ] 独立实现并测试文档入库、检索、精排、生成和引用。
- [ ] 使用真实 embedding/向量库，而非只运行 fallback。
- [ ] 有可重复的评测集、指标、失败样本和改进记录。
- [ ] 能安全更新/删除文档并运行回归评测，引用可追溯到来源位置。
- [ ] 能通过 FastAPI 暴露稳定接口，供 Java 后端调用。

Agent 阶段与最终项目时机见根目录 [统一学习路线.md](../../统一学习路线.md)。
