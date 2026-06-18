import { supabase } from "./supabase.js";
import { STORAGE_BUCKET, MAX_IMAGE_SIZE } from "../utils/constants.js";

/**
 * Uploads an image file to the chat-images bucket and returns its public URL.
 * Throws if the file is too large or not an image.
 */
export async function uploadChatImage(file, conversationId, userId) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files can be uploaded.");
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error(`Image must be smaller than ${Math.round(MAX_IMAGE_SIZE / 1_048_576)}MB.`);
  }

  const ext = file.name.split(".").pop();
  const path = `${conversationId}/${userId}-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
