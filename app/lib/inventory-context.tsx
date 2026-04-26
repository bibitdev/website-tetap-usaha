"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Product, Transaction, ModalState } from "./types";
import { generateId } from "./utils";

/* ----------------------------------------------------------------
   Initial seed data (used only when localStorage is empty)
   ---------------------------------------------------------------- */
const SEED_PRODUCTS: Product[] = [
  { id: "1", name: 'MacBook Pro M3 14"', image: "/product-laptop.png", category: "Laptop", stock: 24, price: 28500000 },
  { id: "2", name: "Galaxy S24 Ultra", image: "/product-smartphone.png", category: "Smartphone", stock: 18, price: 19999000 },
  { id: "3", name: "AirPods Pro 2", image: "/product-earbuds.png", category: "Audio", stock: 5, price: 3799000 },
  { id: "4", name: "Velocita GM87 Keyboard", image: "/product-keyboard.png", category: "Aksesoris", stock: 42, price: 1250000 },
  { id: "5", name: "Logitech G Pro Mouse", image: "/product-mouse.png", category: "Aksesoris", stock: 0, price: 1850000 },
  { id: "6", name: 'Samsung 4K Monitor 27"', image: "/product-monitor.png", category: "Monitor", stock: 8, price: 5400000 },
  { id: "7", name: 'iPad Pro M4 11"', image: "/product-tablet.png", category: "Tablet", stock: 3, price: 17499000 },
  { id: "8", name: "Kabel USB-C 100W", image: "/product-cable.png", category: "Aksesoris", stock: 150, price: 89000 },
];

/* ----------------------------------------------------------------
   Reducer
   ---------------------------------------------------------------- */
type Action =
  | { type: "STOCK_IN"; productId: string; quantity: number }
  | { type: "STOCK_OUT"; productId: string; quantity: number }
  | { type: "HYDRATE"; products: Product[]; transactions: Transaction[] }
  | { type: "ADD_PRODUCT"; product: Product }
  | { type: "UPDATE_PRODUCT"; product: Product }
  | { type: "DELETE_PRODUCT"; productId: string };

interface State {
  products: Product[];
  transactions: Transaction[];
}

function inventoryReducer(state: State, action: Action): State {
  switch (action.type) {
    case "HYDRATE":
      return { products: action.products, transactions: action.transactions };

    case "STOCK_IN": {
      const products = state.products.map((p) =>
        p.id === action.productId
          ? { ...p, stock: p.stock + action.quantity }
          : p
      );
      const tx: Transaction = {
        id: generateId(),
        productId: action.productId,
        type: "IN",
        quantity: action.quantity,
        date: new Date().toISOString(),
      };
      return { products, transactions: [tx, ...state.transactions] };
    }

    case "STOCK_OUT": {
      const products = state.products.map((p) => {
        if (p.id !== action.productId) return p;
        const newStock = Math.max(0, p.stock - action.quantity);
        return { ...p, stock: newStock };
      });
      const actualQty = (() => {
        const p = state.products.find((p) => p.id === action.productId);
        if (!p) return action.quantity;
        return Math.min(action.quantity, p.stock);
      })();
      if (actualQty === 0) return state; // nothing to do
      const tx: Transaction = {
        id: generateId(),
        productId: action.productId,
        type: "OUT",
        quantity: actualQty,
        date: new Date().toISOString(),
      };
      return { products, transactions: [tx, ...state.transactions] };
    }

    case "ADD_PRODUCT":
      return { ...state, products: [...state.products, action.product] };

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
      };

    default:
      return state;
  }
}

/* ----------------------------------------------------------------
   Context
   ---------------------------------------------------------------- */
interface InventoryContextValue {
  products: Product[];
  transactions: Transaction[];
  modal: ModalState;
  openModal: (productId: string, type: "IN" | "OUT") => void;
  closeModal: () => void;
  applyStock: (quantity: number) => void;
  addProduct: (data: Omit<Product, "id">) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  hydrated: boolean;
}

const InventoryContext = createContext<InventoryContextValue | null>(null);

const STORAGE_PRODUCTS = "tetap-usaha-products";
const STORAGE_TRANSACTIONS = "tetap-usaha-transactions";

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(inventoryReducer, {
    products: SEED_PRODUCTS,
    transactions: [],
  });

  const [modal, setModal] = useState<ModalState>({
    open: false,
    productId: null,
    type: null,
  });

  const [hydrated, setHydrated] = useState(false);

  // ── Load from localStorage on mount ─────────────────────────
  useEffect(() => {
    try {
      const rawP = localStorage.getItem(STORAGE_PRODUCTS);
      const rawT = localStorage.getItem(STORAGE_TRANSACTIONS);
      const products = rawP ? (JSON.parse(rawP) as Product[]) : SEED_PRODUCTS;
      const transactions = rawT ? (JSON.parse(rawT) as Transaction[]) : [];
      dispatch({ type: "HYDRATE", products, transactions });
    } catch {
      // corrupt data → keep seed
    }
    setHydrated(true);
  }, []);

  // ── Persist to localStorage on every change ─────────────────
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(state.products));
    localStorage.setItem(STORAGE_TRANSACTIONS, JSON.stringify(state.transactions));
  }, [state.products, state.transactions, hydrated]);

  // ── Modal helpers ───────────────────────────────────────────
  function openModal(productId: string, type: "IN" | "OUT") {
    setModal({ open: true, productId, type });
  }

  function closeModal() {
    setModal({ open: false, productId: null, type: null });
  }

  function applyStock(quantity: number) {
    if (!modal.productId || !modal.type || quantity <= 0) return;
    if (modal.type === "IN") {
      dispatch({ type: "STOCK_IN", productId: modal.productId, quantity });
    } else {
      dispatch({ type: "STOCK_OUT", productId: modal.productId, quantity });
    }
    closeModal();
  }

  // ── CRUD helpers ────────────────────────────────────────────
  function addProduct(data: Omit<Product, "id">) {
    const product: Product = { ...data, id: generateId() };
    dispatch({ type: "ADD_PRODUCT", product });
  }

  function updateProduct(product: Product) {
    dispatch({ type: "UPDATE_PRODUCT", product });
  }

  function deleteProduct(productId: string) {
    dispatch({ type: "DELETE_PRODUCT", productId });
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
        hydrated,
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
