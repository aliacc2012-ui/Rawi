import type { Metadata } from "next";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { ClientErrorReporter } from "@/components/system/ClientErrorReporter";
import "./globals.css";

export const metadata: Metadata = {
  title: "RAWI — Your work deserves better than a Drive link.",
  description:
    "RAWI is a UAE-born media delivery platform for photographers, videographers and creative teams.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Kufi+Arabic:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ClientErrorReporter />
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
