"use server";

import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { createAdminClient } from "@/lib/supabase/admin";

const VISITOR_COOKIE = "rawi_visitor";

async function getVisitorSession() {
  const store = await cookies();
  let session = store.get(VISITOR_COOKIE)?.value;
  if (!session) {
    session = crypto.randomUUID();
    store.set(VISITOR_COOKIE, session, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 365 });
  }
  return session;
}

function accessCookieName(galleryId: string) { return `rawi_gallery_access_${galleryId}`; }

export async function hasGalleryAccess(galleryId: string) {
  const store = await cookies();
  return store.get(accessCookieName(galleryId))?.value === "granted";
}

async function validateGalleryAccess(galleryId: string, capability?: "downloads" | "favorites") {
  const admin = createAdminClient();
  const { data: gallery } = await admin
    .from("galleries")
    .select("id, status, expiry_date, password_enabled, password_hash, downloads_enabled, favorites_enabled")
    .eq("id", galleryId)
    .single();

  if (!gallery || gallery.status !== "published") return { error: "This gallery is unavailable." } as const;
  if (gallery.expiry_date && new Date(gallery.expiry_date) < new Date()) return { error: "This gallery has expired." } as const;
  if (gallery.password_enabled && gallery.password_hash && !(await hasGalleryAccess(gallery.id))) return { error: "Gallery access required." } as const;
  if (capability === "downloads" && !gallery.downloads_enabled) return { error: "Downloads are turned off for this gallery." } as const;
  if (capability === "favorites" && !gallery.favorites_enabled) return { error: "Favorites are turned off for this gallery." } as const;
  return { gallery } as const;
}

export async function verifyGalleryPassword(galleryId: string, password: string) {
  const admin = createAdminClient();
  const { data: gallery } = await admin.from("galleries").select("password_enabled, password_hash, status, expiry_date").eq("id", galleryId).single();
  if (!gallery || gallery.status !== "published") return { error: "This gallery is unavailable." };
  if (gallery.expiry_date && new Date(gallery.expiry_date) < new Date()) return { error: "This gallery has expired." };
  if (!gallery.password_enabled || !gallery.password_hash) return { success: true };
  const valid = await bcrypt.compare(password, gallery.password_hash);
  if (!valid) return { error: "That password isn't right." };
  const store = await cookies();
  store.set(accessCookieName(galleryId), "granted", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 6 });
  return { success: true };
}

export async function recordGalleryView(galleryId: string) {
  const access = await validateGalleryAccess(galleryId);
  if ("error" in access) return { error: access.error };
  const admin = createAdminClient();
  const session = await getVisitorSession();
  const { error } = await admin.from("gallery_views").insert({ gallery_id: galleryId, visitor_session: session });
  if (error) return { error: "Couldn't record this gallery view." };
  return { success: true };
}

export async function toggleFavorite(galleryId: string, mediaId: string, currentlyFavorited: boolean) {
  const access = await validateGalleryAccess(galleryId, "favorites");
  if ("error" in access) return { error: access.error };
  const admin = createAdminClient();
  const { data: media } = await admin.from("media").select("id, gallery_sections!inner(gallery_id)").eq("id", mediaId).eq("gallery_sections.gallery_id", galleryId).single();
  if (!media) return { error: "This photo isn't part of this gallery." };
  const session = await getVisitorSession();
  if (currentlyFavorited) {
    const { error } = await admin.from("favorites").delete().eq("gallery_id", galleryId).eq("media_id", mediaId).eq("visitor_session", session);
    if (error) return { error: "Couldn't update this favorite." };
    return { favorited: false };
  }
  const { error } = await admin.from("favorites").insert({ gallery_id: galleryId, media_id: mediaId, visitor_session: session });
  if (error) return { error: error.message };
  return { favorited: true };
}

export async function getSignedMediaUrl(mediaId: string, forDownload: boolean) {
  const admin = createAdminClient();
  const { data: media } = await admin.from("media").select("storage_path, original_name, gallery_section_id, gallery_sections!inner(gallery_id)").eq("id", mediaId).single();
  if (!media) return { error: "File not found." };
  const section = media.gallery_sections as unknown as { gallery_id?: string } | null;
  const galleryId = section?.gallery_id;
  if (!galleryId) return { error: "This gallery is unavailable." };
  const access = await validateGalleryAccess(galleryId, forDownload ? "downloads" : undefined);
  if ("error" in access) return { error: access.error };
  if (forDownload) {
    const session = await getVisitorSession();
    await admin.from("downloads").insert({ gallery_id: galleryId, media_id: mediaId, download_type: "original", visitor_session: session });
  }
  const { data, error } = await admin.storage.from("media").createSignedUrl(media.storage_path, 60 * 10, { download: forDownload ? media.original_name : false });
  if (error || !data) return { error: "Couldn't prepare that file. Try again." };
  return { url: data.signedUrl };
}

export async function getBulkDownloadUrls(galleryId: string, mediaIds: string[]) {
  if (mediaIds.length === 0) return { files: [] as { id: string; name: string; url: string }[] };
  if (mediaIds.length > 100) return { error: "You can download up to 100 files at a time." };
  const admin = createAdminClient();
  const access = await validateGalleryAccess(galleryId, "downloads");
  if ("error" in access) return { error: access.error };
  const session = await getVisitorSession();
  const { data: media, error: mediaError } = await admin.from("media").select("id, storage_path, original_name, gallery_section_id, gallery_sections!inner(gallery_id)").in("id", mediaIds).eq("gallery_sections.gallery_id", galleryId);
  if (mediaError) return { error: "Couldn't prepare the selected files." };
  const files = await Promise.all((media ?? []).map(async (item) => {
    const { data, error } = await admin.storage.from("media").createSignedUrl(item.storage_path, 60 * 10, { download: item.original_name });
    if (error || !data) return null;
    return { id: item.id, name: item.original_name, url: data.signedUrl };
  }));
  const readyFiles = files.filter((file): file is { id: string; name: string; url: string } => Boolean(file));
  if (readyFiles.length > 0) await admin.from("downloads").insert(readyFiles.map((file) => ({ gallery_id: galleryId, media_id: file.id, download_type: "original" as const, visitor_session: session })));
  return { files: readyFiles };
}
