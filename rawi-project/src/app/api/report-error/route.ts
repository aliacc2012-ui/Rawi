import { NextResponse } from "next/server";

const MAX_BODY_BYTES = 64_000;

export async function POST(request: Request) {
  const startedAt = Date.now();
  const requestId = request.headers.get("x-vercel-id") ?? crypto.randomUUID();

  try {
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > MAX_BODY_BYTES) {
      return NextResponse.json({ ok: false }, { status: 413 });
    }

    const payload = await request.json();
    const safe = {
      level: "error",
      event: "client_error",
      requestId,
      type: String(payload?.type ?? "client-error").slice(0, 80),
      message: String(payload?.message ?? "Unknown client error").slice(0, 2000),
      stack:
        typeof payload?.stack === "string"
          ? payload.stack.slice(0, 8000)
          : undefined,
      digest:
        typeof payload?.digest === "string"
          ? payload.digest.slice(0, 200)
          : undefined,
      path:
        typeof payload?.path === "string"
          ? payload.path.slice(0, 500)
          : undefined,
      source:
        typeof payload?.source === "string"
          ? payload.source.slice(0, 500)
          : undefined,
      release:
        typeof payload?.release === "string"
          ? payload.release.slice(0, 100)
          : process.env.VERCEL_GIT_COMMIT_SHA,
      line: Number.isFinite(payload?.line) ? payload.line : undefined,
      column: Number.isFinite(payload?.column) ? payload.column : undefined,
      occurredAt:
        typeof payload?.ts === "string"
          ? payload.ts
          : new Date().toISOString(),
      userAgent:
        typeof payload?.userAgent === "string"
          ? payload.userAgent.slice(0, 500)
          : undefined,
      durationMs: Date.now() - startedAt,
    };

    console.error(JSON.stringify(safe));
    return NextResponse.json({ ok: true }, { status: 202 });
  } catch (error) {
    console.error(
      JSON.stringify({
        level: "error",
        event: "client_error_report_failed",
        requestId,
        message: error instanceof Error ? error.message : String(error),
        durationMs: Date.now() - startedAt,
      })
    );
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
