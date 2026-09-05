import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://rawi-five.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/demo/", "/support", "/terms", "/privacy"],
      disallow: ["/admin/", "/api/", "/auth/", "/dashboard/", "/forgot-password", "/login", "/projects/", "/settings/", "/signup"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
