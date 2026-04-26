"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  // Load preference on mount
  useEffect(() => {
    const saved = localStorage.getItem("tetap-usaha-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = saved ? saved === "dark" : prefersDark;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  function toggle() {
    const newDark = !dark;
    setDark(newDark);
    document.documentElement.classList.toggle("dark", newDark);
    localStorage.setItem("tetap-usaha-theme", newDark ? "dark" : "light");
  }

  return (
    <button
      id="theme-toggle"
      onClick={toggle}
      className="
        w-10 h-10 rounded-[var(--radius-md)]
        flex items-center justify-center
        hover:bg-surface-50 transition-colors cursor-pointer
      "
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? (
        <Sun className="w-[18px] h-[18px] text-text-secondary" />
      ) : (
        <Moon className="w-[18px] h-[18px] text-text-secondary" />
      )}
    </button>
  );
}
