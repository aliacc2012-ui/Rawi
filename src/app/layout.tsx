import type { Metadata } from "next";
import { Inter, Noto_Kufi_Arabic } from "next/font/google";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { ClientErrorReporter } from "@/components/system/ClientErrorReporter";
import { GoogleAnalytics } from "@/components/system/GoogleAnalytics";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const notoKufiArabic = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-noto-kufi-arabic",
});



export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://rawi-five.vercel.app"),
  applicationName: "RAWI",
  title: {
    default: "RAWI — Your work deserves better than a Drive link.",
    template: "%s | RAWI",
  },
  description:
    "Deliver photos and films through cinematic, branded client galleries built for the way creators actually work.",
  keywords: [
    "client photo galleries",
    "photographer gallery delivery",
    "video delivery platform",
    "UAE photographers",
    "RAWI",
  ],
  verification: {
    google: "8qGFgRZl_P4yfU4Yu7sGfGkJBS-xc6IsSHfi9KKtd9s",
  },
  openGraph: {
    type: "website",
    locale: "en_AE",
    siteName: "RAWI",
    title: "RAWI — Your work deserves better than a Drive link.",
    description:
      "Cinematic, branded client galleries for photographers and filmmakers.",
  },
  twitter: {
    card: "summary_large_image",
    title: "RAWI — Your work deserves better than a Drive link.",
    description:
      "Cinematic, branded client galleries for photographers and filmmakers.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={`${inter.variable} ${notoKufiArabic.variable}`}>
      <body>
        <ClientErrorReporter />
        <LocaleProvider>{children}</LocaleProvider>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
