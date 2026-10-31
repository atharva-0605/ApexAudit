"use client";

import React, { useState, useEffect, useRef } from "react";
import { BlueprintItem, SourceInput, EvidenceMatrixCell, Claim } from "../lib/types";
import { CheckCircle2, AlertTriangle, Clock, HelpCircle, FileText, ExternalLink, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MatrixSkeleton } from "./Skeletons";

interface Props {
  blueprint: BlueprintItem[];
  sources: SourceInput[];
  matrix: EvidenceMatrixCell[];
  isLoading?: boolean;
}

export const EvidenceMatrix: React.FC<Props> = ({
  blueprint,
  sources,
  matrix,
  isLoading
}) => {
  const [selectedCell, setSelectedCell] = useState<{
    aspect: BlueprintItem;
    source: SourceInput;
    cell: EvidenceMatrixCell;
  } | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedCell) {
        setSelectedCell(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCell]);

  // Focus close button on modal open
  useEffect(() => {
    if (selectedCell) {
      setTimeout(() => closeButtonRef.current?.focus(), 50);
    }
  }, [selectedCell]);

  if (isLoading) {
    return <MatrixSkeleton />;
  }

  const getCellData = (aspectId: string, sourceId: string) => {
    return matrix.find((m) => m.aspect_id === aspectId && m.source_id === sourceId);
  };

  const getStatusBadge = (status: EvidenceMatrixCell["status"]) => {
    switch (status) {
      case "Covered":
        return {
          bg: "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30",
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />,
          label: "Covered"
        };
      case "Conflicting":
        return {
          bg: "bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-500/15 dark:hover:bg-rose-500/25 dark:text-rose-400 dark:border-rose-500/40 animate-pulse",
          icon: <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />,
          label: "Conflicting"
        };
      case "Outdated":
        return {
          bg: "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:hover:bg-amber-500/25 dark:text-amber-300 dark:border-amber-500/30",
          icon: <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />,
          label: "Outdated"
        };
      default:
        return {
          bg: "bg-slate-50 hover:bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800/40 dark:hover:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700/40",
          icon: <HelpCircle className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />,
          label: "Missing"
        };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs dark:shadow-xl space-y-4 transition-colors duration-200"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-cyan-400 animate-pulse"></span>
            Evidence Coverage Matrix (Aspects × Sources)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cross-verifies every pre-mortem blueprint aspect against each ingested source text.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-xs flex-wrap" aria-label="Matrix legend">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 text-[11px] font-medium">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Covered
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 text-[11px] font-medium">
            <AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400" /> Conflicting
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 text-[11px] font-medium">
            <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" /> Outdated
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 text-[11px] font-medium">
            <HelpCircle className="w-3 h-3 text-slate-400" /> Missing
          </span>
        </div>
      </div>

      {/* Responsive Matrix Table with Sticky Column */}
      <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl relative">
        <table className="w-full text-left text-sm border-collapse min-w-[680px]">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950/90 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
              <th scope="col" className="p-3.5 font-semibold text-xs tracking-wide uppercase text-slate-600 dark:text-slate-400 w-1/3 min-w-[240px] sticky left-0 bg-slate-50 dark:bg-slate-950 z-10 border-r border-slate-200 dark:border-slate-800/80">
                Pre-Mortem Blueprint Aspect
              </th>
              {sources.map((src) => (
                <th key={src.id} scope="col" className="p-3.5 font-semibold text-xs min-w-[170px]">
                  <div className="flex flex-col">
                    <span className="truncate max-w-[200px] text-slate-900 dark:text-slate-200 font-semibold dark:font-medium" title={src.title}>
                      {src.title}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">
                      {src.source_type} • Auth: {Math.round(src.authority_score * 100)}%
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 bg-white dark:bg-slate-900/30">
            {blueprint.map((bp, rIdx) => (
              <motion.tr
                key={bp.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: rIdx * 0.04 }}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
              >
                <td className="p-3.5 sticky left-0 bg-white dark:bg-slate-900/95 z-10 border-r border-slate-200 dark:border-slate-800/80">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{bp.aspect}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                          bp.criticality === "HIGH"
                            ? "bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30"
                            : bp.criticality === "MEDIUM"
                            ? "bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30"
                            : "bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30"
                        }`}
                      >
                        {bp.criticality}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1" title={bp.failure_scenario}>
                      Failure Risk: {bp.failure_scenario}
                    </span>
                  </div>
                </td>

                {sources.map((src) => {
                  const cell = getCellData(bp.id, src.id);
                  const status = cell ? cell.status : "Missing";
                  const badge = getStatusBadge(status);

                  return (
                    <td key={src.id} className="p-3">
                      <button
                        onClick={() => cell && setSelectedCell({ aspect: bp, source: src, cell })}
                        aria-haspopup="dialog"
                        aria-label={`Inspect ${bp.aspect} in ${src.title} (Status: ${badge.label})`}
                        className={`w-full flex items-center justify-between gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all cursor-pointer ${badge.bg}`}
                      >
                        <span className="flex items-center gap-1.5">
                          {badge.icon}
                          <span>{badge.label}</span>
                        </span>
                        {cell && cell.claims.length > 0 && (
                          <span className="text-[10px] opacity-75 font-mono">
                            {cell.claims.length} quote{cell.claims.length > 1 ? "s" : ""}
                          </span>
                        )}
                      </button>
                    </td>
                  );
                })}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Accessible Verbatim Quote Inspector Modal */}
      <AnimatePresence>
        {selectedCell && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-black/80 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="inspector-modal-title"
          >
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 relative text-slate-900 dark:text-white"
            >
              <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <span className="text-xs font-bold text-indigo-600 dark:text-cyan-400 uppercase tracking-wider">
                    Verbatim Quote Inspector
                  </span>
                  <h4 id="inspector-modal-title" className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedCell.aspect.aspect}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Source: <strong className="text-slate-800 dark:text-slate-300">{selectedCell.source.title}</strong>
                  </p>
                </div>
                <button
                  ref={closeButtonRef}
                  onClick={() => setSelectedCell(null)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Close inspector"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                <div className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 block font-semibold mb-1">Status Analysis:</span>
                  {selectedCell.cell.note || "No specific note."}
                </div>

                {selectedCell.cell.claims.length > 0 ? (
                  <div className="space-y-2.5">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                      Strict Verbatim Quotes from Source Text:
                    </span>
                    {selectedCell.cell.claims.map((claim, idx) => (
                      <div key={idx} className="bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl p-3.5 text-xs space-y-2">
                        <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-400 font-semibold">
                          <span>Extracted Finding: {claim.extracted_value || claim.claim_text}</span>
                          <span className="text-[10px] bg-emerald-100 dark:bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-500/30">
                            Verbatim Match ✓
                          </span>
                        </div>
                        <blockquote className="border-l-2 border-emerald-500 pl-3 my-2 italic text-slate-800 dark:text-slate-200 text-xs leading-relaxed bg-white/80 dark:bg-slate-950/40 py-1.5 rounded-r">
                          &quot;{claim.exact_quote}&quot;
                        </blockquote>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">
                          Character span: {claim.char_start ?? 0} - {claim.char_end ?? 0} • Confidence: {Math.round(claim.confidence * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-50 dark:bg-slate-950/80 p-6 rounded-xl text-center text-xs text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 space-y-1">
                    <p className="font-semibold text-slate-800 dark:text-slate-300">Not Found in this Source Text</p>
                    <p className="text-[11px] text-slate-500">
                      No verified verbatim claims found in &quot;{selectedCell.source.title}&quot; for {selectedCell.aspect.aspect}.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setSelectedCell(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Close Inspector
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
