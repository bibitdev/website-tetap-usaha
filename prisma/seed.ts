/**
 * Seed script — populate the database with initial products
 * Run: npx tsx prisma/seed.ts
 */
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../app/generated/prisma/client.js";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

const SEED_PRODUCTS = [
  { name: 'MacBook Pro M3 14"', image: "/product-laptop.png", category: "Laptop", stock: 24, price: 28500000 },
  { name: "Galaxy S24 Ultra", image: "/product-smartphone.png", category: "Smartphone", stock: 18, price: 19999000 },
  { name: "AirPods Pro 2", image: "/product-earbuds.png", category: "Audio", stock: 5, price: 3799000 },
  { name: "Velocita GM87 Keyboard", image: "/product-keyboard.png", category: "Aksesoris", stock: 42, price: 1250000 },
  { name: "Logitech G Pro Mouse", image: "/product-mouse.png", category: "Aksesoris", stock: 0, price: 1850000 },
  { name: 'Samsung 4K Monitor 27"', image: "/product-monitor.png", category: "Monitor", stock: 8, price: 5400000 },
  { name: 'iPad Pro M4 11"', image: "/product-tablet.png", category: "Tablet", stock: 3, price: 17499000 },
  { name: "Kabel USB-C 100W", image: "/product-cable.png", category: "Aksesoris", stock: 150, price: 89000 },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data first
  await prisma.transaction.deleteMany();
  await prisma.product.deleteMany();

  for (const data of SEED_PRODUCTS) {
    const product = await prisma.product.create({ data });
    console.log(`  ✓ ${product.name}`);
  }

  console.log(`✅ Seeded ${SEED_PRODUCTS.length} products.`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
