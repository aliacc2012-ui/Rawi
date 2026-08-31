import { ImageResponse } from "next/og";

export const alt = "RAWI — Your work deserves better than a Drive link.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: "#06060F",
          color: "#ffffff",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {/* Subtle radial glow top-left */}
        <div style={{ position: "absolute", top: "-180px", left: "-120px", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,212,0,0.12) 0%, transparent 70%)", display: "flex" }} />

        {/* Subtle radial glow bottom-right */}
        <div style={{ position: "absolute", bottom: "-200px", right: "-100px", width: "550px", height: "550px", borderRadius: "50%", background: "radial-gradient(circle, rgba(120,80,255,0.10) 0%, transparent 70%)", display: "flex" }} />

        {/* Mock album cards — right side */}
        <div style={{ position: "absolute", right: "60px", top: "50px", display: "flex", gap: "14px", transform: "rotate(6deg)" }}>
          {/* Card 1 */}
          <div style={{ width: "170px", height: "220px", borderRadius: "16px", background: "linear-gradient(160deg, #1a1a2e, #2d1b4e)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ flex: 1, background: "linear-gradient(135deg, #3d2060 0%, #1a0a30 100%)", display: "flex" }} />
            <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#fff", letterSpacing: "0.05em", display: "flex" }}>VENICE WEDDING</div>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.45)", display: "flex" }}>142 photos</div>
            </div>
          </div>
          {/* Card 2 */}
          <div style={{ width: "170px", height: "220px", borderRadius: "16px", background: "linear-gradient(160deg, #0f1a1a, #1a2d20)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", overflow: "hidden", marginTop: "30px" }}>
            <div style={{ flex: 1, background: "linear-gradient(135deg, #0d3320 0%, #061a10 100%)", display: "flex" }} />
            <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#fff", letterSpacing: "0.05em", display: "flex" }}>BMW M SERIES</div>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.45)", display: "flex" }}>89 photos</div>
            </div>
          </div>
          {/* Card 3 */}
          <div style={{ width: "170px", height: "220px", borderRadius: "16px", background: "linear-gradient(160deg, #1a1510, #2d2010)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ flex: 1, background: "linear-gradient(135deg, #3d2a00 0%, #1a1200 100%)", display: "flex" }} />
            <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#fff", letterSpacing: "0.05em", display: "flex" }}>DESERT DRIFT</div>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.45)", display: "flex" }}>67 photos</div>
            </div>
          </div>
        </div>

        {/* Fade over cards on left edge */}
        <div style={{ position: "absolute", right: "0", top: "0", width: "580px", height: "100%", background: "linear-gradient(to right, #06060F 38%, transparent 100%)", display: "flex" }} />

        {/* Main content */}
        <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", padding: "68px 72px", maxWidth: "680px" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "52px", height: "52px", borderRadius: "14px", background: "#FFD400", fontSize: "28px", fontWeight: 900, color: "#000", transform: "rotate(-6deg)" }}>R</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
              <span style={{ fontSize: "26px", fontWeight: 900, letterSpacing: "0.18em", color: "#fff", display: "flex" }}>RAWI</span>
              <span style={{ fontSize: "20px", color: "rgba(255,255,255,0.35)", display: "flex" }}>راوي</span>
            </div>
          </div>

          {/* Headline */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0px" }}>
            <div style={{ fontSize: "66px", lineHeight: "1.0", letterSpacing: "-0.045em", fontWeight: 800, color: "#ffffff", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex" }}>Your work</div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                deserves&nbsp;<span style={{ background: "#FFD400", color: "#000", padding: "2px 14px", borderRadius: "8px", display: "flex" }}>better</span>
              </div>
              <div style={{ display: "flex", color: "rgba(255,255,255,0.75)" }}>than a Drive link.</div>
            </div>
            <div style={{ marginTop: "24px", fontSize: "22px", color: "rgba(255,255,255,0.42)", lineHeight: 1.4, display: "flex" }}>
              Cinematic, branded client galleries for photographers and filmmakers.
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.3)" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#FFD400", display: "flex" }} />
            UAE-BORN · MADE FOR CREATORS · tryRawi.com
          </div>
        </div>
      </div>
    ),
    size,
  );
}
