"use client";

import React, { useEffect, useState } from "react";
import { ReadinessScore } from "../lib/types";
import { ShieldCheck, AlertTriangle, AlertOctagon, Sparkles, TrendingUp, HelpCircle } from "lucide-react";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import { ReadinessMeterSkeleton } from "./Skeletons";

interface Props {
  scoreData?: ReadinessScore;
  isLoading?: boolean;
}

// Animated score number component
const AnimatedNumber: React.FC<{ value: number }> = ({ value }) => {
  const spring = useSpring(value, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => Math.round(current));
  const [currentVal, setCurrentVal] = useState(value);

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    const unsubscribe = display.on("change", (latest) => {
      setCurrentVal(latest);
    });
    return () => unsubscribe();
  }, [display]);

  return <span>{currentVal}</span>;
};

export const ReadinessMeter: React.FC<Props> = ({ scoreData, isLoading }) => {
  if (isLoading) {
    return <ReadinessMeterSkeleton />;
  }

  if (!scoreData) {
    return null;
  }

  const { score, status, breakdown, summary } = scoreData;

  const getScoreTheme = (val: number) => {
    if (val >= 80) {
      return {
        stroke: "#059669", // emerald
        text: "text-emerald-700 dark:text-emerald-400",
        bg: "bg-emerald-50/70 dark:bg-emerald-950/25",
        border: "border-emerald-200 dark:border-emerald-800/40",
        badge: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30",
        ringShadow: "shadow-emerald-500/5 dark:shadow-emerald-500/10",
        icon: ShieldCheck
      };
    }
    if (val >= 50) {
      return {
        stroke: "#d97706", // amber
        text: "text-amber-700 dark:text-amber-400",
        bg: "bg-amber-50/70 dark:bg-amber-950/25",
        border: "border-amber-200 dark:border-amber-800/40",
        badge: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30",
        ringShadow: "shadow-amber-500/5 dark:shadow-amber-500/10",
        icon: AlertTriangle
      };
    }
    return {
      stroke: "#e11d48", // rose
      text: "text-rose-700 dark:text-rose-400",
      bg: "bg-rose-50/70 dark:bg-rose-950/25",
      border: "border-rose-200 dark:border-rose-800/40",
      badge: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30",
      ringShadow: "shadow-rose-500/5 dark:shadow-rose-500/10",
      icon: AlertOctagon
    };
  };

  const theme = getScoreTheme(score);
  const StatusIcon = theme.icon;

  // SVG Gauge calculations
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <motion.section
      layout
      aria-label="Decision Readiness Assessment"
      aria-live="polite"
      className={`rounded-2xl p-6 border ${theme.border} ${theme.bg} ${theme.ringShadow} backdrop-blur-md shadow-2xl transition-colors duration-500 relative overflow-hidden`}
    >
      {/* Subtle background glow */}
      <div
        className="absolute -right-24 -bottom-24 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ backgroundColor: theme.stroke }}
      />

      <div className="flex flex-col md:flex-row items-center gap-6 justify-between relative z-10">
        
        {/* Circular Gauge with spring SVG stroke */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg
            className="w-44 h-44 transform -rotate-90"
            viewBox="0 0 160 160"
            aria-hidden="true"
          >
            {/* Background track */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="currentColor"
              strokeWidth="11"
              fill="transparent"
              className="text-slate-200 dark:text-slate-800/80"
            />
            {/* Dynamic animated progress ring */}
            <motion.circle
              cx="80"
              cy="80"
              r={radius}
              stroke={theme.stroke}
              strokeWidth="11"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className={`text-4xl font-extrabold tracking-tight ${theme.text}`}>
              <AnimatedNumber value={score} />
            </span>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">
              / 100
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-wide">Readiness</span>
          </div>
        </div>

        {/* Status, Description & Penalties */}
        <div className="flex-1 space-y-3.5 text-center md:text-left w-full">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
            <AnimatePresence mode="wait">
              <motion.span
                key={status}
                initial={{ opacity: 0, y: -4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${theme.badge} shadow-xs`}
              >
                <StatusIcon className="w-3.5 h-3.5" />
                {status}
              </motion.span>
            </AnimatePresence>

            <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
              Live Decision-Readiness Meter
            </span>
          </div>

          <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center justify-center md:justify-start gap-2">
            Decision Readiness Score
          </h3>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
            {summary}
          </p>

          {/* Breakdown Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
            <div className="bg-white/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 shadow-xs">
              <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-medium">Base Coverage</span>
              <span className="text-slate-900 dark:text-slate-100 font-bold text-sm">{breakdown.base_coverage_score}%</span>
            </div>

            <div className="bg-rose-50/80 dark:bg-slate-900/80 border border-rose-200 dark:border-rose-950/60 rounded-xl p-2.5 shadow-xs">
              <span className="text-rose-700 dark:text-rose-400/90 block text-[11px] font-medium">Conflict Penalty</span>
              <span className="text-rose-700 dark:text-rose-300 font-bold text-sm">
                {breakdown.conflict_penalty > 0 ? `-${breakdown.conflict_penalty}` : "0"} pts
              </span>
            </div>

            <div className="bg-amber-50/80 dark:bg-slate-900/80 border border-amber-200 dark:border-amber-950/60 rounded-xl p-2.5 shadow-xs">
              <span className="text-amber-700 dark:text-amber-400/90 block text-[11px] font-medium">Freshness Drift</span>
              <span className="text-amber-700 dark:text-amber-300 font-bold text-sm">
                {breakdown.freshness_penalty > 0 ? `-${breakdown.freshness_penalty}` : "0"} pts
              </span>
            </div>

            <div className="bg-emerald-50/80 dark:bg-slate-900/80 border border-emerald-200 dark:border-emerald-950/60 rounded-xl p-2.5 shadow-xs">
              <span className="text-emerald-700 dark:text-emerald-400/90 block text-[11px] font-medium flex items-center justify-center md:justify-start gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                Verified Bonus
              </span>
              <span className="text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                +{breakdown.user_verified_bonus} pts
              </span>
            </div>
          </div>
        </div>

      </div>
    </motion.section>
  );
};
