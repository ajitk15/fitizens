"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeAlt?: string;
  afterAlt?: string;
  className?: string;
}

/**
 * Draggable before/after comparison slider.
 * Drag the handle (or use arrow keys when focused) to wipe between the two
 * images. Pointer events cover mouse + touch.
 */
export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeAlt = "Before",
  afterAlt = "After",
  className,
}: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50); // percent
  const dragging = useRef(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.max(0, Math.min(100, pct)));
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    updateFromClientX(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    updateFromClientX(e.clientX);
  };
  const onPointerUp = () => {
    dragging.current = false;
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") setPosition((p) => Math.max(0, p - 4));
    if (e.key === "ArrowRight") setPosition((p) => Math.min(100, p + 4));
  };

  return (
    <div
      ref={containerRef}
      className={`relative aspect-[4/5] w-full select-none overflow-hidden rounded-2xl border border-line ${className ?? ""}`}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      {/* After image (full, underneath) */}
      <Image
        src={afterImage}
        alt={afterAlt}
        fill
        sizes="(max-width: 768px) 100vw, 480px"
        className="object-cover"
        draggable={false}
      />
      <span className="absolute right-3 top-3 rounded-full bg-ink/70 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-fg backdrop-blur">
        After
      </span>

      {/* Before image — full-size layer clipped from the right to the handle.
          clip-path avoids squashing the image and never reads layout in render. */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <Image
          src={beforeImage}
          alt={beforeAlt}
          fill
          sizes="(max-width: 768px) 100vw, 480px"
          className="object-cover"
          draggable={false}
        />
        <span className="absolute left-3 top-3 rounded-full bg-accent/90 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink">
          Before
        </span>
      </div>

      {/* Handle */}
      <div
        className="absolute inset-y-0 z-10 w-1 -translate-x-1/2 cursor-ew-resize bg-accent"
        style={{ left: `${position}%` }}
        onPointerDown={onPointerDown}
      >
        <button
          type="button"
          aria-label="Drag to compare before and after"
          aria-valuenow={Math.round(position)}
          aria-valuemin={0}
          aria-valuemax={100}
          role="slider"
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-ink shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M9 6 4 12l5 6M15 6l5 6-5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
