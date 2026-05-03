"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Product, Transaction, ModalState } from "./types";

/* ================================================================
   Types
   ================================================================ */

// Transaction from API includes product details
export interface RichTransaction extends Transaction {
  productName: string;
  productImage: string;
  productCategory: string;
  note?: string | null;
}

/* ================================================================
   Reducer
   ================================================================ */
type Action =
  | { type: "HYDRATE"; products: Product[]; transactions: RichTransaction[] }
  | { type: "SET_PRODUCTS"; products: Product[] }
  | { type: "SET_TRANSACTIONS"; transactions: RichTransaction[] }
  | { type: "ADD_PRODUCT"; product: Product }
  | { type: "UPDATE_PRODUCT"; product: Product }
  | { type: "DELETE_PRODUCT"; productId: string };

interface State {
  products: Product[];
  transactions: RichTransaction[];
}

function inventoryReducer(state: State, action: Action): State {
  switch (action.type) {
    case "HYDRATE":
      return { products: action.products, transactions: action.transactions };

    case "SET_PRODUCTS":
      return { ...state, products: action.products };

    case "SET_TRANSACTIONS":
      return { ...state, transactions: action.transactions };

    case "ADD_PRODUCT":
      return { ...state, products: [action.product, ...state.products] };

    case "UPDATE_PRODUCT":
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.product.id ? action.product : p
        ),
      };

    case "DELETE_PRODUCT":
      return {
        ...state,
        products: state.products.filter((p) => p.id !== action.productId),
        transactions: state.transactions.filter(
          (tx) => tx.productId !== action.productId
        ),
      };

    default:
      return state;
  }
}

/* ================================================================
   Context
   ================================================================ */
interface InventoryContextValue {
  products: Product[];
  transactions: RichTransaction[];
  modal: ModalState;
  openModal: (productId: string, type: "IN" | "OUT") => void;
  closeModal: () => void;
  applyStock: (quantity: number, note?: string) => Promise<void>;
  addProduct: (data: Omit<Product, "id">) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  refreshProducts: () => Promise<void>;
  hydrated: boolean;
  loading: boolean;
  error: string | null;
}

const InventoryContext = createContext<InventoryContextValue | null>(null);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(inventoryReducer, {
    products: [],
    transactions: [],
  });

  const [modal, setModal] = useState<ModalState>({
    open: false,
    productId: null,
    type: null,
  });

  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch all products ────────────────────────────────────────
  const refreshProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Gagal mengambil produk");
      const products: Product[] = await res.json();
      dispatch({ type: "SET_PRODUCTS", products });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }, []);

  // ── Fetch all transactions ────────────────────────────────────
  const refreshTransactions = useCallback(async () => {
    try {
      const res = await fetch("/api/transactions");
      if (!res.ok) throw new Error("Gagal mengambil transaksi");
      const transactions: RichTransaction[] = await res.json();
      dispatch({ type: "SET_TRANSACTIONS", transactions });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }, []);

  // ── Initial load ──────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      setLoading(true);
      await Promise.all([refreshProducts(), refreshTransactions()]);
      setLoading(false);
      setHydrated(true);
    }
    load();
  }, [refreshProducts, refreshTransactions]);

  // ── Modal helpers ─────────────────────────────────────────────
  function openModal(productId: string, type: "IN" | "OUT") {
    setModal({ open: true, productId, type });
  }

  function closeModal() {
    setModal({ open: false, productId: null, type: null });
  }

  // ── Stock In / Out ────────────────────────────────────────────
  async function applyStock(quantity: number, note?: string) {
    if (!modal.productId || !modal.type || quantity <= 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: modal.productId,
          type: modal.type,
          quantity,
          note,
        }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? "Gagal mencatat transaksi");
      }
      // Refresh both after stock change
      await Promise.all([refreshProducts(), refreshTransactions()]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
      closeModal();
    }
  }

  // ── CRUD helpers ──────────────────────────────────────────────
  async function addProduct(data: Omit<Product, "id">) {
    setLoading(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? "Gagal menambah produk");
      }
      const product: Product = await res.json();
      dispatch({ type: "ADD_PRODUCT", product });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  async function updateProduct(product: Product) {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? "Gagal mengupdate produk");
      }
      const updated: Product = await res.json();
      dispatch({ type: "UPDATE_PRODUCT", product: updated });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  async function deleteProduct(productId: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? "Gagal menghapus produk");
      }
      dispatch({ type: "DELETE_PRODUCT", productId });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <InventoryContext.Provider
      value={{
        products: state.products,
        transactions: state.transactions,
        modal,
        openModal,
        closeModal,
        applyStock,
        addProduct,
        updateProduct,
        deleteProduct,
        refreshProducts,
        hydrated,
        loading,
        error,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory(): InventoryContextValue {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error("useInventory must be used within InventoryProvider");
  return ctx;
}
