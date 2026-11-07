// 品牌标识：书本 × 代码符号（Knowledge × Code）。
// 资产来自 Logo Kit 的 SVG 矢量源（public/brand/），浅色/深色各一份，
// 由主题属性切换显示；禁止拉伸与重新着色，比例固定 188×48 / 32×32。
interface BrandLogoProps {
  /** 渲染高度（CSS px）。nav 锁定版宽 = 高 × 188/48；icon 版为正方形。 */
  height?: number;
  variant?: "nav" | "icon";
  className?: string;
}

export function BrandLogo({
  height = 48,
  variant = "icon",
  className = "",
}: BrandLogoProps) {
  const isNav = variant === "nav";
  const width = isNav ? Math.round((height * 188) / 48) : height;
  const suffix = isNav ? "nav" : "icon-small";
  const base = `${import.meta.env.BASE_URL}brand/`;
  return (
    <span className={`brand-logo ${className}`} style={{ height }}>
      <img
        className="brand-asset brand-asset-light"
        src={`${base}javaroadmap-${suffix}.svg`}
        width={width}
        height={height}
        alt="JavaRoadmap Lab"
      />
      <img
        className="brand-asset brand-asset-dark"
        src={`${base}javaroadmap-${suffix}-dark.svg`}
        width={width}
        height={height}
        alt=""
        aria-hidden="true"
      />
    </span>
  );
}
