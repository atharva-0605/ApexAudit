"use client";

import React from "react";

interface ApexLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const ApexLogo: React.FC<ApexLogoProps> = ({
  size = "md",
  className = ""
}) => {
  const sizeMap = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
    xl: "w-12 h-12"
  };

  const dim = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${dim} ${className}`}
      aria-label="ApexAudit Logo"
    >
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xs select-none"
      >
        <defs>
          {/* Primary Gradient: Deep Indigo to Vivid Cobalt */}
          <linearGradient id="apexGradPrimary" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4f46e5" /> {/* indigo-600 */}
            <stop offset="50%" stopColor="#2563eb" /> {/* blue-600 */}
            <stop offset="100%" stopColor="#06b6d4" /> {/* cyan-500 */}
          </linearGradient>

          {/* Secondary Audit Accent Gradient: Emerald to Cyan */}
          <linearGradient id="apexGradAccent" x1="12" y1="20" x2="28" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10b981" /> {/* emerald-500 */}
            <stop offset="100%" stopColor="#06b6d4" /> {/* cyan-500 */}
          </linearGradient>

          {/* Soft Shadow Filter */}
          <filter id="apexGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#4f46e5" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Outer Apex Prism Chevron / Mountain Peak */}
        <path
          d="M20 4L35 32H27.5L20 17.5L12.5 32H5L20 4Z"
          fill="url(#apexGradPrimary)"
          filter="url(#apexGlow)"
        />

        {/* Inner Audit Cross-Verification Jewel (Ascending Peak Anchor) */}
        <path
          d="M20 12.5L27 26.5H22.5L20 21.5L17.5 26.5H13L20 12.5Z"
          fill="#ffffff"
          opacity="0.95"
        />

        {/* Verification Checkpoint Core Node */}
        <circle
          cx="20"
          cy="31"
          r="2.5"
          fill="url(#apexGradAccent)"
        />
      </svg>
    </div>
  );
};

export default ApexLogo;
