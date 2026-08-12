# Stage 11：LLM 应用开发

状态：**只有 mock 示例，真实 API 未接入**　优先级：**P0-AI**

## 为什么要学

本阶段建立框架无关的大模型应用基础：请求消息、上下文、结构化输出、流式响应、工具调用和生产可靠性。先用一个官方 SDK 理解协议与失败模式，再决定是否需要更高层框架。

## 前置知识

- 完成 Python Stage 10 的函数、模块、typing、异常、requests/FastAPI 和测试。

## 必须掌握（P0）

- LLM API、system/user/assistant message、Prompt 与模板变量。
- Token、上下文窗口、截断与成本意识。
- 结构化输出与 schema 校验。
- Streaming、超时、退避重试、限流、取消、fallback 和错误处理。
- Function/Tool Calling 的参数校验与安全边界。
- 薄模型接口、延迟/token/成本记录和固定样本基础评测。
- 密钥只从环境变量读取。

## 了解即可（P1）

- Prompt 版本管理、缓存、模型路由、基础安全过滤。

## 暂时不用深入（P2）

- 同时学习多个模型 SDK、复杂 Agent 框架、微调训练。

## 现有内容怎么用

`examples/mock_llm_prompt/` 保留了 mock LLM、Prompt、多轮对话、聊天记录和论文摘要助手。`common/real_llm_api.py` 明确为 `NotImplemented`，因此当前只证明流程示例存在，不证明会调用真实模型。

## 教学与练习

1. 运行 mock 示例并画出输入/输出数据流。
2. TODO：用环境变量和一个真实 SDK 实现 `ask_real_llm`，不要把 Key 写入代码。
3. TODO：实现 Pydantic 结构化输出与校验失败重试。
4. TODO：实现流式输出、用户取消和网络中断处理。
5. TODO：实现一个无副作用工具调用，记录参数、返回值、超时和错误。
6. TODO：让业务代码依赖一个薄模型接口，记录模型、延迟、token/成本和错误；不要先造多厂商大框架。
7. 测试：mock 超时、限流、取消、空响应、非法 JSON、超过上下文窗口；用固定样本做最小回归评测。

## 面试重点

- Prompt 与 message 的区别、token 与上下文窗口。
- 结构化输出为什么仍需校验。
- Tool Calling 与 Agent 的区别。
- 如何防止密钥泄漏、Prompt Injection 和无限重试。

## 完成标准

- [ ] 独立完成真实 API、结构化输出、streaming 和一个工具调用。
- [ ] 为超时、限流、取消、非法输出写测试，重试有上限。
- [ ] 有固定回归样本和延迟/token/成本记录，能替换薄接口后的模型实现。
- [ ] 能在不依赖 Agent 框架时解释一次完整调用及失败路径。

下一阶段：[Stage 12：RAG](../stage12_rag/README.md)
