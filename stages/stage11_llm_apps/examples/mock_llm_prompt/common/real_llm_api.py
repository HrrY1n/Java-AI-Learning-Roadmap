# -*- coding: utf-8 -*-
"""真实大模型 API 的预留文件。

现在你不需要 API Key，也不需要修改这个文件。
等你准备接入真实模型时，可以把 mock_llm.py 中的 ask_mock_llm 替换为这里的函数。
"""


def ask_real_llm(prompt: str) -> str:
    """预留接口：以后在这里接入真实模型 API。"""
    raise NotImplementedError(
        "请先使用 mock_llm.py 学习流程。准备好 API Key 后，再实现 ask_real_llm。"
    )


# 未来接入思路：
# 1. 从环境变量读取 API Key，不要把 Key 写进代码。
# 2. 构造 messages / prompt。
# 3. 调用模型接口。
# 4. 返回模型输出文本。
#
# 示例伪代码：
# api_key = os.getenv("YOUR_API_KEY")
# client = SomeLLMClient(api_key=api_key)
# response = client.chat(prompt)
# return response.text
