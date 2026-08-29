"use client";

import { useEffect } from "react";

const recentlyReported = new Map<string, number>();
const DEDUPE_WINDOW_MS = 60_000;

function send(payload: Record<string, unknown>) {
  try {
    const fingerprint = `${String(payload.type)}:${String(payload.message)}:${window.location.pathname}`;
    const now = Date.now();
    const lastReported = recentlyReported.get(fingerprint);

    if (lastReported && now - lastReported < DEDUPE_WINDOW_MS) return;
    recentlyReported.set(fingerprint, now);

    const body = JSON.stringify({
      ...payload,
      path: window.location.pathname,
      release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
      userAgent: navigator.userAgent,
      ts: new Date().toISOString(),
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/report-error",
        new Blob([body], { type: "application/json" })
      );
      return;
    }

    void fetch("/api/report-error", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      keepalive: true,
    });
  } catch {
    // Error reporting must never interrupt the customer experience.
  }
}

export function ClientErrorReporter() {
  useEffect(() => {
    const onError = (event: ErrorEvent) =>
      send({
        type: "window.error",
        message: event.message,
        stack: event.error instanceof Error ? event.error.stack : undefined,
        source: event.filename,
        line: event.lineno,
        column: event.colno,
      });

    const onReject = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      send({
        type: "unhandledrejection",
        message: reason instanceof Error ? reason.message : String(reason),
        stack: reason instanceof Error ? reason.stack : undefined,
      });
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onReject);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onReject);
    };
  }, []);

  return null;
}
