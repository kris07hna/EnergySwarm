"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import { useMemo, useRef, useState } from "react";
import { useScreenSize } from "@/hooks/use-screen-size";

type PixelTrailProps = {
  pixelSize: number;
  fadeDuration: number;
  delay: number;
  pixelClassName?: string;
};

type PointerPoint = {
  x: number;
  y: number;
};

export function PixelTrail({
  pixelSize,
  fadeDuration,
  delay,
  pixelClassName = "bg-white",
}: PixelTrailProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const screenSize = useScreenSize();
  const [pointer, setPointer] = useState<PointerPoint>({ x: 0.5, y: 0.5 });

  const columns = Math.max(12, Math.floor((screenSize.width || 1440) / pixelSize));
  const rows = Math.max(10, Math.floor((screenSize.height || 900) / pixelSize));
  const total = Math.min(columns * rows, 256);

  const pixels = useMemo(
    () => Array.from({ length: total }, (_, index) => index),
    [total]
  );

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    setPointer({
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
    });
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      className="absolute inset-0 grid pointer-events-auto select-none"
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
      }}
      aria-hidden="true"
    >
      {pixels.map((index) => {
        const row = Math.floor(index / columns);
        const col = index % columns;
        const cx = (col + 0.5) / columns;
        const cy = (row + 0.5) / rows;
        const distance = Math.hypot(pointer.x - cx, pointer.y - cy);
        const intensity = Math.max(0, 1 - distance * 2.4);
        const scale = 0.76 + intensity * 0.9;
        const opacity = 0.08 + intensity * 0.82;

        return (
          <div
            key={index}
            className={`pixel-trail-cell aspect-square rounded-[2px] ${pixelClassName}`}
            style={{
              opacity,
              transform: `scale(${scale}) translateZ(0)`,
              filter: `blur(${intensity * 0.35}px)`,
              transition: `opacity ${fadeDuration}ms linear, transform ${fadeDuration}ms linear, filter ${fadeDuration}ms linear`,
              transitionDelay: `${delay + (index % 16) * 22}ms`,
              boxShadow: intensity > 0.45 ? "0 0 12px rgba(255,255,255,0.35)" : "none",
            }}
          />
        );
      })}
    </div>
  );
}
