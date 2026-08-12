# expected_output：day03

## main.py 期望输出节选

```text
=== 清洗后文本 ===
RAG retrieves relevant document chunks. The prompt combines context and user question.

=== 关键词统计 ===
{'RAG': 1, 'prompt': 1, 'context': 1}
```

## practice.py 完成后应该能做到

- `clean_text()` 返回无多余空白的文本；
- `count_keyword()` 忽略大小写；
- `build_prompt()` 返回包含上下文和问题的 Prompt；
- `build_result()` 返回结构化 dict。
