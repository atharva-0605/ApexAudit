"use client";

import React from "react";
import { IndependenceEdge } from "../lib/types";
import { Network, Copy, CheckCircle2, AlertOctagon } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  edges: IndependenceEdge[];
  isLoading?: boolean;
}

export const EchoGraph: React.FC<Props> = ({ edges, isLoading }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs dark:shadow-xl space-y-4 transition-colors duration-200"
    >
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400"></span>
          Source Independence & Echo Detector ({edges.length} Pair Relationships)
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Surfaces echo chambers, syndicated content, and duplicate origins where multiple blogs repeat identical unverified text.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {edges.map((edge, idx) => {
          const isEcho = edge.relation_type === "echo_source";
          const isDerived = edge.relation_type === "derived_copy";

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`rounded-xl p-4 border transition-all text-xs space-y-3 shadow-xs dark:shadow-lg ${
                isEcho
                  ? "bg-rose-50/60 border-rose-200 dark:bg-rose-950/20 dark:border-rose-800/50 hover:border-rose-300 dark:hover:border-rose-600"
                  : isDerived
                  ? "bg-amber-50/60 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/40 hover:border-amber-300 dark:hover:border-amber-600"
                  : "bg-slate-50/70 border-slate-200 dark:bg-slate-950/60 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="font-semibold text-slate-900 dark:text-slate-200">
                  {edge.source_a_title.slice(0, 26)}... ⟷ {edge.source_b_title.slice(0, 26)}...
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    isEcho
                      ? "bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40"
                      : isDerived
                      ? "bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30"
                      : "bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                  }`}
                >
                  {edge.relation_type.replace("_", " ")}
                </span>
              </div>

              {/* Similarity bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">N-gram Overlap Similarity:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {Math.round(edge.similarity_score * 100)}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${
                      isEcho
                        ? "bg-rose-500"
                        : isDerived
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round(edge.similarity_score * 100)}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </div>
              </div>

              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {edge.risk_summary}
              </p>

              {edge.shared_phrases.length > 0 && (
                <div className="bg-white dark:bg-slate-900/90 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/80 space-y-1 shadow-xs">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">
                    Shared Verbatim Phrasing:
                  </span>
                  {edge.shared_phrases.map((phrase, pIdx) => (
                    <p key={pIdx} className="text-slate-700 dark:text-slate-300 italic text-[11px] truncate">
                      &quot;{phrase}&quot;
                    </p>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
