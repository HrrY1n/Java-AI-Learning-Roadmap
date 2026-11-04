import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  collectRequiredHan,
  findMissingCharacters,
  readCmap,
  readWoff2Table,
} from "./check-font-coverage.mjs";

const webRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fontPath = resolve(
  webRoot,
  "src/assets/fonts/NotoSansSC-Subset.woff2",
);
// 用码点构造生僻示例，避免把测试样本误放进正式课程或界面源码。
const RARE = String.fromCodePoint(0x9f98);

async function makeFixtureWebRoot(source = "") {
  const root = await mkdtemp(join(tmpdir(), "font-coverage-"));
  await mkdir(join(root, "src/generated"), { recursive: true });
  await mkdir(join(root, "public/reference"), { recursive: true });
  await mkdir(join(root, "content"), { recursive: true });
  await writeFile(
    join(root, "src/generated/catalog.json"),
    JSON.stringify({ markdown: "课程正文" }),
    "utf8",
  );
  await writeFile(
    join(root, "public/reference/reference-01.json"),
    JSON.stringify({ content: "参考内容" }),
    "utf8",
  );
  await writeFile(
    join(root, "content/topics.json"),
    JSON.stringify({ title: "专题内容" }),
    "utf8",
  );
  await writeFile(join(root, "src/App.tsx"), source, "utf8");
  await writeFile(
    join(root, "index.html"),
    `<!-- ${RARE} --><title>站点界面</title>`,
    "utf8",
  );
  await writeFile(
    join(root, "src/styles.css"),
    `/* ${RARE} */ body::after { content: "界面提示"; }`,
    "utf8",
  );
  return root;
}

test("字体外的生僻字只出现在源码、HTML 或 CSS 注释时不会进入覆盖检查", async () => {
  const root = await makeFixtureWebRoot(
    [
      `// ${RARE}：开发备注，不展示给访客。`,
      `/* ${RARE}：设计备注，不展示给访客。 */`,
      "export const label = \"界面文本\";",
      "export function Page() { return <p>课程界面</p>; }",
    ].join("\n"),
  );
  try {
    const required = await collectRequiredHan(root);
    assert(!required.has(RARE));
    assert(required.has("界"));
    assert(required.has("课"));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("字体外的生僻字出现在可见字符串、JSX 或实体中时会进入覆盖检查", async () => {
  const code = RARE.codePointAt(0);
  const root = await makeFixtureWebRoot(
    [
      `export const message = "界面${RARE}";`,
      `export function Page() { return <p>正文&#x${code.toString(16)};</p>; }`,
    ].join("\n"),
  );
  await writeFile(
    join(root, "src/generated/catalog.json"),
    JSON.stringify({ markdown: `正文&#${code};` }),
    "utf8",
  );
  try {
    const required = await collectRequiredHan(root);
    assert(required.has(RARE));
    const sources = [...(required.get(RARE) ?? [])];
    assert(sources.some((path) => path.endsWith("App.tsx")));
    assert(sources.some((path) => path.endsWith("catalog.json")));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

function makeCmap12(groups) {
  const subtableOffset = 12;
  const subtableLength = 16 + groups.length * 12;
  const buffer = Buffer.alloc(subtableOffset + subtableLength);
  buffer.writeUInt16BE(0, 0);
  buffer.writeUInt16BE(1, 2);
  buffer.writeUInt16BE(0, 4);
  buffer.writeUInt16BE(4, 6);
  buffer.writeUInt32BE(subtableOffset, 8);
  buffer.writeUInt16BE(12, subtableOffset);
  buffer.writeUInt16BE(0, subtableOffset + 2);
  buffer.writeUInt32BE(subtableLength, subtableOffset + 4);
  buffer.writeUInt32BE(0, subtableOffset + 8);
  buffer.writeUInt32BE(groups.length, subtableOffset + 12);
  let position = subtableOffset + 16;
  for (const group of groups) {
    buffer.writeUInt32BE(group.start, position);
    buffer.writeUInt32BE(group.end, position + 4);
    buffer.writeUInt32BE(group.startGlyph, position + 8);
    position += 12;
  }
  return buffer;
}

test("format 12 从 glyph 0 开始的组只排除映射到 glyph 0 的首字符", () => {
  const start = RARE.codePointAt(0);
  const codepoints = readCmap(
    makeCmap12([{ start, end: start + 2, startGlyph: 0 }]),
  );
  assert(!codepoints.has(start));
  assert(codepoints.has(start + 1));
  assert(codepoints.has(start + 2));
});

test("当前字体覆盖全部发布汉字；上一版本旧字体仍能检出此前的三个缺字", async () => {
  const required = await collectRequiredHan(webRoot);
  const current = readCmap(
    readWoff2Table(await readFile(fontPath), "cmap"),
  );
  assert.equal(findMissingCharacters(required, current).length, 0);
  for (const character of ["啾", "喵", "癖"]) {
    assert(current.has(character.codePointAt(0)));
  }

  // 构造修复前的 cmap 语义：当前码点集合去掉这三个字，验证门禁仍能准确检出。
  const stale = new Set(current);
  for (const character of ["啾", "喵", "癖"]) {
    stale.delete(character.codePointAt(0));
  }
  assert.deepEqual(findMissingCharacters(required, stale), ["啾", "喵", "癖"]);
});
