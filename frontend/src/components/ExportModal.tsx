"use client";

import React, { useState } from "react";
import { AnalysisResponse } from "../lib/types";
import { generateMarkdownReport, downloadFile } from "../lib/exportMarkdown";
import { PrintableReport } from "./PrintableReport";
import {
  Download,
  FileText,
  Printer,
  Copy,
  Check,
  X,
  ExternalLink,
  Eye,
  Sparkles,
  ShieldAlert,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: AnalysisResponse;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  analysis
}) => {
  const [activeFormat, setActiveFormat] = useState<"markdown" | "pdf" | "preview">("markdown");
  const [isCopied, setIsCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleDownloadMarkdown = () => {
    const md = generateMarkdownReport(analysis);
    const dateSlug = new Date().toISOString().slice(0, 10);
    downloadFile(md, `ApexAudit-Report-${dateSlug}.md`, "text/markdown;charset=utf-8");
  };

  const handleCopyMarkdown = async () => {
    const md = generateMarkdownReport(analysis);
    try {
      await navigator.clipboard.writeText(md);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Clipboard copy failed:", err);
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm no-print"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-cyan-500/20 dark:text-cyan-400 dark:border-cyan-500/30 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 id="export-modal-title" className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Export Verification Pack
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-indigo-700 border border-slate-200 dark:bg-slate-800 dark:text-cyan-300 dark:border-slate-700">
                  REPORT
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Download quote-grounded findings, blueprint requirements, matrix, and action kit.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close export dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="px-6 pt-4 flex gap-2 border-b border-slate-200 dark:border-slate-800 text-xs">
          <button
            onClick={() => setActiveFormat("markdown")}
            className={`pb-3 px-3 font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeFormat === "markdown"
                ? "border-indigo-600 text-indigo-600 dark:border-cyan-400 dark:text-cyan-300"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Markdown Document (.md)
          </button>

          <button
            onClick={() => setActiveFormat("pdf")}
            className={`pb-3 px-3 font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeFormat === "pdf"
                ? "border-indigo-600 text-indigo-600 dark:border-cyan-400 dark:text-cyan-300"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            PDF Document (.pdf)
          </button>

          <button
            onClick={() => setActiveFormat("preview")}
            className={`pb-3 px-3 font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeFormat === "preview"
                ? "border-indigo-600 text-indigo-600 dark:border-cyan-400 dark:text-cyan-300"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Executive Document Preview
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs text-slate-700 dark:text-slate-300">
          
          {/* Format 1: Markdown */}
          {activeFormat === "markdown" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold">
                    <FileText className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
                    <span>Standard GitHub Flavored Markdown</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    ApexAudit-Report.md
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xs">
                  A structured markdown document containing YAML-compatible metadata, readiness score audit, pre-mortem failure scenarios, cross-source evidence matrix table, verbatim quotes for all detected conflicts, and the full prioritized action checklist with official verification URLs.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={handleDownloadMarkdown}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white rounded-xl font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Markdown (.md)</span>
                  </button>

                  <button
                    onClick={handleCopyMarkdown}
                    className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 rounded-xl font-semibold flex items-center gap-2 transition-all cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-emerald-600 dark:text-emerald-400">Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        <span>Copy Raw Markdown</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Markdown Preview Snip */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Document Snippet Preview
                </div>
                <div className="p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl font-mono text-[11px] text-slate-700 dark:text-slate-400 max-h-48 overflow-y-auto leading-relaxed select-all">
                  <pre className="whitespace-pre-wrap">{generateMarkdownReport(analysis).slice(0, 1100)}...</pre>
                </div>
              </div>
            </div>
          )}

          {/* Format 2: PDF */}
          {activeFormat === "pdf" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold">
                    <Printer className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>Executive Print & PDF Generation</span>
                  </div>
                  <span className="text-[11px] font-mono text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 px-2 py-0.5 rounded">
                    A4 Clean Format
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xs">
                  Uses tailored high-contrast print media styling (`@media print`) designed specifically for executive briefings and archival. Automatically suppresses dark dashboard UI elements, formats vector score gauges, prevents page cuts inside conflict evidence cards, and renders clean tabular evidence.
                </p>

                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 text-[11px] space-y-1">
                  <div className="font-semibold text-indigo-600 dark:text-cyan-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    How to Save as PDF:
                  </div>
                  <ol className="list-decimal list-inside space-y-0.5 text-slate-600 dark:text-slate-400">
                    <li>Click the <strong>&quot;Print / Save as PDF&quot;</strong> button below.</li>
                    <li>In the browser dialog, select <strong>&quot;Save as PDF&quot;</strong> as your destination.</li>
                    <li>Ensure <strong>&quot;Background graphics&quot;</strong> is checked for colored badge rendering.</li>
                  </ol>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handlePrintPdf}
                    className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print / Save as PDF</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Format 3: Live Preview */}
          {activeFormat === "preview" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400 text-xs">
                  Scroll down to view how the report renders in print & PDF mode:
                </span>
                <button
                  onClick={handlePrintPdf}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3 h-3" />
                  Print this Document
                </button>
              </div>

              <div className="border border-slate-300 rounded-xl max-h-[500px] overflow-y-auto bg-white shadow-inner">
                <PrintableReport analysis={analysis} />
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50/80 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Quote-grounded & verified across {analysis.sources.length} sources</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
