"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  History,
  FileBarChart2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  { icon: Package, label: "Data Barang", id: "data-barang" },
  { icon: ArrowDownToLine, label: "Barang Masuk", id: "barang-masuk" },
  { icon: ArrowUpFromLine, label: "Barang Keluar", id: "barang-keluar" },
  { icon: History, label: "Riwayat", id: "riwayat" },
  { icon: FileBarChart2, label: "Laporan", id: "laporan" },
];

export default function Sidebar() {
  const [activeId, setActiveId] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`
        relative flex flex-col h-screen sticky top-0
        bg-white border-r border-surface-200
        transition-all duration-300 ease-in-out
        ${collapsed ? "w-[72px]" : "w-[260px]"}
      `}
      style={{ boxShadow: "var(--shadow-xs)" }}
    >
      {/* Logo area */}
      <div className="flex items-center gap-3 px-5 h-[72px] border-b border-surface-200 shrink-0 overflow-hidden">
        <div
          className="flex items-center justify-center w-9 h-9 rounded-[var(--radius-md)] shrink-0"
          style={{
            background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
          }}
        >
          <Package className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="text-[15px] font-semibold text-text-primary tracking-tight leading-tight">
              Tetap Usaha
            </h1>
            <p className="text-[11px] text-text-tertiary leading-tight">
              Inventory System
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-1 stagger">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeId === item.id;

            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => setActiveId(item.id)}
                className={`
                  animate-slide-left
                  group flex items-center gap-3 w-full px-3 h-10 rounded-[var(--radius-md)]
                  text-[14px] font-medium transition-all duration-200 cursor-pointer
                  ${
                    isActive
                      ? "bg-brand-50 text-brand-600"
                      : "text-text-secondary hover:bg-surface-50 hover:text-text-primary"
                  }
                `}
              >
                <Icon
                  className={`w-[18px] h-[18px] shrink-0 transition-colors duration-200 ${
                    isActive
                      ? "text-brand-500"
                      : "text-text-tertiary group-hover:text-text-secondary"
                  }`}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
                {isActive && !collapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500 animate-count" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Collapse toggle */}
      <button
        id="sidebar-toggle"
        onClick={() => setCollapsed(!collapsed)}
        className="
          absolute -right-3 top-[80px]
          w-6 h-6 rounded-full bg-white border border-surface-200
          flex items-center justify-center
          shadow-sm hover:shadow-md transition-all duration-200
          hover:bg-brand-50 hover:border-brand-200 cursor-pointer
          z-10
        "
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight className="w-3.5 h-3.5 text-text-tertiary" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5 text-text-tertiary" />
        )}
      </button>

      {/* Bottom section */}
      <div className="px-3 pb-4 border-t border-surface-200 pt-3 shrink-0">
        <div className="flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] hover:bg-surface-50 transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shrink-0">
            <span className="text-[12px] font-semibold text-white">TU</span>
          </div>
          {!collapsed && (
            <div className="animate-fade-in min-w-0">
              <p className="text-[13px] font-medium text-text-primary truncate">
                Admin
              </p>
              <p className="text-[11px] text-text-tertiary truncate">
                admin@tetapusaha.id
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
