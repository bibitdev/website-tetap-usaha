"use client";

import { useState, useEffect, useRef } from "react";
import { X, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { useInventory } from "@/app/lib/inventory-context";

export default function StockModal() {
  const { modal, closeModal, applyStock, products } = useInventory();
  const [quantity, setQuantity] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const product = products.find((p) => p.id === modal.productId) ?? null;
  const isIn = modal.type === "IN";

  // Focus input & reset on open
  useEffect(() => {
    if (modal.open) {
      setQuantity("");
      setError("");
      // Small delay so the element is in the DOM
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [modal.open]);

  if (!modal.open || !product) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      setError("Masukkan jumlah yang valid (> 0)");
      return;
    }
    if (!isIn && qty > product!.stock) {
      setError(`Stok tidak cukup (tersedia: ${product!.stock})`);
      return;
    }
    setError("");
    applyStock(qty);
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm animate-fade-in"
        style={{ animationDuration: "200ms" }}
        onClick={closeModal}
      />

      {/* Modal */}
      <div
        className="
          fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-full max-w-[400px]
          bg-white rounded-[var(--radius-lg)] border border-surface-200
          animate-fade-in
        "
        style={{
          boxShadow: "var(--shadow-lg)",
          animationDuration: "250ms",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-200">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center"
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
            <div>
              <h3 className="text-[15px] font-semibold text-text-primary">
                {isIn ? "Barang Masuk" : "Barang Keluar"}
              </h3>
              <p className="text-[12px] text-text-tertiary">{product.name}</p>
            </div>
          </div>
          <button
            id="modal-close"
            onClick={closeModal}
            className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center hover:bg-surface-50 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-text-tertiary" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <div>
            <label
              htmlFor="stock-quantity"
              className="block text-[13px] font-medium text-text-secondary mb-1.5"
            >
              Jumlah
            </label>
            <input
              ref={inputRef}
              id="stock-quantity"
              type="number"
              min="1"
              max={isIn ? undefined : product.stock}
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                setError("");
              }}
              placeholder={`Masukkan jumlah ${isIn ? "masuk" : "keluar"}...`}
              className="
                w-full h-10 px-3 rounded-[var(--radius-md)]
                bg-surface-50 border border-surface-200
                text-[14px] text-text-primary placeholder:text-text-tertiary
                outline-none
                focus:border-brand-300 focus:ring-2 focus:ring-brand-100
                transition-all
              "
            />
            {error && (
              <p className="mt-1.5 text-[12px] font-medium" style={{ color: "var(--color-status-danger-text)" }}>
                {error}
              </p>
            )}
          </div>

          {/* Current stock info */}
          <div className="flex items-center justify-between px-3 py-2.5 rounded-[var(--radius-md)] bg-surface-50">
            <span className="text-[12px] text-text-tertiary">Stok saat ini</span>
            <span className="text-[13px] font-semibold text-text-primary">
              {product.stock}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={closeModal}
              className="
                flex-1 h-10 rounded-[var(--radius-md)]
                border border-surface-200
                text-[13px] font-medium text-text-secondary
                hover:bg-surface-50 transition-colors cursor-pointer
              "
            >
              Batal
            </button>
            <button
              type="submit"
              id="modal-submit"
              className="
                flex-1 h-10 rounded-[var(--radius-md)]
                text-[13px] font-semibold text-white
                transition-all cursor-pointer
                hover:shadow-md active:scale-[0.98]
              "
              style={{
                background: isIn
                  ? "linear-gradient(135deg, #22c55e, #16a34a)"
                  : "linear-gradient(135deg, #ef4444, #dc2626)",
              }}
            >
              {isIn ? "Tambah Stok" : "Kurangi Stok"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
