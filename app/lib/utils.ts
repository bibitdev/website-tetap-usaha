/* ================================================================
   Pure utility functions — no React, no side effects
   ================================================================ */

import type { StockStatus, Transaction } from "./types";

/** Derive stock status from the current stock count */
export function getStockStatus(stock: number): StockStatus {
  if (stock === 0) return "out";
  if (stock <= 5) return "low";
  return "safe";
}

/** UI config for each stock status */
export const statusConfig: Record<
  StockStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  safe: {
    label: "Aman",
    bg: "var(--color-status-safe-bg)",
    text: "var(--color-status-safe-text)",
    dot: "var(--color-status-safe)",
  },
  low: {
    label: "Hampir Habis",
    bg: "var(--color-status-warning-bg)",
    text: "var(--color-status-warning-text)",
    dot: "var(--color-status-warning)",
  },
  out: {
    label: "Habis",
    bg: "var(--color-status-danger-bg)",
    text: "var(--color-status-danger-text)",
    dot: "var(--color-status-danger)",
  },
};

/** Format number to Rupiah string */
export function formatRupiah(n: number): string {
  return "Rp " + n.toLocaleString("id-ID");
}

/** Generate a unique ID (good enough for client-side) */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Check whether an ISO date string falls within the current month.
 * Used for the "bulan ini" summary card calculations.
 */
function isCurrentMonth(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

/** Sum quantities for a transaction type within the current month */
export function sumTransactions(
  transactions: Transaction[],
  type: "IN" | "OUT"
): number {
  return transactions
    .filter((t) => t.type === type && isCurrentMonth(t.date))
    .reduce((sum, t) => sum + t.quantity, 0);
}
