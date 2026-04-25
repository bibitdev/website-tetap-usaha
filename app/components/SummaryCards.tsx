"use client";

import { Package, ArrowDownToLine, ArrowUpFromLine, TrendingUp, TrendingDown } from "lucide-react";
import { useInventory } from "@/app/lib/inventory-context";
import { sumTransactions } from "@/app/lib/utils";

export default function SummaryCards() {
  const { products, transactions } = useInventory();

  const totalProducts = products.reduce((sum, p) => sum + p.stock, 0);
  const totalIn = sumTransactions(transactions, "IN");
  const totalOut = sumTransactions(transactions, "OUT");

  const cards = [
    {
      id: "card-total",
      label: "Total Barang",
      value: totalProducts.toLocaleString("id-ID"),
      change: "+12%",
      trend: "up" as const,
      icon: Package,
      gradient: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
      bgLight: "#eff6ff",
      textColor: "#2563eb",
    },
    {
      id: "card-masuk",
      label: "Barang Masuk",
      value: totalIn.toLocaleString("id-ID"),
      subtitle: "bulan ini",
      change: "+24%",
      trend: "up" as const,
      icon: ArrowDownToLine,
      gradient: "linear-gradient(135deg, #22c55e, #16a34a)",
      bgLight: "#f0fdf4",
      textColor: "#16a34a",
    },
    {
      id: "card-keluar",
      label: "Barang Keluar",
      value: totalOut.toLocaleString("id-ID"),
      subtitle: "bulan ini",
      change: "-8%",
      trend: "down" as const,
      icon: ArrowUpFromLine,
      gradient: "linear-gradient(135deg, #f97316, #ea580c)",
      bgLight: "#fff7ed",
      textColor: "#ea580c",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
      {cards.map((card) => {
        const Icon = card.icon;
        const TrendIcon = card.trend === "up" ? TrendingUp : TrendingDown;
        return (
          <div
            key={card.id}
            id={card.id}
            className="animate-fade-in group relative overflow-hidden bg-white rounded-[var(--radius-lg)] p-5 border border-surface-200 hover:border-brand-200 transition-all duration-300 ease-out hover:-translate-y-0.5 cursor-default"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <div
              className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-2xl"
              style={{ background: card.gradient }}
            />
            <div className="flex items-start justify-between relative z-10">
              <div className="space-y-3">
                <p className="text-[13px] font-medium text-text-secondary">{card.label}</p>
                <div className="flex items-end gap-2">
                  <h3 className="text-[28px] font-bold text-text-primary leading-none tracking-tight animate-count">{card.value}</h3>
                  {card.subtitle && <span className="text-[12px] text-text-tertiary mb-1">{card.subtitle}</span>}
                </div>
                <div className="flex items-center gap-1.5">
                  <div
                    className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[12px] font-medium"
                    style={{
                      background: card.trend === "up" ? "var(--color-status-safe-bg)" : "var(--color-status-danger-bg)",
                      color: card.trend === "up" ? "var(--color-status-safe-text)" : "var(--color-status-danger-text)",
                    }}
                  >
                    <TrendIcon className="w-3 h-3" />
                    {card.change}
                  </div>
                  <span className="text-[11px] text-text-tertiary">dari bulan lalu</span>
                </div>
              </div>
              <div className="w-11 h-11 rounded-[var(--radius-md)] flex items-center justify-center shrink-0" style={{ background: card.bgLight }}>
                <Icon className="w-5 h-5" style={{ color: card.textColor }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
