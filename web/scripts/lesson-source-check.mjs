const normalize = (s) => s.replace(/\s+/g, " ").trim();

const CONTROL_KEYWORDS =
  /^(?:if|for|while|switch|catch|return|do|else|try|new|throw|assert|synchronized\s*\(|super|this)\b/;

/**
 * 从 Java 源码文本中提取“声明行”。
 * 判别标准：方法/构造器声明行包含 `(`、去掉可选 throws 子句后以 `{` 结尾，
 * 且首词不是控制流关键字或 lambda；无圆括号的类型声明由 TYPE_RE 单独处理：
 * - 带修饰符方法：`public static void main(String[] args) {`
 * - 无修饰符方法：`void put(String key, int value) {`
 * - 构造器：`public Demo() {` / `Point(int x, int y) {`
 * - 无参数类型声明：`public class Demo {` / `static class Inner {`
 * 排除调用语句（以 `;` 结尾）与控制流块。
 */
export function collectDeclarations(code) {
  const decls = [];
  for (const rawLine of code.split("\n")) {
    const line = rawLine.trim();
    if (!line.includes("(") || !line.endsWith("{")) continue;
    // 去掉 throws 子句后再检查
    const withoutThrows = line.replace(/\s+throws\s+[\w.,\s]+$/, "");
    if (!withoutThrows.endsWith("{")) continue;
    const firstWord =
      line.match(/^(?:@[\w.]+\s+)*(?:[\w<>\[\],.?]+\s+)?\b(\w+)/)?.[1] ?? "";
    if (CONTROL_KEYWORDS.test(firstWord)) continue;
    // 排除纯 lambda 表达式开头（如 `list.forEach(item -> {`）
    if (/->\s*\{\s*$/.test(line)) continue;
    decls.push(normalize(withoutThrows));
  }
  // 类型声明（不含圆括号）：class / interface / enum / record
  const TYPE_RE =
    /^[ \t]*(?:(?:public|private|protected|static|final|abstract)\s+)*(class|interface|enum|record)\s+(\w+)/gm;
  for (const m of code.matchAll(TYPE_RE)) {
    decls.push(normalize(`${m[1]} ${m[2]}`));
  }
  return [...new Set(decls)];
}

/**
 * 校验课程正文里的 java 代码块声明是否全部存在于落盘源码中。
 * 返回缺失声明列表；空数组表示全部一致。
 */
export function findMissingDeclarations(markdown, sourceCode) {
  const blocks = [];
  const re = /```java\n([\s\S]*?)```/g;
  let m;
  while ((m = re.exec(markdown)) !== null) blocks.push(m[1]);

  const normalizedSource = normalize(sourceCode);
  const missing = [];
  for (const block of blocks) {
    for (const decl of collectDeclarations(block)) {
      if (!normalizedSource.includes(decl)) {
        missing.push(decl);
      }
    }
  }
  return missing;
}
