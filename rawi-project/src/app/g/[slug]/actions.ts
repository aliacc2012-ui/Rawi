"use server";

import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import { createAdminClient } from "@/lib/supabase/admin";

const VISITOR_COOKIE = "rawi_visitor";
async function getVisitorSession() {
  const store = await cookies();
  let session = store.get(VISITOR_COOKIE)?.value;
  if (!session) {
    session = crypto.randomUUID();
    store.set(VISITOR_COOKIE, session, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return session;
}
function accessCookieName(galleryId: string) {
  return `rawi_gallery_access_${galleryId}`;
}
function galleryAccessToken(galleryId: string, passwordHash: string) {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error("Gallery access signing is unavailable.");
  return createHmac("sha256", secret)
    .update(`${galleryId}:${passwordHash}`)
    .digest("base64url");
}
function tokensMatch(received: string, expected: string) {
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
export async function hasGalleryAccess(
  galleryId: string,
  passwordHash: string,
) {
  const store = await cookies();
  const received = store.get(accessCookieName(galleryId))?.value;
  if (!received) return false;
  return tokensMatch(received, galleryAccessToken(galleryId, passwordHash));
}
async function validateGalleryAccess(
  galleryId: string,
  capability?: "downloads" | "favorites" | "comments",
) {
  const admin = createAdminClient();
  const { data: gallery } = await admin
    .from("galleries")
    .select(
      "id,status,expiry_date,password_enabled,password_hash,downloads_enabled,favorites_enabled,comments_enabled",
    )
    .eq("id", galleryId)
    .single();
  if (!gallery || gallery.status !== "published")
    return { error: "This gallery is unavailable." } as const;
  if (gallery.expiry_date && new Date(gallery.expiry_date) < new Date())
    return { error: "This gallery has expired." } as const;
  if (
    gallery.password_enabled &&
    gallery.password_hash &&
    !(await hasGalleryAccess(gallery.id, gallery.password_hash))
  )
    return { error: "Gallery access required." } as const;
  if (capability === "downloads" && !gallery.downloads_enabled)
    return { error: "Downloads are turned off for this gallery." } as const;
  if (capability === "favorites" && !gallery.favorites_enabled)
    return { error: "Favorites are turned off for this gallery." } as const;
  if (capability === "comments" && !gallery.comments_enabled)
    return { error: "Comments are turned off for this gallery." } as const;
  return { gallery } as const;
}
export async function verifyGalleryPassword(
  galleryId: string,
  password: string,
) {
  const admin = createAdminClient();
  const { data: gallery } = await admin
    .from("galleries")
    .select("password_enabled,password_hash,status,expiry_date")
    .eq("id", galleryId)
    .single();
  if (!gallery || gallery.status !== "published")
    return { error: "This gallery is unavailable." };
  if (gallery.expiry_date && new Date(gallery.expiry_date) < new Date())
    return { error: "This gallery has expired." };
  if (!gallery.password_enabled || !gallery.password_hash)
    return { success: true };
  const valid = await bcrypt.compare(password, gallery.password_hash);
  if (!valid) return { error: "That password isn't right." };
  const store = await cookies();
  store.set(
    accessCookieName(galleryId),
    galleryAccessToken(galleryId, gallery.password_hash),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 6,
    },
  );
  return { success: true };
}
export async function recordGalleryView(galleryId: string) {
  const access = await validateGalleryAccess(galleryId);
  if ("error" in access) return { error: access.error };
  const admin = createAdminClient();
  const session = await getVisitorSession();
  const { error } = await admin
    .from("gallery_views")
    .insert({ gallery_id: galleryId, visitor_session: session });
  return error
    ? { error: "Couldn't record this gallery view." }
    : { success: true };
}
export async function toggleFavorite(
  galleryId: string,
  mediaId: string,
  currentlyFavorited: boolean,
) {
  const access = await validateGalleryAccess(galleryId, "favorites");
  if ("error" in access) return { error: access.error };
  const admin = createAdminClient();
  const { data: media } = await admin
    .from("media")
    .select("id,gallery_sections!inner(gallery_id)")
    .eq("id", mediaId)
    .eq("gallery_sections.gallery_id", galleryId)
    .single();
  if (!media) return { error: "This photo isn't part of this gallery." };
  const session = await getVisitorSession();
  if (currentlyFavorited) {
    const { error } = await admin
      .from("favorites")
      .delete()
      .eq("gallery_id", galleryId)
      .eq("media_id", mediaId)
      .eq("visitor_session", session);
    return error
      ? { error: "Couldn't update this favorite." }
      : { favorited: false };
  }
  const { error } = await admin
    .from("favorites")
    .insert({
      gallery_id: galleryId,
      media_id: mediaId,
      visitor_session: session,
    });
  return error ? { error: error.message } : { favorited: true };
}
export async function getSignedMediaUrl(mediaId: string, forDownload: boolean) {
  const admin = createAdminClient();
  const { data: media } = await admin
    .from("media")
    .select(
      "storage_path,original_name,gallery_section_id,gallery_sections!inner(gallery_id)",
    )
    .eq("id", mediaId)
    .single();
  if (!media) return { error: "File not found." };
  const section = media.gallery_sections as unknown as {
    gallery_id?: string;
  } | null;
  const galleryId = section?.gallery_id;
  if (!galleryId) return { error: "This gallery is unavailable." };
  const access = await validateGalleryAccess(
    galleryId,
    forDownload ? "downloads" : undefined,
  );
  if ("error" in access) return { error: access.error };
  if (forDownload) {
    const session = await getVisitorSession();
    await admin
      .from("downloads")
      .insert({
        gallery_id: galleryId,
        media_id: mediaId,
        download_type: "original",
        visitor_session: session,
      });
  }
  const { data, error } = await admin.storage
    .from("media")
    .createSignedUrl(media.storage_path, 60 * 10, {
      download: forDownload ? media.original_name : false,
    });
  return error || !data
    ? { error: "Couldn't prepare that file. Try again." }
    : { url: data.signedUrl };
}
export async function getBulkDownloadUrls(
  galleryId: string,
  mediaIds: string[],
) {
  if (mediaIds.length === 0)
    return { files: [] as { id: string; name: string; url: string }[] };
  if (mediaIds.length > 100)
    return { error: "You can download up to 100 files at a time." };
  const admin = createAdminClient();
  const access = await validateGalleryAccess(galleryId, "downloads");
  if ("error" in access) return { error: access.error };
  const session = await getVisitorSession();
  const { data: media, error: mediaError } = await admin
    .from("media")
    .select(
      "id,storage_path,original_name,gallery_section_id,gallery_sections!inner(gallery_id)",
    )
    .in("id", mediaIds)
    .eq("gallery_sections.gallery_id", galleryId);
  if (mediaError) return { error: "Couldn't prepare the selected files." };
  const files = await Promise.all(
    (media ?? []).map(async (item) => {
      const { data, error } = await admin.storage
        .from("media")
        .createSignedUrl(item.storage_path, 60 * 10, {
          download: item.original_name,
        });
      return error || !data
        ? null
        : { id: item.id, name: item.original_name, url: data.signedUrl };
    }),
  );
  const readyFiles = files.filter(
    (file): file is { id: string; name: string; url: string } => Boolean(file),
  );
  if (readyFiles.length > 0)
    await admin
      .from("downloads")
      .insert(
        readyFiles.map((file) => ({
          gallery_id: galleryId,
          media_id: file.id,
          download_type: "original" as const,
          visitor_session: session,
        })),
      );
  return { files: readyFiles };
}
export async function getVisitorApproval(galleryId: string) {
  const session = await getVisitorSession();
  const admin = createAdminClient();
  const { data } = await admin
    .from("gallery_approvals")
    .select("client_name,approved_at")
    .eq("gallery_id", galleryId)
    .eq("visitor_session", session)
    .maybeSingle();
  return data ?? null;
}
export async function approveGalleryDelivery(
  galleryId: string,
  clientName: string,
) {
  const name = clientName.trim();
  if (name.length < 1 || name.length > 120)
    return { error: "Please enter your name." };
  const access = await validateGalleryAccess(galleryId);
  if ("error" in access) return { error: access.error };
  const admin = createAdminClient();
  const { data: context } = await admin
    .from("galleries")
    .select("id,projects!inner(workspaces!inner(plan))")
    .eq("id", galleryId)
    .single();
  const project = context?.projects as unknown as {
    workspaces?: { plan?: string } | null;
  } | null;
  if (project?.workspaces?.plan !== "pro")
    return { error: "Client approval is available on Pro galleries only." };
  const session = await getVisitorSession();
  const approvedAt = new Date().toISOString();
  const { data, error } = await admin
    .from("gallery_approvals")
    .upsert(
      {
        gallery_id: galleryId,
        visitor_session: session,
        client_name: name,
        status: "approved",
        approved_at: approvedAt,
      },
      { onConflict: "gallery_id,visitor_session" },
    )
    .select("client_name,approved_at")
    .single();
  if (error || !data)
    return { error: "Couldn't record your approval. Please try again." };
  return {
    success: true,
    clientName: data.client_name,
    approvedAt: data.approved_at,
  };
}

async function validateCommentPlan(galleryId: string) {
  const admin = createAdminClient();
  const { data: context } = await admin
    .from("galleries")
    .select("id,projects!inner(workspaces!inner(plan))")
    .eq("id", galleryId)
    .single();
  const project = context?.projects as unknown as {
    workspaces?: { plan?: string } | null;
  } | null;
  const plan = project?.workspaces?.plan;
  if (plan !== "creator" && plan !== "pro" && plan !== "studio")
    return {
      error: "Client comments are available on Creator and Pro galleries only.",
    } as const;
  return { plan } as const;
}
export async function addGalleryComment(
  galleryId: string,
  clientName: string,
  commentText: string,
  mediaId?: string | null,
) {
  const name = clientName.trim();
  const text = commentText.trim();
  if (name.length < 1 || name.length > 120)
    return { error: "Please enter your name." };
  if (text.length < 1) return { error: "Please enter a comment." };
  if (text.length > 2000)
    return { error: "Comments can be up to 2,000 characters." };
  const access = await validateGalleryAccess(galleryId, "comments");
  if ("error" in access) return { error: access.error };
  const planCheck = await validateCommentPlan(galleryId);
  if ("error" in planCheck) return { error: planCheck.error };
  const admin = createAdminClient();
  if (mediaId) {
    const { data: media } = await admin
      .from("media")
      .select("id,gallery_sections!inner(gallery_id)")
      .eq("id", mediaId)
      .eq("gallery_sections.gallery_id", galleryId)
      .single();
    if (!media) return { error: "This media item isn't part of this gallery." };
  }
  const session = await getVisitorSession();
  const { data, error } = await admin
    .from("gallery_comments")
    .insert({
      gallery_id: galleryId,
      media_id: mediaId ?? null,
      visitor_session: session,
      client_name: name,
      comment_text: text,
    })
    .select("id,client_name,comment_text,media_id,created_at")
    .single();
  if (error || !data)
    return { error: "Couldn't send your comment. Please try again." };
  return { success: true, comment: data };
}
export async function getVisitorComments(galleryId: string) {
  const access = await validateGalleryAccess(galleryId, "comments");
  if ("error" in access) return [];
  const planCheck = await validateCommentPlan(galleryId);
  if ("error" in planCheck) return [];
  const session = await getVisitorSession();
  const admin = createAdminClient();
  const { data } = await admin
    .from("gallery_comments")
    .select("id,client_name,comment_text,media_id,created_at")
    .eq("gallery_id", galleryId)
    .eq("visitor_session", session)
    .order("created_at", { ascending: false });
  return data ?? [];
}
export async function submitGalleryReview(
  galleryId: string,
  clientName: string,
  rating: number,
  reviewText: string,
) {
  const name = clientName.trim();
  const text = reviewText.trim();
  if (name.length < 1 || name.length > 120)
    return { error: "Please enter your name." };
  if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    return { error: "Choose a rating from 1 to 5 stars." };
  if (text.length < 1 || text.length > 1000)
    return { error: "Write a short review up to 1,000 characters." };
  const access = await validateGalleryAccess(galleryId);
  if ("error" in access) return { error: access.error };
  const session = await getVisitorSession();
  const admin = createAdminClient();
  const { error } = await admin
    .from("gallery_reviews")
    .upsert(
      {
        gallery_id: galleryId,
        visitor_session: session,
        client_name: name,
        rating,
        review_text: text,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "gallery_id,visitor_session" },
    );
  return error
    ? { error: "Couldn't save your review. Please try again." }
    : { success: true };
}
