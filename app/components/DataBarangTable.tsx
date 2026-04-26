"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { useInventory } from "@/app/lib/inventory-context";
import { getStockStatus, statusConfig, formatRupiah } from "@/app/lib/utils";
import ProductFormModal from "@/app/components/ProductFormModal";
import type { Product } from "@/app/lib/types";

export default function DataBarangTable() {
  const { products, addProduct, updateProduct, deleteProduct } = useInventory();
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase())
  );

  // ── Handlers ────────────────────────────────────────────────
  function handleOpenAdd() {
    setEditingProduct(null);
    setFormOpen(true);
  }

  function handleOpenEdit(product: Product) {
    setEditingProduct(product);
    setFormOpen(true);
  }

  function handleFormSubmit(data: Omit<Product, "id"> & { id?: string }) {
    if (data.id) {
      updateProduct(data as Product);
    } else {
      addProduct(data);
    }
  }

  function handleDelete(productId: string) {
    deleteProduct(productId);
    setDeleteConfirm(null);
  }

  return (
    <>
      <div className="space-y-5 animate-fade-in">
        {/* Main card */}
        <div
          className="bg-white rounded-[var(--radius-lg)] border border-surface-200"
          style={{ boxShadow: "var(--shadow-sm)" }}
        >
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-b border-surface-200">
            <div>
              <h3 className="text-[15px] font-semibold text-text-primary">
                Kelola Produk
              </h3>
              <p className="text-[12px] text-text-tertiary mt-0.5">
                {products.length} produk terdaftar
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="flex items-center gap-2 h-9 px-3 rounded-[var(--radius-md)] bg-surface-50 border border-surface-200 w-[220px] focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-100 transition-all">
                <Search className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
                <input
                  id="data-barang-search"
                  type="text"
                  placeholder="Cari produk..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="bg-transparent outline-none text-[13px] text-text-primary placeholder:text-text-tertiary w-full"
                />
              </div>
              {/* Add button */}
              <button
                id="add-product-btn"
                onClick={handleOpenAdd}
                className="
                  h-9 px-4 rounded-[var(--radius-md)]
                  text-[13px] font-semibold text-white
                  flex items-center gap-1.5
                  transition-all cursor-pointer
                  hover:shadow-md active:scale-[0.98]
                "
                style={{
                  background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                }}
              >
                <Plus className="w-4 h-4" />
                Tambah Produk
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px]">
              <thead>
                <tr className="border-b border-surface-200">
                  <th className="text-left text-[12px] font-medium text-text-tertiary uppercase tracking-wider px-5 py-3">
                    Produk
                  </th>
                  <th className="text-left text-[12px] font-medium text-text-tertiary uppercase tracking-wider px-4 py-3">
                    Kategori
                  </th>
                  <th className="text-center text-[12px] font-medium text-text-tertiary uppercase tracking-wider px-4 py-3">
                    Stok
                  </th>
                  <th className="text-left text-[12px] font-medium text-text-tertiary uppercase tracking-wider px-4 py-3">
                    Harga
                  </th>
                  <th className="text-left text-[12px] font-medium text-text-tertiary uppercase tracking-wider px-4 py-3">
                    Status
                  </th>
                  <th className="text-center text-[12px] font-medium text-text-tertiary uppercase tracking-wider px-5 py-3">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="stagger">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <p className="text-[13px] text-text-tertiary">
                        {query
                          ? "Tidak ada produk yang cocok"
                          : "Belum ada produk. Klik \"Tambah Produk\" untuk mulai."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((product) => {
                    const stockStatus = getStockStatus(product.stock);
                    const status = statusConfig[stockStatus];
                    const isDeleting = deleteConfirm === product.id;

                    return (
                      <tr
                        key={product.id}
                        className="animate-fade-in border-b border-surface-100 last:border-b-0 hover:bg-surface-50/60 transition-colors"
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-[var(--radius-sm)] overflow-hidden bg-surface-50 border border-surface-200 shrink-0 relative">
                              <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="40px"
                              />
                            </div>
                            <span className="text-[13px] font-medium text-text-primary">
                              {product.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-block px-2.5 py-1 rounded-[var(--radius-sm)] bg-surface-50 text-[12px] font-medium text-text-secondary">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-[13px] font-semibold text-text-primary">
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[13px] text-text-secondary font-mono">
                            {formatRupiah(product.price)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
                            style={{
                              background: status.bg,
                              color: status.text,
                            }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ background: status.dot }}
                            />
                            {status.label}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-center gap-1.5">
                            {isDeleting ? (
                              /* Delete confirmation inline */
                              <div className="flex items-center gap-1.5 animate-fade-in" style={{ animationDuration: "150ms" }}>
                                <span className="text-[11px] text-text-tertiary mr-1">
                                  Hapus?
                                </span>
                                <button
                                  onClick={() => handleDelete(product.id)}
                                  className="h-8 px-3 rounded-[var(--radius-sm)] bg-status-danger-bg text-[12px] font-medium transition-all hover:shadow-sm cursor-pointer"
                                  style={{ color: "var(--color-status-danger-text)" }}
                                >
                                  Ya
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  className="h-8 px-3 rounded-[var(--radius-sm)] border border-surface-200 text-[12px] font-medium text-text-secondary hover:bg-surface-50 transition-colors cursor-pointer"
                                >
                                  Batal
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  id={`edit-${product.id}`}
                                  onClick={() => handleOpenEdit(product)}
                                  className="h-8 px-3 rounded-[var(--radius-sm)] border border-surface-200 text-[12px] font-medium text-text-secondary flex items-center gap-1 hover:bg-surface-50 transition-all cursor-pointer"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                  Edit
                                </button>
                                <button
                                  id={`delete-${product.id}`}
                                  onClick={() => setDeleteConfirm(product.id)}
                                  className="h-8 px-3 rounded-[var(--radius-sm)] bg-status-danger-bg text-[12px] font-medium flex items-center gap-1 transition-all hover:shadow-sm cursor-pointer"
                                  style={{ color: "var(--color-status-danger-text)" }}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Hapus
                                </button>
                              </>
                            )}
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
              Menampilkan {filtered.length} dari {products.length} produk
            </p>
          </div>
        </div>
      </div>

      {/* Product Form Modal */}
      <ProductFormModal
        open={formOpen}
        product={editingProduct}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      {/* Delete confirmation overlay for mobile (backup) */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setDeleteConfirm(null)}
        />
      )}
    </>
  );
}
