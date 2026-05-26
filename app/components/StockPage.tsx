"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Search,
  ChevronDown,
  Calendar,
  Check,
} from "lucide-react";
import { useInventory } from "@/app/lib/inventory-context";
import { formatRupiah, getStockStatus, statusConfig } from "@/app/lib/utils";
import type { TransactionType } from "@/app/lib/types";

interface StockPageProps {
  type: TransactionType; // "IN" | "OUT"
}

/** Config per type */
const CONFIG = {
  IN: {
    title: "Barang Masuk",
    subtitle: "Tambah stok produk ke inventaris",
    actionLabel: "Tambah Stok",
    icon: ArrowDownToLine,
    gradient: "linear-gradient(135deg, #22c55e, #16a34a)",
    bg: "var(--color-status-safe-bg)",
    text: "var(--color-status-safe-text)",
    dot: "var(--color-status-safe)",
    sign: "+",
  },
  OUT: {
    title: "Barang Keluar",
    subtitle: "Kurangi stok produk dari inventaris",
    actionLabel: "Kurangi Stok",
    icon: ArrowUpFromLine,
    gradient: "linear-gradient(135deg, #ef4444, #dc2626)",
    bg: "var(--color-status-danger-bg)",
    text: "var(--color-status-danger-text)",
    dot: "var(--color-status-danger)",
    sign: "-",
  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function StockPage({ type }: StockPageProps) {
  const { products, transactions, submitStock } = useInventory();
  const cfg = CONFIG[type];
  const Icon = cfg.icon;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // ── Filtered transactions for this type ─────────────────────
  const filteredTx = useMemo(() => {
    return transactions.filter((tx) => tx.type === type);
  }, [transactions, type]);

  // ── Stats ───────────────────────────────────────────────────
  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = filteredTx.filter((tx) => {
      const d = new Date(tx.date);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });
    const totalQty = thisMonth.reduce((s, t) => s + t.quantity, 0);
    return { totalAll: filteredTx.length, totalMonth: thisMonth.length, totalQty };
  }, [filteredTx]);

  // ── Product lookup ──────────────────────────────────────────
  const productMap = useMemo(() => {
    const map = new Map<string, (typeof products)[0]>();
    for (const p of products) map.set(p.id, p);
    return map;
  }, [products]);

  const selectedProduct = selectedProductId
    ? productMap.get(selectedProductId) ?? null
    : null;

  // ── Product search for dropdown ─────────────────────────────
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  // ── Group transactions by date ──────────────────────────────
  const grouped = useMemo(() => {
    const groups: { date: string; items: typeof filteredTx }[] = [];
    let current = "";
    for (const tx of filteredTx) {
      const d = formatDate(tx.date);
      if (d !== current) {
        current = d;
        groups.push({ date: d, items: [] });
      }
      groups[groups.length - 1].items.push(tx);
    }
    return groups;
  }, [filteredTx]);

  // ── Submit handler ──────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProductId) {
      setError("Pilih produk terlebih dahulu");
      return;
    }
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      setError("Jumlah harus lebih dari 0");
      return;
    }
    if (type === "OUT" && selectedProduct && qty > selectedProduct.stock) {
      setError(`Stok tidak cukup (tersedia: ${selectedProduct.stock})`);
      return;
    }

    setError("");
    await submitStock(selectedProductId, type, qty);
    setSuccessMsg(
      `${cfg.sign}${qty} ${selectedProduct?.name ?? "produk"} berhasil dicatat`
    );
    setQuantity("");
    setSelectedProductId(null);
    setTimeout(() => setSuccessMsg(""), 3000);
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* ── Summary strip ───────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className="bg-white rounded-[var(--radius-lg)] p-4 border border-surface-200"
          style={{ boxShadow: "var(--shadow-xs)" }}
        >
          <p className="text-[12px] font-medium text-text-tertiary">
            Total Transaksi
          </p>
          <p className="text-[22px] font-bold text-text-primary mt-1">
            {stats.totalAll}
          </p>
        </div>
        <div
          className="bg-white rounded-[var(--radius-lg)] p-4 border border-surface-200"
          style={{ boxShadow: "var(--shadow-xs)" }}
        >
          <p className="text-[12px] font-medium text-text-tertiary">
            Bulan Ini
          </p>
          <p className="text-[22px] font-bold mt-1" style={{ color: cfg.text }}>
            {stats.totalMonth} transaksi
          </p>
        </div>
        <div
          className="bg-white rounded-[var(--radius-lg)] p-4 border border-surface-200"
          style={{ boxShadow: "var(--shadow-xs)" }}
        >
          <p className="text-[12px] font-medium text-text-tertiary">
            Total {type === "IN" ? "Masuk" : "Keluar"} (Bulan Ini)
          </p>
          <p className="text-[22px] font-bold mt-1" style={{ color: cfg.text }}>
            {cfg.sign}{stats.totalQty}
          </p>
        </div>
      </div>

      {/* ── Quick action card ───────────────────────────────── */}
      <div
        className="bg-white rounded-[var(--radius-lg)] border border-surface-200 p-5"
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center"
            style={{ background: cfg.bg }}
          >
            <Icon className="w-4 h-4" style={{ color: cfg.text }} />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-text-primary">
              {cfg.title} Cepat
            </h3>
            <p className="text-[12px] text-text-tertiary">{cfg.subtitle}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_160px_auto] gap-3 items-end">
            {/* Product selector */}
            <div className="relative">
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">
                Produk
              </label>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="
                  w-full h-10 px-3 rounded-[var(--radius-md)]
                  bg-surface-50 border border-surface-200
                  text-[13px] text-left
                  flex items-center justify-between
                  focus:border-brand-300 focus:ring-2 focus:ring-brand-100
                  transition-all cursor-pointer
                "
              >
                {selectedProduct ? (
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-[4px] overflow-hidden bg-surface-100 shrink-0 relative">
                      <Image
                        src={selectedProduct.image}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="24px"
                      />
                    </div>
                    <span className="truncate text-text-primary">
                      {selectedProduct.name}
                    </span>
                  </div>
                ) : (
                  <span className="text-text-tertiary">Pilih produk...</span>
                )}
                <ChevronDown className="w-4 h-4 text-text-tertiary shrink-0" />
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div
                  className="
                    absolute top-full left-0 right-0 mt-1 z-20
                    bg-white rounded-[var(--radius-md)] border border-surface-200
                    max-h-[240px] overflow-y-auto animate-fade-in
                  "
                  style={{
                    boxShadow: "var(--shadow-lg)",
                    animationDuration: "150ms",
                  }}
                >
                  {/* Search inside dropdown */}
                  <div className="px-3 py-2 border-b border-surface-100 sticky top-0 bg-white">
                    <div className="flex items-center gap-2 h-8 px-2 rounded-[var(--radius-sm)] bg-surface-50 border border-surface-200">
                      <Search className="w-3 h-3 text-text-tertiary" />
                      <input
                        type="text"
                        placeholder="Cari..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent outline-none text-[12px] text-text-primary placeholder:text-text-tertiary w-full"
                        autoFocus
                      />
                    </div>
                  </div>
                  {filteredProducts.map((p) => {
                    const status = statusConfig[getStockStatus(p.stock)];
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSelectedProductId(p.id);
                          setDropdownOpen(false);
                          setSearchQuery("");
                          setError("");
                        }}
                        className="
                          w-full flex items-center gap-3 px-3 py-2.5
                          hover:bg-surface-50 transition-colors cursor-pointer text-left
                        "
                      >
                        <div className="w-8 h-8 rounded-[var(--radius-sm)] overflow-hidden bg-surface-50 border border-surface-200 shrink-0 relative">
                          <Image
                            src={p.image}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="32px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium text-text-primary truncate">
                            {p.name}
                          </p>
                          <p className="text-[11px] text-text-tertiary">
                            Stok: {p.stock} · {p.category}
                          </p>
                        </div>
                        <span
                          className="text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0"
                          style={{ background: status.bg, color: status.text }}
                        >
                          {status.label}
                        </span>
                      </button>
                    );
                  })}
                  {filteredProducts.length === 0 && (
                    <p className="px-3 py-4 text-[12px] text-text-tertiary text-center">
                      Produk tidak ditemukan
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">
                Jumlah
              </label>
              <input
                id={`quick-qty-${type.toLowerCase()}`}
                type="number"
                min="1"
                max={type === "OUT" && selectedProduct ? selectedProduct.stock : undefined}
                value={quantity}
                onChange={(e) => {
                  setQuantity(e.target.value);
                  setError("");
                }}
                placeholder="0"
                className="
                  w-full h-10 px-3 rounded-[var(--radius-md)]
                  bg-surface-50 border border-surface-200
                  text-[14px] text-text-primary placeholder:text-text-tertiary
                  outline-none
                  focus:border-brand-300 focus:ring-2 focus:ring-brand-100
                  transition-all
                "
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              id={`quick-submit-${type.toLowerCase()}`}
              className="
                h-10 px-5 rounded-[var(--radius-md)]
                text-[13px] font-semibold text-white
                flex items-center gap-1.5
                transition-all cursor-pointer
                hover:shadow-md active:scale-[0.98]
                self-end
              "
              style={{ background: cfg.gradient }}
            >
              <Icon className="w-4 h-4" />
              {cfg.actionLabel}
            </button>
          </div>

          {/* Error / success */}
          {error && (
            <p
              className="text-[12px] font-medium"
              style={{ color: "var(--color-status-danger-text)" }}
            >
              {error}
            </p>
          )}
          {successMsg && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] text-[12px] font-medium animate-fade-in"
              style={{
                background: cfg.bg,
                color: cfg.text,
                animationDuration: "200ms",
              }}
            >
              <Check className="w-3.5 h-3.5" />
              {successMsg}
            </div>
          )}
        </form>
      </div>

      {/* ── Close dropdown on outside click ─────────────────── */}
      {dropdownOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => {
            setDropdownOpen(false);
            setSearchQuery("");
          }}
        />
      )}

      {/* ── Transaction history ─────────────────────────────── */}
      <div
        className="bg-white rounded-[var(--radius-lg)] border border-surface-200"
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        <div className="px-5 py-4 border-b border-surface-200">
          <h3 className="text-[15px] font-semibold text-text-primary">
            Riwayat {cfg.title}
          </h3>
          <p className="text-[12px] text-text-tertiary mt-0.5">
            {filteredTx.length} transaksi
          </p>
        </div>

        <div className="divide-y divide-surface-100">
          {filteredTx.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-surface-50 flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-5 h-5 text-text-tertiary" />
              </div>
              <p className="text-[14px] font-medium text-text-secondary">
                Belum ada transaksi {type === "IN" ? "masuk" : "keluar"}
              </p>
              <p className="text-[12px] text-text-tertiary mt-1">
                Gunakan form di atas untuk mencatat {type === "IN" ? "barang masuk" : "barang keluar"}
              </p>
            </div>
          ) : (
            grouped.map((group) => (
              <div key={group.date}>
                <div className="px-5 py-2 bg-surface-50/80 sticky top-[72px] z-10">
                  <p className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">
                    {group.date}
                  </p>
                </div>
                {group.items.map((tx) => {
                  const product = productMap.get(tx.productId);
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface-50/60 transition-colors"
                    >
                      <div
                        className="w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0"
                        style={{ background: cfg.bg }}
                      >
                        <Icon className="w-4 h-4" style={{ color: cfg.text }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-text-primary truncate">
                          {product?.name ?? "Produk tidak ditemukan"}
                        </p>
                        <p className="text-[11px] text-text-tertiary">
                          {formatTime(tx.date)}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p
                          className="text-[14px] font-semibold"
                          style={{ color: cfg.text }}
                        >
                          {cfg.sign}{tx.quantity}
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
