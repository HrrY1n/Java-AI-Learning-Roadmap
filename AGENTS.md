# Repository Instructions

## Git workflow

- This repository inherits the global `## Git Gate and Worktree Lifecycle` protocol from `%USERPROFILE%\.codex\AGENTS.md`; these rules do not disable its automatic post-gate integration behavior.
- The main branch is `main`. Use a scoped task branch such as `codex/<task-name>` for non-trivial changes.
- Inspect `git status`, the exact diff, and registered worktrees before editing or integrating. Preserve unrelated user files and other task worktrees.
- `.codex/hooks.json` is currently untracked local hook configuration. Do not edit, stage, delete, or otherwise absorb it into an unrelated task.

## Repository structure and sources of truth

- `统一学习路线.md` is the single authoritative roadmap. `README.md` links the active entry points; `真实学习进度.md` and `求职能力矩阵.md` record evidence and gaps.
- `stages/` contains tutorials, exercises, reference implementations, and generated examples. Reference or generated code is not evidence that a stage was learned or completed.
- Preserve the Stage 01–03 `existing_course/` material unless a task explicitly targets it. Keep AI-generated/reference implementations under the appropriate `examples/` tree.
- `archive/` is inactive legacy scaffolding and is ignored by Git. Do not edit or use it to infer current progress.
- Keep paths repository-relative and text files UTF-8. Do not introduce machine-specific absolute paths.

## Teaching model

- New or revised lessons follow `Scenario → Why → Concept → Mental Model → Minimal Code → Observe → Modify → Exercise → Real Usage`; omit a step only when it genuinely adds no value.
- Start from one concrete development problem and teach one primary concept at a time. Keep the first runnable example minimal, then revisit the concept in a later exercise or project.
- Keep the concept close to the code: use a short file-level concept card for the scenario and mental model, block comments for **why** a choice exists, and line comments only for non-obvious details. Do not narrate every line's **what**.
- `Observe` asks the learner to predict and run; `Modify` changes one meaningful condition; `Exercise` leaves the core implementation to the learner. Never prefill the exercise answer or replace a TODO with a reference solution.
- Label reference/generated implementations clearly and keep them separate from learner-owned practice. Running or improving a reference example never changes learning status.
- Stage README files are navigation maps: scope, order, concept relationships, learning entry, and evidence expectations. Put detailed local explanations beside the relevant code instead of duplicating long theory across Markdown files.
- Prefer representative problems and transfer explanations over fixed problem counts. Do not add LeetCode quotas, check-in dashboards, mistake databases, or another progress-tracking system.
- Learning priorities guide attention only. Do not introduce a repository-defined job-application Gate or claim that a checklist decides when the learner may apply.

## Teaching collaboration modes（教学协作模式）

学习场景（概念提问、练习、Debug、Review）按以下默认行为工作；学习者明确要求实施修改/修复/交付时直接进入实际开发，不受这些默认约束。执行细节见 [docs/教学协作细则.md](docs/教学协作细则.md)。

- **概念讲解**：优先链接对应 `deep_dives/` 深化课；新主题按"是什么 → 为什么 → 最小示例 → 常见误解"讲，结尾给一个可自行运行的验证动作。
- **练习指导**：默认不提供完整实现；按 L1 理解问题 → L2 相关知识 → L3 结构思路 → L4 调试线索逐级给提示；完整答案仅在学习者明确要求时提供，且不写入练习文档。
- **Debug 指导**：引导读错误信息 → 定位 → 假设 → 设计验证 → 理解修复；不默认重写整个文件；环境类问题指向 docs/跨平台问题排查.md。
- **Code Review**：按 P0 功能 Bug / P1 边界 / P2 可读性 / P3 设计取舍 / P4 风格分层，以当前学习阶段能力为基准。
- **诚实性**：不代勾 [真实学习进度](真实学习进度.md) 状态；参考实现与 AI 生成代码不表述为个人掌握。

## Validation

There is currently no unified build, test, lint, or static-analysis entry point, and no test files are present. Never invent a passing test command or claim tests ran when they do not exist. Select the smallest real checks that cover the changed scope:

- Documentation or configuration only: run `git diff --check`, inspect the rendered/plain diff, and verify changed relative paths and links against the repository tree.
- Python syntax: from the repository root, run the documented `python -m compileall .`; for behavior changes, also run the directly affected script using the command documented in its nearby README. Do not retain or commit generated `__pycache__/` or `*.pyc` artifacts.
- Java course regression (recommended first check): from the repository root run `bash scripts/verify_java.sh` or `powershell -ExecutionPolicy Bypass -File scripts\verify_java.ps1`. They compile and run every lesson listed in `scripts/verify_manifest.tsv` with UTF-8 flags and clean generated files. Learner practice (`my_practices/`) and `answers/` are intentionally outside this regression.
- Java examples: enter the lesson source-root directory containing `com/`, compile the lesson's package-path sources together with `javac -encoding UTF-8 -d out <package-path>/*.java`, then run a non-destructive entry point with `java -cp out <fully-qualified-class-name>`. Use a disposable ignored output directory.
- Run service, network, real-LLM, database, Streamlit, FastAPI, or dependency-install commands only when the task directly requires them and the needed environment/credentials are available. Never hard-code or expose secrets.

If tests or build tooling are later added in the changed scope, run their local documented command in addition to the checks above.

## Code and documentation conventions

### Java package rule

- Never use the Java default package for repository learning code.
- Every Java lesson, example, exercise, and mini-project must use an explicit, unique package consistent with its source layout.
- Classes belonging to one lesson must share its lesson package; separate lessons must use separate namespaces even when class names repeat, so IntelliJ IDEA whole-project builds cannot produce duplicate classes.
- Keep Java main classes runnable in IntelliJ IDEA and with command-line `javac` / `java` without relying on `.idea/`, `.iml`, or machine-specific IDE configuration.

- Follow nearby code style. Java uses package declarations where present, four-space indentation, small explicit methods, and concise Chinese teaching comments/output. Python uses four-space indentation, UTF-8, `pathlib` for paths, a `main()` entry point with an `if __name__ == "__main__"` guard, and paths derived from the script/repository rather than a local machine.
- Keep learning prose factual. Do not mark TODOs, stages, skills, projects, or résumé claims complete without user-produced implementation and validation evidence.
- Do not replace exercises with reference answers or treat edits to generated examples as proof of mastery.
- Keep changes scoped; do not broadly rewrite roadmap, progress, or capability-matrix documents for a code-only task.
- Do not commit generated `*.class`, `out/`, `target/`, `__pycache__/`, `*.pyc`, local databases, temporary reports, secrets, or validation output.
