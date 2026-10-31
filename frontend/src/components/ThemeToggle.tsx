"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("apexaudit-theme") || localStorage.getItem("verifyfirst-theme");
    if (saved === "dark") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    try {
      localStorage.setItem("apexaudit-theme", next);
    } catch (e) {
      // Storage access might be restricted in some iframes
    }
    if (next === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
      title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
      className="relative p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all shadow-xs cursor-pointer flex items-center justify-center overflow-hidden"
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === "light" ? (
          <motion.div
            key="light-icon"
            initial={{ scale: 0.5, rotate: -90, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.5, rotate: 90, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Moon className="w-4 h-4 text-slate-700" />
          </motion.div>
        ) : (
          <motion.div
            key="dark-icon"
            initial={{ scale: 0.5, rotate: 90, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.5, rotate: -90, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Sun className="w-4 h-4 text-amber-400" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
};
