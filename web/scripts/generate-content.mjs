// JavaRoadmap Lab 内容生成入口（CLI）。
// 职责：调用 scripts/content/build.mjs 组装 Catalog，写出生成产物，
// 并在 --update-registry 时把稳定 ID 契约同步到 web/content/registry.json。
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildCatalog } from "./content/build.mjs";
import { readSource, readJson } from "./content/load.mjs";

export { sections } from "./content/load.mjs";
export { buildCatalog, validateCatalog } from "./content/build.mjs";

const webRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const repoRoot = path.resolve(webRoot, "..");
const contentRoot = path.join(webRoot, "content");

export async function generateCatalog({ write = true, updateRegistry = false } = {}) {
  // --update-registry 是新 ID 的显式登记动作：先带豁免构建出 ID 集合，
  // 同步契约文件后复验（不带豁免），确保登记后的目录满足完整契约。
  if (updateRegistry) {
    const preview = await buildCatalog({
      repoRoot,
      contentRoot,
      allowUnknownIds: true,
    });
    const registry = await readJson(contentRoot, "registry.json");
    const current = [
      ...preview.lessons.map((item) => item.id),
      ...preview.exercises.map((item) => item.id),
      ...preview.predictions.map((item) => item.id),
      ...preview.modifications.map((item) => item.id),
    ].sort();
    const known = [...new Set([...(registry.knownIds ?? []), ...current])].sort();
    await writeFile(
      path.join(contentRoot, "registry.json"),
      `${JSON.stringify({ ...registry, knownIds: known }, null, 2)}
`,
      "utf8",
    );
    console.log(`registry.json updated: ${known.length} known IDs`);
  }
  const catalog = await buildCatalog({ repoRoot, contentRoot });
  if (write) {
    await mkdir(path.join(webRoot, "src/generated"), { recursive: true });
    await mkdir(path.join(webRoot, "public/reference"), { recursive: true });
    await writeFile(
      path.join(webRoot, "src/generated/catalog.json"),
      `${JSON.stringify(catalog, null, 2)}\n`,
      "utf8",
    );
    for (const reference of catalog.references) {
      const content = await readSource(repoRoot, reference.sourcePath, {
        reference: reference.url,
      });
      await writeFile(
        path.join(webRoot, "public", reference.url),
        `${JSON.stringify(
          {
            sourcePath: reference.sourcePath,
            language: reference.sourcePath.endsWith(".java")
              ? "java"
              : "markdown",
            content,
          },
          null,
          2,
        )}\n`,
        "utf8",
      );
    }
  }
  return catalog;
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const updateRegistry = process.argv.includes("--update-registry");
  const catalog = await generateCatalog({ updateRegistry });
  console.log(
    `Content: ${catalog.lessons.length} lessons, ${catalog.exercises.length} exercises, ${catalog.predictions.length} predictions, ${catalog.stages.length} stages.`,
  );
}
