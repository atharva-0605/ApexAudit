"use client";

import React from "react";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileSearch,
  AlertTriangle,
  CheckCircle2,
  Zap,
  HelpCircle,
  Layers,
  BookOpen,
  Compass,
  ShieldAlert,
  ArrowUpRight,
  Cpu,
  FileText
} from "lucide-react";
import { motion } from "framer-motion";

interface OnboardingGuideProps {
  onSelectTemplate?: (goalText: string, autoRunDemo?: boolean) => void;
  onLoadDemo: () => void;
}

export const OnboardingGuide: React.FC<OnboardingGuideProps> = ({
  onSelectTemplate,
  onLoadDemo
}) => {
  const steps = [
    {
      step: "01",
      icon: ShieldAlert,
      title: "Derive Pre-Mortem Blueprint",
      tag: "Failure Modeling",
      description:
        "Instead of broad summarization, ApexAudit works backward from catastrophic real-world failure modes (disqualification, missed deadlines, invalid attestations) to map the critical criteria you must verify.",
      badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/50"
    },
    {
      step: "02",
      icon: FileSearch,
      title: "Multi-Source Evidence Ingestion",
      tag: "Cross-Reference",
      description:
        "Ingest official regulatory portals, gazettes, aggregator advisories, or pasted text. Every document is parsed into atomic claims tagged by aspect, published date, and authority score.",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/50"
    },
    {
      step: "03",
      icon: AlertTriangle,
      title: "Conflict, Drift & Echo Audit",
      tag: "Discrepancy Detection",
      description:
        "Automatically identifies direct policy contradictions between sources (e.g., differing income ceilings), flags temporal drift (superseded rules), and reveals circular citations.",
      badgeColor: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50"
    },
    {
      step: "04",
      icon: ShieldCheck,
      title: "Readiness Score & Action Kit",
      tag: "Decision Ready",
      description:
        "Synthesizes an auditable 0–100 Readiness Score based on quote-grounded coverage and penalties. Generates a prioritized verification checklist with pre-drafted inquiry emails.",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50"
    }
  ];

  return (
    <div className="space-y-8 py-2">
      {/* 1. Value Proposition Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-50/80 via-white to-slate-50 dark:from-slate-900/80 dark:via-slate-900/40 dark:to-slate-950 border border-slate-200/80 dark:border-slate-800 p-8 shadow-sm"
      >
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border dark:border-cyan-500/20">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" />
            <span>Intelligent Decision-Readiness Architecture</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
            Know what you <span className="text-indigo-600 dark:text-cyan-400">still don&apos;t know</span> before making high-stakes decisions.
          </h2>

          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Search engines retrieve documents and AI chatbots summarize them, but neither warns you of missing requirements, expired rules, or conflicting clauses across sources. ApexAudit audits multi-source evidence against a pre-mortem failure blueprint, delivering quote-grounded readiness confidence.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onLoadDemo}
              className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 dark:from-cyan-600 dark:to-blue-600 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Load Full CSSS Interactive Demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <span className="text-xs text-slate-500 dark:text-slate-400">
              or enter a goal above to start from scratch
            </span>
          </div>
        </div>

        {/* Subtle decorative background glow */}
        <div className="absolute -right-12 -bottom-12 w-80 h-80 rounded-full bg-indigo-500/5 dark:bg-cyan-500/5 blur-3xl pointer-events-none" />
      </motion.div>

      {/* 2. Four-Step Verification Protocol */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
              The ApexAudit 4-Step Verification Engine
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              How the platform turns unverified, conflicting web content into auditable decision certainty.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500">
                      STEP {item.step}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${item.badgeColor}`}>
                      {item.tag}
                    </span>
                  </div>

                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-slate-800 dark:text-slate-200">
                    <Icon className="w-4 h-4" />
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {item.title}
                  </h4>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 3. Quick-Start Decision Template */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
              Quick-Start Decision Template
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Experience the verification engine with an interactive multi-source decision scenario.
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-2xl p-6 border bg-indigo-50/40 border-indigo-200 dark:bg-slate-900/90 dark:border-indigo-800/60 shadow-xs space-y-4 max-w-2xl"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Higher Education / Government Subsidy
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-cyan-500/20 dark:text-cyan-300 border border-indigo-200 dark:border-cyan-500/30">
                Live Sample Pack
              </span>
            </div>
            <span className="text-xs font-mono font-semibold text-indigo-700 dark:text-cyan-400">
              3 Sources • 7 Blueprint Requirements
            </span>
          </div>

          <div className="space-y-1.5">
            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Central Sector Scholarship (CSSS) Renewal
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Official Ministry of Education gazette vs. aggregator and student forum articles. Demonstrates real-world parental income ceiling discrepancies (₹4.5 Lakh vs ₹8.0 Lakh), outdated aggregate marks rules, and DBT bank account pitfalls.
            </p>
          </div>

          <div className="pt-1">
            <button
              onClick={onLoadDemo}
              className="py-2.5 px-5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs dark:bg-cyan-600 dark:hover:bg-cyan-500 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Load CSSS Scholarship Demo (Recommended)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </section>

      {/* 4. Three-Trust-Lane Philosophy Pill Grid */}
      <section className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" />
          The Strict Verification Ground Rule
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
            <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Lane 1: Verbatim Quote Grounded
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Every factual requirement must reference an exact, unedited sentence located in an ingested source document. Zero LLM extrapolation.
            </p>
          </div>

          <div className="p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
            <span className="font-bold text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              Lane 2: AI-Suggested Advisory
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Helpful procedural tips, timing advice, or contextual explanations. Clearly labeled as non-authoritative AI synthesis.
            </p>
          </div>

          <div className="p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              Lane 3: Blindspot / Not Found
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Blueprint failure scenarios that none of your ingested documents addressed. Prioritized in the verification action kit.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
