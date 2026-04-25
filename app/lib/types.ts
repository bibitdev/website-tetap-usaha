/* ================================================================
   Shared type definitions for the inventory system
   ================================================================ */

export type StockStatus = "safe" | "low" | "out";
export type TransactionType = "IN" | "OUT";

export interface Product {
  id: string;
  name: string;
  image: string;
  category: string;
  stock: number;
  price: number;
}

export interface Transaction {
  id: string;
  productId: string;
  type: TransactionType;
  quantity: number;
  date: string; // ISO string
}

export interface ModalState {
  open: boolean;
  productId: string | null;
  type: TransactionType | null;
}
