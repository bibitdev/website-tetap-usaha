/* ================================================================
   Export utilities for PDF and Excel
   ================================================================ */

import type { Product, Transaction } from "./types";
import { getStockStatus, statusConfig, formatRupiah } from "./utils";

/** Export products to Excel (.xlsx) */
export async function exportToExcel(products: Product[], transactions: Transaction[]) {
  const XLSX = await import("xlsx");

  // Sheet 1: Products
  const productRows = products.map((p) => ({
    "Nama Produk": p.name,
    Kategori: p.category,
    Stok: p.stock,
    Harga: p.price,
    "Total Nilai": p.stock * p.price,
    Status: statusConfig[getStockStatus(p.stock)].label,
  }));

  // Sheet 2: Transactions
  const txRows = transactions.map((tx) => {
    const product = products.find((p) => p.id === tx.productId);
    return {
      Tanggal: new Date(tx.date).toLocaleDateString("id-ID"),
      Waktu: new Date(tx.date).toLocaleTimeString("id-ID"),
      Produk: product?.name ?? "Unknown",
      Tipe: tx.type === "IN" ? "Masuk" : "Keluar",
      Jumlah: tx.quantity,
      Nilai: product ? tx.quantity * product.price : 0,
    };
  });

  const wb = XLSX.utils.book_new();

  const ws1 = XLSX.utils.json_to_sheet(productRows);
  ws1["!cols"] = [
    { wch: 28 },
    { wch: 14 },
    { wch: 8 },
    { wch: 16 },
    { wch: 18 },
    { wch: 14 },
  ];
  XLSX.utils.book_append_sheet(wb, ws1, "Produk");

  const ws2 = XLSX.utils.json_to_sheet(txRows);
  ws2["!cols"] = [
    { wch: 14 },
    { wch: 10 },
    { wch: 28 },
    { wch: 10 },
    { wch: 10 },
    { wch: 16 },
  ];
  XLSX.utils.book_append_sheet(wb, ws2, "Transaksi");

  XLSX.writeFile(wb, `Laporan_TetapUsaha_${formatDateFile()}.xlsx`);
}

/** Export products to PDF */
export async function exportToPdf(products: Product[], transactions: Transaction[]) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF();

  // Title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Laporan Inventaris - Tetap Usaha", 14, 20);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Tanggal: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`, 14, 28);

  // Summary
  const totalStock = products.reduce((s, p) => s + p.stock, 0);
  const totalValue = products.reduce((s, p) => s + p.stock * p.price, 0);
  const critical = products.filter((p) => getStockStatus(p.stock) !== "safe").length;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Ringkasan", 14, 40);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Total Produk: ${products.length}`, 14, 47);
  doc.text(`Total Stok: ${totalStock.toLocaleString("id-ID")}`, 14, 53);
  doc.text(`Nilai Inventaris: ${formatRupiah(totalValue)}`, 14, 59);
  doc.text(`Stok Kritis: ${critical} produk`, 14, 65);

  // Product table
  autoTable(doc, {
    startY: 75,
    head: [["Nama Produk", "Kategori", "Stok", "Harga", "Total Nilai", "Status"]],
    body: products.map((p) => [
      p.name,
      p.category,
      p.stock.toString(),
      formatRupiah(p.price),
      formatRupiah(p.stock * p.price),
      statusConfig[getStockStatus(p.stock)].label,
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [59, 130, 246] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  // Transaction table on next page if there are transactions
  if (transactions.length > 0) {
    doc.addPage();
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Riwayat Transaksi", 14, 20);

    autoTable(doc, {
      startY: 28,
      head: [["Tanggal", "Produk", "Tipe", "Jumlah", "Nilai"]],
      body: transactions.slice(0, 50).map((tx) => {
        const product = products.find((p) => p.id === tx.productId);
        return [
          new Date(tx.date).toLocaleDateString("id-ID"),
          product?.name ?? "Unknown",
          tx.type === "IN" ? "Masuk" : "Keluar",
          tx.quantity.toString(),
          product ? formatRupiah(tx.quantity * product.price) : "-",
        ];
      }),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });
  }

  doc.save(`Laporan_TetapUsaha_${formatDateFile()}.pdf`);
}

function formatDateFile() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
