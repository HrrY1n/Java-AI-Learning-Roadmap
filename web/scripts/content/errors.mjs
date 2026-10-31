// 内容系统共享错误类型：所有失败必须携带来源文件/字段上下文。
export class ContentError extends Error {
  constructor(message, context = {}) {
    const where = Object.entries(context)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => `${key}=${value}`)
      .join(" ");
    super(where ? `${message}（${where}）` : message);
    this.name = "ContentError";
    this.context = context;
  }
}

export function contentError(message, context) {
  return new ContentError(message, context);
}
