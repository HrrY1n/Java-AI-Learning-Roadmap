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

## Validation

There is currently no unified build, test, lint, or static-analysis entry point, and no test files are present. Never invent a passing test command or claim tests ran when they do not exist. Select the smallest real checks that cover the changed scope:

- Documentation or configuration only: run `git diff --check`, inspect the rendered/plain diff, and verify changed relative paths and links against the repository tree.
- Python syntax: from the repository root, run the documented `python -m compileall .`; for behavior changes, also run the directly affected script using the command documented in its nearby README. Do not retain or commit generated `__pycache__/` or `*.pyc` artifacts.
- Standalone Java examples: enter the specific example source directory, run `javac -encoding UTF-8 App.java`, then `java App` when the program is non-destructive and does not require interactive or external resources. For packaged examples, compile to a disposable ignored output directory and run the documented fully qualified class.
- Run service, network, real-LLM, database, Streamlit, FastAPI, or dependency-install commands only when the task directly requires them and the needed environment/credentials are available. Never hard-code or expose secrets.

If tests or build tooling are later added in the changed scope, run their local documented command in addition to the checks above.

## Code and documentation conventions

- Follow nearby code style. Java uses package declarations where present, four-space indentation, small explicit methods, and concise Chinese teaching comments/output. Python uses four-space indentation, UTF-8, `pathlib` for paths, a `main()` entry point with an `if __name__ == "__main__"` guard, and paths derived from the script/repository rather than a local machine.
- Keep learning prose factual. Do not mark TODOs, stages, skills, projects, or résumé claims complete without user-produced implementation and validation evidence.
- Do not replace exercises with reference answers or treat edits to generated examples as proof of mastery.
- Keep changes scoped; do not broadly rewrite roadmap, progress, or capability-matrix documents for a code-only task.
- Do not commit generated `*.class`, `out/`, `target/`, `__pycache__/`, `*.pyc`, local databases, temporary reports, secrets, or validation output.
