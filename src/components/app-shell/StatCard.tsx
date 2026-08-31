"use client";
import { useEffect, useRef, useState } from "react";

interface StatCardProps {
  value: number;
  suffix?: string;
  label: string;
  icon: React.ReactNode;
  color: string;          // tailwind bg class for icon bg
  textColor: string;      // tailwind text class for value
  glowColor: string;      // css color for box-shadow glow
  delay?: number;
  href?: string;
  alert?: boolean;
}

function useCountUp(target: number, duration = 1200, delay = 0) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    let frame: number;
    const timeout = setTimeout(() => {
      const step = (timestamp: number) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        // easeOutExpo
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        setCount(Math.floor(eased * target));
        if (progress < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    }, delay);
    return () => { clearTimeout(timeout); cancelAnimationFrame(frame); };
  }, [target, duration, delay]);
  return count;
}

export function StatCard({ value, suffix = "", label, icon, color, textColor, glowColor, delay = 0, alert }: StatCardProps) {
  const [hovered, setHovered] = useState(false);
  const displayValue = useCountUp(value, 1100, delay);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        transition: "box-shadow 0.35s ease, transform 0.25s ease",
        transform: hovered ? "translateY(-4px) scale(1.025)" : "translateY(0) scale(1)",
        boxShadow: hovered
          ? `0 0 0 1px rgba(255,255,255,0.12), 0 8px 32px ${glowColor}40`
          : `0 0 0 1px rgba(255,255,255,0.07)`,
      }}
      className={`relative overflow-hidden bg-rawi-panel rounded-[20px] p-4 min-h-[130px] flex flex-col cursor-default ${alert ? "border border-amber-400/30" : ""}`}
    >
      {/* subtle inner glow */}
      <div
        style={{ background: `radial-gradient(ellipse at top left, ${glowColor}18 0%, transparent 65%)` }}
        className="absolute inset-0 pointer-events-none"
      />
      <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center`}>
        {icon}
      </div>
      <div className={`text-[28px] font-extrabold mt-auto tracking-tight ${textColor}`}>
        {displayValue.toLocaleString()}{suffix}
      </div>
      <div className="text-[11px] font-bold uppercase tracking-[.14em] text-white/35 mt-0.5">{label}</div>
    </div>
  );
}
