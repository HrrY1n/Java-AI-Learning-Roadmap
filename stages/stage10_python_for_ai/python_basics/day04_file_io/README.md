# day04：文件读取、文本统计与 Markdown 报告

## 今天学什么

- 使用 `pathlib.Path` 组织路径；
- 读取 txt 文件；
- 统计行数、词数、段落数；
- 写入 Markdown 报告；
- 初步处理文件不存在。

## 为什么对 AI/RAG/Python 实习有用

RAG 的第一步就是读取文档。你需要能稳定读取 txt/md 文件，把统计结果写成报告，为后续文本切分和检索做准备。

## 运行命令

```powershell
python .\stages\stage10_python_for_ai\python_basics\day04_file_io\main.py
python .\stages\stage10_python_for_ai\python_basics\day04_file_io\practice.py
python .\stages\stage10_python_for_ai\python_basics\day04_file_io\challenge.py
python .\stages\stage10_python_for_ai\python_basics\day04_file_io\debug_task.py
```

## 完成标准

- 能解释 `Path(__file__).parent`；
- 能读取 `data/sample_article.txt`；
- 能生成 `output/report.md`；
- 能处理文件路径写错的情况。
