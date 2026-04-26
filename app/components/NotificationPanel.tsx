"use client";

import { useMemo } from "react";
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  PackageX,
  Bell,
} from "lucide-react";
import { useInventory } from "@/app/lib/inventory-context";
import { getStockStatus, statusConfig, formatRupiah } from "@/app/lib/utils";

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const { products, transactions } = useInventory();

  // ── Generate notifications from data ────────────────────────
  const notifications = useMemo(() => {
    const items: {
      id: string;
      icon: typeof AlertTriangle;
      iconBg: string;
      iconColor: string;
      title: string;
      description: string;
      time?: string;
      priority: number; // lower = higher priority
    }[] = [];

    // 1. Out of stock alerts (highest priority)
    products
      .filter((p) => p.stock === 0)
      .forEach((p) => {
        items.push({
          id: `out-${p.id}`,
          icon: PackageX,
          iconBg: "var(--color-status-danger-bg)",
          iconColor: "var(--color-status-danger-text)",
          title: `${p.name} habis!`,
          description: "Stok sudah 0. Segera lakukan restock.",
          priority: 0,
        });
      });

    // 2. Low stock warnings
    products
      .filter((p) => getStockStatus(p.stock) === "low")
      .forEach((p) => {
        items.push({
          id: `low-${p.id}`,
          icon: AlertTriangle,
          iconBg: "var(--color-status-warning-bg)",
          iconColor: "var(--color-status-warning-text)",
          title: `${p.name} hampir habis`,
          description: `Sisa stok: ${p.stock}. Pertimbangkan restock.`,
          priority: 1,
        });
      });

    // 3. Recent transactions (last 5)
    transactions.slice(0, 5).forEach((tx) => {
      const product = products.find((p) => p.id === tx.productId);
      const isIn = tx.type === "IN";
      const timeAgo = getTimeAgo(tx.date);
      items.push({
        id: `tx-${tx.id}`,
        icon: isIn ? ArrowDownToLine : ArrowUpFromLine,
        iconBg: isIn ? "var(--color-status-safe-bg)" : "var(--color-status-danger-bg)",
        iconColor: isIn ? "var(--color-status-safe-text)" : "var(--color-status-danger-text)",
        title: `${isIn ? "Masuk" : "Keluar"}: ${product?.name ?? "Produk"}`,
        description: `${isIn ? "+" : "-"}${tx.quantity} unit${product ? ` (${formatRupiah(tx.quantity * product.price)})` : ""}`,
        time: timeAgo,
        priority: 2,
      });
    });

    return items.sort((a, b) => a.priority - b.priority);
  }, [products, transactions]);

  const alertCount = useMemo(
    () => products.filter((p) => getStockStatus(p.stock) !== "safe").length,
    [products]
  );

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Panel */}
      <div
        className="
          absolute right-0 top-full mt-2 z-50
          w-[360px] bg-white rounded-[var(--radius-lg)] border border-surface-200
          overflow-hidden animate-fade-in
        "
        style={{ boxShadow: "var(--shadow-lg)", animationDuration: "150ms" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-surface-200">
          <div className="flex items-center gap-2">
            <h3 className="text-[14px] font-semibold text-text-primary">Notifikasi</h3>
            {alertCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-status-danger text-white text-[10px] font-bold flex items-center justify-center">
                {alertCount}
              </span>
            )}
          </div>
          <span className="text-[11px] text-text-tertiary">
            {notifications.length} item
          </span>
        </div>

        {/* Notification list */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-surface-100">
          {notifications.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <div className="w-10 h-10 rounded-full bg-surface-50 flex items-center justify-center mx-auto mb-2">
                <Bell className="w-4 h-4 text-text-tertiary" />
              </div>
              <p className="text-[13px] text-text-tertiary">
                Tidak ada notifikasi
              </p>
            </div>
          ) : (
            notifications.map((notif) => {
              const Icon = notif.icon;
              return (
                <div
                  key={notif.id}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-surface-50/60 transition-colors"
                >
                  <div
                    className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: notif.iconBg }}
                  >
                    <Icon className="w-4 h-4" style={{ color: notif.iconColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-text-primary leading-tight">
                      {notif.title}
                    </p>
                    <p className="text-[11px] text-text-tertiary mt-0.5 leading-tight">
                      {notif.description}
                    </p>
                  </div>
                  {notif.time && (
                    <span className="text-[10px] text-text-tertiary shrink-0 mt-0.5">
                      {notif.time}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}

/** Simple relative time formatter */
function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Baru saja";
  if (mins < 60) return `${mins}m lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}j lalu`;
  const days = Math.floor(hours / 24);
  return `${days}h lalu`;
}
