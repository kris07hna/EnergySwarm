"use client";

import Script from "next/script";
import Image from "next/image";
import { useState } from "react";

type SplineBackdropProps = {
  imageSrc: string;
  imageAlt: string;
  sceneUrl: string;
};

export function SplineBackdrop({ imageSrc, imageAlt, sceneUrl }: SplineBackdropProps) {
  const [viewerReady, setViewerReady] = useState(false);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <Script
        id="spline-viewer-loader"
        type="module"
        src="https://unpkg.com/@splinetool/viewer@1.12.94/build/spline-viewer.js"
        strategy="afterInteractive"
        onLoad={() => setViewerReady(true)}
      />

      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-65"
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.2),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.22),transparent_30%),linear-gradient(180deg,rgba(2,6,23,0.18),rgba(2,6,23,0.92))]" />

      {viewerReady ? (
        <div className="absolute inset-0 opacity-95 [contain:layout_paint_style]">
          <spline-viewer
            url={sceneUrl}
            loading-anim-type="none"
            className="h-full w-full opacity-95"
          />
        </div>
      ) : null}

      <FallbackSplineScene />

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.1),rgba(2,6,23,0.88))]" />
    </div>
  );
}

function FallbackSplineScene() {
  return (
    <div className="absolute inset-0 opacity-90">
      <div className="absolute left-[8%] top-[16%] h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute right-[10%] top-[26%] h-72 w-72 rounded-full bg-fuchsia-500/14 blur-3xl" />
      <div className="absolute inset-0 [perspective:1200px]">
        <div className="absolute left-1/2 top-[18%] h-56 w-56 -translate-x-1/2 rotate-12 rounded-[2rem] border border-cyan-200/18 bg-[linear-gradient(145deg,rgba(255,255,255,0.22),rgba(255,255,255,0.02))] shadow-[0_0_120px_rgba(34,211,238,0.18)] backdrop-blur-md [transform-style:preserve-3d]" />
        <div className="absolute left-[15%] top-[34%] h-40 w-40 rounded-[1.5rem] border border-white/10 bg-[linear-gradient(145deg,rgba(99,102,241,0.28),rgba(15,23,42,0.12))] shadow-[0_24px_80px_rgba(15,23,42,0.5)] [transform:rotateY(26deg)_rotateX(18deg)]" />
        <div className="absolute right-[12%] top-[44%] h-44 w-44 rounded-[1.5rem] border border-white/10 bg-[linear-gradient(145deg,rgba(236,72,153,0.22),rgba(15,23,42,0.12))] shadow-[0_24px_80px_rgba(15,23,42,0.5)] [transform:rotateY(-28deg)_rotateX(16deg)]" />
        <div className="absolute bottom-[14%] left-[22%] h-24 w-[38%] rounded-full bg-white/10 blur-3xl" />
      </div>
    </div>
  );
}
