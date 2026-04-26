"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  History,
  FileBarChart2,
  X,
} from "lucide-react";
import { useInventory } from "@/app/lib/inventory-context";
import { formatRupiah, getStockStatus, statusConfig } from "@/app/lib/utils";

/** Pages that are always searchable */
const PAGES = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard, keywords: "home beranda utama" },
  { label: "Data Barang", href: "/data-barang", icon: Package, keywords: "produk kelola crud" },
  { label: "Barang Masuk", href: "/barang-masuk", icon: ArrowDownToLine, keywords: "stok masuk tambah" },
  { label: "Barang Keluar", href: "/barang-keluar", icon: ArrowUpFromLine, keywords: "stok keluar kurang" },
  { label: "Riwayat", href: "/riwayat", icon: History, keywords: "transaksi history log" },
  { label: "Laporan", href: "/laporan", icon: FileBarChart2, keywords: "report grafik chart" },
];

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const { products } = useInventory();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // ⌘K shortcut
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (open) onClose();
        else {
          // parent handles opening
        }
      }
      if (open && e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // ── Search results ──────────────────────────────────────────
  const results = useMemo(() => {
    const q = query.toLowerCase().trim();

    // Pages
    const pageResults = PAGES.filter(
      (p) =>
        !q ||
        p.label.toLowerCase().includes(q) ||
        p.keywords.includes(q)
    ).map((p) => ({ type: "page" as const, ...p }));

    // Products
    const productResults = q
      ? products
          .filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.category.toLowerCase().includes(q)
          )
          .slice(0, 5)
          .map((p) => ({ type: "product" as const, ...p }))
      : [];

    return [...pageResults, ...productResults];
  }, [query, products]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && results[activeIndex]) {
        e.preventDefault();
        selectResult(activeIndex);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, activeIndex, results]);

  // Reset active on query change
  useEffect(() => setActiveIndex(0), [query]);

  function selectResult(index: number) {
    const r = results[index];
    if (!r) return;
    if (r.type === "page") {
      router.push(r.href);
    } else {
      // Navigate to data-barang for product results
      router.push("/data-barang");
    }
    onClose();
  }

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm animate-fade-in"
        style={{ animationDuration: "150ms" }}
        onClick={onClose}
      />

      {/* Palette */}
      <div
        className="
          fixed z-50 top-[15%] left-1/2 -translate-x-1/2
          w-full max-w-[520px]
          bg-white rounded-[var(--radius-lg)] border border-surface-200
          overflow-hidden animate-fade-in
        "
        style={{ boxShadow: "var(--shadow-lg)", animationDuration: "200ms" }}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 h-12 border-b border-surface-200">
          <Search className="w-4 h-4 text-text-tertiary shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari halaman, produk, atau fitur..."
            className="flex-1 bg-transparent outline-none text-[14px] text-text-primary placeholder:text-text-tertiary"
          />
          <kbd className="flex items-center justify-center h-5 px-1.5 rounded-[4px] bg-surface-100 text-[10px] text-text-tertiary font-mono">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[340px] overflow-y-auto py-2">
          {results.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-[13px] text-text-tertiary">
                Tidak ada hasil untuk &quot;{query}&quot;
              </p>
            </div>
          ) : (
            <>
              {/* Page results */}
              {results.some((r) => r.type === "page") && (
                <div className="px-3 mb-1">
                  <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider px-2 py-1">
                    Halaman
                  </p>
                </div>
              )}
              {results.map((r, i) => {
                if (r.type === "page") {
                  const Icon = r.icon;
                  return (
                    <button
                      key={`page-${r.href}`}
                      onClick={() => selectResult(i)}
                      className={`
                        w-full flex items-center gap-3 px-5 py-2.5
                        text-left transition-colors cursor-pointer
                        ${i === activeIndex ? "bg-brand-50" : "hover:bg-surface-50"}
                      `}
                      onMouseEnter={() => setActiveIndex(i)}
                    >
                      <div
                        className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0"
                        style={{
                          background: i === activeIndex ? "var(--color-brand-100)" : "var(--color-surface-50)",
                        }}
                      >
                        <Icon
                          className="w-4 h-4"
                          style={{
                            color: i === activeIndex ? "var(--color-brand-600)" : "var(--color-text-tertiary)",
                          }}
                        />
                      </div>
                      <span
                        className={`text-[13px] font-medium ${
                          i === activeIndex ? "text-brand-600" : "text-text-primary"
                        }`}
                      >
                        {r.label}
                      </span>
                    </button>
                  );
                }

                // Product result separator
                if (i > 0 && results[i - 1].type === "page" && r.type === "product") {
                  return (
                    <div key={`sep-${i}`}>
                      <div className="px-3 mt-2 mb-1">
                        <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider px-2 py-1">
                          Produk
                        </p>
                      </div>
                      <ProductResult
                        product={r}
                        isActive={i === activeIndex}
                        onClick={() => selectResult(i)}
                        onHover={() => setActiveIndex(i)}
                      />
                    </div>
                  );
                }

                if (r.type === "product") {
                  return (
                    <ProductResult
                      key={`prod-${r.id}`}
                      product={r}
                      isActive={i === activeIndex}
                      onClick={() => selectResult(i)}
                      onHover={() => setActiveIndex(i)}
                    />
                  );
                }

                return null;
              })}
            </>
          )}
        </div>

        {/* Footer hints */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-surface-100 bg-surface-50/50">
          <span className="text-[10px] text-text-tertiary flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-surface-200 text-[9px] font-mono">↑↓</kbd>
            navigasi
          </span>
          <span className="text-[10px] text-text-tertiary flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-surface-200 text-[9px] font-mono">↵</kbd>
            pilih
          </span>
          <span className="text-[10px] text-text-tertiary flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-surface-200 text-[9px] font-mono">esc</kbd>
            tutup
          </span>
        </div>
      </div>
    </>
  );
}

/* ================================================================
   Product result sub-component
   ================================================================ */
function ProductResult({
  product,
  isActive,
  onClick,
  onHover,
}: {
  product: { id: string; name: string; image: string; category: string; stock: number; price: number };
  isActive: boolean;
  onClick: () => void;
  onHover: () => void;
}) {
  const status = statusConfig[getStockStatus(product.stock)];
  return (
    <button
      onClick={onClick}
      onMouseEnter={onHover}
      className={`
        w-full flex items-center gap-3 px-5 py-2.5
        text-left transition-colors cursor-pointer
        ${isActive ? "bg-brand-50" : "hover:bg-surface-50"}
      `}
    >
      <div className="w-8 h-8 rounded-[var(--radius-sm)] overflow-hidden bg-surface-50 border border-surface-200 shrink-0 relative">
        <Image src={product.image} alt="" fill className="object-cover" sizes="32px" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[13px] font-medium truncate ${isActive ? "text-brand-600" : "text-text-primary"}`}>
          {product.name}
        </p>
        <p className="text-[11px] text-text-tertiary">
          {product.category} · {formatRupiah(product.price)}
        </p>
      </div>
      <span
        className="text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0"
        style={{ background: status.bg, color: status.text }}
      >
        {product.stock} stok
      </span>
    </button>
  );
}
