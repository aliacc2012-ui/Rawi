export type RawiAnalyticsEvent =
  | "pricing_click"
  | "signup_started"
  | "signup_completed"
  | "project_created"
  | "media_uploaded"
  | "gallery_published"
  | "payment_completed";

type EventProperties = Record<string, string | number | boolean>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(name: RawiAnalyticsEvent, properties: EventProperties = {}) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", name, properties);
}

export function markPendingProjectCreation() {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem("rawi_pending_project_created", "1");
}

export function consumePendingProjectCreation(pathname: string) {
  if (typeof window === "undefined" || !/^\/projects\/[0-9a-f-]{36}$/i.test(pathname)) return;
  if (window.sessionStorage.getItem("rawi_pending_project_created") !== "1") return;
  window.sessionStorage.removeItem("rawi_pending_project_created");
  trackEvent("project_created");
}
