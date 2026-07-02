"use client";

import { useState } from "react";

/**
 * Image picker for admin forms: uploads to /api/admin/upload and stores the
 * returned public path in a hidden input submitted with the form.
 */
export function ImageUploadField({
  name,
  label,
  defaultValue = "",
}: {
  name: string;
  label: string;
  defaultValue?: string;
}) {
  const [path, setPath] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.path) throw new Error(data.error || "Upload failed");
      setPath(data.path);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">
        {label}
      </span>
      <input type="hidden" name={name} value={path} />
      <div className="flex items-center gap-4">
        {path ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={path} alt="" className="h-16 w-16 rounded-lg border border-line object-cover" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-line text-xs text-muted">
            none
          </div>
        )}
        <div className="text-sm">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={(e) => onFile(e.target.files?.[0])}
            disabled={busy}
            className="block text-xs text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-accent-deep"
          />
          {busy && <p className="mt-1 text-xs text-muted">Uploading…</p>}
          {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
          {path && (
            <button
              type="button"
              onClick={() => setPath("")}
              className="mt-1 text-xs text-muted underline hover:text-red-400"
            >
              Remove image
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
