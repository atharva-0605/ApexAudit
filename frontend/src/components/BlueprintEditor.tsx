"use client";

import React, { useState } from "react";
import { BlueprintItem } from "../lib/types";
import { Plus, Trash2, ShieldAlert, Sparkles, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  blueprint: BlueprintItem[];
  onChange: (updated: BlueprintItem[]) => void;
  onGenerateAI: () => void;
  isLoading: boolean;
}

export const BlueprintEditor: React.FC<Props> = ({
  blueprint,
  onChange,
  onGenerateAI,
  isLoading
}) => {
  const [newAspect, setNewAspect] = useState("");
  const [newFailure, setNewFailure] = useState("");
  const [newCriticality, setNewCriticality] = useState<"HIGH" | "MEDIUM" | "LOW">("HIGH");

  const handleAdd = () => {
    if (!newAspect.trim()) return;
    const item: BlueprintItem = {
      id: `bp-custom-${Date.now()}`,
      aspect: newAspect.trim(),
      failure_scenario: newFailure.trim() || `Unverified ${newAspect} resulting in disqualification or rejection.`,
      criticality: newCriticality,
      description: `User-defined pre-mortem checklist item for ${newAspect.trim()}`,
      weight: newCriticality === "HIGH" ? 1.0 : newCriticality === "MEDIUM" ? 0.6 : 0.3
    };
    onChange([...blueprint, item]);
    setNewAspect("");
    setNewFailure("");
  };

  const handleRemove = (id: string) => {
    onChange(blueprint.filter((item) => item.id !== id));
  };

  const handleUpdateCriticality = (id: string, crit: "HIGH" | "MEDIUM" | "LOW") => {
    const updated = blueprint.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          criticality: crit,
          weight: crit === "HIGH" ? 1.0 : crit === "MEDIUM" ? 0.6 : 0.3
        };
      }
      return item;
    });
    onChange(updated);
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
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 dark:bg-cyan-400"></span>
            Pre-Mortem Blueprint ({blueprint.length} Requirements)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Derived by working backward from real-world catastrophic failure scenarios. Editable before analysis.
          </p>
        </div>

        <button
          onClick={onGenerateAI}
          disabled={isLoading}
          className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 dark:from-cyan-600 dark:to-blue-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Regenerate Blueprint</span>
            </>
          )}
        </button>
      </div>

      {/* Blueprint Items List with AnimatePresence */}
      <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {blueprint.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-50/70 border border-slate-200 dark:bg-slate-950/70 dark:border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-800 dark:text-slate-100">{item.aspect}</span>
                  <span
                    className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
                      item.criticality === "HIGH"
                        ? "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30"
                        : item.criticality === "MEDIUM"
                        ? "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30"
                        : "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30"
                    }`}
                  >
                    {item.criticality} (Weight: {item.weight})
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-1 leading-snug">
                  <strong className="text-slate-700 dark:text-slate-300">Failure Risk:</strong> {item.failure_scenario}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={item.criticality}
                  onChange={(e) => handleUpdateCriticality(item.id, e.target.value as any)}
                  aria-label={`Criticality weight for ${item.aspect}`}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded px-2 py-1 text-[11px] focus:outline-none focus:border-indigo-500 dark:focus:border-cyan-500 cursor-pointer"
                >
                  <option value="HIGH">High Criticality</option>
                  <option value="MEDIUM">Medium Criticality</option>
                  <option value="LOW">Low Criticality</option>
                </select>

                <button
                  onClick={() => handleRemove(item.id)}
                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded hover:bg-slate-100 dark:text-slate-500 dark:hover:text-rose-400 dark:hover:bg-slate-900 transition-colors cursor-pointer"
                  aria-label={`Remove requirement ${item.aspect}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Custom Aspect */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
        <div className="sm:col-span-5">
          <input
            type="text"
            value={newAspect}
            onChange={(e) => setNewAspect(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Add custom aspect (e.g., Late Fee Penalty)"
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs focus:outline-none focus:border-indigo-500 dark:focus:border-cyan-500"
          />
        </div>
        <div className="sm:col-span-4">
          <input
            type="text"
            value={newFailure}
            onChange={(e) => setNewFailure(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Potential failure scenario"
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs focus:outline-none focus:border-indigo-500 dark:focus:border-cyan-500"
          />
        </div>
        <div className="sm:col-span-2">
          <select
            value={newCriticality}
            onChange={(e) => setNewCriticality(e.target.value as any)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-2 text-slate-700 dark:text-slate-300 text-xs focus:outline-none cursor-pointer"
          >
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
        <div className="sm:col-span-1">
          <button
            onClick={handleAdd}
            className="w-full h-full bg-slate-100 hover:bg-slate-200 text-indigo-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-cyan-400 rounded-lg flex items-center justify-center py-2 transition-colors cursor-pointer"
            title="Add to blueprint"
            aria-label="Add aspect to blueprint"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
