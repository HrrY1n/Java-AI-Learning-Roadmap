# -*- coding: utf-8 -*-
"""Print the core RAG workflow."""


def main():
    steps = ["load documents", "split text", "retrieve chunks", "build prompt", "generate answer", "show references"]
    for index, step in enumerate(steps, start=1):
        print(f"{index}. {step}")


if __name__ == "__main__":
    main()
