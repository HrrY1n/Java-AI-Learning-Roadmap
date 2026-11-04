interface BrandLogoProps {
  size?: number;
  className?: string;
}

/** 品牌图形：路线里程碑节点与终端提示符（>_）组合，表达持续实践的成长路径。 */
export function BrandLogo({ size = 38, className = "" }: BrandLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`brand-logo-svg ${className}`}
      aria-label="JavaRoadmap Lab Logo"
    >
      <defs>
        {/* 深邃黑曜石渐变底座 */}
        <linearGradient
          id="conceptB-bg"
          x1="0"
          y1="0"
          x2="100"
          y2="100"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#1E232B" />
          <stop offset="50%" stopColor="#15191F" />
          <stop offset="100%" stopColor="#0E1115" />
        </linearGradient>

        {/* 细腻高光边框 */}
        <linearGradient
          id="conceptB-border"
          x1="0"
          y1="0"
          x2="100"
          y2="100"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.25" />
          <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.10" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.04" />
        </linearGradient>

        {/* 学习路线渐变色 (琥珀金到暖红) */}
        <linearGradient
          id="conceptB-road"
          x1="10"
          y1="90"
          x2="85"
          y2="25"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FDC35C" />
          <stop offset="45%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        {/* 右上方终点旗帜暖光微晕 */}
        <radialGradient
          id="conceptB-glow"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(80 25) rotate(45) scale(35)"
        >
          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 现代圆角矩形底板 (Squircle) */}
      <rect
        x="1.5"
        y="1.5"
        width="97"
        height="97"
        rx="22"
        fill="url(#conceptB-bg)"
        stroke="url(#conceptB-border)"
        strokeWidth="2"
      />

      {/* 暖色环境光 */}
      <rect
        x="1.5"
        y="1.5"
        width="97"
        height="97"
        rx="22"
        fill="url(#conceptB-glow)"
      />

      {/* 终端代码提示符: >_ (纯白极简) */}
      <path
        d="M 18 18 L 30 26.5 L 18 35"
        stroke="#FFFFFF"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 35 35 H 48"
        stroke="#FFFFFF"
        strokeWidth="5.5"
        strokeLinecap="round"
      />

      {/* 蜿蜒向上的学习路线图主干 (Roadmap Path) */}
      <path
        d="M 2 92 C 10 86, 18 80, 32 77 C 52 72, 70 72, 76 65 C 80 61, 70 56, 50 51 C 42 49, 46 41, 62 38 C 70 36.5, 76 35, 80 34"
        stroke="url(#conceptB-road)"
        strokeWidth="8.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 阶段里程碑节点 1 (基础阶段) */}
      <circle
        cx="32"
        cy="77"
        r="7.5"
        fill="#15191F"
        stroke="#FFFFFF"
        strokeWidth="3.2"
      />
      <circle cx="32" cy="77" r="3.8" fill="#F59E0B" />

      {/* 阶段里程碑节点 2 (核心进阶) */}
      <circle
        cx="50"
        cy="51"
        r="7"
        fill="#15191F"
        stroke="#FFFFFF"
        strokeWidth="3"
      />
      <circle cx="50" cy="51" r="3.5" fill="#F59E0B" />

      {/* 阶段里程碑节点 3 (工程实战) */}
      <circle
        cx="74"
        cy="65"
        r="7.5"
        fill="#15191F"
        stroke="#FFFFFF"
        strokeWidth="3.2"
      />
      <circle cx="74" cy="65" r="3.8" fill="#F59E0B" />

      {/* 终点站台与旗杆 (Summit Goal) */}
      <circle
        cx="80"
        cy="34"
        r="4.5"
        fill="#15191F"
        stroke="#FFFFFF"
        strokeWidth="2.2"
      />
      <path
        d="M 80 34 V 10"
        stroke="#FFFFFF"
        strokeWidth="4.5"
        strokeLinecap="round"
      />

      {/* 终点飞扬的暖金色目标旗帜 (Pennant Flag) */}
      <path
        d="M 80 11 L 96 17 L 80 23 Z"
        fill="url(#conceptB-road)"
        stroke="url(#conceptB-road)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
