import { db, supabase } from "./supabase.js";
import { STORAGE_BUCKET } from "../utils/constants.js";

/** Fetch a single profile by user id */
export async function fetchProfile(userId) {
  const { data, error } = await db("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
}

/**
 * Update editable profile fields.
 * Only updates fields that are explicitly provided (undefined fields are ignored).
 */
export async function updateProfile(userId, fields) {
  const allowed = ["username", "avatar_url", "status_message", "bio", "available_hours"];
  const payload = {};
  for (const key of allowed) {
    if (fields[key] !== undefined) payload[key] = fields[key];
  }
  if (Object.keys(payload).length === 0) return;

  const { data, error } = await db("profiles")
    .update(payload)
    .eq("id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Upload a new avatar image to Storage and return its public URL */
export async function uploadAvatar(file, userId) {
  if (!file.type.startsWith("image/")) throw new Error("Only image files are allowed.");
  if (file.size > 3 * 1024 * 1024) throw new Error("Avatar must be smaller than 3MB.");

  // Use a dedicated avatars bucket path (or reuse chat-images bucket)
  const ext  = file.name.split(".").pop();
  const path = `avatars/${userId}-${Date.now()}.${ext}`;

  const { error: uploadErr } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: true });
  if (uploadErr) throw uploadErr;

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
