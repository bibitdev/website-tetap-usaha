/**
 * POST /api/upload
 * Accepts multipart/form-data with field "file"
 * Validates type (magic bytes) + size, saves to /public/uploads/
 * Returns { url: "/uploads/<filename>" }
 *
 * Uses Node.js runtime (not Edge) — needs fs access
 */
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getSession } from "@/app/lib/auth/session";
import {
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_LABEL,
  ALLOWED_MIME_TYPES,
  detectMimeFromBuffer,
  sanitizeFilename,
} from "@/app/lib/utils/file-validation";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── Auth check ────────────────────────────────────────────────
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Parse multipart form ──────────────────────────────────────
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Request harus berupa multipart/form-data" },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: "Field 'file' wajib ada" },
      { status: 400 }
    );
  }

  // ── Size validation ───────────────────────────────────────────
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(1);
    return NextResponse.json(
      { error: `Ukuran file terlalu besar (${sizeMB}MB). Maksimal ${MAX_FILE_SIZE_LABEL}.` },
      { status: 413 }
    );
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "File kosong" }, { status: 400 });
  }

  // ── Read bytes + magic-byte MIME detection ────────────────────
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  const detectedMime = detectMimeFromBuffer(bytes);
  if (!detectedMime || !ALLOWED_MIME_TYPES.includes(detectedMime as (typeof ALLOWED_MIME_TYPES)[number])) {
    return NextResponse.json(
      { error: "Format file tidak valid. Hanya JPG, PNG, dan WebP yang diizinkan." },
      { status: 415 }
    );
  }

  // ── Generate safe filename + save ─────────────────────────────
  const filename = sanitizeFilename(file.name);
  const filepath = path.join(UPLOADS_DIR, filename);

  try {
    await mkdir(UPLOADS_DIR, { recursive: true });
    await writeFile(filepath, bytes);
  } catch (err) {
    console.error("[POST /api/upload] Write error:", err);
    return NextResponse.json(
      { error: "Gagal menyimpan file. Coba lagi." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { url: `/uploads/${filename}` },
    { status: 201 }
  );
}
