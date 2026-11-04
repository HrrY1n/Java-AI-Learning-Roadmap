import { access, readFile, readdir } from "node:fs/promises";
import { brotliDecompressSync } from "node:zlib";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

// 字体覆盖门禁：只收集实际发布/渲染文本中的汉字，再读取 WOFF2 的真实 cmap 验证。
// 源码注释、HTML/CSS 注释不进入检查；Markdown/HTML 数字字符实体按渲染后的码点检查。
const defaultWebRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const defaultFontPath = resolve(
  defaultWebRoot,
  "src/assets/fonts/NotoSansSC-Subset.woff2",
);
const HAN = /\p{Script=Han}/u;
const WOFF2_TAGS = [
  "cmap", "head", "hhea", "hmtx", "maxp", "name", "OS/2", "post",
  "cvt ", "fpgm", "glyf", "loca", "prep", "CFF ", "VORG", "EBDT",
  "EBLC", "gasp", "hdmx", "kern", "LTSH", "PCLT", "VDMX", "vhea",
  "vmtx", "BASE", "GDEF", "GPOS", "GSUB", "EBSC", "JSTF", "MATH",
  "CBDT", "CBLC", "COLR", "CPAL", "SVG ", "sbix", "acnt", "avar",
  "bdat", "bloc", "bsln", "cvar", "fdsc", "feat", "fmtx", "fvar",
  "gvar", "hsty", "just", "lcar", "mort", "morx", "opbd", "prop",
  "trak", "Zapf", "Silf", "Glat", "Gloc", "Feat", "Sill",
];

// 读取 WOFF2 表目录使用的 Base128 变长整数。
function readBase128(buffer, state) {
  let value = 0;
  for (let i = 0; i < 5; i += 1) {
    const byte = buffer[state.offset];
    state.offset += 1;
    if (byte === undefined) throw new Error("WOFF2 表目录意外结束");
    value = value * 128 + (byte & 0x7f);
    if ((byte & 0x80) === 0) return value;
  }
  throw new Error("WOFF2 表目录中的 Base128 数值过长");
}

// 解压 WOFF2 的压缩表区，按表目录定位并返回未变换的目标表。
export function readWoff2Table(buffer, wantedTag) {
  if (buffer.toString("ascii", 0, 4) !== "wOF2") {
    throw new Error("字体文件不是 WOFF2 格式");
  }
  const numTables = buffer.readUInt16BE(12);
  const totalCompressedSize = buffer.readUInt32BE(20);
  const state = { offset: 48 };
  const entries = [];
  for (let index = 0; index < numTables; index += 1) {
    const flags = buffer[state.offset];
    state.offset += 1;
    const tagIndex = flags & 0x3f;
    const transformVersion = flags >>> 6;
    let tag;
    if (tagIndex === 63) {
      tag = buffer.toString("ascii", state.offset, state.offset + 4);
      state.offset += 4;
    } else {
      tag = WOFF2_TAGS[tagIndex];
    }
    if (!tag) throw new Error(`WOFF2 表标签索引无效：${tagIndex}`);
    const origLength = readBase128(buffer, state);
    const transformed =
      tag === "glyf" || tag === "loca"
        ? transformVersion === 0
        : transformVersion !== 0;
    const storedLength = transformed
      ? readBase128(buffer, state)
      : origLength;
    entries.push({ tag, origLength, storedLength, transformed });
  }

  const compressed = buffer.subarray(
    state.offset,
    state.offset + totalCompressedSize,
  );
  const raw = brotliDecompressSync(compressed);
  let dataOffset = 0;
  for (const entry of entries) {
    if (entry.tag === wantedTag) {
      if (entry.transformed) throw new Error(`目标表 ${wantedTag} 被 WOFF2 变换`);
      return raw.subarray(dataOffset, dataOffset + entry.origLength);
    }
    dataOffset += entry.storedLength;
  }
  throw new Error(`WOFF2 中缺少 ${wantedTag} 表`);
}

function addCmapCode(codepoints, code) {
  if (code >= 0 && code <= 0x10ffff) codepoints.add(code);
}

// 解析 BMP 的 cmap format 4，按 segment 与 idRangeOffset 还原有效码点。
function readFormat4(table, offset, codepoints) {
  const segCount = table.readUInt16BE(offset + 6) / 2;
  const endBase = offset + 14;
  const startBase = endBase + segCount * 2 + 2;
  const deltaBase = startBase + segCount * 2;
  const rangeBase = deltaBase + segCount * 2;

  for (let index = 0; index < segCount; index += 1) {
    const end = table.readUInt16BE(endBase + index * 2);
    const start = table.readUInt16BE(startBase + index * 2);
    if (start === 0xffff && end === 0xffff) continue;
    const delta = table.readInt16BE(deltaBase + index * 2);
    const rangeOffset = table.readUInt16BE(rangeBase + index * 2);
    for (let code = start; code <= end; code += 1) {
      let glyph;
      if (rangeOffset === 0) {
        glyph = (code + delta) & 0xffff;
      } else {
        const address =
          rangeBase + index * 2 + rangeOffset + (code - start) * 2;
        if (address + 2 > table.length) continue;
        glyph = table.readUInt16BE(address);
        if (glyph !== 0) glyph = (glyph + delta) & 0xffff;
      }
      if (glyph !== 0) addCmapCode(codepoints, code);
    }
  }
}

// format 12 中组内 glyph 连续递增；startGlyph 为 0 时，只有后续非 0 glyph 有效。
function readFormat12(table, offset, codepoints) {
  const groupCount = table.readUInt32BE(offset + 12);
  let position = offset + 16;
  for (let index = 0; index < groupCount; index += 1) {
    const start = table.readUInt32BE(position);
    const end = table.readUInt32BE(position + 4);
    const startGlyph = table.readUInt32BE(position + 8);
    position += 12;
    for (let code = start; code <= end; code += 1) {
      const glyph = startGlyph + (code - start);
      if (glyph !== 0) addCmapCode(codepoints, code);
    }
  }
}

function readFormat6(table, offset, codepoints) {
  const firstCode = table.readUInt16BE(offset + 6);
  const entryCount = table.readUInt16BE(offset + 8);
  for (let index = 0; index < entryCount; index += 1) {
    const glyph = table.readUInt16BE(offset + 10 + index * 2);
    if (glyph !== 0) addCmapCode(codepoints, firstCode + index);
  }
}

function readFormat0(table, offset, codepoints) {
  for (let code = 0; code < 256; code += 1) {
    if (table[offset + 6 + code] !== 0) addCmapCode(codepoints, code);
  }
}

// 合并 cmap 中所有 Unicode 子表，得到字体真实可映射的码点集合。
export function readCmap(buffer) {
  if (buffer.readUInt16BE(0) !== 0) throw new Error("cmap 版本不受支持");
  const tableCount = buffer.readUInt16BE(2);
  const offsets = new Set();
  for (let index = 0; index < tableCount; index += 1) {
    const record = 4 + index * 8;
    offsets.add(buffer.readUInt32BE(record + 4));
  }

  const codepoints = new Set();
  for (const offset of offsets) {
    const format = buffer.readUInt16BE(offset);
    if (format === 0) readFormat0(buffer, offset, codepoints);
    else if (format === 4) readFormat4(buffer, offset, codepoints);
    else if (format === 6) readFormat6(buffer, offset, codepoints);
    else if (format === 12) readFormat12(buffer, offset, codepoints);
  }
  return codepoints;
}

// 递归列出目录中符合条件的文件，供发布文本扫描使用。
async function listFiles(directory, accepts) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await listFiles(path, accepts)));
    else if (accepts(path)) files.push(path);
  }
  return files;
}

// 数字字符实体在 Markdown/HTML 渲染时会变成实际码点，必须按渲染语义检查。
export function decodeNumericCharacterReferences(text) {
  return text.replace(
    /&#(?:[xX]([0-9a-fA-F]+)|([0-9]+));/g,
    (entity, hex, decimal) => {
      const code = Number.parseInt(hex ?? decimal, hex ? 16 : 10);
      if (!Number.isSafeInteger(code) || code < 0 || code > 0x10ffff) {
        return entity;
      }
      return String.fromCodePoint(code);
    },
  );
}

function removeBlockComments(text, start, end) {
  let output = "";
  let position = 0;
  while (position < text.length) {
    const opening = text.indexOf(start, position);
    if (opening === -1) {
      output += text.slice(position);
      break;
    }
    const closing = text.indexOf(end, opening + start.length);
    if (closing === -1) {
      output += text.slice(position, opening);
      break;
    }
    output += text.slice(position, opening);
    position = closing + end.length;
  }
  return output;
}

// 从 TypeScript/TSX AST 收集字符串、模板与 JSX 文本；注释不会成为 AST 子节点。
function addTypeScriptText(path, source, required, webRoot) {
  const sourceFile = ts.createSourceFile(
    path,
    source,
    ts.ScriptTarget.Latest,
    true,
    path.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const visit = (node) => {
    if (
      ts.isStringLiteral(node) ||
      ts.isNoSubstitutionTemplateLiteral(node)
    ) {
      addText(node.text, path, required, webRoot);
    } else if (
      ts.isTemplateHead(node) ||
      ts.isTemplateMiddle(node) ||
      ts.isTemplateTail(node)
    ) {
      addText(node.text, path, required, webRoot);
    } else if (ts.isJsxText(node)) {
      addText(node.text, path, required, webRoot);
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
}

// 遍历生成目录/参考 JSON，只收集字符串值中的汉字。
function addJsonStrings(value, source, required, webRoot) {
  if (typeof value === "string") {
    addText(value, source, required, webRoot);
  } else if (Array.isArray(value)) {
    for (const item of value) addJsonStrings(item, source, required, webRoot);
  } else if (value && typeof value === "object") {
    for (const item of Object.values(value)) {
      addJsonStrings(item, source, required, webRoot);
    }
  }
}

// 记录每个汉字及其发布来源，便于覆盖失败时定位到具体内容文件。
function addText(text, source, required, webRoot = defaultWebRoot) {
  const relativePath = relative(webRoot, source);
  const renderedText = decodeNumericCharacterReferences(text);
  for (const character of renderedText) {
    if (!HAN.test(character)) continue;
    const sources = required.get(character) ?? new Set();
    sources.add(relativePath);
    required.set(character, sources);
  }
}

// 读取 JSON 并保留文件名上下文；内容解析失败不能伪装成“字体缺字”。
async function readJson(path) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    throw new Error(`无法读取或解析 ${relative(defaultWebRoot, path)}：${error.message}`);
  }
}

export async function collectRequiredHan(webRoot = defaultWebRoot) {
  const required = new Map();
  const catalogPath = resolve(webRoot, "src/generated/catalog.json");
  try {
    await access(catalogPath);
  } catch {
    throw new Error(
      "缺少 src/generated/catalog.json；请先运行 npm run content 再检查字体覆盖。",
    );
  }
  addJsonStrings(await readJson(catalogPath), catalogPath, required, webRoot);

  for (const path of await listFiles(resolve(webRoot, "public/reference"), (path) =>
    path.endsWith(".json"),
  )) {
    addJsonStrings(await readJson(path), path, required, webRoot);
  }
  for (const path of await listFiles(resolve(webRoot, "content"), (path) =>
    path.endsWith(".json"),
  )) {
    addJsonStrings(await readJson(path), path, required, webRoot);
  }
  for (const path of await listFiles(
    resolve(webRoot, "src"),
    (path) =>
      /\.(ts|tsx)$/.test(path) && !/\.test\.(ts|tsx)$/.test(path),
  )) {
    addTypeScriptText(path, await readFile(path, "utf8"), required, webRoot);
  }

  const indexPath = resolve(webRoot, "index.html");
  const html = await readFile(indexPath, "utf8");
  addText(removeBlockComments(html, "<!--", "-->"), indexPath, required, webRoot);

  const stylesPath = resolve(webRoot, "src/styles.css");
  const styles = await readFile(stylesPath, "utf8");
  addText(removeBlockComments(styles, "/*", "*/"), stylesPath, required, webRoot);

  return required;
}

export function findMissingCharacters(required, cmap) {
  return [...required.keys()]
    .filter((character) => !cmap.has(character.codePointAt(0)))
    .sort((a, b) => a.codePointAt(0) - b.codePointAt(0));
}

async function main() {
  const required = await collectRequiredHan(defaultWebRoot);
  const cmap = readCmap(
    readWoff2Table(await readFile(defaultFontPath), "cmap"),
  );
  const missing = findMissingCharacters(required, cmap);
  if (missing.length > 0) {
    const details = missing
      .slice(0, 40)
      .map((character) => {
        const locations = [...(required.get(character) ?? [])].join(", ");
        return `${character}（${locations}）`;
      })
      .join("；");
    throw new Error(
      `Noto Sans SC 子集缺少 ${missing.length} 个已发布汉字：${details}${
        missing.length > 40 ? "……" : ""
      }`,
    );
  }

  console.log(
    `字体覆盖通过：${required.size} 个已发布汉字均存在于 ${relative(defaultWebRoot, defaultFontPath)} 的实际 cmap 中。`,
  );
}

const entryPath = process.argv[1] ? resolve(process.argv[1]) : "";
if (entryPath && entryPath === fileURLToPath(import.meta.url)) {
  await main();
}
