"use client";

import { useState, useEffect, useRef } from "react";
import { X, Package } from "lucide-react";
import type { Product } from "@/app/lib/types";
import ImageUpload from "@/app/components/upload/ImageUpload";

/** Fallback image used for new products with no image selected yet */
const DEFAULT_IMAGE = "/product-laptop.png";

interface ProductFormModalProps {
  open: boolean;
  product: Product | null; // null = add mode, Product = edit mode
  onClose: () => void;
  onSubmit: (data: Omit<Product, "id"> & { id?: string }) => void;
}

export default function ProductFormModal({
  open,
  product,
  onClose,
  onSubmit,
}: ProductFormModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(DEFAULT_IMAGE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  const isEdit = product !== null;

  // ── Populate form when editing ─────────────────────────────
  useEffect(() => {
    if (open && product) {
      setName(product.name);
      setCategory(product.category);
      setStock(product.stock.toString());
      setPrice(product.price.toString());
      // Use existing image, fallback to default if empty
      setImage(product.image || DEFAULT_IMAGE);
      setErrors({});
    } else if (open) {
      setName("");
      setCategory("");
      setStock("0");
      setPrice("");
      setImage(DEFAULT_IMAGE);
      setErrors({});
    }
    if (open) setTimeout(() => nameRef.current?.focus(), 50);
  }, [open, product]);

  if (!open) return null;

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Nama produk wajib diisi";
    if (!category.trim()) e.category = "Kategori wajib diisi";
    const priceNum = parseInt(price, 10);
    if (isNaN(priceNum) || priceNum <= 0) e.price = "Harga harus lebih dari 0";
    const stockNum = parseInt(stock, 10);
    if (isNaN(stockNum) || stockNum < 0) e.stock = "Stok tidak boleh negatif";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate() || isSubmitting) return;
    setIsSubmitting(true);
    onSubmit({
      ...(isEdit ? { id: product!.id } : {}),
      name: name.trim(),
      category: category.trim(),
      stock: parseInt(stock, 10),
      price: parseInt(price, 10),
      image: image || DEFAULT_IMAGE,
    });
    setIsSubmitting(false);
    onClose();
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm animate-fade-in"
        style={{ animationDuration: "200ms" }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="
          fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-full max-w-[500px] max-h-[92vh] overflow-y-auto
          bg-white rounded-[var(--radius-lg)] border border-surface-200
          animate-fade-in
        "
        style={{ boxShadow: "var(--shadow-lg)", animationDuration: "250ms" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-200 sticky top-0 bg-white z-10 rounded-t-[var(--radius-lg)]">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center"
              style={{ background: "var(--color-brand-50)" }}
            >
              <Package className="w-4 h-4" style={{ color: "var(--color-brand-500)" }} />
            </div>
            <h3 className="text-[15px] font-semibold text-text-primary">
              {isEdit ? "Edit Produk" : "Tambah Produk"}
            </h3>
          </div>
          <button
            id="product-form-close"
            onClick={onClose}
            className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center hover:bg-surface-50 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-text-tertiary" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {/* Image Upload */}
          <div>
            <label className="block text-[13px] font-medium text-text-secondary mb-2">
              Gambar Produk
            </label>
            <ImageUpload
              value={image}
              onChange={setImage}
              disabled={isSubmitting}
            />
          </div>

          {/* Name */}
          <Field label="Nama Produk" error={errors.name}>
            <input
              ref={nameRef}
              id="field-name"
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
              placeholder="Contoh: MacBook Air M4"
              className={inputClass(!!errors.name)}
            />
          </Field>

          {/* Category */}
          <Field label="Kategori" error={errors.category}>
            <input
              id="field-category"
              type="text"
              value={category}
              onChange={(e) => { setCategory(e.target.value); setErrors((p) => ({ ...p, category: "" })); }}
              placeholder="Contoh: Laptop, Smartphone, Aksesoris"
              className={inputClass(!!errors.category)}
            />
          </Field>

          {/* Price + Stock row */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Harga (Rp)" error={errors.price}>
              <input
                id="field-price"
                type="number"
                min="1"
                value={price}
                onChange={(e) => { setPrice(e.target.value); setErrors((p) => ({ ...p, price: "" })); }}
                placeholder="0"
                className={inputClass(!!errors.price)}
              />
            </Field>
            <Field label="Stok Awal" error={errors.stock}>
              <input
                id="field-stock"
                type="number"
                min="0"
                value={stock}
                onChange={(e) => { setStock(e.target.value); setErrors((p) => ({ ...p, stock: "" })); }}
                placeholder="0"
                className={inputClass(!!errors.stock)}
              />
            </Field>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
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
              id="product-form-submit"
              disabled={isSubmitting}
              className="
                flex-1 h-10 rounded-[var(--radius-md)]
                text-[13px] font-semibold text-white
                transition-all cursor-pointer
                hover:shadow-md active:scale-[0.98]
                disabled:opacity-60 disabled:cursor-not-allowed
              "
              style={{
                background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
              }}
            >
              {isSubmitting ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Produk"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

/* ================================================================
   Field wrapper sub-component
   ================================================================ */
function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-text-secondary mb-1.5">
        {label}
      </label>
      {children}
      {error && (
        <p
          className="mt-1 text-[12px] font-medium"
          style={{ color: "var(--color-status-danger-text)" }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

/** Shared input class builder */
function inputClass(hasError: boolean) {
  return `
    w-full h-10 px-3 rounded-[var(--radius-md)]
    bg-surface-50 border text-[14px] text-text-primary placeholder:text-text-tertiary
    outline-none transition-all
    ${
      hasError
        ? "border-status-danger focus:ring-2 focus:ring-status-danger-bg"
        : "border-surface-200 focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
    }
  `;
}
