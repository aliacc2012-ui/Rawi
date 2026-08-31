"use client";
import { useEffect, useRef, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  delay?: 0 | 1 | 2 | 3 | 4 | 5;
  className?: string;
}

export function Reveal({ children, delay = 0, className = "" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          el.classList.add("visible");
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal${delay > 0 ? ` reveal-delay-${delay}` : ""} ${className}`}
    >
      {children}
    </div>
  );
}
