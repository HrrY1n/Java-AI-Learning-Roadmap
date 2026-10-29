import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import { dirname, resolve, relative, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";

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
console.log(
  `构建产物完整：${assets.length}个入口资源、Monaco/worker、${catalog.references.length}个懒加载参考。`,
);
