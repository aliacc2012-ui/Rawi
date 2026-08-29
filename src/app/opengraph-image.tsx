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
          background: "#fbf6ef",
          color: "#090909",
          padding: "72px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ position: "absolute", inset: 0, display: "flex", opacity: 0.28, backgroundImage: "linear-gradient(#dfd7cc 1px, transparent 1px), linear-gradient(90deg, #dfd7cc 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
        <div style={{ position: "absolute", right: "-80px", top: "-100px", width: "380px", height: "380px", border: "42px solid #FFD400", borderRadius: "50%", opacity: 0.55 }} />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "74px", height: "74px", borderRadius: "22px", background: "#FFD400", fontSize: "42px", fontWeight: 900, transform: "rotate(-7deg)" }}>R</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "14px", fontSize: "34px", fontWeight: 900, letterSpacing: "0.14em" }}>
              RAWI <span style={{ color: "#707070", fontSize: "25px", letterSpacing: 0 }}>راوي</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: "940px" }}>
            <div style={{ fontSize: "72px", lineHeight: 0.98, letterSpacing: "-0.055em", fontWeight: 700 }}>
              Your work deserves <span style={{ background: "#FFD400", padding: "0 12px" }}>better</span><br />than a Drive link.
            </div>
            <div style={{ marginTop: "30px", fontSize: "27px", color: "#5f6672" }}>Cinematic, branded client galleries for photographers and filmmakers.</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "18px", fontWeight: 700, letterSpacing: "0.12em", color: "#5f6672" }}>
            <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#FFD400" }} />
            UAE-BORN • MADE FOR CREATORS
          </div>
        </div>
      </div>
    ),
    size,
  );
}
