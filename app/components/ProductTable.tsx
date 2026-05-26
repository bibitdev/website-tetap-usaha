"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { Search, Filter, ArrowDownToLine, ArrowUpFromLine, X, ChevronLeft, ChevronRight, Package } from "lucide-react";
import { useInventory } from "@/app/lib/inventory-context";
import { getStockStatus, statusConfig, formatRupiah } from "@/app/lib/utils";
import type { StockStatus } from "@/app/lib/types";

export default function ProductTable() {
  const { products, openModal } = useInventory();
  const [query, setQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedStatuses, setSelectedStatuses] = useState<Set<StockStatus>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // ── Derive unique categories from products ──────────────────
  const categories = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category))).sort();
  }, [products]);

  // ── Filter logic ────────────────────────────────────────────
  const filtered = useMemo(() => {
    return products.filter((p) => {
      // text search
      if (query) {
        const q = query.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.category.toLowerCase().includes(q)) {
          return false;
        }
      }
      // category filter
      if (selectedCategories.size > 0 && !selectedCategories.has(p.category)) {
        return false;
      }
      // status filter
      if (selectedStatuses.size > 0 && !selectedStatuses.has(getStockStatus(p.stock))) {
        return false;
      }
      return true;
    });
  }, [products, query, selectedCategories, selectedStatuses]);

  const activeFilterCount = selectedCategories.size + selectedStatuses.size;

  // ── Pagination ──────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [query, selectedCategories, selectedStatuses]);

  // ── Toggle helpers ──────────────────────────────────────────
  function toggleCategory(cat: string) {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  function toggleStatus(status: StockStatus) {
    setSelectedStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  }

  function clearAllFilters() {
    setSelectedCategories(new Set());
    setSelectedStatuses(new Set());
  }

  return (
    <div className="bg-white rounded-[var(--radius-lg)] border border-surface-200 animate-fade-in" style={{ boxShadow: "var(--shadow-sm)", animationDelay: "200ms" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-b border-surface-200">
        <div>
          <h3 className="text-[15px] font-semibold text-text-primary">Daftar Produk</h3>
          <p className="text-[12px] text-text-tertiary mt-0.5">{filtered.length} produk ditemukan</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 h-9 px-3 rounded-[var(--radius-md)] bg-surface-50 border border-surface-200 w-[220px] focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-100 transition-all">
            <Search className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
            <input
              id="product-search"
              type="text"
              placeholder="Cari produk..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-transparent outline-none text-[13px] text-text-primary placeholder:text-text-tertiary w-full"
            />
          </div>
          {/* Filter button */}
          <div className="relative">
            <button
              id="filter-btn"
              onClick={() => setFilterOpen(!filterOpen)}
              className={`
                h-9 px-3 rounded-[var(--radius-md)] border flex items-center gap-1.5
                text-[13px] font-medium transition-colors cursor-pointer
                ${
                  activeFilterCount > 0
                    ? "border-brand-300 bg-brand-50 text-brand-600"
                    : "border-surface-200 text-text-secondary hover:bg-surface-50"
                }
              `}
            >
              <Filter className="w-3.5 h-3.5" />
              Filter
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Filter dropdown */}
            {filterOpen && (
              <div
                className="
                  absolute right-0 top-full mt-2 z-30
                  w-[260px] bg-white rounded-[var(--radius-md)] border border-surface-200
                  animate-fade-in
                "
                style={{ boxShadow: "var(--shadow-lg)", animationDuration: "150ms" }}
              >
                {/* Dropdown header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100">
                  <span className="text-[13px] font-semibold text-text-primary">Filter</span>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="text-[11px] font-medium text-brand-500 hover:text-brand-600 cursor-pointer"
                    >
                      Reset semua
                    </button>
                  )}
                </div>

                {/* Category section */}
                <div className="px-4 py-3 border-b border-surface-100">
                  <p className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider mb-2">
                    Kategori
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map((cat) => {
                      const isActive = selectedCategories.has(cat);
                      return (
                        <button
                          key={cat}
                          onClick={() => toggleCategory(cat)}
                          className={`
                            h-7 px-2.5 rounded-full text-[11px] font-medium
                            transition-colors cursor-pointer border
                            ${
                              isActive
                                ? "bg-brand-50 text-brand-600 border-brand-200"
                                : "bg-surface-50 text-text-secondary border-surface-200 hover:border-surface-300"
                            }
                          `}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Status section */}
                <div className="px-4 py-3">
                  <p className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider mb-2">
                    Status Stok
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(["safe", "low", "out"] as StockStatus[]).map((s) => {
                      const cfg = statusConfig[s];
                      const isActive = selectedStatuses.has(s);
                      return (
                        <button
                          key={s}
                          onClick={() => toggleStatus(s)}
                          className={`
                            h-7 px-2.5 rounded-full text-[11px] font-medium
                            transition-colors cursor-pointer border
                            flex items-center gap-1.5
                            ${
                              isActive
                                ? "border-brand-200"
                                : "border-surface-200 hover:border-surface-300"
                            }
                          `}
                          style={
                            isActive
                              ? { background: cfg.bg, color: cfg.text, borderColor: cfg.dot }
                              : undefined
                          }
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: cfg.dot }}
                          />
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 px-5 py-2.5 border-b border-surface-100 bg-surface-50/50">
          <span className="text-[11px] text-text-tertiary shrink-0">Filter aktif:</span>
          <div className="flex flex-wrap gap-1.5">
            {Array.from(selectedCategories).map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center gap-1 h-6 px-2 rounded-full bg-brand-50 text-brand-600 text-[11px] font-medium border border-brand-200"
              >
                {cat}
                <button onClick={() => toggleCategory(cat)} className="cursor-pointer hover:text-brand-800">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {Array.from(selectedStatuses).map((s) => {
              const cfg = statusConfig[s];
              return (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 h-6 px-2 rounded-full text-[11px] font-medium border"
                  style={{ background: cfg.bg, color: cfg.text, borderColor: cfg.dot }}
                >
                  {cfg.label}
                  <button onClick={() => toggleStatus(s)} className="cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
            <button
              onClick={clearAllFilters}
              className="text-[11px] text-text-tertiary hover:text-text-secondary cursor-pointer ml-1"
            >
              Hapus semua
            </button>
          </div>
        </div>
      )}

      {/* Close dropdown on outside click */}
      {filterOpen && (
        <div className="fixed inset-0 z-20" onClick={() => setFilterOpen(false)} />
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-surface-200">
              <th className="text-left text-[12px] font-medium text-text-tertiary uppercase tracking-wider px-5 py-3">Produk</th>
              <th className="text-left text-[12px] font-medium text-text-tertiary uppercase tracking-wider px-4 py-3">Kategori</th>
              <th className="text-center text-[12px] font-medium text-text-tertiary uppercase tracking-wider px-4 py-3">Stok</th>
              <th className="text-left text-[12px] font-medium text-text-tertiary uppercase tracking-wider px-4 py-3">Harga</th>
              <th className="text-left text-[12px] font-medium text-text-tertiary uppercase tracking-wider px-4 py-3">Total Nilai</th>
              <th className="text-left text-[12px] font-medium text-text-tertiary uppercase tracking-wider px-4 py-3">Status</th>
              <th className="text-center text-[12px] font-medium text-text-tertiary uppercase tracking-wider px-5 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody className="stagger">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-16 text-center">
                  <p className="text-[13px] text-text-tertiary">Tidak ada produk yang cocok dengan filter</p>
                </td>
              </tr>
            ) : (
              paginated.map((product) => {
                const stockStatus = getStockStatus(product.stock);
                const status = statusConfig[stockStatus];
                return (
                  <tr
                    key={product.id}
                    className="animate-fade-in border-b border-surface-100 last:border-b-0 hover:bg-surface-50/60 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <ProductThumbnail src={product.image} name={product.name} />
                        <span className="text-[13px] font-medium text-text-primary">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2.5 py-1 rounded-[var(--radius-sm)] bg-surface-50 text-[12px] font-medium text-text-secondary">{product.category}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-[13px] font-semibold text-text-primary">{product.stock}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[13px] text-text-secondary font-mono">{formatRupiah(product.price)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[13px] text-text-primary font-mono font-medium">{formatRupiah(product.stock * product.price)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium" style={{ background: status.bg, color: status.text }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: status.dot }} />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          id={`masuk-${product.id}`}
                          onClick={() => openModal(product.id, "IN")}
                          className="h-8 px-3 rounded-[var(--radius-sm)] bg-status-safe-bg text-[12px] font-medium flex items-center gap-1 transition-all hover:shadow-sm cursor-pointer"
                          style={{ color: "var(--color-status-safe-text)" }}
                        >
                          <ArrowDownToLine className="w-3.5 h-3.5" />
                          Masuk
                        </button>
                        <button
                          id={`keluar-${product.id}`}
                          onClick={() => openModal(product.id, "OUT")}
                          className="h-8 px-3 rounded-[var(--radius-sm)] bg-status-danger-bg text-[12px] font-medium flex items-center gap-1 transition-all hover:shadow-sm cursor-pointer"
                          style={{ color: "var(--color-status-danger-text)" }}
                        >
                          <ArrowUpFromLine className="w-3.5 h-3.5" />
                          Keluar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-surface-200">
        <p className="text-[12px] text-text-tertiary">
          Menampilkan {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filtered.length)}-{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} dari {filtered.length} produk
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center text-text-secondary hover:bg-surface-50 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-8 h-8 rounded-[var(--radius-sm)] text-[12px] font-medium transition-colors cursor-pointer ${
                  p === currentPage
                    ? "bg-brand-500 text-white"
                    : "text-text-secondary hover:bg-surface-50"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center text-text-secondary hover:bg-surface-50 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================
   ProductThumbnail — handles missing / broken image gracefully
   ================================================================ */
function ProductThumbnail({ src, name }: { src: string; name: string }) {
  const [error, setError] = useState(false);
  const hasValidSrc = src && !error;

  return (
    <div className="w-10 h-10 rounded-[var(--radius-sm)] overflow-hidden bg-surface-50 border border-surface-200 shrink-0 relative flex items-center justify-center">
      {hasValidSrc ? (
        <Image
          src={src}
          alt={name}
          fill
          className="object-cover"
          sizes="40px"
          onError={() => setError(true)}
        />
      ) : (
        <Package className="w-5 h-5 text-text-tertiary" />
      )}
    </div>
  );
}
