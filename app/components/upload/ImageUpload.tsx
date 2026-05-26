"use client";

/**
 * ImageUpload — reusable drag-and-drop image uploader
 * Features: drag & drop, click to upload, preview, progress, remove, validation
 * Dark mode compatible, responsive, matches existing design language
 */
import { useState, useRef, useCallback, useId } from "react";
import Image from "next/image";
import { Upload, X, ImageIcon, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { validateImageFile, ALLOWED_EXTENSIONS, MAX_FILE_SIZE_LABEL } from "@/app/lib/utils/file-validation";

export interface ImageUploadProps {
  /** Current image URL (from DB or local preset path) */
  value: string;
  /** Called with the new public URL after successful upload, or "" to clear */
  onChange: (url: string) => void;
  /** Whether the form is being submitted (disables interaction) */
  disabled?: boolean;
}

type UploadState =
  | { status: "idle" }
  | { status: "uploading"; progress: number }
  | { status: "success" }
  | { status: "error"; message: string };

export default function ImageUpload({ value, onChange, disabled = false }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>({ status: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  const hasImage = !!value;
  const isUploading = uploadState.status === "uploading";
  const isInteractive = !disabled && !isUploading;

  // ── Upload logic ─────────────────────────────────────────────
  const uploadFile = useCallback(
    async (file: File) => {
      // Client-side validation first
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setUploadState({ status: "error", message: validation.error! });
        return;
      }

      setUploadState({ status: "uploading", progress: 0 });

      // Simulate progress since fetch doesn't expose upload progress for small files
      const progressInterval = setInterval(() => {
        setUploadState((prev) =>
          prev.status === "uploading" && prev.progress < 85
            ? { status: "uploading", progress: prev.progress + 15 }
            : prev
        );
      }, 120);

      try {
        const form = new FormData();
        form.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: form,
        });

        clearInterval(progressInterval);

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Upload gagal. Coba lagi.");
        }

        const { url } = await res.json();
        setUploadState({ status: "success" });
        onChange(url);

        // Reset to idle after brief success flash
        setTimeout(() => setUploadState({ status: "idle" }), 1800);
      } catch (err) {
        clearInterval(progressInterval);
        setUploadState({
          status: "error",
          message: err instanceof Error ? err.message : "Upload gagal.",
        });
      }
    },
    [onChange]
  );

  // ── Drag handlers ─────────────────────────────────────────────
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    if (isInteractive) setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    // Only fire when leaving the zone entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (!isInteractive) return;
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    // Reset input so same file can be re-selected
    e.target.value = "";
  }

  function handleRemove(e: React.MouseEvent) {
    e.stopPropagation();
    if (!isInteractive) return;
    onChange("");
    setUploadState({ status: "idle" });
  }

  function handleZoneClick() {
    if (isInteractive) inputRef.current?.click();
  }

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="img-upload-root">
      {/* Hidden file input */}
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ALLOWED_EXTENSIONS.map((e) => `.${e}`).join(",")}
        className="sr-only"
        onChange={handleInputChange}
        disabled={!isInteractive}
        aria-label="Upload gambar produk"
      />

      {/* Drop zone */}
      <div
        className={[
          "img-upload-zone",
          isDragging && "img-upload-zone--dragging",
          hasImage && "img-upload-zone--has-image",
          !isInteractive && "img-upload-zone--disabled",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={handleZoneClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={isInteractive ? 0 : -1}
        aria-label="Klik atau seret gambar ke sini untuk upload"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleZoneClick();
        }}
      >
        {/* ── Preview ── */}
        {hasImage && !isUploading && (
          <div className="img-upload-preview">
            <Image
              src={value}
              alt="Preview produk"
              fill
              className="object-contain p-2"
              sizes="280px"
              onError={() => {
                // Silently ignore broken image — handled by fallback icon
              }}
            />
            {/* Overlay on hover */}
            <div className="img-upload-overlay">
              <div className="img-upload-overlay-inner">
                <Upload className="w-5 h-5" />
                <span className="text-[12px] font-medium mt-1">Ganti gambar</span>
              </div>
            </div>
            {/* Remove button */}
            {isInteractive && (
              <button
                type="button"
                onClick={handleRemove}
                className="img-upload-remove"
                aria-label="Hapus gambar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* ── Uploading state ── */}
        {isUploading && (
          <div className="img-upload-uploading">
            <Loader2 className="w-8 h-8 animate-spin img-upload-spinner" />
            <p className="text-[13px] font-medium text-text-secondary mt-3">
              Mengupload...
            </p>
            {/* Progress bar */}
            <div className="img-upload-progress-track">
              <div
                className="img-upload-progress-fill"
                style={{
                  width: `${uploadState.status === "uploading" ? uploadState.progress : 0}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* ── Success flash ── */}
        {uploadState.status === "success" && !isUploading && hasImage && (
          <div className="img-upload-success-badge">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        )}

        {/* ── Empty state (no image, not uploading) ── */}
        {!hasImage && !isUploading && (
          <div className="img-upload-empty">
            <div className={`img-upload-icon ${isDragging ? "img-upload-icon--drag" : ""}`}>
              {isDragging ? (
                <Upload className="w-6 h-6" />
              ) : (
                <ImageIcon className="w-6 h-6" />
              )}
            </div>
            <p className="img-upload-hint-primary">
              {isDragging ? "Lepas untuk upload" : "Klik atau seret gambar"}
            </p>
            <p className="img-upload-hint-secondary">
              JPG, PNG, WebP · maks {MAX_FILE_SIZE_LABEL}
            </p>
          </div>
        )}
      </div>

      {/* ── Error message ── */}
      {uploadState.status === "error" && (
        <div className="img-upload-error" role="alert">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-[1px]" />
          <span>{uploadState.message}</span>
          <button
            type="button"
            onClick={() => setUploadState({ status: "idle" })}
            className="img-upload-error-dismiss"
            aria-label="Tutup"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* ── Preset quick-pick ── */}
      <PresetPicker currentValue={value} onSelect={onChange} disabled={!isInteractive} />
    </div>
  );
}

/* ================================================================
   Preset quick-pick — kept as optional fallback shortcuts
   ================================================================ */
const PRESETS = [
  { src: "/product-laptop.png", label: "Laptop" },
  { src: "/product-smartphone.png", label: "Smartphone" },
  { src: "/product-earbuds.png", label: "Audio" },
  { src: "/product-keyboard.png", label: "Keyboard" },
  { src: "/product-mouse.png", label: "Mouse" },
  { src: "/product-monitor.png", label: "Monitor" },
  { src: "/product-tablet.png", label: "Tablet" },
  { src: "/product-cable.png", label: "Kabel" },
] as const;

function PresetPicker({
  currentValue,
  onSelect,
  disabled,
}: {
  currentValue: string;
  onSelect: (url: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="img-preset-root">
      <p className="img-preset-label">Atau pilih gambar preset:</p>
      <div className="img-preset-grid">
        {PRESETS.map((p) => (
          <button
            key={p.src}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(p.src)}
            className={[
              "img-preset-btn",
              currentValue === p.src && "img-preset-btn--active",
            ]
              .filter(Boolean)
              .join(" ")}
            title={p.label}
            aria-label={p.label}
          >
            <Image
              src={p.src}
              alt={p.label}
              fill
              className="object-cover p-1"
              sizes="48px"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
