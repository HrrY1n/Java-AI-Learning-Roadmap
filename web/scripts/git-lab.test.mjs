import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const exec = promisify(execFile);

async function runGit(args, cwd) {
  return exec("git", args, {
    cwd,
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: "Git Learner",
      GIT_AUTHOR_EMAIL: "learner@roadmap.test",
      GIT_COMMITTER_NAME: "Git Learner",
      GIT_COMMITTER_EMAIL: "learner@roadmap.test",
    },
  });
}

test("Git Lab 实验沙箱：全流程在一次性临时目录验证，绝不破坏用户真实仓库", async (t) => {
  const sandbox = await mkdtemp(path.join(os.tmpdir(), "git-lab-sandbox-"));
  const localRepo = path.join(sandbox, "project");
  const remoteBare = path.join(sandbox, "remote.git");

  t.after(async () => {
    // 自动清理一次性沙箱
    await rm(sandbox, { recursive: true, force: true });
  });

  await t.test("Lesson 1: git-intro-basics (初始化与三大工作区状态查看)", async () => {
    await runGit(["init", "-b", "main", localRepo]);
    const { stdout } = await runGit(["status"], localRepo);
    assert.match(stdout, /On branch main/);
    assert.match(stdout, /No commits yet|nothing to commit/);
  });

  await t.test("Lesson 2: git-record-changes (工作区 -> 暂存区 -> 原子提交)", async () => {
    await writeFile(path.join(localRepo, "README.md"), "# Project Sandbox\n", "utf8");

    // 状态 1：工作区有未跟踪文件
    const status1 = await runGit(["status", "--short"], localRepo);
    assert.equal(status1.stdout.trim(), "?? README.md");

    // 状态 2：暂存区
    await runGit(["add", "README.md"], localRepo);
    const status2 = await runGit(["status", "--short"], localRepo);
    assert.equal(status2.stdout.trim(), "A  README.md");

    // 状态 3：提交落盘
    await runGit(["commit", "-m", "docs: initialize project readme"], localRepo);
    const status3 = await runGit(["status", "--short"], localRepo);
    assert.equal(status3.stdout.trim(), "");
  });

  await t.test("Lesson 3: git-history-diff (查看历史与工作区/暂存区差异)", async () => {
    // 修改文件
    await writeFile(path.join(localRepo, "README.md"), "# Project Sandbox\n\nNew line added.\n", "utf8");

    // diff 比对工作区与暂存区
    const diff1 = await runGit(["diff"], localRepo);
    assert.match(diff1.stdout, /\+New line added\./);

    // 暂存后再比对 --staged
    await runGit(["add", "README.md"], localRepo);
    const diff2 = await runGit(["diff", "--staged"], localRepo);
    assert.match(diff2.stdout, /\+New line added\./);

    await runGit(["commit", "-m", "docs: expand readme background"], localRepo);
    const log = await runGit(["log", "--oneline"], localRepo);
    const lines = log.stdout.trim().split("\n");
    assert.equal(lines.length, 2);
    assert.match(lines[0], /docs: expand readme background/);
    assert.match(lines[1], /docs: initialize project readme/);
  });

  await t.test("Lesson 4: git-branch-create-merge (分支切换、快进合并与三方合并)", async () => {
    // 创建特性分支 feature/auth
    await runGit(["switch", "-c", "feature/auth"], localRepo);
    await writeFile(path.join(localRepo, "Auth.java"), "public class Auth {}\n", "utf8");
    await runGit(["add", "Auth.java"], localRepo);
    await runGit(["commit", "-m", "feat: create auth module"], localRepo);

    // 切回 main 进行快进合并
    await runGit(["switch", "main"], localRepo);
    const ffMerge = await runGit(["merge", "feature/auth"], localRepo);
    assert.match(ffMerge.stdout, /Fast-forward/);

    // 测试三方合并（双方各自有提交）
    await runGit(["switch", "-c", "feature/payment"], localRepo);
    await writeFile(path.join(localRepo, "Payment.java"), "public class Payment {}\n", "utf8");
    await runGit(["add", "Payment.java"], localRepo);
    await runGit(["commit", "-m", "feat: create payment module"], localRepo);

    await runGit(["switch", "main"], localRepo);
    await writeFile(path.join(localRepo, "Config.java"), "public class Config {}\n", "utf8");
    await runGit(["add", "Config.java"], localRepo);
    await runGit(["commit", "-m", "chore: add global config"], localRepo);

    // 三方合并产生合并提交
    const threeWayMerge = await runGit(["merge", "--no-edit", "feature/payment"], localRepo);
    assert.match(threeWayMerge.stdout, /Merge made by the 'ort' strategy|Merge made by the 'recursive' strategy/);

    // 验证合并节点具有双父节点
    const parent1 = await runGit(["rev-parse", "HEAD^1"], localRepo);
    const parent2 = await runGit(["rev-parse", "HEAD^2"], localRepo);
    assert.ok(parent1.stdout.trim().length === 40);
    assert.ok(parent2.stdout.trim().length === 40);
    assert.notEqual(parent1.stdout.trim(), parent2.stdout.trim());
  });

  await t.test("Lesson 5: git-remote-collab (裸仓库、remote 配置与 fetch/push 协作)", async () => {
    // 创建独立的裸仓库作为模拟远端
    await runGit(["init", "--bare", "-b", "main", remoteBare]);

    // 添加 remote 并推送
    await runGit(["remote", "add", "origin", remoteBare], localRepo);
    const remotes = await runGit(["remote", "-v"], localRepo);
    assert.match(remotes.stdout, /origin/);

    await runGit(["push", "-u", "origin", "main"], localRepo);
    const fetch = await runGit(["fetch", "origin"], localRepo);
    assert.equal(fetch.stderr.trim(), "");

    // 验证远程追踪分支
    const headRev = await runGit(["rev-parse", "HEAD"], localRepo);
    const remoteRev = await runGit(["rev-parse", "refs/remotes/origin/main"], localRepo);
    assert.equal(headRev.stdout.trim(), remoteRev.stdout.trim());
  });
});
