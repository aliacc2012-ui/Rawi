"use client";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

type CatState = "sit" | "walk" | "run";

export function CatCursor() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: -300, y: -300 });
  const curr = useRef({ x: -300, y: -300 });
  const raf = useRef<number | undefined>(undefined);
  const idleT = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [state, setState] = useState<CatState>("sit");
  const [left, setLeft] = useState(false);

  useEffect(() => {
    const onMove = (e: MouseEvent) => { target.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("mousemove", onMove);

    let px = -300;
    const loop = () => {
      const dx = target.current.x - curr.current.x;
      const dy = target.current.y - curr.current.y;
      curr.current.x += dx * 0.11;
      curr.current.y += dy * 0.11;
      const speed = Math.sqrt(dx * dx + dy * dy);
      const goLeft = curr.current.x < px - 0.8;
      const goRight = curr.current.x > px + 0.8;
      px = curr.current.x;

      if (wrapRef.current) {
        const sx = goLeft ? -1 : goRight ? 1 : left ? -1 : 1;
        wrapRef.current.style.transform =
          `translate(${curr.current.x - 50}px, ${curr.current.y - 68}px) scaleX(${sx})`;
      }
      if (speed > 22) {
        setState("run"); if (goLeft) setLeft(true); if (goRight) setLeft(false);
        clearTimeout(idleT.current); idleT.current = setTimeout(() => setState("sit"), 500);
      } else if (speed > 5) {
        setState("walk"); if (goLeft) setLeft(true); if (goRight) setLeft(false);
        clearTimeout(idleT.current); idleT.current = setTimeout(() => setState("sit"), 900);
      }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf.current) cancelAnimationFrame(raf.current);
      clearTimeout(idleT.current);
    };
  }, [left]);

  const d = state === "run" ? "0.2s" : "0.38s";
  const moving = state !== "sit";

  // Leg animation style helper
  const legStyle = (phase: "fwd" | "bwd", active: boolean): CSSProperties => ({
    animation: active ? `cat-leg-${phase} ${d} ease-in-out infinite` : "none",
  });

  return (
    <>
      <style>{`
        @keyframes cat-leg-fwd { 0%,100%{transform:rotate(-30deg)} 50%{transform:rotate(35deg)} }
        @keyframes cat-leg-bwd { 0%,100%{transform:rotate(35deg)} 50%{transform:rotate(-30deg)} }
        @keyframes cat-body-walk { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes cat-body-run  { 0%,100%{transform:translateY(0) scaleX(1.14) scaleY(.86)} 50%{transform:translateY(-9px) scaleX(.88) scaleY(1.12)} }
        @keyframes cat-breathe   { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(1.05)} }
        @keyframes cat-tail-idle { 0%,100%{transform:rotate(-12deg)} 50%{transform:rotate(18deg)} }
        @keyframes cat-tail-move { 0%,100%{transform:rotate(-30deg)} 50%{transform:rotate(10deg)} }
        @keyframes cat-blink     { 0%,88%,100%{transform:scaleY(1)} 94%{transform:scaleY(0.07)} }
        @keyframes cat-ear       { 0%,78%,100%{transform:rotate(0)} 86%{transform:rotate(-12deg)} 93%{transform:rotate(7deg)} }
        @keyframes cat-paw       { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
      `}</style>

      <div ref={wrapRef} className="pointer-events-none fixed left-0 top-0 z-[9999]"
           style={{ willChange: "transform" }} aria-hidden="true">
        <svg width="100" height="88" viewBox="0 0 100 88" fill="none">

          {/* ==== TAIL (attaches at rear-bottom of body) ==== */}
          <g style={{
            transformOrigin: "24px 54px",
            animation: `${moving ? "cat-tail-move" : "cat-tail-idle"} ${moving ? d : "2.2s"} ease-in-out infinite`,
          }}>
            <path d="M24 54 Q8 44 6 30 Q4 16 18 14 Q26 12 26 22"
                  stroke="#0a0a0a" strokeWidth="8" strokeLinecap="round" fill="none" />
          </g>

          {/* ==== BACK LEGS (far side, slightly muted, drawn before body) ==== */}
          {/* Back-far leg */}
          <g style={{ transformOrigin: "34px 56px", ...legStyle("bwd", moving) }}>
            <rect x="30" y="56" width="9" height="22" rx="4.5" fill="#181818" />
            <ellipse cx="34.5" cy="78" rx="8" ry="4" fill="#181818" />
          </g>
          {/* Back-near leg */}
          <g style={{ transformOrigin: "44px 56px", ...legStyle("fwd", moving) }}>
            <rect x="40" y="56" width="9" height="22" rx="4.5" fill="#222" />
            <ellipse cx="44.5" cy="78" rx="8" ry="4" fill="#222" />
          </g>

          {/* ==== BODY ==== */}
          <g style={{
            transformOrigin: "46px 48px",
            animation: state === "run"
              ? `cat-body-run ${d} ease-in-out infinite`
              : state === "walk"
              ? `cat-body-walk ${d} ease-in-out infinite`
              : "cat-breathe 2.8s ease-in-out infinite",
          }}>
            <ellipse cx="46" cy="48" rx="26" ry="18" fill="#0a0a0a" />
          </g>

          {/* ==== FRONT LEGS (near side, drawn over body) ==== */}
          {/* Front-far leg */}
          <g style={{
            transformOrigin: "60px 56px",
            ...legStyle("fwd", moving),
            ...(state === "sit" ? { animation: "cat-paw 3s ease-in-out infinite" } : {}),
          }}>
            <rect x="56" y="56" width="9" height="22" rx="4.5" fill="#181818" />
            <ellipse cx="60.5" cy="78" rx="8" ry="4" fill="#181818" />
          </g>
          {/* Front-near leg */}
          <g style={{
            transformOrigin: "70px 56px",
            ...legStyle("bwd", moving),
            ...(state === "sit" ? { animation: "cat-paw 3s ease-in-out 0.6s infinite" } : {}),
          }}>
            <rect x="66" y="56" width="9" height="22" rx="4.5" fill="#222" />
            <ellipse cx="70.5" cy="78" rx="8" ry="4" fill="#222" />
          </g>

          {/* ==== NECK ==== */}
          <ellipse cx="66" cy="38" rx="12" ry="11" fill="#0a0a0a" />

          {/* ==== HEAD ==== */}
          <circle cx="72" cy="24" r="20" fill="#0a0a0a" />

          {/* ==== EARS ==== */}
          {/* Left ear */}
          <g style={{ transformOrigin: "60px 8px", animation: "cat-ear 6s ease-in-out infinite" }}>
            <polygon points="60,10 52,0 66,6" fill="#0a0a0a" />
            <polygon points="60,10 54,3 64,7" fill="#2a0f1a" opacity="0.65" />
          </g>
          {/* Right ear */}
          <polygon points="84,10 78,0 90,6" fill="#0a0a0a" />
          <polygon points="84,10 80,3 88,7" fill="#2a0f1a" opacity="0.65" />

          {/* ==== EYE ==== */}
          <g style={{ transformOrigin: "76px 24px", animation: "cat-blink 4.5s ease-in-out infinite" }}>
            <ellipse cx="76" cy="24" rx="7" ry="8" fill="#FFD400" />
            <ellipse cx="76" cy="24" rx="3.5" ry="7" fill="#060606" />
            <circle cx="78.5" cy="20.5" r="1.8" fill="white" opacity="0.9" />
          </g>

          {/* ==== NOSE + MOUTH ==== */}
          <polygon points="70,31 67.5,28 72.5,28" fill="#e8748a" />
          <path d="M67.5 32 Q70 35 72.5 32" stroke="#e8748a" strokeWidth="1.2" fill="none" strokeLinecap="round" />

          {/* ==== WHISKERS ==== */}
          <line x1="50" y1="28" x2="64" y2="29.5" stroke="white" strokeWidth="1" opacity="0.45" />
          <line x1="50" y1="32" x2="64" y2="31.5" stroke="white" strokeWidth="1" opacity="0.45" />
          <line x1="94" y1="28" x2="80" y2="29.5" stroke="white" strokeWidth="1" opacity="0.45" />
          <line x1="94" y1="32" x2="80" y2="31.5" stroke="white" strokeWidth="1" opacity="0.45" />
        </svg>
      </div>
    </>
  );
}
