/**
 * GET    /api/products/[id]   → get single product
 * PUT    /api/products/[id]   → update product
 * DELETE /api/products/[id]   → delete product (cascade transactions)
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    return NextResponse.json(product);
  } catch (err) {
    console.error("[GET /api/products/[id]]", err);
    return NextResponse.json({ error: "Gagal mengambil produk" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { name, image, category, stock, price } = body as {
      name?: string;
      image?: string;
      category?: string;
      stock?: number;
      price?: number;
    };

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(image !== undefined && { image }),
        ...(category !== undefined && { category }),
        ...(stock !== undefined && { stock: Number(stock) }),
        ...(price !== undefined && { price: Number(price) }),
      },
    });
    return NextResponse.json(product);
  } catch (err) {
    console.error("[PUT /api/products/[id]]", err);
    return NextResponse.json({ error: "Gagal mengupdate produk" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/products/[id]]", err);
    return NextResponse.json({ error: "Gagal menghapus produk" }, { status: 500 });
  }
}
