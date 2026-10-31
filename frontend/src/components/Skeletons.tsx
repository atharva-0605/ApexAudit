"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, CheckCircle2, Loader2 } from "lucide-react";

export const ShimmerBar: React.FC<{ className?: string }> = ({ className = "h-4 w-full" }) => (
  <div
    className={`bg-slate-200 dark:bg-slate-800/80 rounded-md overflow-hidden relative ${className}`}
  >
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-slate-300/60 dark:via-slate-700/40 to-transparent" />
  </div>
);

export const ReadinessMeterSkeleton: React.FC = () => (
  <div className="rounded-2xl p-6 border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/40 shadow-sm dark:shadow-xl animate-pulse">
    <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
      {/* Gauge Placeholder */}
      <div className="relative w-44 h-44 rounded-full border-8 border-slate-200 dark:border-slate-800/70 flex items-center justify-center shrink-0">
        <div className="w-24 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg" />
      </div>

      {/* Info & Bars */}
      <div className="flex-1 space-y-3 w-full">
        <div className="flex items-center gap-2">
          <div className="w-32 h-6 bg-slate-200 dark:bg-slate-800 rounded-full" />
          <div className="w-24 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
        <div className="w-48 h-6 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="w-full h-12 bg-slate-100 dark:bg-slate-800/60 rounded-lg" />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800/70 rounded-lg p-2.5 space-y-1.5">
              <div className="w-16 h-3 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="w-12 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const MatrixSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-4">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 dark:bg-cyan-400 animate-ping" />
          <ShimmerBar className="w-64 h-5" />
        </div>
        <ShimmerBar className="w-96 h-3.5" />
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-20 h-6 bg-slate-100 dark:bg-slate-800/60 rounded-md" />
        ))}
      </div>
    </div>

    {/* Table Skeleton */}
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
      <div className="bg-slate-50 dark:bg-slate-950/80 p-3.5 border-b border-slate-200 dark:border-slate-800 flex gap-4">
        <ShimmerBar className="w-1/3 h-4" />
        <ShimmerBar className="w-1/5 h-4" />
        <ShimmerBar className="w-1/5 h-4" />
        <ShimmerBar className="w-1/5 h-4" />
      </div>
      <div className="divide-y divide-slate-200 dark:divide-slate-800/60 bg-white dark:bg-slate-900/30">
        {[1, 2, 3, 4, 5].map((row) => (
          <div key={row} className="p-3.5 flex items-center gap-4">
            <div className="w-1/3 space-y-2">
              <div className="flex items-center gap-2">
                <ShimmerBar className="w-40 h-4" />
                <div className="w-12 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
              <ShimmerBar className="w-full h-3" />
            </div>
            <div className="w-1/5">
              <div className="h-9 bg-slate-100 dark:bg-slate-800/50 rounded-lg p-2 border border-slate-200 dark:border-slate-700/30" />
            </div>
            <div className="w-1/5">
              <div className="h-9 bg-slate-100 dark:bg-slate-800/50 rounded-lg p-2 border border-slate-200 dark:border-slate-700/30" />
            </div>
            <div className="w-1/5">
              <div className="h-9 bg-slate-100 dark:bg-slate-800/50 rounded-lg p-2 border border-slate-200 dark:border-slate-700/30" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const ConflictSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-4">
      <div className="space-y-1.5">
        <ShimmerBar className="w-72 h-5" />
        <ShimmerBar className="w-96 h-3.5" />
      </div>

      <div className="grid grid-cols-1 gap-4 pt-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-slate-50/70 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
              <ShimmerBar className="w-48 h-4" />
              <div className="w-24 h-5 bg-rose-100 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-lg p-3 space-y-2">
                <ShimmerBar className="w-32 h-3.5" />
                <ShimmerBar className="w-full h-8" />
              </div>
              <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-lg p-3 space-y-2">
                <ShimmerBar className="w-32 h-3.5" />
                <ShimmerBar className="w-full h-8" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const TrustLaneSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-4">
    <div className="space-y-1.5">
      <ShimmerBar className="w-64 h-5" />
      <ShimmerBar className="w-96 h-3.5" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
      {[1, 2, 3].map((lane) => (
        <div key={lane} className="bg-slate-50/70 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
            <ShimmerBar className="w-36 h-4" />
            <div className="w-16 h-4 bg-slate-200 dark:bg-slate-800 rounded-full" />
          </div>
          <ShimmerBar className="w-full h-3" />
          <div className="space-y-2.5 pt-1">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 space-y-1.5">
                <ShimmerBar className="w-3/4 h-3.5" />
                <ShimmerBar className="w-full h-6" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const PipelineProgress: React.FC<{ currentStep: number; totalSteps?: number }> = ({
  currentStep,
  totalSteps = 5
}) => {
  const steps = [
    "Ingesting & parsing source documents",
    "Deriving pre-mortem failure blueprint",
    "Running strict verbatim quote verification",
    "Detecting contradictory policies & echo loops",
    "Synthesizing Decision Readiness Score"
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-indigo-50/80 dark:bg-cyan-950/40 border border-indigo-200 dark:border-cyan-800/60 rounded-2xl p-5 shadow-sm dark:shadow-2xl space-y-3.5 backdrop-blur-md"
    >
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-indigo-600 dark:text-cyan-400 animate-spin" />
          <span className="font-bold text-indigo-900 dark:text-cyan-200 uppercase tracking-wider">
            Analysis Pipeline In Progress
          </span>
        </div>
        <span className="font-mono text-indigo-600 dark:text-cyan-400 font-semibold">
          Step {Math.min(currentStep, totalSteps)} of {totalSteps}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden border border-indigo-100 dark:border-cyan-900/60">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-500 dark:from-cyan-500 dark:via-blue-500 dark:to-emerald-400 rounded-full"
          initial={{ width: "10%" }}
          animate={{ width: `${(Math.min(currentStep, totalSteps) / totalSteps) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-1 text-[11px]">
        {steps.map((label, idx) => {
          const isDone = currentStep > idx + 1;
          const isCurrent = currentStep === idx + 1;

          return (
            <div
              key={idx}
              className={`p-2 rounded-lg border transition-all ${
                isCurrent
                  ? "bg-indigo-100 border-indigo-500 text-indigo-900 font-semibold shadow-sm dark:bg-cyan-500/20 dark:border-cyan-400 dark:text-cyan-200 dark:shadow-cyan-500/20"
                  : isDone
                  ? "bg-white dark:bg-slate-900/80 border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                  : "bg-slate-100/80 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/80 text-slate-500"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                {isDone ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-3 h-3 text-indigo-600 dark:text-cyan-400 animate-spin shrink-0" />
                ) : (
                  <span className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center text-[9px]">
                    {idx + 1}
                  </span>
                )}
                <span className="truncate">Phase {idx + 1}</span>
              </div>
              <p className="text-[10px] leading-tight line-clamp-2">{label}</p>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
