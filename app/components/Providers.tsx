"use client";

import { type ReactNode } from "react";
import { InventoryProvider } from "@/app/lib/inventory-context";
import { SidebarProvider } from "@/app/lib/sidebar-context";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <InventoryProvider>
      <SidebarProvider>{children}</SidebarProvider>
    </InventoryProvider>
  );
}
