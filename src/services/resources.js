import { supabase } from "../lib/supabase";

export async function listResources(type = "All", category = "All") {
  let q = supabase.from("digital_resources").select("*").order("created_at", { ascending: false });
  if (type !== "All") q = q.eq("resource_type", type);
  if (category !== "All") q = q.eq("category", category);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}
export async function createResource({ file, ...payload }) {
  let file_path = payload.file_path;
  if (file) {
    const safeName = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
    const { error: uploadError } = await supabase.storage.from("digital-resources").upload(safeName, file);
    if (uploadError) throw uploadError;
    file_path = safeName;
  }
  const { data, error } = await supabase.from("digital_resources").insert({ ...payload, file_url: file_path }).select().single();
  if (error) throw error;
  return data;
}
export async function deleteResource(id, path) {
  if (path) await supabase.storage.from("digital-resources").remove([path]);
  const { error } = await supabase.from("digital_resources").delete().eq("id", id);
  if (error) throw error;
}
export function resourceUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const { data } = supabase.storage.from("digital-resources").getPublicUrl(path);
  return data.publicUrl;
}
