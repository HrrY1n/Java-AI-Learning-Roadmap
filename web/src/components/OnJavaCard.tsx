import { BookOpen, Sparkles } from "lucide-react";
import { catalog } from "../catalog";
import type { OnJavaLink } from "../content-types";

interface OnJavaCardProps {
  lessonId: string;
}

const OVERLAP_BADGES: Record<
  OnJavaLink["overlapType"],
  { label: string; tone: string; desc: string }
> = {
  "full-overlap": {
    label: "完全重叠",
    tone: "overlap-full",
    desc: "语法与基础规则与主线完全一致，原书作为权威对照参考",
  },
  extension: {
    label: "深度扩展",
    tone: "overlap-extension",
    desc: "在主线语法之上，原书从内存模型或底层机制展开深度剖析",
  },
  "gap-supplement": {
    label: "缺口补充",
    tone: "overlap-gap",
    desc: "补充面向对象高级设计原则（如组合优于继承、接口解耦）",
  },
  advanced: {
    label: "进阶思考",
    tone: "overlap-advanced",
    desc: "涉及多态分派、隐蔽副作用等工程踩坑进阶议题",
  },
};

export function OnJavaCard({ lessonId }: OnJavaCardProps) {
  const link = (catalog.onJavaLinks ?? []).find((l) => l.lessonId === lessonId);
  if (!link) return null;

  const badge = OVERLAP_BADGES[link.overlapType] ?? OVERLAP_BADGES.extension;

  return (
    <div className="on-java-card">
      <div className="on-java-header">
        <div className="on-java-tag">
          <BookOpen size={16} />
          <span>权威教材深度延伸 ·《On Java 8》</span>
        </div>
        <span className={`on-java-overlap-badge ${badge.tone}`} title={badge.desc}>
          {badge.label}
        </span>
      </div>

      <div className="on-java-content">
        <div className="on-java-reference-meta">
          <span className="on-java-chapter">{link.bookChapter}</span>
          <span className="on-java-pages">PDF 第 {link.pdfPages} 页</span>
        </div>

        <p className="on-java-rationale">{link.rationale}</p>

        {link.modernJdkDiff && (
          <div className="on-java-jdk-diff">
            <div className="on-java-jdk-diff-title">
              <Sparkles size={14} />
              <span>现代 JDK 演进与演变说明（区别于 Java 8 历史观点）</span>
            </div>
            <p className="on-java-jdk-diff-body">{link.modernJdkDiff}</p>
          </div>
        )}
      </div>

      <div className="on-java-footer">
        <span className="on-java-tip">
          💡 提示：项目不生成冗余的第二条 Java 路线，此模块作为该课时的深度思维补充。
        </span>
      </div>
    </div>
  );
}
