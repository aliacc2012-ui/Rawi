import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import sharp from "sharp";

const VISITOR_COOKIE = "rawi_visitor";

function accessCookieName(gid: string) {
  return `rawi_gallery_access_${gid}`;
}

function galleryAccessToken(gid: string, hash: string) {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createHmac("sha256", secret).update(`${gid}:${hash}`).digest("base64url");
}

function tokensMatch(a: string, b: string) {
  const ab = Buffer.from(a), bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export async function GET(req: NextRequest) {
  const mediaId = req.nextUrl.searchParams.get("mediaId");
  if (!mediaId) return NextResponse.json({ error: "Missing mediaId" }, { status: 400 });

  const admin = createAdminClient();

  // Fetch media + gallery info in one query
  const { data: media } = await admin
    .from("media")
    .select("id,storage_path,original_name,media_type,gallery_sections!inner(gallery_id)")
    .eq("id", mediaId)
    .single();

  if (!media) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const galleryId = (media.gallery_sections as unknown as { gallery_id: string }).gallery_id;

  type GalleryRow = { id: string; status: string; expiry_date: string | null; password_enabled: boolean; password_hash: string | null; downloads_enabled: boolean; watermark_text: string | null; projects: { workspaces: { plan: string } | null } | null };
  const { data: gallery } = await (admin
    .from("galleries")
    .select("id,status,expiry_date,password_enabled,password_hash,downloads_enabled,watermark_text,projects!inner(workspaces!inner(plan))")
    .eq("id", galleryId)
    .single() as unknown as Promise<{ data: GalleryRow | null; error: unknown }>);

  if (!gallery || gallery.status !== "published")
    return NextResponse.json({ error: "Unavailable" }, { status: 403 });
  if (gallery.expiry_date && new Date(gallery.expiry_date) < new Date())
    return NextResponse.json({ error: "Expired" }, { status: 403 });
  if (!gallery.downloads_enabled)
    return NextResponse.json({ error: "Downloads disabled" }, { status: 403 });

  // Check password cookie
  if (gallery.password_enabled && gallery.password_hash) {
    const store = await cookies();
    const received = store.get(accessCookieName(galleryId))?.value;
    if (!received || !tokensMatch(received, galleryAccessToken(galleryId, gallery.password_hash)))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Determine watermark text
  const project = gallery.projects;
  const plan = project?.workspaces?.plan ?? "free";
  const paid = plan !== "free";
  const wmText: string | null = paid
    ? (gallery.watermark_text || null)
    : "Delivered by RAWI";

  // Get signed URL for original file (short TTL — we fetch immediately)
  const { data: signed } = await admin.storage
    .from("media")
    .createSignedUrl(media.storage_path, 120, { download: media.original_name });

  if (!signed?.signedUrl)
    return NextResponse.json({ error: "Could not prepare file" }, { status: 500 });

  // Record download
  const store = await cookies();
  const session = store.get(VISITOR_COOKIE)?.value;
  if (session) {
    await admin.from("downloads").insert({
      gallery_id: galleryId, media_id: mediaId,
      download_type: "original", visitor_session: session,
    }).then(() => {}, () => {});
  }

  // Non-images or no watermark → redirect to signed URL
  const mediaType = media.media_type as string;
  if (mediaType !== "image" || !wmText) {
    return NextResponse.redirect(signed.signedUrl);
  }

  // Fetch original image and burn watermark in with sharp
  const imgRes = await fetch(signed.signedUrl);
  if (!imgRes.ok) return NextResponse.json({ error: "Failed to fetch image" }, { status: 502 });
  const imgBuf = Buffer.from(await imgRes.arrayBuffer());

  const meta = await sharp(imgBuf).metadata();
  const imgW = meta.width ?? 2000;
  const imgH = meta.height ?? 2000;

  // Build tiled diagonal SVG watermark
  const tileW = Math.round(imgW / 3);
  const tileH = Math.round(tileW * 0.5);
  const fontSize = Math.max(24, Math.round(tileW / 8));
  const cols = Math.ceil(imgW / tileW) + 1;
  const rows = Math.ceil(imgH / tileH) + 1;

  const escapedText = wmText.replace(/[<>&"']/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" }[c] ?? c)
  );

  let texts = "";
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = c * tileW + tileW / 2;
      const cy = r * tileH + tileH / 2;
      texts += `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" font-family="Arial,Helvetica,sans-serif" font-size="${fontSize}" font-weight="bold" letter-spacing="3" fill="white" fill-opacity="0.38" transform="rotate(-30 ${cx} ${cy})">${escapedText}</text>`;
    }
  }

  const svg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${imgW}" height="${imgH}">${texts}</svg>`
  );

  const output = await sharp(imgBuf)
    .composite([{ input: svg, top: 0, left: 0 }])
    .jpeg({ quality: 88 })
    .toBuffer();

  const filename = (media.original_name ?? "photo").replace(/\.[^.]+$/, "") + "-watermarked.jpg";

  return new NextResponse(output, {
    headers: {
      "Content-Type": "image/jpeg",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store, no-cache",
    },
  });
}
