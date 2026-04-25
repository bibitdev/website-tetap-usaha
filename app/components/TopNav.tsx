"use client";

import { Bell, Search, ChevronDown } from "lucide-react";

export default function TopNav() {
  return (
    <header
      className="
        sticky top-0 z-30
        flex items-center justify-between
        h-[72px] px-8
        bg-white/80 backdrop-blur-xl
        border-b border-surface-200
      "
      style={{ boxShadow: "var(--shadow-xs)" }}
    >
      {/* Left: page title */}
      <div>
        <h2 className="text-[18px] font-semibold text-text-primary tracking-tight">
          Dashboard
        </h2>
        <p className="text-[13px] text-text-tertiary -mt-0.5">
          Selamat datang kembali 👋
        </p>
      </div>

      {/* Right: search + notifications + profile */}
      <div className="flex items-center gap-4">
        {/* Search (desktop) */}
        <div className="hidden lg:flex items-center gap-2 h-10 px-4 rounded-[var(--radius-lg)] bg-surface-50 border border-surface-200 w-[280px] transition-all duration-200 focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-100">
          <Search className="w-4 h-4 text-text-tertiary shrink-0" />
          <input
            id="global-search"
            type="text"
            placeholder="Cari menu atau fitur..."
            className="bg-transparent outline-none text-[13px] text-text-primary placeholder:text-text-tertiary w-full"
          />
          <kbd className="hidden xl:flex items-center justify-center h-5 px-1.5 rounded-[6px] bg-surface-200 text-[10px] text-text-tertiary font-mono">
            ⌘K
          </kbd>
        </div>

        {/* Notifications */}
        <button
          id="notifications-btn"
          className="relative w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center hover:bg-surface-50 transition-colors cursor-pointer"
          aria-label="Notifications"
        >
          <Bell className="w-[18px] h-[18px] text-text-secondary" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-status-danger ring-2 ring-white" />
        </button>

        {/* Divider */}
        <div className="h-8 w-px bg-surface-200" />

        {/* Profile */}
        <button
          id="profile-btn"
          className="flex items-center gap-2.5 h-10 pl-1.5 pr-3 rounded-[var(--radius-lg)] hover:bg-surface-50 transition-colors cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
            <span className="text-[12px] font-semibold text-white">A</span>
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-[13px] font-medium text-text-primary leading-tight">
              Admin
            </p>
            <p className="text-[11px] text-text-tertiary leading-tight">
              Manager
            </p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-text-tertiary ml-1" />
        </button>
      </div>
    </header>
  );
}
