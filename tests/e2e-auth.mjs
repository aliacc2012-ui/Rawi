import { chromium } from "playwright";

// Triggered after the dedicated RAWI E2E account is configured.

const base = process.env.RAWI_BASE_URL || "https://rawi-five.vercel.app";
const email = process.env.RAWI_E2E_EMAIL;
const password = process.env.RAWI_E2E_PASSWORD;
if (!email || !password) throw new Error("RAWI_E2E_EMAIL and RAWI_E2E_PASSWORD are required.");

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
try {
  await page.goto(`${base}/login`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  try {
    await page.waitForFunction(() => !window.location.pathname.includes("/login") || Boolean(document.querySelector('[class*="text-red"], [role="alert"]')), null, { timeout: 30000 });
  } catch {
    const body = (await page.locator("body").innerText()).replace(/\s+/g, " ").slice(0, 800);
    throw new Error(`Sign-in did not leave /login within 30s. Current URL: ${page.url()}. Page says: ${body}`);
  }

  if (page.url().includes("/login")) {
    const body = (await page.locator("body").innerText()).replace(/\s+/g, " ").slice(0, 800);
    throw new Error(`RAWI sign-in failed. Page says: ${body}`);
  }

  if (page.url().includes("/onboarding")) {
    throw new Error("E2E account signed in but has no RAWI workspace. Complete onboarding once for the test account.");
  }

  for (const route of ["/dashboard", "/projects", "/settings"]) {
    const response = await page.goto(`${base}${route}`, { waitUntil: "domcontentloaded", timeout: 30000 });
    if (!response || !response.ok()) throw new Error(`${route} returned ${response?.status() ?? "no response"}`);
    if (page.url().includes("/login")) throw new Error(`${route} unexpectedly redirected to login.`);
    if (page.url().includes("/onboarding")) throw new Error(`${route} redirected to onboarding; complete workspace setup for the E2E account.`);
  }

  console.log("RAWI authenticated E2E smoke passed.");
} finally {
  await browser.close();
}
