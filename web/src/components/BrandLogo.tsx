interface BrandLogoProps {
  size?: number;
  className?: string;
}

export function BrandLogo({ size = 38, className = "" }: BrandLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`brand-logo-svg ${className}`}
      aria-label="JavaRoadmap Lab Logo"
    >
      <defs>
        {/* 深邃暗金渐变底座 */}
        <linearGradient
          id="brand-bg"
          x1="0"
          y1="0"
          x2="40"
          y2="40"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#1E232B" />
          <stop offset="50%" stopColor="#15191F" />
          <stop offset="100%" stopColor="#0D1014" />
        </linearGradient>

        {/* 精致微光边框 */}
        <linearGradient
          id="brand-border"
          x1="0"
          y1="0"
          x2="40"
          y2="40"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.28" />
          <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.04" />
        </linearGradient>

        {/* 代码斜杠/编译火花渐变 */}
        <linearGradient
          id="brand-slash"
          x1="23"
          y1="11"
          x2="29"
          y2="29"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="60%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        {/* 内部暖色氛围微晕 */}
        <radialGradient
          id="brand-ambient"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(27 13) rotate(45) scale(15)"
        >
          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 现代圆角方形底板 (Squircle) */}
      <rect
        x="0.75"
        y="0.75"
        width="38.5"
        height="38.5"
        rx="10"
        fill="url(#brand-bg)"
        stroke="url(#brand-border)"
        strokeWidth="1.5"
      />

      {/* 暖色微光层 */}
      <rect
        x="1.5"
        y="1.5"
        width="37"
        height="37"
        rx="9"
        fill="url(#brand-ambient)"
      />

      {/* 路线轨迹 J (Roadmap Track) */}
      {/* 顶栏学习锚点横轨 */}
      <path
        d="M10.5 12H20"
        stroke="#F4F4F5"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* 主轴垂直下沉与优雅平滑拐角 */}
      <path
        d="M17.5 12V22C17.5 25.4 14.8 28.2 11.4 28.2C9.4 28.2 7.7 27 7 25"
        stroke="#F4F4F5"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* 路线里程碑节点 (Milestone Nodes) */}
      <circle cx="10.5" cy="12" r="2.2" fill="#F59E0B" />
      <circle cx="17.5" cy="18.5" r="1.6" fill="#F4F4F5" />
      <circle cx="7.5" cy="25" r="2" fill="#F59E0B" />

      {/* 动态代码斜杠 (Code Slash / Compiler / Lab) */}
      <path
        d="M23 28.5L28.5 11.5"
        stroke="url(#brand-slash)"
        strokeWidth="2.8"
        strokeLinecap="round"
      />

      {/* 终端闪烁点标 */}
      <circle cx="30" cy="28" r="1.3" fill="#FBBF24" />
    </svg>
  );
}
