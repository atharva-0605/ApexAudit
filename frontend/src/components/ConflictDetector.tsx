"use client";

import React from "react";
import { ConflictFinding, TemporalDriftFinding } from "../lib/types";
import { AlertTriangle, Clock, ArrowRightLeft, ShieldAlert, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { ConflictSkeleton } from "./Skeletons";
import { NoConflictsState } from "./EmptyAndErrorStates";

interface Props {
  conflicts: ConflictFinding[];
  temporalDrifts: TemporalDriftFinding[];
  isLoading?: boolean;
}

export const ConflictDetector: React.FC<Props> = ({
  conflicts,
  temporalDrifts,
  isLoading
}) => {
  if (isLoading) {
    return <ConflictSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Conflicts Section */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs dark:shadow-xl space-y-4 transition-colors duration-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
              Conflict Detector & Contradictory Claims ({conflicts.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Contrasting criteria and policy disagreements surfaced side-by-side with exact verbatim citations.
            </p>
          </div>

          {conflicts.length > 0 ? (
            <span className="px-3 py-1 bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30 rounded-full text-xs font-semibold flex items-center gap-1.5 shrink-0">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              {conflicts.length} Contradiction{conflicts.length > 1 ? "s" : ""} Found
            </span>
          ) : (
            <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30 rounded-full text-xs font-semibold flex items-center gap-1.5 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Clean Alignment
            </span>
          )}
        </div>

        {conflicts.length === 0 ? (
          <NoConflictsState />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {conflicts.map((cnf, idx) => (
              <motion.div
                key={cnf.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-rose-50/40 dark:bg-slate-950/70 border border-rose-200 dark:border-rose-900/40 hover:border-rose-300 dark:hover:border-rose-700/60 rounded-xl p-4 transition-all space-y-3 shadow-xs dark:shadow-lg"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-200/60 dark:border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-rose-950 dark:text-rose-300 text-sm">{cnf.aspect_name}</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/30">
                      {cnf.severity} Discrepancy
                    </span>
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-400 italic">
                    {cnf.contrast_summary}
                  </span>
                </div>

                {/* Side-by-side comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 relative">
                  {/* Visual central link on desktop */}
                  <div className="hidden md:flex absolute inset-0 items-center justify-center pointer-events-none z-10">
                    <span className="w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-rose-600 dark:text-rose-400 flex items-center justify-center text-[10px] font-bold shadow-xs">
                      VS
                    </span>
                  </div>

                  {/* Source A */}
                  <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/90 rounded-xl p-3.5 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-indigo-900 dark:text-cyan-300 truncate max-w-[240px]" title={cnf.source_a_title}>
                        Source A: {cnf.source_a_title}
                      </span>
                    </div>
                    <blockquote className="text-xs text-slate-800 dark:text-slate-200 border-l-2 border-indigo-500 dark:border-cyan-400 pl-3 italic leading-relaxed py-0.5">
                      &quot;{cnf.quote_a}&quot;
                    </blockquote>
                  </div>

                  {/* Source B */}
                  <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/90 rounded-xl p-3.5 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-amber-900 dark:text-amber-300 truncate max-w-[240px]" title={cnf.source_b_title}>
                        Source B: {cnf.source_b_title}
                      </span>
                    </div>
                    <blockquote className="text-xs text-slate-800 dark:text-slate-200 border-l-2 border-amber-500 dark:border-amber-400 pl-3 italic leading-relaxed py-0.5">
                      &quot;{cnf.quote_b}&quot;
                    </blockquote>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Temporal Drift Section */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs dark:shadow-xl space-y-4 transition-colors duration-200">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            Temporal Drift & Stale Rule Signals ({temporalDrifts.length})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Identifies sources published in prior years or referencing superseded operational circulars.
          </p>
        </div>

        {temporalDrifts.length === 0 ? (
          <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl p-6 text-center text-sm text-slate-500 dark:text-slate-400">
            No temporal obsolescence detected. Ingested sources represent current guideline cycles.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {temporalDrifts.map((td, idx) => (
              <motion.div
                key={td.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 hover:border-amber-300 dark:hover:border-amber-700/60 rounded-xl p-4 text-xs space-y-2 transition-all shadow-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-amber-900 dark:text-amber-300 truncate" title={td.source_title}>
                    {td.source_title}
                  </span>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30 rounded text-[10px] font-bold uppercase shrink-0">
                    Dated {td.detected_date || "Past Year"}
                  </span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">{td.reason}</p>
                <p className="text-amber-800 dark:text-amber-400/90 text-[11px] font-medium italic pt-0.5">
                  💡 {td.caution_message}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
