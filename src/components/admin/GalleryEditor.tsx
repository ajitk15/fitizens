"use client";

import { useState } from "react";

/**
 * Visual editor for image lists (trainer gallery): upload to add, click to
 * remove, drag-free reordering via arrows. Serializes to a hidden JSON input —
 * no hand-typed paths to get wrong.
 */
export function GalleryEditor({ name, initial }: { name: string; initial: string[] }) {
  const [paths, setPaths] = useState<string[]>(initial);
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
      setPaths((ps) => [...ps, data.path]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  const move = (i: number, dir: -1 | 1) =>
    setPaths((ps) => {
      const j = i + dir;
      if (j < 0 || j >= ps.length) return ps;
      const next = [...ps];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(paths)} />
      <div className="flex flex-wrap gap-3">
        {paths.map((p, i) => (
          <div key={`${p}-${i}`} className="group relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p} alt="" className="h-20 w-20 rounded-lg border border-line object-cover" />
            <div className="absolute inset-x-0 bottom-0 hidden justify-center gap-1 rounded-b-lg bg-ink/80 py-0.5 group-hover:flex">
              <button type="button" aria-label="Move left" onClick={() => move(i, -1)} className="px-1 text-xs text-muted hover:text-accent">
                ←
              </button>
              <button
                type="button"
                aria-label="Remove image"
                onClick={() => setPaths((ps) => ps.filter((_, j) => j !== i))}
                className="px-1 text-xs text-red-400"
              >
                ×
              </button>
              <button type="button" aria-label="Move right" onClick={() => move(i, 1)} className="px-1 text-xs text-muted hover:text-accent">
                →
              </button>
            </div>
          </div>
        ))}
        <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border border-dashed border-line text-2xl text-muted hover:border-accent hover:text-accent">
          +
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            disabled={busy}
            onChange={(e) => {
              void onFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>
      </div>
      {busy && <p className="mt-1 text-xs text-muted">Uploading…</p>}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
