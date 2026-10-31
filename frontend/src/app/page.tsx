"use client";

import React, { useState, useEffect } from "react";
import {
  BlueprintItem,
  SourceInput,
  AnalysisResponse,
  ReadinessScore,
  VerificationChecklistItem
} from "../lib/types";
import {
  fetchDemoPack,
  generateBlueprint,
  fetchSourceUrl,
  runAnalysis,
  checkBackendHealth,
  markChecklistItem
} from "../lib/api";
import { ReadinessMeter } from "../components/ReadinessMeter";
import { EvidenceMatrix } from "../components/EvidenceMatrix";
import { ConflictDetector } from "../components/ConflictDetector";
import { EchoGraph } from "../components/EchoGraph";
import { ThreeLaneTrustDashboard } from "../components/ThreeLaneTrust";
import { VerificationChecklist } from "../components/VerificationChecklist";
import { BlueprintEditor } from "../components/BlueprintEditor";
import { SourceManager } from "../components/SourceManager";
import { PipelineProgress } from "../components/Skeletons";
import { UrlFetchErrorAlert, ApiErrorBanner } from "../components/EmptyAndErrorStates";
import { ExportModal } from "../components/ExportModal";
import { PrintableReport } from "../components/PrintableReport";
import { ThemeToggle } from "../components/ThemeToggle";
import { Sidebar } from "../components/Sidebar";
import { OnboardingGuide } from "../components/OnboardingGuide";
import { ApexLogo } from "../components/ApexLogo";
import {
  Shield,
  Search,
  Sparkles,
  Zap,
  Grid3X3,
  AlertTriangle,
  Layers,
  CheckCircle2,
  RefreshCw,
  Info,
  ExternalLink,
  ChevronRight,
  Download,
  RotateCcw,
  Menu,
  ArrowRight,
  Compass
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  // Pristine empty state on initial boot (no dummy data)
  const [goal, setGoal] = useState<string>("");
  const [blueprint, setBlueprint] = useState<BlueprintItem[]>([]);
  const [sources, setSources] = useState<SourceInput[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [verifiedChecklistIds, setVerifiedChecklistIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"findings" | "conflicts" | "trust" | "checklist">("findings");

  // Layout & UI states
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pipelineStep, setPipelineStep] = useState<number>(0);
  const [isGeneratingBp, setIsGeneratingBp] = useState<boolean>(false);
  const [isLoadingUrl, setIsLoadingUrl] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Error States & Modals
  const [urlFetchError, setUrlFetchError] = useState<{ url: string; message: string } | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isPastedModalRequested, setIsPastedModalRequested] = useState<boolean>(false);
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean | null>(null);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  // On initial mount, only verify backend health — do not pre-load dummy data
  useEffect(() => {
    checkBackendHealth().then((res) => setIsBackendHealthy(res.online));
  }, []);

  const handleResetToCleanState = () => {
    setGoal("");
    setBlueprint([]);
    setSources([]);
    setAnalysis(null);
    setVerifiedChecklistIds([]);
    setUrlFetchError(null);
    setApiError(null);
    setStatusMessage("Dashboard reset to clean canvas.");
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const loadDemoDataset = async () => {
    setIsLoading(true);
    setPipelineStep(1);
    setStatusMessage("Loading Central Sector Scheme of Scholarship (CSSS) Pack...");
    setUrlFetchError(null);
    setApiError(null);

    try {
      setPipelineStep(2);
      const demo = await fetchDemoPack("csss-scholarship-renewal");
      setGoal(demo.goal);
      setBlueprint(demo.blueprint);
      setSources(demo.sources);
      setVerifiedChecklistIds([]);

      setPipelineStep(3);
      // Auto-run initial analysis
      const result = await runAnalysis(demo.goal, demo.blueprint, demo.sources, []);
      setPipelineStep(4);
      setTimeout(() => setPipelineStep(5), 200);
      setAnalysis(result);
      setStatusMessage("Demo loaded with 3 sources, 7 blueprint requirements, and active conflicts detected.");
    } catch (err: any) {
      console.error("Demo load error:", err);
      setApiError(err.message || "Failed to load demo pack from backend API");
      setStatusMessage("Error loading demo: " + (err.message || String(err)));
    } finally {
      setTimeout(() => {
        setIsLoading(false);
        setPipelineStep(0);
      }, 400);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const handleSelectTemplate = async (templateGoal: string) => {
    setGoal(templateGoal);
    setAnalysis(null);
    setBlueprint([]);
    setSources([]);
    setIsGeneratingBp(true);
    setStatusMessage("Deriving pre-mortem failure scenarios for selected template...");
    try {
      const items = await generateBlueprint(templateGoal);
      setBlueprint(items);
      setStatusMessage(`Derived ${items.length} critical blueprint requirements.`);
    } catch (err: any) {
      console.error(err);
      setApiError("Failed to generate blueprint: " + err.message);
    } finally {
      setIsGeneratingBp(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const handleGenerateBlueprint = async () => {
    if (!goal.trim()) return;
    setIsGeneratingBp(true);
    setStatusMessage("Deriving pre-mortem failure scenarios & knowledge requirements...");
    setApiError(null);
    try {
      const items = await generateBlueprint(goal);
      setBlueprint(items);
      setStatusMessage(`Derived ${items.length} critical blueprint requirements.`);
    } catch (err: any) {
      console.error(err);
      setApiError("Failed to generate blueprint: " + err.message);
      setStatusMessage("Failed to generate blueprint: " + err.message);
    } finally {
      setIsGeneratingBp(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const handleFetchUrl = async (url: string) => {
    setIsLoadingUrl(true);
    setUrlFetchError(null);
    setStatusMessage(`Fetching and extracting text from ${url}...`);
    try {
      const newSource = await fetchSourceUrl(url);
      setSources((prev) => [...prev, newSource]);
      setStatusMessage(`Successfully ingested: ${newSource.title}`);
    } catch (err: any) {
      console.error(err);
      setUrlFetchError({
        url,
        message: err.message || "Site blocked automated scraping or connection timed out"
      });
      setStatusMessage("Failed to fetch URL. Please use Pasted-Text Fallback.");
    } finally {
      setIsLoadingUrl(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const handleRunAnalysis = async () => {
    if (sources.length === 0 || blueprint.length === 0) {
      setStatusMessage("Please ensure you have at least 1 blueprint requirement and 1 source.");
      return;
    }
    setIsLoading(true);
    setPipelineStep(1);
    setStatusMessage("Executing pipeline: Ingesting & normalizing multi-source texts...");
    setApiError(null);

    try {
      setTimeout(() => setPipelineStep(2), 200);
      setTimeout(() => setPipelineStep(3), 400);
      const result = await runAnalysis(goal, blueprint, sources, verifiedChecklistIds);
      setPipelineStep(4);
      setTimeout(() => setPipelineStep(5), 200);
      setAnalysis(result);
      setStatusMessage("Analysis complete. Decision Readiness Score updated.");
    } catch (err: any) {
      console.error(err);
      setApiError("Analysis failed: " + err.message);
      setStatusMessage("Analysis failed: " + err.message);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
        setPipelineStep(0);
      }, 500);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const handleToggleVerified = async (itemId: string, verified: boolean) => {
    const nextVerified = verified
      ? [...verifiedChecklistIds, itemId]
      : verifiedChecklistIds.filter((id) => id !== itemId);

    setVerifiedChecklistIds(nextVerified);
    markChecklistItem(itemId, verified).catch(() => {});

    if (analysis) {
      try {
        const updated = await runAnalysis(goal, blueprint, sources, nextVerified);
        setAnalysis(updated);
      } catch (err) {
        const updatedChecklist = analysis.checklist.map((item) =>
          item.id === itemId ? { ...item, verified_by_user: verified } : item
        );
        setAnalysis({
          ...analysis,
          checklist: updatedChecklist
        });
      }
    }
  };

  const suggestionChips = [
    {
      label: "🎓 CSSS Scholarship Renewal",
      text: "Verify eligibility, renewal criteria, and submission deadlines for the Central Sector Scheme of Scholarship (CSSS) for College and University Students to avoid cancellation or lapse."
    },
    {
      label: "🛂 Graduate Work Visa",
      text: "Verify eligibility criteria, minimum financial solvency balance, biometric appointment deadlines, and approved insurance policies for post-graduate work visa renewal."
    },
    {
      label: "💼 MSME Subsidy Scheme",
      text: "Verify mandatory documentation, turnover thresholds, lending partner eligibility, and interest subvention limits for the MSME Collateral-Free Credit Guarantee Scheme."
    },
    {
      label: "🏛️ University Admission",
      text: "Verify eligibility cutoff scores, domicile requirements, document verification deadlines, and counseling seat acceptance policies for undergraduate university admissions."
    }
  ];

  const hasDraftContent = blueprint.length > 0 || sources.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex font-sans transition-colors duration-200">
      
      {/* Enterprise Sidebar */}
      <Sidebar
        goal={goal}
        blueprintCount={blueprint.length}
        sourcesCount={sources.length}
        analysis={analysis}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onReset={handleResetToCleanState}
        onLoadDemo={loadDemoDataset}
        onSelectTemplate={handleSelectTemplate}
        onExport={() => setIsExportOpen(true)}
        isBackendHealthy={isBackendHealthy}
        isOpen={isSidebarOpen}
        onToggleOpen={() => setIsSidebarOpen((prev) => !prev)}
      />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        
        {/* Top Navigation Bar */}
        <header className="border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen((prev) => !prev)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 md:hidden transition-colors"
                aria-label="Toggle Navigation Sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5">
                <ApexLogo size="sm" />
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                    ApexAudit
                  </span>
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-cyan-400 dark:border-slate-700">
                    DECISION ENGINE
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Reset to Clean Slate */}
              {(goal || hasDraftContent || analysis) && (
                <button
                  onClick={handleResetToCleanState}
                  className="px-3 py-1.5 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Clear decision state and reset to clean canvas"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              )}

              {/* Reload CSSS Demo Pack Button */}
              <button
                onClick={loadDemoDataset}
                disabled={isLoading}
                className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 dark:bg-gradient-to-r dark:from-amber-500/20 dark:to-orange-500/20 dark:hover:from-amber-500/30 dark:hover:to-orange-500/30 dark:text-amber-300 dark:border-amber-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                title="Reload CSSS Scholarship Renewal demo pack"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500 dark:text-amber-400 dark:fill-amber-400" />
                <span className="hidden sm:inline">Load CSSS Demo</span>
                <span className="sm:hidden">Demo</span>
              </button>

              {/* Evaluate Readiness CTA */}
              <button
                onClick={handleRunAnalysis}
                disabled={isLoading || (!hasDraftContent && !goal.trim())}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs shadow-indigo-600/20 dark:shadow-cyan-600/20 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                <span>{isLoading ? "Evaluating..." : "Evaluate Readiness"}</span>
              </button>

              {/* Export Report CTA */}
              <button
                onClick={() => setIsExportOpen(true)}
                disabled={!analysis || isLoading}
                className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 hover:border-slate-400 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-cyan-300 dark:border-slate-700 dark:hover:border-cyan-500/50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                title={analysis ? "Download complete verification report (Markdown or PDF)" : "Run evaluation to enable report export"}
              >
                <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" />
                <span className="hidden sm:inline">Export Report</span>
                <span className="sm:hidden">Export</span>
              </button>

              {/* Dark/Light Theme Switcher */}
              <ThemeToggle />
            </div>

          </div>
        </header>

        {/* Non-blocking API Error Banner */}
        <AnimatePresence>
          {apiError && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 w-full">
              <ApiErrorBanner
                message={apiError}
                onRetry={handleRunAnalysis}
                onUseFallbackEngine={loadDemoDataset}
              />
            </div>
          )}
        </AnimatePresence>

        {/* Non-blocking URL Fetch Error Alert */}
        <AnimatePresence>
          {urlFetchError && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 w-full">
              <UrlFetchErrorAlert
                failedUrl={urlFetchError.url}
                errorMessage={urlFetchError.message}
                onOpenFallback={() => {
                  setUrlFetchError(null);
                  setIsPastedModalRequested(true);
                }}
                onDismiss={() => setUrlFetchError(null)}
              />
            </div>
          )}
        </AnimatePresence>

        {/* Transient Status Alert Notification */}
        <AnimatePresence>
          {statusMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-indigo-50 border-b border-indigo-200 dark:bg-cyan-950/80 dark:border-cyan-800/60 py-2 px-4 text-center text-xs text-indigo-900 dark:text-cyan-200 flex items-center justify-center gap-2"
            >
              <Info className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400 shrink-0" />
              <span>{statusMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Workspace */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

          {/* Goal Ingestor Section (Always Available) */}
          <section aria-labelledby="goal-section-heading" className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs dark:shadow-xl space-y-3 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <label id="goal-section-heading" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-cyan-400"></span>
                Target Decision Goal or Question
              </label>
              <span className="text-[11px] text-slate-500 font-medium">
                Define the high-stakes outcome you are verifying
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerateBlueprint()}
                  placeholder="e.g. Verify scholarship renewal deadlines, visa criteria, public tender subsidies..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 dark:focus:border-cyan-500 focus:bg-white dark:focus:bg-slate-950 transition-colors"
                />
              </div>

              <button
                onClick={handleGenerateBlueprint}
                disabled={isGeneratingBp || !goal.trim()}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-cyan-300 dark:border dark:border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shrink-0 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-200 dark:text-cyan-400" />
                <span>{isGeneratingBp ? "Generating..." : "Generate Pre-Mortem Blueprint"}</span>
              </button>
            </div>

            {/* Quick Suggestions Chips when Goal is empty or unanalyzed */}
            {!analysis && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                <span className="text-[11px] text-slate-400 font-medium mr-1">Suggestions:</span>
                {suggestionChips.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setGoal(chip.text);
                      handleGenerateBlueprint();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Dynamic Pipeline Progress Indicator */}
          <AnimatePresence>
            {isLoading && pipelineStep > 0 && (
              <PipelineProgress currentStep={pipelineStep} totalSteps={5} />
            )}
          </AnimatePresence>

          {/* VIEW 1: PRISTINE LANDING & ONBOARDING GUIDE (When no analysis and no draft items) */}
          {!analysis && !hasDraftContent && (
            <OnboardingGuide
              onSelectTemplate={handleSelectTemplate}
              onLoadDemo={loadDemoDataset}
            />
          )}

          {/* VIEW 2: DRAFT IN PROGRESS (User generated a blueprint or attached sources, but not evaluated yet) */}
          {!analysis && hasDraftContent && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Informative Guidance Banner */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 dark:bg-cyan-950/30 dark:border-cyan-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white dark:bg-cyan-500/20 dark:text-cyan-300 flex items-center justify-center shrink-0">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Draft In Progress ({blueprint.length} Requirements, {sources.length} Sources)
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Attach official portals or paste verbatim documents below, then click &quot;Evaluate Readiness&quot; to audit policy contradictions.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleRunAnalysis}
                  disabled={isLoading || sources.length === 0}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50 shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                  <span>Run Decision Audit Now</span>
                </button>
              </div>

              {/* Side-by-side Configuration: Sources & Blueprint */}
              <div id="workspace-config-heading" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SourceManager
                  sources={sources}
                  onAddSource={(src) => setSources((prev) => [...prev, src])}
                  onRemoveSource={(id) => setSources((prev) => prev.filter((s) => s.id !== id))}
                  onFetchUrl={handleFetchUrl}
                  onLoadDemo={loadDemoDataset}
                  isLoadingUrl={isLoadingUrl}
                  isInitialModalOpen={isPastedModalRequested}
                />

                <BlueprintEditor
                  blueprint={blueprint}
                  onChange={setBlueprint}
                  onGenerateAI={handleGenerateBlueprint}
                  isLoading={isGeneratingBp}
                />
              </div>
            </motion.div>
          )}

          {/* VIEW 3: ACTIVE EVALUATED ANALYSIS DASHBOARD */}
          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              {/* Decision Readiness Score Meter (Hero) */}
              <ReadinessMeter scoreData={analysis.readiness_score} isLoading={isLoading} />

              {/* Ingestion & Pre-Mortem Configuration (Split view) */}
              <div id="workspace-config-heading" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SourceManager
                  sources={sources}
                  onAddSource={(src) => setSources((prev) => [...prev, src])}
                  onRemoveSource={(id) => setSources((prev) => prev.filter((s) => s.id !== id))}
                  onFetchUrl={handleFetchUrl}
                  onLoadDemo={loadDemoDataset}
                  isLoadingUrl={isLoadingUrl}
                  isInitialModalOpen={isPastedModalRequested}
                />

                <BlueprintEditor
                  blueprint={blueprint}
                  onChange={setBlueprint}
                  onGenerateAI={handleGenerateBlueprint}
                  isLoading={isGeneratingBp}
                />
              </div>

              {/* Findings & Dashboard Navigation Tabs */}
              <section aria-label="Evaluation Findings and Trust Dashboards" className="space-y-4 pt-2">
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto text-xs" role="tablist">
                  <button
                    role="tab"
                    aria-selected={activeTab === "findings"}
                    onClick={() => setActiveTab("findings")}
                    className={`px-3.5 py-2 rounded-xl font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                      activeTab === "findings"
                        ? "bg-indigo-50 text-indigo-800 border border-indigo-200 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/30"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
                    }`}
                  >
                    <Grid3X3 className="w-3.5 h-3.5" />
                    Evidence Matrix & Inspector
                  </button>

                  <button
                    role="tab"
                    aria-selected={activeTab === "conflicts"}
                    onClick={() => setActiveTab("conflicts")}
                    className={`px-3.5 py-2 rounded-xl font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                      activeTab === "conflicts"
                        ? "bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Conflicts & Echo Sources</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-500/30 dark:text-rose-300 ml-1">
                      {analysis.conflicts.length}
                    </span>
                  </button>

                  <button
                    role="tab"
                    aria-selected={activeTab === "trust"}
                    onClick={() => setActiveTab("trust")}
                    className={`px-3.5 py-2 rounded-xl font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                      activeTab === "trust"
                        ? "bg-purple-50 text-purple-800 border border-purple-200 dark:bg-violet-500/20 dark:text-violet-300 dark:border-violet-500/30"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    Three-Lane Trust Dashboard
                  </button>

                  <button
                    role="tab"
                    aria-selected={activeTab === "checklist"}
                    onClick={() => setActiveTab("checklist")}
                    className={`px-3.5 py-2 rounded-xl font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                      activeTab === "checklist"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Prioritized Verification Kit</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/30 dark:text-emerald-300 ml-1">
                      {analysis.checklist.length}
                    </span>
                  </button>
                </div>

                {/* Tab Contents with Animated Transitions */}
                <AnimatePresence mode="wait">
                  {activeTab === "findings" && (
                    <div key="tab-findings" role="tabpanel">
                      <EvidenceMatrix
                        blueprint={analysis.blueprint}
                        sources={analysis.sources}
                        matrix={analysis.matrix}
                        isLoading={isLoading}
                      />
                    </div>
                  )}

                  {activeTab === "conflicts" && (
                    <div key="tab-conflicts" role="tabpanel" className="space-y-6">
                      <ConflictDetector
                        conflicts={analysis.conflicts}
                        temporalDrifts={analysis.temporal_drifts}
                        isLoading={isLoading}
                      />
                      <EchoGraph edges={analysis.independence_edges} isLoading={isLoading} />
                    </div>
                  )}

                  {activeTab === "trust" && (
                    <div key="tab-trust" role="tabpanel">
                      <ThreeLaneTrustDashboard
                        trustData={analysis.three_lane_trust}
                        isLoading={isLoading}
                      />
                    </div>
                  )}

                  {activeTab === "checklist" && (
                    <div key="tab-checklist" role="tabpanel">
                      <VerificationChecklist
                        checklist={analysis.checklist}
                        onToggleVerified={handleToggleVerified}
                        isLoading={isLoading}
                        onExport={() => setIsExportOpen(true)}
                      />
                    </div>
                  )}
                </AnimatePresence>
              </section>
            </motion.div>
          )}

        </main>

        {/* Export Report Modal */}
        {analysis && (
          <ExportModal
            isOpen={isExportOpen}
            onClose={() => setIsExportOpen(false)}
            analysis={analysis}
          />
        )}

        {/* Hidden printable document rendered for browser print / Save as PDF */}
        {analysis && (
          <div className="print-only">
            <PrintableReport analysis={analysis} />
          </div>
        )}

        {/* Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-900 py-6 text-center text-xs text-slate-500 no-print transition-colors duration-200">
          <p>
            ApexAudit — Know what you don&apos;t know before you decide • Intelligent Decision-Readiness Platform • Strict Verbatim Quote Verification &amp; Pre-Mortem Blueprints
          </p>
        </footer>
      </div>

    </div>
  );
}
