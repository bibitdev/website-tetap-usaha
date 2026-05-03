/**
 * GET  /api/products        → list all products
 * POST /api/products        → create a new product
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(products);
  } catch (err) {
    console.error("[GET /api/products]", err);
    return NextResponse.json({ error: "Gagal mengambil data produk" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, image, category, stock, price } = body as {
      name: string;
      image: string;
      category: string;
      stock: number;
      price: number;
    };

    if (!name || !category || stock == null || price == null) {
      return NextResponse.json({ error: "Field tidak lengkap" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        image: image || "/product-default.png",
        category,
        stock: Number(stock),
        price: Number(price),
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    console.error("[POST /api/products]", err);
    return NextResponse.json({ error: "Gagal membuat produk" }, { status: 500 });
  }
}
