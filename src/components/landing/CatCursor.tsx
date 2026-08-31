"use client";
import { useEffect, useRef } from "react";

export function CatCursor() {
  const catRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -200, y: -200 });
  const cur = useRef({ x: -200, y: -200 });
  const vel = useRef({ x: 0, y: 0 });
  const raf = useRef<number | undefined>(undefined);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMove);

    const loop = () => {
      const dx = pos.current.x - cur.current.x;
      const dy = pos.current.y - cur.current.y;
      vel.current.x = dx * 0.13;
      vel.current.y = dy * 0.13;
      cur.current.x += vel.current.x;
      cur.current.y += vel.current.y;

      if (catRef.current) {
        const tilt = Math.max(-18, Math.min(18, vel.current.x * 1.5));
        const flip = vel.current.x < -1 ? "scaleX(-1)" : "scaleX(1)";
        catRef.current.style.transform =
          `translate(${cur.current.x - 32}px, ${cur.current.y - 52}px) ${flip} rotate(${tilt}deg)`;
      }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes cat-tail {
          0%,100% { d: path("M 32 52 Q 54 60 56 46 Q 58 34 46 40"); }
          50%      { d: path("M 32 52 Q 58 48 54 34 Q 50 22 40 32"); }
        }
        @keyframes cat-blink {
          0%,90%,100% { transform: scaleY(1); }
          95%          { transform: scaleY(0.08); }
        }
        @keyframes cat-float {
          0%,100% { translate: 0 0px; }
          50%      { translate: 0 -3px; }
        }
        .cat-wrap { animation: cat-float 2.2s ease-in-out infinite; }
        .cat-eye  { animation: cat-blink 4s ease-in-out infinite; transform-origin: center; }
        .cat-tail-path { animation: cat-tail 1.1s ease-in-out infinite alternate; }
      `}</style>

      <div
        ref={catRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999]"
        style={{ willChange: "transform", transition: "none" }}
        aria-hidden="true"
      >
        <div className="cat-wrap">
          <svg width="68" height="72" viewBox="0 0 68 72" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Tail */}
            <path
              className="cat-tail-path"
              d="M 32 52 Q 54 60 56 46 Q 58 34 46 40"
              stroke="#0a0a0a"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />
            {/* Body */}
            <ellipse cx="34" cy="46" rx="17" ry="16" fill="#0a0a0a" />
            {/* Head */}
            <circle cx="34" cy="28" r="17" fill="#0a0a0a" />
            {/* Ears */}
            <polygon points="18,16 12,2 25,12" fill="#0a0a0a" />
            <polygon points="50,16 56,2 43,12" fill="#0a0a0a" />
            {/* Inner ears */}
            <polygon points="19,14 14,5 24,11" fill="#1a0a0f" opacity="0.7" />
            <polygon points="49,14 54,5 44,11" fill="#1a0a0f" opacity="0.7" />
            {/* Eye whites / iris (yellow) */}
            <g className="cat-eye">
              <ellipse cx="26" cy="27" rx="6" ry="7" fill="#FFD400" />
              <ellipse cx="42" cy="27" rx="6" ry="7" fill="#FFD400" />
            </g>
            {/* Pupils */}
            <ellipse cx="26" cy="27" rx="3" ry="5.5" fill="#050505" />
            <ellipse cx="42" cy="27" rx="3" ry="5.5" fill="#050505" />
            {/* Eye shine */}
            <circle cx="28" cy="24.5" r="1.4" fill="white" opacity="0.9" />
            <circle cx="44" cy="24.5" r="1.4" fill="white" opacity="0.9" />
            {/* Nose */}
            <polygon points="34,34 31,31 37,31" fill="#e8748a" />
            {/* Mouth */}
            <path d="M 31 35 Q 34 38 37 35" stroke="#e8748a" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            {/* Whiskers left */}
            <line x1="14" y1="30" x2="27" y2="32" stroke="white" strokeWidth="1" opacity="0.55" />
            <line x1="14" y1="34" x2="27" y2="33.5" stroke="white" strokeWidth="1" opacity="0.55" />
            {/* Whiskers right */}
            <line x1="54" y1="30" x2="41" y2="32" stroke="white" strokeWidth="1" opacity="0.55" />
            <line x1="54" y1="34" x2="41" y2="33.5" stroke="white" strokeWidth="1" opacity="0.55" />
          </svg>
        </div>
      </div>
    </>
  );
}
