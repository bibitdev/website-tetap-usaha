"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, Filter, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { useInventory } from "@/app/lib/inventory-context";
import { getStockStatus, statusConfig, formatRupiah } from "@/app/lib/utils";

export default function ProductTable() {
  const { products, openModal } = useInventory();
  const [query, setQuery] = useState("");

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase())
  );

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
          <button id="filter-btn" className="h-9 px-3 rounded-[var(--radius-md)] border border-surface-200 flex items-center gap-1.5 text-[13px] text-text-secondary hover:bg-surface-50 transition-colors cursor-pointer">
            <Filter className="w-3.5 h-3.5" />
            Filter
          </button>
        </div>
      </div>

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
            {filtered.map((product) => {
              const stockStatus = getStockStatus(product.stock);
              const status = statusConfig[stockStatus];
              return (
                <tr
                  key={product.id}
                  className="animate-fade-in border-b border-surface-100 last:border-b-0 hover:bg-surface-50/60 transition-colors"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[var(--radius-sm)] overflow-hidden bg-surface-50 border border-surface-200 shrink-0 relative">
                        <Image src={product.image} alt={product.name} fill className="object-cover" sizes="40px" />
                      </div>
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
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-surface-200">
        <p className="text-[12px] text-text-tertiary">Menampilkan {filtered.length} dari {products.length} produk</p>
        <div className="flex items-center gap-1">
          {[1, 2, 3].map((p) => (
            <button
              key={p}
              className={`w-8 h-8 rounded-[var(--radius-sm)] text-[12px] font-medium transition-colors cursor-pointer ${p === 1 ? "bg-brand-500 text-white" : "text-text-secondary hover:bg-surface-50"}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
