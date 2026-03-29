import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

/**
 * Get the image URL for a product.
 * Priority: 1) Stored image in bucket  2) Fallback to product.image from data
 */
export async function getShoeImageUrl(productId: string): Promise<string | null> {
  const { data } = await supabase
    .from("shoe_images")
    .select("storage_path")
    .eq("product_id", productId)
    .maybeSingle();

  if (data?.storage_path) {
    return `${SUPABASE_URL}/storage/v1/object/public/shoe-images/${data.storage_path}`;
  }
  return null;
}

/**
 * Upload a shoe image and register it in shoe_images table
 */
export async function uploadShoeImage(
  productId: string,
  file: File,
  altText?: string
): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${productId}.${ext}`;

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from("shoe-images")
    .upload(path, file, { upsert: true });

  if (uploadError) throw uploadError;

  // Upsert in shoe_images table
  const { error: dbError } = await supabase
    .from("shoe_images")
    .upsert(
      { product_id: productId, storage_path: path, alt_text: altText || productId, updated_at: new Date().toISOString() },
      { onConflict: "product_id" }
    );

  if (dbError) throw dbError;

  return `${SUPABASE_URL}/storage/v1/object/public/shoe-images/${path}`;
}

/**
 * Batch load all stored images (for catalog/results pages)
 */
export async function getAllShoeImages(): Promise<Record<string, string>> {
  const { data } = await supabase.from("shoe_images").select("product_id, storage_path");
  if (!data) return {};

  const map: Record<string, string> = {};
  for (const row of data) {
    map[row.product_id] = `${SUPABASE_URL}/storage/v1/object/public/shoe-images/${row.storage_path}`;
  }
  return map;
}
