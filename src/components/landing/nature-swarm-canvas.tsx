"use client";

import { useEffect, useRef, useState } from "react";

type NatureSwarmCanvasProps = {
  imageSrc: string;
  imageAlt: string;
  className?: string;
  particleCount?: number;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hue: number;
  radius: number;
  seed: number;
};

export function NatureSwarmCanvas({
  imageSrc,
  imageAlt,
  className = "",
  particleCount = 84,
}: NatureSwarmCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const pointerRef = useRef({ x: 0.5, y: 0.44 });
  const frameRef = useRef<number | null>(null);
  const [imageReady, setImageReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const image = new Image();
    image.src = imageSrc;
    imageRef.current = image;

    const createParticles = () => {
      particlesRef.current = Array.from({ length: particleCount }, (_, index) => ({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.0018,
        vy: (Math.random() - 0.5) * 0.0018,
        hue: 168 + Math.random() * 110,
        radius: 1.3 + Math.random() * 2.8,
        seed: index + Math.random() * 10,
      }));
    };

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const scale = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(rect.width * scale));
      canvas.height = Math.max(1, Math.round(rect.height * scale));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      context.setTransform(scale, 0, 0, scale, 0, 0);
    };

    const drawCoverImage = (ctx: CanvasRenderingContext2D, img: HTMLImageElement) => {
      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const imageRatio = img.width / img.height;
      const frameRatio = width / height;
      let drawWidth = width;
      let drawHeight = height;
      let offsetX = 0;
      let offsetY = 0;

      if (frameRatio > imageRatio) {
        drawWidth = width;
        drawHeight = width / imageRatio;
        offsetY = (height - drawHeight) / 2;
      } else {
        drawHeight = height;
        drawWidth = height * imageRatio;
        offsetX = (width - drawWidth) / 2;
      }

      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    };

    const drawFrame = (time: number) => {
      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      if (!width || !height) {
        frameRef.current = requestAnimationFrame(drawFrame);
        return;
      }

      context.clearRect(0, 0, width, height);

      if (imageRef.current?.complete) {
        context.save();
        context.globalAlpha = 0.9;
        drawCoverImage(context, imageRef.current);
        context.restore();
      } else {
        const fallback = context.createLinearGradient(0, 0, width, height);
        fallback.addColorStop(0, "#07111f");
        fallback.addColorStop(0.45, "#0f1b2f");
        fallback.addColorStop(1, "#020617");
        context.fillStyle = fallback;
        context.fillRect(0, 0, width, height);
      }

      const haze = context.createRadialGradient(width * 0.2, height * 0.2, 40, width * 0.5, height * 0.45, Math.max(width, height));
      haze.addColorStop(0, "rgba(34,211,238,0.22)");
      haze.addColorStop(0.38, "rgba(14,165,233,0.12)");
      haze.addColorStop(1, "rgba(2,6,23,0.82)");
      context.fillStyle = haze;
      context.fillRect(0, 0, width, height);

      const lines = [
        ["rgba(255,255,255,0.06)", 0.12],
        ["rgba(45,212,191,0.08)", 0.1],
      ] as const;
      lines.forEach(([color, alpha], index) => {
        context.strokeStyle = color;
        context.lineWidth = 1;
        context.globalAlpha = alpha;
        context.beginPath();
        const offset = (time * 0.00002 + index * 0.33) % 1;
        context.moveTo(0, height * (0.12 + offset * 0.6));
        context.bezierCurveTo(width * 0.2, height * (0.2 + offset * 0.18), width * 0.7, height * (0.05 + offset * 0.35), width, height * (0.18 + offset * 0.5));
        context.stroke();
      });
      context.globalAlpha = 1;

      const particles = particlesRef.current;
      const target = pointerRef.current;
      const dt = 1 + Math.min(2, (time % 1200) / 7000);

      particles.forEach((particle) => {
        const wobbleX = Math.sin(time * 0.0008 + particle.seed) * 0.0007;
        const wobbleY = Math.cos(time * 0.0006 + particle.seed) * 0.0007;
        const pullX = (target.x - particle.x) * 0.00065;
        const pullY = (target.y - particle.y) * 0.00065;

        particle.vx = particle.vx * 0.985 + wobbleX + pullX;
        particle.vy = particle.vy * 0.985 + wobbleY + pullY;
        particle.x = (particle.x + particle.vx * dt + 1) % 1;
        particle.y = (particle.y + particle.vy * dt + 1) % 1;
      });

      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        const ax = a.x * width;
        const ay = a.y * height;

        for (let j = i + 1; j < Math.min(i + 6, particles.length); j++) {
          const b = particles[j];
          const bx = b.x * width;
          const by = b.y * height;
          const dx = ax - bx;
          const dy = ay - by;
          const distance = Math.hypot(dx, dy);

          if (distance < 220) {
            context.beginPath();
            context.strokeStyle = `rgba(112, 243, 240, ${Math.max(0, 0.18 - distance / 1200)})`;
            context.lineWidth = 0.7;
            context.moveTo(ax, ay);
            context.lineTo(bx, by);
            context.stroke();
          }
        }
      }

      particles.forEach((particle) => {
        const x = particle.x * width;
        const y = particle.y * height;
        const glow = context.createRadialGradient(x, y, 0, x, y, particle.radius * 8);
        glow.addColorStop(0, `hsla(${particle.hue}, 92%, 72%, 0.95)`);
        glow.addColorStop(1, `hsla(${particle.hue}, 92%, 72%, 0)`);
        context.fillStyle = glow;
        context.beginPath();
        context.arc(x, y, particle.radius * 3.1, 0, Math.PI * 2);
        context.fill();
      });

      context.fillStyle = "rgba(2,6,23,0.18)";
      context.fillRect(0, 0, width, height);
      frameRef.current = requestAnimationFrame(drawFrame);
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointerRef.current = {
        x: (event.clientX - rect.left) / rect.width,
        y: (event.clientY - rect.top) / rect.height,
      };
    };

    const onPointerLeave = () => {
      pointerRef.current = { x: 0.5, y: 0.44 };
    };

    const onResize = () => resize();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(onResize) : null;
    const startAnimation = () => {
      setImageReady(true);
      resize();
      createParticles();
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      frameRef.current = requestAnimationFrame(drawFrame);
    };

    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerleave", onPointerLeave);
    observer?.observe(container);
    window.addEventListener("resize", onResize);

    image.onload = startAnimation;
    image.onerror = startAnimation;

    if (image.complete && image.naturalWidth > 0) {
      startAnimation();
    }

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      observer?.disconnect();
      window.removeEventListener("resize", onResize);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [imageAlt, imageSrc, particleCount]);

  return (
    <div ref={containerRef} className={`absolute inset-0 overflow-hidden ${className}`} aria-label={imageAlt}>
      <canvas ref={canvasRef} className="h-full w-full" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.12),rgba(2,6,23,0.72))]" />
      {!imageReady && <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" />}
    </div>
  );
}
