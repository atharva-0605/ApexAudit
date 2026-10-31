"use client";

import React from "react";
import { AnalysisResponse } from "../lib/types";
import { ApexLogo } from "./ApexLogo";
import {
  Shield,
  Compass,
  FileText,
  Layers,
  Grid3X3,
  AlertTriangle,
  CheckCircle2,
  Download,
  Plus,
  Zap,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Cpu
} from "lucide-react";

interface SidebarProps {
  goal: string;
  blueprintCount: number;
  sourcesCount: number;
  analysis: AnalysisResponse | null;
  activeTab: "findings" | "conflicts" | "trust" | "checklist";
  onSelectTab: (tab: "findings" | "conflicts" | "trust" | "checklist") => void;
  onReset: () => void;
  onLoadDemo: () => void;
  onSelectTemplate?: (goalText: string) => void;
  onExport: () => void;
  isBackendHealthy: boolean | null;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  goal,
  blueprintCount,
  sourcesCount,
  analysis,
  activeTab,
  onSelectTab,
  onReset,
  onLoadDemo,
  onSelectTemplate,
  onExport,
  isBackendHealthy,
  isOpen,
  onToggleOpen
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={onToggleOpen}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 ${
          isOpen ? "w-72 translate-x-0" : "-translate-x-full md:translate-x-0 md:w-16"
        } shrink-0`}
      >
        {/* Sidebar Brand Header */}
        <div className="h-16 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <ApexLogo size="md" />

            {isOpen && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white truncate">
                    ApexAudit
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-cyan-400 dark:border-slate-700">
                    SaaS
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  Enterprise Intelligence
                </p>
              </div>
            )}
          </div>

          <button
            onClick={onToggleOpen}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer shrink-0"
            title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            aria-label={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 text-xs">
          
          {/* Active Decision Card */}
          {isOpen ? (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                  Active Audit
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    analysis
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300"
                      : blueprintCount > 0
                      ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300"
                      : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  {analysis ? "Audit Active" : blueprintCount > 0 ? "Draft In Progress" : "Pristine"}
                </span>
              </div>

              <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 line-clamp-2">
                {goal.trim() ? goal : "No decision goal defined yet."}
              </p>

              <div className="pt-1 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 text-[11px]">
                <button
                  onClick={onReset}
                  className="inline-flex items-center gap-1 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                  title="Clear decision state and reset to clean canvas"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset / Clear</span>
                </button>

                {analysis && (
                  <span className="font-mono font-bold text-indigo-600 dark:text-cyan-400">
                    Score: {analysis.readiness_score.score}/100
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={onReset}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-900"
                title="Reset / Clear Canvas"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Core Navigation Rail */}
          <div className="space-y-1">
            {isOpen && (
              <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Workspace Sections
              </span>
            )}

            <a
              href="#goal-section-heading"
              className="flex items-center gap-3 px-2.5 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="Target Decision Goal"
            >
              <Compass className="w-4 h-4 shrink-0" />
              {isOpen && <span>Decision Goal</span>}
            </a>

            <a
              href="#workspace-config-heading"
              className="flex items-center justify-between px-2.5 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="Pre-Mortem Blueprint"
            >
              <div className="flex items-center gap-3">
                <Layers className="w-4 h-4 shrink-0" />
                {isOpen && <span>Pre-Mortem Blueprint</span>}
              </div>
              {isOpen && (
                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {blueprintCount}
                </span>
              )}
            </a>

            <a
              href="#workspace-config-heading"
              className="flex items-center justify-between px-2.5 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="Ingested Evidence Sources"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 shrink-0" />
                {isOpen && <span>Ingested Evidence</span>}
              </div>
              {isOpen && (
                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {sourcesCount}
                </span>
              )}
            </a>
          </div>

          {/* Analysis Findings Rail (only if analysis exists) */}
          {analysis && (
            <div className="space-y-1 pt-3 border-t border-slate-200 dark:border-slate-800">
              {isOpen && (
                <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Audit Findings
                </span>
              )}

              <button
                onClick={() => onSelectTab("findings")}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-colors cursor-pointer ${
                  activeTab === "findings"
                    ? "bg-indigo-50 text-indigo-700 dark:bg-cyan-500/10 dark:text-cyan-300 font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
                }`}
                title="Evidence Matrix"
              >
                <div className="flex items-center gap-3">
                  <Grid3X3 className="w-4 h-4 shrink-0" />
                  {isOpen && <span>Evidence Matrix</span>}
                </div>
              </button>

              <button
                onClick={() => onSelectTab("conflicts")}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-colors cursor-pointer ${
                  activeTab === "conflicts"
                    ? "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300 font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
                }`}
                title="Conflicts & Echo Detector"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {isOpen && <span>Policy Conflicts</span>}
                </div>
                {isOpen && (
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300">
                    {analysis.conflicts.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => onSelectTab("trust")}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-colors cursor-pointer ${
                  activeTab === "trust"
                    ? "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300 font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
                }`}
                title="Three-Lane Trust Dashboard"
              >
                <div className="flex items-center gap-3">
                  <Layers className="w-4 h-4 shrink-0" />
                  {isOpen && <span>Three-Lane Trust</span>}
                </div>
              </button>

              <button
                onClick={() => onSelectTab("checklist")}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-colors cursor-pointer ${
                  activeTab === "checklist"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
                }`}
                title="Verification Checklist"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {isOpen && <span>Action Checklist</span>}
                </div>
                {isOpen && (
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                    {analysis.checklist.length}
                  </span>
                )}
              </button>

              <button
                onClick={onExport}
                className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                title="Export Final Verification Pack"
              >
                <Download className="w-4 h-4 shrink-0 text-indigo-600 dark:text-cyan-400" />
                {isOpen && <span>Export Report Pack</span>}
              </button>
            </div>
          )}

          {/* Quick Presets & Templates */}
          {isOpen && (
            <div className="space-y-1.5 pt-3 border-t border-slate-200 dark:border-slate-800">
              <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Decision Presets
              </span>

              <button
                onClick={onLoadDemo}
                className="w-full text-left px-2.5 py-2 rounded-xl text-slate-700 dark:text-slate-300 bg-amber-50/70 hover:bg-amber-100/80 dark:bg-amber-950/20 dark:hover:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/40 transition-colors flex items-center justify-between gap-2 cursor-pointer shadow-2xs"
                title="Load Central Sector Scheme of Scholarship (CSSS) interactive renewal demo"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                  <span className="font-semibold text-xs truncate">CSSS Scholarship Demo</span>
                </div>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 shrink-0">
                  Interactive
                </span>
              </button>
            </div>
          )}

        </div>

        {/* Sidebar Footer System Health */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950 shrink-0">
          {isOpen ? (
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isBackendHealthy === null
                      ? "bg-slate-400 animate-pulse"
                      : isBackendHealthy
                      ? "bg-emerald-500"
                      : "bg-amber-500"
                  }`}
                />
                <span className="text-slate-500 dark:text-slate-400">
                  {isBackendHealthy ? "FastAPI 8000 Active" : "Resilient Engine"}
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400">v2.0</span>
            </div>
          ) : (
            <div className="flex justify-center" title={isBackendHealthy ? "FastAPI Active" : "Resilient Engine"}>
              <span
                className={`w-2 h-2 rounded-full ${
                  isBackendHealthy ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
