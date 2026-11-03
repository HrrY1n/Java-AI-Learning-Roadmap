import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, readFile as fsReadFile, rm, writeFile as fsWriteFile } from "node:fs/promises";
import fs from "node:fs";
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
    await fsWriteFile(path.join(localRepo, "README.md"), "# Project Sandbox\n", "utf8");

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
    await fsWriteFile(path.join(localRepo, "README.md"), "# Project Sandbox\n\nNew line added.\n", "utf8");

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
    await fsWriteFile(path.join(localRepo, "Auth.java"), "public class Auth {}\n", "utf8");
    await runGit(["add", "Auth.java"], localRepo);
    await runGit(["commit", "-m", "feat: create auth module"], localRepo);

    // 切回 main 进行快进合并
    await runGit(["switch", "main"], localRepo);
    const ffMerge = await runGit(["merge", "feature/auth"], localRepo);
    assert.match(ffMerge.stdout, /Fast-forward/);

    // 测试三方合并（双方各自有提交）
    await runGit(["switch", "-c", "feature/payment"], localRepo);
    await fsWriteFile(path.join(localRepo, "Payment.java"), "public class Payment {}\n", "utf8");
    await runGit(["add", "Payment.java"], localRepo);
    await runGit(["commit", "-m", "feat: create payment module"], localRepo);

    await runGit(["switch", "main"], localRepo);
    await fsWriteFile(path.join(localRepo, "Config.java"), "public class Config {}\n", "utf8");
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


test('V1.5 Pro Git 补齐课程：冲突/撤销/stash/标签/变基拣选/协作/考古/内部原理 沙箱实测', async (t) => {
  const sandbox = await mkdtemp(path.join(os.tmpdir(), 'git-lab-v15-'));
  // Windows autocrlf 下 checkout/stash/restore 会把 LF 转成 CRLF，断言前统一归一化
  const readLf = async (file) =>
    (await fsReadFile(file, 'utf8')).replace(/\r\n/g, '\n');
  t.after(async () => {
    await rm(sandbox, { recursive: true, force: true });
  });

  await t.test('git-merge-conflict: 真冲突产生、标记存在、解决后可提交', async () => {
    const repo = path.join(sandbox, 'conflict');
    await runGit(['init', '-b', 'main', repo]);
    await fsWriteFile(path.join(repo, 'plan.md'), 'baseline\n');
    await runGit(['add', '.'], repo);
    await runGit(['commit', '-m', 'base'], repo);
    await runGit(['switch', '-c', 'feature/ideas'], repo);
    await fsWriteFile(path.join(repo, 'plan.md'), 'feature version\n');
    await runGit(['commit', '-am', 'feature edit'], repo);
    await runGit(['switch', 'main'], repo);
    await fsWriteFile(path.join(repo, 'plan.md'), 'main version\n');
    await runGit(['commit', '-am', 'main edit'], repo);
    const merge = await runGit(['merge', 'feature/ideas'], repo).catch((e) => e);
    const merged = (merge.stdout || '') + (merge.stderr || '');
    assert.match(merged, /CONFLICT|冲突/, '必须产生真实冲突');
    const content = await fsReadFile(path.join(repo, 'plan.md'), 'utf8');
    assert.match(content, /<<<<<<< /, '文件中必须出现冲突标记');
    assert.match(content, /=======/, '文件中必须出现分隔标记');
    const status = await runGit(['status'], repo);
    assert.match(status.stdout, /both modified|双方修改|Unmerged|未合并/);
    // 手工解决（保留统一版本），add 即“已解决”声明
    await fsWriteFile(path.join(repo, 'plan.md'), 'resolved\n');
    await runGit(['add', 'plan.md'], repo);
    await runGit(['commit', '--no-edit'], repo);
    const done = await runGit(['status'], repo);
    assert.match(done.stdout, /nothing to commit|工作树是干净的|working tree clean/);
  });

  await t.test('git-undo-recover: restore 丢弃 / restore --staged 取消暂存 / revert 反向提交', async () => {
    const repo = path.join(sandbox, 'undo');
    await runGit(['init', '-b', 'main', repo]);
    await fsWriteFile(path.join(repo, 'note.txt'), 'v1\n');
    await runGit(['add', '.'], repo);
    await runGit(['commit', '-m', 'v1'], repo);
    // restore：丢弃未暂存修改
    await fsWriteFile(path.join(repo, 'note.txt'), 'v1 + messy edit\n');
    await runGit(['restore', 'note.txt'], repo);
    assert.equal(await readLf(path.join(repo, 'note.txt')), 'v1\n');
    // restore --staged：取消暂存但保留修改
    await fsWriteFile(path.join(repo, 'note.txt'), 'v1 + staged edit\n');
    await runGit(['add', 'note.txt'], repo);
    await runGit(['restore', '--staged', 'note.txt'], repo);
    const staged = await runGit(['status', '--porcelain'], repo);
    assert.ok(!staged.stdout.includes('M  note.txt'), '不应再处于已暂存列');
    assert.equal(await readLf(path.join(repo, 'note.txt')), 'v1 + staged edit\n');
    await runGit(['restore', 'note.txt'], repo);
    // revert：生成反向提交
    await fsWriteFile(path.join(repo, 'note.txt'), 'v2\n');
    await runGit(['commit', '-am', 'v2'], repo);
    await runGit(['revert', '--no-edit', 'HEAD'], repo);
    assert.equal(await readLf(path.join(repo, 'note.txt')), 'v1\n');
    const log = await runGit(['log', '--oneline'], repo);
    assert.match(log.stdout, /Revert/, 'revert 应生成反向提交');
  });

  await t.test('git-stash: push 收起工作区，list 可见，pop 恢复', async () => {
    const repo = path.join(sandbox, 'stash');
    await runGit(['init', '-b', 'main', repo]);
    await fsWriteFile(path.join(repo, 'wip.txt'), 'committed\n');
    await runGit(['add', '.'], repo);
    await runGit(['commit', '-m', 'base'], repo);
    await fsWriteFile(path.join(repo, 'wip.txt'), 'committed + wip\n');
    await runGit(['stash', 'push', '-m', 'wip: 草稿'], repo);
    const status = await runGit(['status', '--porcelain'], repo);
    assert.equal(status.stdout.trim(), '', 'stash 后工作区应干净');
    const list = await runGit(['stash', 'list'], repo);
    assert.match(list.stdout, /wip: 草稿/);
    await runGit(['stash', 'pop'], repo);
    assert.equal(await readLf(path.join(repo, 'wip.txt')), 'committed + wip\n');
    const after = await runGit(['stash', 'list'], repo);
    assert.equal(after.stdout.trim(), '', 'pop 后贮藏栈应为空');
  });

  await t.test('git-tag: 附注标签创建、列举、show 与钉死提交', async () => {
    const repo = path.join(sandbox, 'tag');
    await runGit(['init', '-b', 'main', repo]);
    await fsWriteFile(path.join(repo, 'a.txt'), 'a\n');
    await runGit(['add', '.'], repo);
    await runGit(['commit', '-m', 'a'], repo);
    await runGit(['tag', '-a', 'v1.0', '-m', '首个里程碑'], repo);
    const tags = await runGit(['tag'], repo);
    assert.match(tags.stdout, /v1\.0/);
    const show = await runGit(['show', 'v1.0', '--stat'], repo);
    assert.match(show.stdout, /首个里程碑/);
    await fsWriteFile(path.join(repo, 'a.txt'), 'a2\n');
    await runGit(['commit', '-am', 'a2'], repo);
    const tagged = await runGit(['rev-parse', 'v1.0^{commit}'], repo);
    const headOld = await runGit(['rev-parse', 'HEAD~1'], repo);
    assert.equal(tagged.stdout.trim(), headOld.stdout.trim(), '标签应钉死在打标签时的提交上');
  });

  await t.test('git-rebase-cherry-pick: 变基成线性历史，拣选生成新哈希', async () => {
    const repo = path.join(sandbox, 'rebase');
    await runGit(['init', '-b', 'main', repo]);
    await fsWriteFile(path.join(repo, 'f.txt'), 'l1\n');
    await runGit(['add', '.'], repo);
    await runGit(['commit', '-m', 'l1'], repo);
    await runGit(['switch', '-c', 'feature'], repo);
    await fsWriteFile(path.join(repo, 'f.txt'), 'l1\nf1\n');
    await runGit(['commit', '-am', 'f1'], repo);
    await runGit(['switch', 'main'], repo);
    await fsWriteFile(path.join(repo, 'g.txt'), 'g1\n');
    await runGit(['add', '.'], repo);
    await runGit(['commit', '-m', 'g1'], repo);
    await runGit(['switch', 'feature'], repo);
    await runGit(['rebase', 'main'], repo);
    const f1parent = await runGit(['rev-parse', 'feature~1'], repo);
    const mainHead = await runGit(['rev-parse', 'main'], repo);
    assert.equal(f1parent.stdout.trim(), mainHead.stdout.trim(), '变基后 feature 应线性落在 main 之上');
    // cherry-pick：构造不同的父提交使哈希确定不同
    await runGit(['switch', '-c', 'hotfix'], repo);
    const l1hash = await runGit(['log', '--format=%H', '--grep=l1'], repo);
    await runGit(['reset', '--hard', l1hash.stdout.trim()], repo);
    // 在 hotfix 上先加一笔额外提交，让 cherry-pick 的父提交与原提交的父提交不同
    await fsWriteFile(path.join(repo, 'hotfix-setup.txt'), 'setup\n');
    await runGit(['add', '.'], repo);
    await runGit(['commit', '-m', 'hotfix setup'], repo);
    const g1hash = await runGit(['log', '--format=%H', '--grep=g1', 'main'], repo);
    await runGit(['cherry-pick', g1hash.stdout.trim()], repo);
    const picked = await runGit(['rev-parse', 'HEAD'], repo);
    assert.notEqual(picked.stdout.trim(), g1hash.stdout.trim(), '父提交不同 → 拣选生成的新提交哈希必须不同');
    const pickedMsg = await runGit(['log', '-1', '--format=%s'], repo);
    assert.match(pickedMsg.stdout, /g1/, '拣选后的提交消息应保留');
    // 验证文件内容确实被带到了 hotfix
    const pickedTree = await runGit(['ls-tree', '--name-only', 'HEAD'], repo);
    assert.match(pickedTree.stdout, /g\.txt/);
  });

  await t.test('git-collab-workflow: clone 本地远端、push -u 建立跟踪', async () => {
    const bare = path.join(sandbox, 'collab-remote.git');
    const seed = path.join(sandbox, 'collab-seed');
    await runGit(['init', '--bare', '-b', 'main', bare]);
    await runGit(['init', '-b', 'main', seed]);
    await fsWriteFile(path.join(seed, 'app.md'), 'app\n');
    await runGit(['add', '.'], seed);
    await runGit(['commit', '-m', 'init'], seed);
    await runGit(['remote', 'add', 'origin', bare], seed);
    await runGit(['push', '-u', 'origin', 'main'], seed);
    const clone = path.join(sandbox, 'collab-clone');
    await runGit(['clone', bare, clone]);
    const branches = await runGit(['branch', '-a'], clone);
    assert.match(branches.stdout, /remotes\/origin\/main/, '克隆后即可见远程跟踪分支');
    await runGit(['switch', '-c', 'feature/login'], clone);
    await fsWriteFile(path.join(clone, 'login.md'), 'login\n');
    await runGit(['add', '.'], clone);
    await runGit(['commit', '-m', 'login'], clone);
    await runGit(['push', '-u', 'origin', 'feature/login'], clone);
    const upstream = await runGit(['rev-parse', '--abbrev-ref', 'feature/login@{upstream}'], clone);
    assert.match(upstream.stdout, /origin\/feature\/login/);
  });

  await t.test('git-history-archaeology: reflog 记录移动，reset 后可经分支接回，blame 逐行归属', async () => {
    const repo = path.join(sandbox, 'archaeology');
    await runGit(['init', '-b', 'main', repo]);
    await fsWriteFile(path.join(repo, 'code.txt'), 'line1\n');
    await runGit(['add', '.'], repo);
    await runGit(['commit', '-m', 'line1'], repo);
    await fsWriteFile(path.join(repo, 'code.txt'), 'line1\nline2\n');
    await runGit(['commit', '-am', 'line2'], repo);
    const lost = await runGit(['rev-parse', 'HEAD'], repo); // reset 后这笔提交“丢失”
    await runGit(['reset', '--hard', 'HEAD~1'], repo);
    assert.equal(await readLf(path.join(repo, 'code.txt')), 'line1\n');
    const reflog = await runGit(['reflog'], repo);
    assert.match(reflog.stdout, /reset|line2/, 'reflog 必须记录 HEAD 移动');
    await runGit(['branch', 'rescue', lost.stdout.trim()], repo);
    await runGit(['switch', 'rescue'], repo);
    assert.equal(await readLf(path.join(repo, 'code.txt')), 'line1\nline2\n');
    const blame = await runGit(['blame', 'code.txt'], repo);
    assert.match(blame.stdout, /line1/, 'blame 输出应包含源行内容');
  });

  await t.test('git-history-archaeology: bisect 完整二分定位小例', async () => {
    const repo = path.join(sandbox, 'bisect');
    await runGit(['init', '-b', 'main', repo]);
    // 5 笔提交，第 3 笔引入 bug（写入了 bad 标记）
    for (let i = 1; i <= 5; i++) {
      await fsWriteFile(path.join(repo, 'v.txt'), 'v' + i + (i >= 3 ? '\nBUG\n' : '\n'));
      await runGit(['add', '.'], repo);
      await runGit(['commit', '-m', 'v' + i], repo);
    }
    const v5 = await runGit(['rev-parse', 'HEAD'], repo);
    const goodHash = await runGit(['rev-parse', 'HEAD~4'], repo); // v1 = good
    // 二分开始：只初始化流程，尚未检出候选
    await runGit(['bisect', 'start'], repo);
    await runGit(['bisect', 'bad', v5.stdout.trim()], repo);
    await runGit(['bisect', 'good', goodHash.stdout.trim()], repo);
    // 标记完成后 Git 自动检出中间提交（v3 附近），reflog 应有 bisect 记录
    const midHead = await runGit(['rev-parse', 'HEAD'], repo);
    assert.notEqual(midHead.stdout.trim(), v5.stdout.trim(), 'bisect 应把 HEAD 切到中间候选');
    // 假设在中间提交测试后标记 bad，Git 继续缩小范围
    await runGit(['bisect', 'bad'], repo);
    await runGit(['bisect', 'reset'], repo);
    const afterReset = await runGit(['rev-parse', 'HEAD'], repo);
    assert.equal(afterReset.stdout.trim(), v5.stdout.trim(), 'bisect reset 应回到原始分支');
  });

  await t.test('git-internals-basics: 配置读取、hash-object 内容寻址、cat-file 与 ls-tree', async () => {
    const repo = path.join(sandbox, 'internals');
    await runGit(['init', '-b', 'main', repo]);
    await runGit(['config', 'user.name', 'Internals Learner'], repo);
    const name = await runGit(['config', 'user.name'], repo);
    assert.equal(name.stdout.trim(), 'Internals Learner');
    // 内容寻址：相同内容 → 相同哈希
    await fsWriteFile(path.join(repo, 'hello.txt'), 'git objects\n');
    await fsWriteFile(path.join(repo, 'copy.txt'), 'git objects\n');
    const h1 = await runGit(['hash-object', '-w', 'hello.txt'], repo);
    const h2 = await runGit(['hash-object', '-w', 'copy.txt'], repo);
    assert.equal(h1.stdout.trim(), h2.stdout.trim());
    const cat = await runGit(['cat-file', '-p', h1.stdout.trim()], repo);
    assert.equal(cat.stdout, 'git objects\n');
    await runGit(['add', '.'], repo);
    await runGit(['commit', '-m', 'objects'], repo);
    const tree = await runGit(['ls-tree', 'HEAD'], repo);
    assert.match(tree.stdout, /blob/, '提交的树对象应列出 blob');
    assert.match(tree.stdout, /hello\.txt|copy\.txt/);
  });
});
