"use client";

import React, { useState, useEffect, useRef } from "react";
import { SourceInput } from "../lib/types";
import { Link2, FileText, Plus, Trash2, Globe, Sparkles, AlertCircle, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { NoSourcesEmptyState } from "./EmptyAndErrorStates";

interface Props {
  sources: SourceInput[];
  onAddSource: (src: SourceInput) => void;
  onRemoveSource: (id: string) => void;
  onFetchUrl: (url: string) => Promise<void>;
  onLoadDemo?: () => void;
  isLoadingUrl: boolean;
  isInitialModalOpen?: boolean;
}

export const SourceManager: React.FC<Props> = ({
  sources,
  onAddSource,
  onRemoveSource,
  onFetchUrl,
  onLoadDemo,
  isLoadingUrl,
  isInitialModalOpen = false
}) => {
  const [urlInput, setUrlInput] = useState("");
  const [showPasteModal, setShowPasteModal] = useState(isInitialModalOpen);
  const [pasteTitle, setPasteTitle] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [pasteType, setPasteType] = useState<SourceInput["source_type"]>("user_pasted");

  const modalRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showPasteModal) {
      setTimeout(() => titleInputRef.current?.focus(), 60);
    }
  }, [showPasteModal]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showPasteModal) {
        setShowPasteModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showPasteModal]);

  const handleFetch = async () => {
    if (!urlInput.trim()) return;
    await onFetchUrl(urlInput.trim());
    setUrlInput("");
  };

  const handlePasteSubmit = () => {
    if (!pasteTitle.trim() || !pasteText.trim()) return;
    const newSrc: SourceInput = {
      id: `src-pasted-${Date.now()}`,
      title: pasteTitle.trim(),
      raw_text: pasteText.trim(),
      source_type: pasteType,
      authority_score: pasteType === "official" ? 0.95 : 0.6
    };
    onAddSource(newSrc);
    setPasteTitle("");
    setPasteText("");
    setShowPasteModal(false);
  };

  const handleInsertSample = () => {
    setPasteTitle("Directorate Advisory Circular #824");
    setPasteType("official");
    setPasteText(
      "DIRECTORATE OF HIGHER EDUCATION ADVISORY\n\n" +
      "1. Family annual income limit must not exceed Rs. 4,50,000 for the ongoing academic cycle.\n" +
      "2. Renewal candidate must secure at least 50% aggregate marks with zero active disciplinary backlogs.\n" +
      "3. All scholarship beneficiaries must ensure bank accounts are seeded with Aadhaar on the NPCI mapper for Direct Benefit Transfer (DBT).\n" +
      "4. The deadline for student online application submission is October 31, 2024."
    );
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
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            Ingested Sources ({sources.length})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            URL fetching with automated text extraction, official portals, or manual pasted-text fallback.
          </p>
        </div>

        <button
          onClick={() => setShowPasteModal(true)}
          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-indigo-600 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-cyan-400 dark:border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5" />
          Pasted-Text Fallback
        </button>
      </div>

      {/* URL Fetch Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Globe className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleFetch()}
            placeholder="Enter URL to ingest (e.g., https://scholarships.gov.in/...)"
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 dark:focus:border-cyan-500"
          />
        </div>
        <button
          onClick={handleFetch}
          disabled={isLoadingUrl || !urlInput.trim()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50 shadow-sm cursor-pointer"
        >
          {isLoadingUrl ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Fetching...</span>
            </>
          ) : (
            <span>Fetch Source</span>
          )}
        </button>
      </div>

      {/* Sources List or Empty State */}
      <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
        {sources.length === 0 ? (
          <NoSourcesEmptyState
            onLoadDemo={onLoadDemo || (() => {})}
            onOpenPasteModal={() => setShowPasteModal(true)}
          />
        ) : (
          sources.map((src, idx) => (
            <motion.div
              key={src.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="bg-slate-50/70 border border-slate-200 dark:bg-slate-950/70 dark:border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3 text-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800 dark:text-slate-100 truncate">{src.title}</span>
                  <span
                    className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
                      src.source_type === "official"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30"
                        : src.source_type === "aggregator"
                        ? "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30"
                        : "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30"
                    }`}
                  >
                    {src.source_type}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  <span>Authority: {Math.round(src.authority_score * 100)}%</span>
                  {src.published_date && <span>Published: {src.published_date}</span>}
                  <span>{src.raw_text.length.toLocaleString()} chars</span>
                </div>
              </div>

              <button
                onClick={() => onRemoveSource(src.id)}
                className="text-slate-400 hover:text-rose-600 p-1.5 rounded hover:bg-slate-100 dark:text-slate-500 dark:hover:text-rose-400 dark:hover:bg-slate-900 transition-colors cursor-pointer"
                aria-label={`Remove source ${src.title}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))
        )}
      </div>

      {/* Accessible Pasted Text Fallback Modal */}
      <AnimatePresence>
        {showPasteModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-black/80 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="paste-modal-title"
          >
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative"
            >
              <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <h4 id="paste-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
                    Pasted-Text Fallback Ingestion
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Bypasses blocked pages, intranet portals, PDF excerpts, or paywalls.
                  </p>
                </div>
                <button
                  onClick={() => setShowPasteModal(false)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-700 dark:text-slate-300 font-semibold">Source Title / Reference</label>
                    <button
                      type="button"
                      onClick={handleInsertSample}
                      className="text-[11px] text-indigo-600 hover:text-indigo-700 dark:text-cyan-400 dark:hover:text-cyan-300 font-medium cursor-pointer"
                    >
                      + Insert Sample Excerpt
                    </button>
                  </div>
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={pasteTitle}
                    onChange={(e) => setPasteTitle(e.target.value)}
                    placeholder="e.g. Official Gazette Circular #410-B"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 dark:focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Source Type</label>
                  <select
                    value={pasteType}
                    onChange={(e) => setPasteType(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-slate-800 dark:text-slate-300 focus:outline-none focus:border-indigo-500 dark:focus:border-cyan-500"
                  >
                    <option value="official">Official Authority / Ministry Gazette</option>
                    <option value="aggregator">Educational Aggregator / Advisory Portal</option>
                    <option value="forum">Community Forum / Social Media</option>
                    <option value="user_pasted">Generic Pasted Text</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Verbatim Document Text</label>
                  <textarea
                    rows={6}
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    placeholder="Paste verbatim source text here..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 dark:focus:border-cyan-500 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPasteModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePasteSubmit}
                  disabled={!pasteTitle.trim() || !pasteText.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold disabled:opacity-50 shadow-sm cursor-pointer"
                >
                  Ingest Source
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
