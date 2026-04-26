"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Package,
  TrendingUp,
  Wallet,
  Layers,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { exportToExcel, exportToPdf } from "@/app/lib/export";
import { useInventory } from "@/app/lib/inventory-context";
import { formatRupiah, getStockStatus, statusConfig } from "@/app/lib/utils";
import type { Product, Transaction } from "@/app/lib/types";

/* ================================================================
   Helper: aggregate transactions by month (last 6 months)
   ================================================================ */
function getMonthlyData(transactions: Transaction[]) {
  const months: { label: string; masuk: number; keluar: number }[] = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString("id-ID", { month: "short" });
    const year = d.getFullYear();
    const month = d.getMonth();

    let masuk = 0;
    let keluar = 0;
    for (const tx of transactions) {
      const txDate = new Date(tx.date);
      if (txDate.getFullYear() === year && txDate.getMonth() === month) {
        if (tx.type === "IN") masuk += tx.quantity;
        else keluar += tx.quantity;
      }
    }
    months.push({ label, masuk, keluar });
  }
  return months;
}

/* ================================================================
   Helper: aggregate stock by category for pie chart
   ================================================================ */
function getCategoryData(products: Product[]) {
  const map = new Map<string, number>();
  for (const p of products) {
    map.set(p.category, (map.get(p.category) ?? 0) + p.stock);
  }
  return Array.from(map, ([name, value]) => ({ name, value }));
}

const PIE_COLORS = ["#3b82f6", "#22c55e", "#f97316", "#a855f7", "#ec4899", "#14b8a6"];

/* ================================================================
   Custom tooltip for bar chart
   ================================================================ */
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="bg-white rounded-[var(--radius-md)] border border-surface-200 px-3 py-2"
      style={{ boxShadow: "var(--shadow-md)" }}
    >
      <p className="text-[12px] font-semibold text-text-primary mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-[11px] text-text-secondary">
          {p.dataKey === "masuk" ? "Masuk" : "Keluar"}:{" "}
          <span className="font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

/* ================================================================
   Main Component
   ================================================================ */
export default function ReportDashboard() {
  const { products, transactions } = useInventory();

  // ── Computed stats ───────────────────────────────────────────
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalStock = products.reduce((s, p) => s + p.stock, 0);
    const totalValue = products.reduce((s, p) => s + p.stock * p.price, 0);
    const categories = new Set(products.map((p) => p.category)).size;
    const criticalProducts = products.filter(
      (p) => getStockStatus(p.stock) !== "safe"
    );
    const topOutgoing = getTopOutgoing(products, transactions);

    return { totalProducts, totalStock, totalValue, categories, criticalProducts, topOutgoing };
  }, [products, transactions]);

  const monthlyData = useMemo(() => getMonthlyData(transactions), [transactions]);
  const categoryData = useMemo(() => getCategoryData(products), [products]);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* ── Export buttons ─────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-2">
        <button
          id="export-excel"
          onClick={() => exportToExcel(products, transactions)}
          className="h-9 px-4 rounded-[var(--radius-md)] border border-surface-200 text-[13px] font-medium text-text-secondary flex items-center gap-1.5 hover:bg-surface-50 transition-colors cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4" style={{ color: "#16a34a" }} />
          Export Excel
        </button>
        <button
          id="export-pdf"
          onClick={() => exportToPdf(products, transactions)}
          className="h-9 px-4 rounded-[var(--radius-md)] text-[13px] font-semibold text-white flex items-center gap-1.5 transition-all cursor-pointer hover:shadow-md active:scale-[0.98]"
          style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}
        >
          <FileText className="w-4 h-4" />
          Export PDF
        </button>
      </div>

      {/* ── Row 1: Overview cards ─────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <StatCard
          icon={Package}
          label="Total Produk"
          value={stats.totalProducts.toString()}
          bg="#eff6ff"
          color="#2563eb"
        />
        <StatCard
          icon={Layers}
          label="Total Stok"
          value={stats.totalStock.toLocaleString("id-ID")}
          bg="#f0fdf4"
          color="#16a34a"
        />
        <StatCard
          icon={Wallet}
          label="Nilai Inventaris"
          value={formatRupiah(stats.totalValue)}
          bg="#faf5ff"
          color="#7c3aed"
        />
        <StatCard
          icon={TrendingUp}
          label="Kategori"
          value={stats.categories.toString()}
          bg="#fff7ed"
          color="#ea580c"
        />
      </div>

      {/* ── Row 2: Charts ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Bar chart — monthly trends */}
        <div
          className="lg:col-span-2 bg-white rounded-[var(--radius-lg)] border border-surface-200 p-5"
          style={{ boxShadow: "var(--shadow-sm)" }}
        >
          <h3 className="text-[15px] font-semibold text-text-primary mb-1">
            Tren Bulanan
          </h3>
          <p className="text-[12px] text-text-tertiary mb-4">
            Barang masuk vs keluar (6 bulan terakhir)
          </p>
          <div className="h-[260px]">
            {monthlyData.every((m) => m.masuk === 0 && m.keluar === 0) ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-[13px] text-text-tertiary">
                  Belum ada data transaksi
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    width={32}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f1f5f9" }} />
                  <Bar
                    dataKey="masuk"
                    name="Masuk"
                    fill="#22c55e"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                  <Bar
                    dataKey="keluar"
                    name="Keluar"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Pie chart — category distribution */}
        <div
          className="bg-white rounded-[var(--radius-lg)] border border-surface-200 p-5"
          style={{ boxShadow: "var(--shadow-sm)" }}
        >
          <h3 className="text-[15px] font-semibold text-text-primary mb-1">
            Distribusi Kategori
          </h3>
          <p className="text-[12px] text-text-tertiary mb-4">
            Stok per kategori
          </p>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="45%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((_, i) => (
                    <Cell
                      key={`cell-${i}`}
                      fill={PIE_COLORS[i % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  formatter={(value: string) => (
                    <span className="text-[11px] text-text-secondary">{value}</span>
                  )}
                />
                <Tooltip
                  formatter={(value, name) => [`${value} unit`, `${name}`]}
                  contentStyle={{
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-surface-200)",
                    boxShadow: "var(--shadow-md)",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Row 3: Tables ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Critical stock */}
        <div
          className="bg-white rounded-[var(--radius-lg)] border border-surface-200"
          style={{ boxShadow: "var(--shadow-sm)" }}
        >
          <div className="px-5 py-4 border-b border-surface-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" style={{ color: "var(--color-status-warning)" }} />
            <div>
              <h3 className="text-[15px] font-semibold text-text-primary">
                Stok Kritis
              </h3>
              <p className="text-[12px] text-text-tertiary">
                Produk yang perlu restock
              </p>
            </div>
          </div>
          {stats.criticalProducts.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-[13px] text-text-tertiary">
                Semua stok aman 🎉
              </p>
            </div>
          ) : (
            <div className="divide-y divide-surface-100">
              {stats.criticalProducts.map((p) => {
                const status = statusConfig[getStockStatus(p.stock)];
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between px-5 py-3 hover:bg-surface-50/60 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-text-primary truncate">
                        {p.name}
                      </p>
                      <p className="text-[11px] text-text-tertiary">
                        {p.category}
                      </p>
                    </div>
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium shrink-0"
                      style={{ background: status.bg, color: status.text }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: status.dot }}
                      />
                      {p.stock === 0 ? "Habis" : `Sisa ${p.stock}`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top outgoing products */}
        <div
          className="bg-white rounded-[var(--radius-lg)] border border-surface-200"
          style={{ boxShadow: "var(--shadow-sm)" }}
        >
          <div className="px-5 py-4 border-b border-surface-200 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" style={{ color: "var(--color-brand-500)" }} />
            <div>
              <h3 className="text-[15px] font-semibold text-text-primary">
                Produk Terlaris
              </h3>
              <p className="text-[12px] text-text-tertiary">
                Berdasarkan total keluar
              </p>
            </div>
          </div>
          {stats.topOutgoing.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-[13px] text-text-tertiary">
                Belum ada transaksi keluar
              </p>
            </div>
          ) : (
            <div className="divide-y divide-surface-100">
              {stats.topOutgoing.map((item, i) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-surface-50/60 transition-colors"
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold"
                    style={{
                      background: i < 3 ? "var(--color-brand-50)" : "var(--color-surface-50)",
                      color: i < 3 ? "var(--color-brand-600)" : "var(--color-text-tertiary)",
                    }}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-text-primary truncate">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-text-tertiary">
                      {item.category}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[13px] font-semibold text-text-primary flex items-center gap-1">
                      <ArrowUpFromLine className="w-3 h-3" style={{ color: "var(--color-status-danger-text)" }} />
                      {item.totalOut}
                    </p>
                    <p className="text-[11px] text-text-tertiary font-mono">
                      {formatRupiah(item.totalOut * item.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   Stat card sub-component
   ================================================================ */
function StatCard({
  icon: Icon,
  label,
  value,
  bg,
  color,
}: {
  icon: typeof Package;
  label: string;
  value: string;
  bg: string;
  color: string;
}) {
  return (
    <div
      className="animate-fade-in bg-white rounded-[var(--radius-lg)] p-4 border border-surface-200 hover:border-brand-200 transition-all duration-300"
      style={{ boxShadow: "var(--shadow-xs)" }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center shrink-0"
          style={{ background: bg }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div className="min-w-0">
          <p className="text-[12px] font-medium text-text-tertiary">{label}</p>
          <p className="text-[18px] font-bold text-text-primary truncate leading-tight mt-0.5">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   Helper: compute top outgoing products
   ================================================================ */
function getTopOutgoing(products: Product[], transactions: Transaction[]) {
  const outMap = new Map<string, number>();
  for (const tx of transactions) {
    if (tx.type === "OUT") {
      outMap.set(tx.productId, (outMap.get(tx.productId) ?? 0) + tx.quantity);
    }
  }

  return Array.from(outMap.entries())
    .map(([productId, totalOut]) => {
      const product = products.find((p) => p.id === productId);
      return {
        productId,
        name: product?.name ?? "Unknown",
        category: product?.category ?? "",
        price: product?.price ?? 0,
        totalOut,
      };
    })
    .sort((a, b) => b.totalOut - a.totalOut)
    .slice(0, 5);
}
