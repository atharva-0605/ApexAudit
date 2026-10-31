"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Zap,
  Plus,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  HelpCircle,
  XCircle,
  WifiOff
} from "lucide-react";

interface NoSourcesProps {
  onLoadDemo: () => void;
  onOpenPasteModal: () => void;
}

export const NoSourcesEmptyState: React.FC<NoSourcesProps> = ({
  onLoadDemo,
  onOpenPasteModal
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-slate-50/70 dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-8 text-center space-y-4 shadow-sm"
    >
      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-cyan-500/10 border border-indigo-200 dark:border-cyan-500/20 text-indigo-600 dark:text-cyan-400 flex items-center justify-center mx-auto">
        <FileText className="w-6 h-6" />
      </div>

      <div className="max-w-md mx-auto space-y-1.5">
        <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
          No Ingested Sources Yet
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          ApexAudit needs at least one source document to cross-verify claims against your pre-mortem blueprint.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          onClick={onLoadDemo}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          Load CSSS Demo Pack
        </button>

        <button
          onClick={onOpenPasteModal}
          className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-indigo-600 dark:text-cyan-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" />
          Paste Document Text
        </button>
      </div>
    </motion.div>
  );
};

export const NoConflictsState: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-emerald-50/50 dark:bg-slate-950/40 border border-emerald-200 dark:border-emerald-900/30 rounded-2xl p-8 text-center space-y-3 shadow-sm"
    >
      <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
        <ShieldCheck className="w-6 h-6" />
      </div>

      <div className="max-w-md mx-auto space-y-1">
        <h4 className="text-base font-bold text-emerald-800 dark:text-emerald-300">
          No Direct Policy Conflicts Detected
        </h4>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          All reviewed sources currently corroborate one another or focus on distinct non-overlapping requirements.
        </p>
        <p className="text-[11px] text-slate-500 italic pt-1">
          💡 Be sure to inspect the <strong>Evidence Matrix</strong> and <strong>Trust Lanes</strong> for missing requirements or unaddressed blindspots.
        </p>
      </div>
    </motion.div>
  );
};

interface UrlErrorProps {
  failedUrl: string;
  errorMessage?: string;
  onOpenFallback: (url: string) => void;
  onDismiss: () => void;
}

export const UrlFetchErrorAlert: React.FC<UrlErrorProps> = ({
  failedUrl,
  errorMessage,
  onOpenFallback,
  onDismiss
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      role="alert"
      aria-live="assertive"
      className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl p-4 text-xs space-y-2.5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-semibold">
          <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>Could Not Automatically Ingest URL</span>
        </div>
        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs px-1 cursor-pointer"
          aria-label="Dismiss error"
        >
          ✕
        </button>
      </div>

      <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
        Web scraping for <code className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-transparent px-1 py-0.5 rounded text-rose-700 dark:text-rose-200">{failedUrl}</code> was blocked or timed out ({errorMessage || "anti-bot or network protection"}).
      </p>

      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={() => onOpenFallback(failedUrl)}
          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5" />
          Open Pasted-Text Fallback
        </button>
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          Paste the text directly to bypass URL blocking.
        </span>
      </div>
    </motion.div>
  );
};

interface ApiErrorProps {
  message: string;
  onRetry: () => void;
  onUseFallbackEngine?: () => void;
}

export const ApiErrorBanner: React.FC<ApiErrorProps> = ({
  message,
  onRetry,
  onUseFallbackEngine
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      role="alert"
      aria-live="assertive"
      className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 rounded-2xl p-4 text-xs space-y-2 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
          <WifiOff className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>Backend Connection Notice</span>
        </div>
        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-transparent">
          Offline Fallback Available
        </span>
      </div>

      <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
        {message}. VerifyFirst is able to run the complete analysis locally using our built-in client evaluation engine.
      </p>

      <div className="flex items-center gap-2.5 pt-1">
        <button
          onClick={onRetry}
          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <RefreshCw className="w-3 h-3" />
          Retry Connection
        </button>

        {onUseFallbackEngine && (
          <button
            onClick={onUseFallbackEngine}
            className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-600/30 font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            Run Client-Side Engine
          </button>
        )}
      </div>
    </motion.div>
  );
};
