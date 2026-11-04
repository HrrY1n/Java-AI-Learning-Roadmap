import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import { dirname, resolve, relative, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";

// 发布产物门禁：相对入口资源不得越出 dist，字体许可与懒加载资源必须随产物交付。
const webRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(webRoot, process.argv[2] || "dist");
const html = await readFile(resolve(dist, "index.html"), "utf8");
assert.match(html, /id="root"/);
const assets = [...html.matchAll(/(?:src|href)="([^"#]+)"/g)].map(
  (match) => match[1],
);
assert(
  assets.some((path) => path.endsWith(".js")),
  "入口缺少JavaScript",
);
assert(
  assets.some((path) => path.endsWith(".css")),
  "入口缺少CSS",
);
for (const path of assets) {
  assert(
    !path.startsWith("/") && !path.includes(":"),
    `产物使用非相对资源: ${path}`,
  );
  const absolute = resolve(dist, path);
  const within = relative(dist, absolute);
  assert(!within.startsWith("..") && !isAbsolute(within), "资源越出产物目录");
  assert((await stat(absolute)).size > 0, `资源为空: ${path}`);
}
const chunks = await readdir(resolve(dist, "assets"));
for (const name of ["MonacoEditor-", "editor.worker-"]) {
  assert(
    chunks.some((path) => path.startsWith(name) && path.endsWith(".js")),
    `缺少 ${name} 资源`,
  );
}
const catalog = JSON.parse(
  await readFile(resolve(webRoot, "src/generated/catalog.json"), "utf8"),
);
for (const reference of catalog.references) {
  const record = JSON.parse(
    await readFile(resolve(dist, reference.url), "utf8"),
  );
  assert.equal(record.sourcePath, reference.sourcePath, "参考资源与目录不匹配");
  assert.equal(typeof record.content, "string");
  assert(record.content.length > 0, "参考资源为空");
}
// KaTeX 数学字体随 CSS 一起发布，OFL 1.1 要求完整许可证和字体版权声明随附。
for (const name of ["README.md", "OFL-1.1.txt", "KaTeX-MIT.txt"]) {
  const file = resolve(dist, "licenses", name);
  assert((await stat(file)).size > 0, `缺少字体许可资料: ${name}`);
}
const fontNotice = await readFile(resolve(dist, "licenses/README.md"), "utf8");
assert.match(fontNotice, /Design Science, Inc\./);
assert.match(fontNotice, /Khan Academy/);
assert.match(fontNotice, /SIL Open Font License, Version 1\.1/);
const ofl = await readFile(resolve(dist, "licenses/OFL-1.1.txt"), "utf8");
assert.match(ofl, /SIL OPEN FONT LICENSE Version 1\.1/);
assert.match(ofl, /PERMISSION & CONDITIONS/);
assert.match(ofl, /DISCLAIMER/);
console.log(
  `构建产物完整：${assets.length}个入口资源、Monaco/worker、${catalog.references.length}个懒加载参考、字体许可资料。`,
);
