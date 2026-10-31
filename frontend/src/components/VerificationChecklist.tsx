"use client";

import React, { useState } from "react";
import { VerificationChecklistItem } from "../lib/types";
import { CheckSquare, Square, Mail, ExternalLink, ChevronDown, ChevronUp, Copy, Check, Sparkles, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  checklist: VerificationChecklistItem[];
  onToggleVerified: (itemId: string, verified: boolean) => void;
  isLoading?: boolean;
  onExport?: () => void;
}

export const VerificationChecklist: React.FC<Props> = ({
  checklist,
  onToggleVerified,
  isLoading,
  onExport
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(checklist[0]?.id || null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyEmail = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleKeyDownCheckbox = (e: React.KeyboardEvent, id: string, verified: boolean) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggleVerified(id, !verified);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-4"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            Prioritized Verification Checklist & Action Kit ({checklist.length})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ranked by <strong>Impact × Uncertainty</strong>. Checking items off dynamically boosts your Decision Readiness Score.
          </p>
        </div>

        {onExport && (
          <button
            onClick={onExport}
            className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-600/20 dark:hover:bg-emerald-600/30 dark:text-emerald-300 dark:border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
            title="Download report or print PDF"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Export Action Kit</span>
          </button>
        )}
      </div>

      <div className="space-y-3">
        {checklist.map((item, idx) => {
          const isExpanded = expandedId === item.id;

          return (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className={`border rounded-xl transition-colors duration-300 shadow-sm ${
                item.verified_by_user
                  ? "bg-emerald-50/70 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800/50"
                  : item.priority_score >= 80
                  ? "bg-rose-50/40 border-rose-200 hover:border-rose-300 dark:bg-slate-950/80 dark:border-rose-900/50 dark:hover:border-rose-800"
                  : "bg-slate-50/50 border-slate-200 hover:border-slate-300 dark:bg-slate-950/60 dark:border-slate-800 dark:hover:border-slate-700"
              }`}
            >
              <div className="p-4 flex items-center justify-between gap-4">
                {/* Left: Accessible Checkbox & Title */}
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <button
                    role="checkbox"
                    aria-checked={item.verified_by_user}
                    aria-label={`Mark ${item.title} as ${item.verified_by_user ? "unverified" : "verified"}`}
                    onClick={() => onToggleVerified(item.id, !item.verified_by_user)}
                    onKeyDown={(e) => handleKeyDownCheckbox(e, item.id, item.verified_by_user)}
                    className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-transform active:scale-95 shrink-0 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 rounded cursor-pointer"
                  >
                    {item.verified_by_user ? (
                      <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                        <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </motion.div>
                    ) : (
                      <Square className="w-5 h-5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500">
                        #{item.priority_rank}
                      </span>
                      <span
                        className={`text-sm font-semibold truncate transition-all ${
                          item.verified_by_user
                            ? "line-through text-slate-400 dark:text-slate-500"
                            : "text-slate-900 dark:text-slate-100"
                        }`}
                      >
                        {item.title}
                      </span>
                      {item.verified_by_user && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" /> Verified
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block truncate mt-0.5">
                      {item.recommended_action}
                    </span>
                  </div>
                </div>

                {/* Right: Scores & Expand Button */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="hidden sm:flex items-center gap-1.5 text-xs">
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">Priority:</span>
                    <span
                      className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                        item.verified_by_user
                          ? "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500"
                          : item.priority_score >= 80
                          ? "bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30"
                          : item.priority_score >= 40
                          ? "bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30"
                          : "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-transparent"
                      }`}
                    >
                      {item.priority_score} ({item.impact_score}×{item.uncertainty_score})
                    </span>
                  </div>

                  <button
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    aria-expanded={isExpanded}
                    aria-label={`Toggle action kit for ${item.title}`}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span className="text-[11px] hidden sm:inline">Verification Kit</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Collapsible Verification Kit Panel with AnimatePresence */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="border-t border-slate-200 dark:border-slate-800/80 p-4 bg-slate-50/70 dark:bg-slate-900/50 space-y-4 text-xs overflow-hidden"
                  >
                    {/* Action recommendation */}
                    <div>
                      <span className="text-slate-600 dark:text-slate-400 font-semibold block text-[11px] uppercase tracking-wider mb-1">
                        Recommended Verification Protocol
                      </span>
                      <p className="text-slate-800 dark:text-slate-200 leading-relaxed bg-white dark:bg-slate-950/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                        {item.recommended_action}
                      </p>
                    </div>

                    {/* Official links */}
                    {item.official_links.length > 0 && (
                      <div>
                        <span className="text-slate-600 dark:text-slate-400 font-semibold block text-[11px] uppercase tracking-wider mb-1.5">
                          Official Direct Links & Portals
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {item.official_links.map((link, lIdx) => (
                            <a
                              key={lIdx}
                              href={link.split(" ")[0]}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800/50 dark:hover:bg-cyan-900/40 transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>{link}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Draft clarification email */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-slate-600 dark:text-slate-400 font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                          Ready-to-Send Draft Query Email
                        </span>
                        <button
                          onClick={() => handleCopyEmail(item.id, item.draft_email_query)}
                          className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-700 dark:text-cyan-400 dark:hover:text-cyan-300 cursor-pointer font-medium"
                        >
                          {copiedId === item.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Copied to Clipboard!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" /> Copy Draft
                            </>
                          )}
                        </button>
                      </div>

                      <pre className="bg-white dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-800 dark:text-slate-300 whitespace-pre-wrap leading-relaxed select-all">
                        {item.draft_email_query}
                      </pre>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
