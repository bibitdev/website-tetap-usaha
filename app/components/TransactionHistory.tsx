"use client";

import { useState, useMemo } from "react";
import {
  Search,
  ArrowDownToLine,
  ArrowUpFromLine,
  Calendar,
  Filter,
} from "lucide-react";
import { useInventory } from "@/app/lib/inventory-context";
import { formatRupiah } from "@/app/lib/utils";
import type { TransactionType } from "@/app/lib/types";

type FilterType = "ALL" | TransactionType;

/** Format ISO date → human-readable Indonesian format */
function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Format ISO date → time string HH:mm */
function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TransactionHistory() {
  const { transactions, products } = useInventory();
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("ALL");

  /** Build a lookup map: productId → Product */
  const productMap = useMemo(() => {
    const map = new Map<string, (typeof products)[0]>();
    for (const p of products) map.set(p.id, p);
    return map;
  }, [products]);

  /** Filter transactions */
  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      // type filter
      if (filterType !== "ALL" && tx.type !== filterType) return false;
      // search filter — match product name
      if (query) {
        const product = productMap.get(tx.productId);
        const name = product?.name?.toLowerCase() ?? "";
        if (!name.includes(query.toLowerCase())) return false;
      }
      return true;
    });
  }, [transactions, filterType, query, productMap]);

  /** Group transactions by date for visual separation */
  const grouped = useMemo(() => {
    const groups: { date: string; items: typeof filtered }[] = [];
    let currentDate = "";
    for (const tx of filtered) {
      const d = formatDate(tx.date);
      if (d !== currentDate) {
        currentDate = d;
        groups.push({ date: d, items: [] });
      }
      groups[groups.length - 1].items.push(tx);
    }
    return groups;
  }, [filtered]);

  const totalIn = filtered
    .filter((t) => t.type === "IN")
    .reduce((s, t) => s + t.quantity, 0);
  const totalOut = filtered
    .filter((t) => t.type === "OUT")
    .reduce((s, t) => s + t.quantity, 0);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Summary strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className="bg-white rounded-[var(--radius-lg)] p-4 border border-surface-200"
          style={{ boxShadow: "var(--shadow-xs)" }}
        >
          <p className="text-[12px] font-medium text-text-tertiary">
            Total Transaksi
          </p>
          <p className="text-[22px] font-bold text-text-primary mt-1">
            {filtered.length}
          </p>
        </div>
        <div
          className="bg-white rounded-[var(--radius-lg)] p-4 border border-surface-200"
          style={{ boxShadow: "var(--shadow-xs)" }}
        >
          <p className="text-[12px] font-medium text-text-tertiary">
            Total Masuk
          </p>
          <p className="text-[22px] font-bold mt-1" style={{ color: "var(--color-status-safe-text)" }}>
            +{totalIn}
          </p>
        </div>
        <div
          className="bg-white rounded-[var(--radius-lg)] p-4 border border-surface-200"
          style={{ boxShadow: "var(--shadow-xs)" }}
        >
          <p className="text-[12px] font-medium text-text-tertiary">
            Total Keluar
          </p>
          <p className="text-[22px] font-bold mt-1" style={{ color: "var(--color-status-danger-text)" }}>
            -{totalOut}
          </p>
        </div>
      </div>

      {/* Main card */}
      <div
        className="bg-white rounded-[var(--radius-lg)] border border-surface-200"
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-b border-surface-200">
          <div>
            <h3 className="text-[15px] font-semibold text-text-primary">
              Riwayat Transaksi
            </h3>
            <p className="text-[12px] text-text-tertiary mt-0.5">
              {filtered.length} transaksi
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="flex items-center gap-2 h-9 px-3 rounded-[var(--radius-md)] bg-surface-50 border border-surface-200 w-[200px] focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-100 transition-all">
              <Search className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
              <input
                id="history-search"
                type="text"
                placeholder="Cari produk..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-transparent outline-none text-[13px] text-text-primary placeholder:text-text-tertiary w-full"
              />
            </div>
            {/* Type filter */}
            <div className="flex items-center h-9 rounded-[var(--radius-md)] border border-surface-200 overflow-hidden">
              {(["ALL", "IN", "OUT"] as FilterType[]).map((type) => (
                <button
                  key={type}
                  id={`filter-${type.toLowerCase()}`}
                  onClick={() => setFilterType(type)}
                  className={`
                    h-full px-3 text-[12px] font-medium transition-colors cursor-pointer
                    ${
                      filterType === type
                        ? "bg-brand-50 text-brand-600"
                        : "text-text-secondary hover:bg-surface-50"
                    }
                  `}
                >
                  {type === "ALL" ? "Semua" : type === "IN" ? "Masuk" : "Keluar"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Transaction list */}
        <div className="divide-y divide-surface-100">
          {filtered.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-surface-50 flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-5 h-5 text-text-tertiary" />
              </div>
              <p className="text-[14px] font-medium text-text-secondary">
                Belum ada transaksi
              </p>
              <p className="text-[12px] text-text-tertiary mt-1">
                Transaksi akan muncul setelah Anda menambah atau mengurangi stok
              </p>
            </div>
          ) : (
            grouped.map((group) => (
              <div key={group.date}>
                {/* Date header */}
                <div className="px-5 py-2 bg-surface-50/80 sticky top-[72px] z-10">
                  <p className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">
                    {group.date}
                  </p>
                </div>
                {/* Transactions */}
                {group.items.map((tx) => {
                  const product = productMap.get(tx.productId);
                  const isIn = tx.type === "IN";
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface-50/60 transition-colors"
                    >
                      {/* Icon */}
                      <div
                        className="w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0"
                        style={{
                          background: isIn
                            ? "var(--color-status-safe-bg)"
                            : "var(--color-status-danger-bg)",
                        }}
                      >
                        {isIn ? (
                          <ArrowDownToLine
                            className="w-4 h-4"
                            style={{ color: "var(--color-status-safe-text)" }}
                          />
                        ) : (
                          <ArrowUpFromLine
                            className="w-4 h-4"
                            style={{ color: "var(--color-status-danger-text)" }}
                          />
                        )}
                      </div>

                      {/* Product info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-text-primary truncate">
                          {product?.name ?? "Produk tidak ditemukan"}
                        </p>
                        <p className="text-[11px] text-text-tertiary">
                          {isIn ? "Barang Masuk" : "Barang Keluar"} ·{" "}
                          {formatTime(tx.date)}
                        </p>
                      </div>

                      {/* Quantity */}
                      <div className="text-right shrink-0">
                        <p
                          className="text-[14px] font-semibold"
                          style={{
                            color: isIn
                              ? "var(--color-status-safe-text)"
                              : "var(--color-status-danger-text)",
                          }}
                        >
                          {isIn ? "+" : "-"}
                          {tx.quantity}
                        </p>
                        {product && (
                          <p className="text-[11px] text-text-tertiary font-mono">
                            {formatRupiah(tx.quantity * product.price)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
