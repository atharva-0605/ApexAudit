"use client";

import React from "react";
import { ThreeLaneTrust as ThreeLaneType } from "../lib/types";
import { CheckCircle2, Lightbulb, AlertOctagon, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { TrustLaneSkeleton } from "./Skeletons";

interface Props {
  trustData: ThreeLaneType;
  isLoading?: boolean;
}

export const ThreeLaneTrustDashboard: React.FC<Props> = ({ trustData, isLoading }) => {
  if (isLoading) {
    return <TrustLaneSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs dark:shadow-xl space-y-4 transition-colors duration-200"
    >
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-600 dark:bg-violet-400"></span>
          Three-Lane Trust Dashboard
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Separates verified facts with literal citations from AI pre-mortem assumptions and unaddressed blind spots.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        
        {/* Lane 1: Quote-Grounded */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-emerald-50/30 dark:bg-slate-950/70 border border-emerald-200 dark:border-emerald-900/40 rounded-xl p-4 space-y-3 shadow-xs"
        >
          <div className="flex items-center justify-between border-b border-emerald-200/60 dark:border-slate-800 pb-2">
            <span className="font-bold text-sm text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Quote-Grounded Facts
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-transparent">
              {trustData.quote_grounded.length} verified
            </span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            Backed by literal verbatim quotations matched directly in raw source text.
          </p>

          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {trustData.quote_grounded.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="bg-white dark:bg-slate-900/80 border border-emerald-200/80 dark:border-emerald-950 rounded-lg p-2.5 text-xs space-y-1.5 hover:border-emerald-300 dark:hover:border-emerald-800/60 transition-colors shadow-xs"
              >
                <span className="font-semibold text-slate-900 dark:text-slate-200 block truncate">
                  {item.claim_text}
                </span>
                <blockquote className="text-emerald-900 dark:text-emerald-300/90 italic text-[11px] border-l-2 border-emerald-600 dark:border-emerald-500 pl-2 leading-relaxed bg-emerald-50/50 dark:bg-slate-950/40 py-1 rounded-r">
                  &quot;{item.exact_quote.slice(0, 110)}...&quot;
                </blockquote>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Lane 2: AI-Suggested */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-indigo-50/30 dark:bg-slate-950/70 border border-indigo-200 dark:border-blue-900/40 rounded-xl p-4 space-y-3 shadow-xs"
        >
          <div className="flex items-center justify-between border-b border-indigo-200/60 dark:border-slate-800 pb-2">
            <span className="font-bold text-sm text-indigo-800 dark:text-blue-400 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-indigo-600 dark:text-blue-400" />
              AI-Inferred Requirements
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-transparent">
              {trustData.ai_suggested.length} rules
            </span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            Derived from pre-mortem failure scenarios requiring manual verification against criteria.
          </p>

          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {trustData.ai_suggested.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="bg-white dark:bg-slate-900/80 border border-indigo-200/80 dark:border-blue-950 rounded-lg p-2.5 text-xs space-y-1 hover:border-indigo-300 dark:hover:border-blue-800/60 transition-colors shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 dark:text-slate-200">{item.aspect}</span>
                  <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-transparent">
                    {item.criticality}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-snug">
                  Potential Failure: {item.suggested_risk_rule}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Lane 3: Not Found / Blind Spots */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-rose-50/30 dark:bg-slate-950/70 border border-rose-200 dark:border-rose-900/40 rounded-xl p-4 space-y-3 shadow-xs"
        >
          <div className="flex items-center justify-between border-b border-rose-200/60 dark:border-slate-800 pb-2">
            <span className="font-bold text-sm text-rose-800 dark:text-rose-400 flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              Not Found in Sources
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-transparent">
              {trustData.not_found.length} gaps
            </span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            Crucial knowledge items absent from all sources reviewed—high real-world blindspot hazard.
          </p>

          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {trustData.not_found.length === 0 ? (
              <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-lg text-center text-xs text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800/80">
                All pre-mortem requirements received some degree of evidence in the sources reviewed.
              </div>
            ) : (
              trustData.not_found.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="bg-white dark:bg-slate-900/80 border border-rose-200/80 dark:border-rose-950 rounded-lg p-2.5 text-xs space-y-1.5 hover:border-rose-300 dark:hover:border-rose-800/60 transition-colors shadow-xs"
                >
                  <span className="font-bold text-rose-900 dark:text-rose-300 block">
                    {item.aspect}
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                    {item.gap_description}
                  </p>
                  <p className="text-rose-800 dark:text-rose-400/90 text-[10px] italic">
                    Risk: {item.failure_risk}
                  </p>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};
