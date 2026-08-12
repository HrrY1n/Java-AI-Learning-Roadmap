# day05：JSON、CSV 与论文数据转换

## 今天学什么

- 读取 JSON；
- 处理 list[dict]；
- 提取论文标题、年份、关键词；
- 保存 CSV；
- 根据年份筛选论文。

## 为什么对 AI/RAG/Python 实习有用

API 返回结果通常是 JSON，评测和数据分析常用 CSV。你需要能把 JSON 里的结构化数据提取出来，转成可读、可分析的表格。

## 运行命令

```powershell
python .\stages\stage10_python_for_ai\python_basics\day05_json_csv\main.py
python .\stages\stage10_python_for_ai\python_basics\day05_json_csv\practice.py
python .\stages\stage10_python_for_ai\python_basics\day05_json_csv\challenge.py
python .\stages\stage10_python_for_ai\python_basics\day05_json_csv\debug_task.py
```

## 完成标准

- 能读取 `data/papers.json`；
- 能导出 `output/papers_summary.csv`；
- 能筛选指定年份之后的论文；
- 能解释 `json.loads` 和 `csv.DictWriter`。
