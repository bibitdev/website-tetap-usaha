/**
 * GET  /api/transactions         → list all transactions (with product name)
 * POST /api/transactions         → record stock IN or OUT
 *
 * POST body: { productId, type: "IN"|"OUT", quantity, note? }
 * The product's stock is updated atomically in the same transaction.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { withAuth } from "@/app/lib/auth/api-guard";

export const GET = withAuth(async () => {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { date: "desc" },
      include: { product: { select: { name: true, image: true, category: true } } },
    });

    // Shape matches the frontend Transaction type + product details
    const data = transactions.map((tx: typeof transactions[number]) => ({
      id: tx.id,
      productId: tx.productId,
      productName: tx.product.name,
      productImage: tx.product.image,
      productCategory: tx.product.category,
      type: tx.type,
      quantity: tx.quantity,
      note: tx.note,
      date: tx.date.toISOString(),
    }));

    return NextResponse.json(data);
  } catch (err) {
    console.error("[GET /api/transactions]", err);
    return NextResponse.json({ error: "Gagal mengambil transaksi" }, { status: 500 });
  }
});

export const POST = withAuth(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { productId, type, quantity, note } = body as {
      productId: string;
      type: "IN" | "OUT";
      quantity: number;
      note?: string;
    };

    if (!productId || !type || !quantity || quantity <= 0) {
      return NextResponse.json({ error: "Data transaksi tidak valid" }, { status: 400 });
    }
    if (type !== "IN" && type !== "OUT") {
      return NextResponse.json({ error: "Tipe harus IN atau OUT" }, { status: 400 });
    }

    // Use a Prisma interactive transaction to keep stock update & transaction record atomic
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) throw new Error("Produk tidak ditemukan");

      const actualQty =
        type === "OUT" ? Math.min(quantity, product.stock) : quantity;
      if (actualQty === 0) throw new Error("Stok sudah habis");

      const stockDelta = type === "IN" ? actualQty : -actualQty;

      const [updatedProduct, transaction] = await Promise.all([
        tx.product.update({
          where: { id: productId },
          data: { stock: { increment: stockDelta } },
        }),
        tx.transaction.create({
          data: {
            productId,
            type,
            quantity: actualQty,
            note: note ?? null,
          },
        }),
      ]);

      return { product: updatedProduct, transaction };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal mencatat transaksi";
    console.error("[POST /api/transactions]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
});
