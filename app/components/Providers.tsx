"use client";

import { type ReactNode } from "react";
import { InventoryProvider } from "@/app/lib/inventory-context";

export default function Providers({ children }: { children: ReactNode }) {
  return <InventoryProvider>{children}</InventoryProvider>;
}
