"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { Bell, Search, ChevronDown, Menu } from "lucide-react";
import { useInventory } from "@/app/lib/inventory-context";
import { getStockStatus } from "@/app/lib/utils";
import CommandPalette from "./CommandPalette";
import NotificationPanel from "./NotificationPanel";
import ThemeToggle from "./ThemeToggle";
import { useSidebar } from "@/app/lib/sidebar-context";

/** Map route path → page title + subtitle */
const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Dashboard", subtitle: "Selamat datang kembali 👋" },
  "/data-barang": { title: "Data Barang", subtitle: "Kelola produk inventaris" },
  "/barang-masuk": { title: "Barang Masuk", subtitle: "Catat stok masuk" },
  "/barang-keluar": { title: "Barang Keluar", subtitle: "Catat stok keluar" },
  "/riwayat": { title: "Riwayat", subtitle: "Riwayat transaksi stok" },
  "/laporan": { title: "Laporan", subtitle: "Laporan inventaris" },
};

export default function TopNav() {
  const pathname = usePathname();
  const { products } = useInventory();
  const { title, subtitle } = pageTitles[pathname] ?? {
    title: "Halaman",
    subtitle: "",
  };

  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Alert count for bell badge
  const alertCount = useMemo(
    () => products.filter((p) => getStockStatus(p.stock) !== "safe").length,
    [products]
  );

  // ⌘K shortcut to open search
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
        setNotifOpen(false);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const { setMobileOpen } = useSidebar();

  return (
    <>
      <header
        className="
          sticky top-0 z-30
          flex items-center justify-between
          h-[60px] lg:h-[72px] px-4 lg:px-8
          bg-white/80 backdrop-blur-xl
          border-b border-surface-200
        "
        style={{ boxShadow: "var(--shadow-xs)" }}
      >
        {/* Left: hamburger + page title */}
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            id="mobile-menu-btn"
            onClick={() => setMobileOpen(true)}
            className="lg:hidden w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center hover:bg-surface-50 transition-colors cursor-pointer -ml-1"
          >
            <Menu className="w-5 h-5 text-text-secondary" />
          </button>
          <div>
            <h2 className="text-[16px] lg:text-[18px] font-semibold text-text-primary tracking-tight">
              {title}
            </h2>
            <p className="text-[12px] lg:text-[13px] text-text-tertiary -mt-0.5 hidden sm:block">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Right: search + notifications + profile */}
        <div className="flex items-center gap-2 lg:gap-4">
          {/* Search trigger (desktop) */}
          <button
            id="global-search"
            onClick={() => { setSearchOpen(true); setNotifOpen(false); }}
            className="hidden lg:flex items-center gap-2 h-10 px-4 rounded-[var(--radius-lg)] bg-surface-50 border border-surface-200 w-[280px] transition-all duration-200 hover:border-surface-300 cursor-pointer"
          >
            <Search className="w-4 h-4 text-text-tertiary shrink-0" />
            <span className="text-[13px] text-text-tertiary flex-1 text-left">
              Cari menu atau fitur...
            </span>
            <kbd className="hidden xl:flex items-center justify-center h-5 px-1.5 rounded-[6px] bg-surface-200 text-[10px] text-text-tertiary font-mono">
              ⌘K
            </kbd>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              id="notifications-btn"
              onClick={() => { setNotifOpen(!notifOpen); setSearchOpen(false); }}
              className="relative w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center hover:bg-surface-50 transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-[18px] h-[18px] text-text-secondary" />
              {alertCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-status-danger text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                  {alertCount}
                </span>
              )}
            </button>
            <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
          </div>

          {/* Theme toggle */}
          <ThemeToggle />

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

      {/* Command Palette (rendered outside header for proper z-index) */}
      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
