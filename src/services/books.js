import { supabase } from "../lib/supabase";

export async function listBooks({ search = "", category = "All" } = {}) {
  if (!supabase) return [];
  let q = supabase.from("books").select("*").order("created_at", { ascending: false });
  if (search) q = q.or(`title.ilike.%${search}%,author.ilike.%${search}%,category.ilike.%${search}%`);
  if (category !== "All") q = q.eq("category", category);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}
export async function getBook(id) {
  const { data, error } = await supabase.from("books").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}
export async function createBook(payload) {
  const { data, error } = await supabase.from("books").insert({ ...payload, available_copies: payload.total_copies }).select().single();
  if (error) throw error;
  return data;
}
export async function updateBook(id, payload) {
  const { data: current, error: readError } = await supabase.from("books").select("total_copies,available_copies").eq("id", id).single();
  if (readError) throw readError;
  const delta = Number(payload.total_copies) - Number(current.total_copies);
  const available = Math.max(0, Math.min(Number(payload.total_copies), Number(current.available_copies) + delta));
  const { data, error } = await supabase.from("books").update({ ...payload, available_copies: available }).eq("id", id).select().single();
  if (error) throw error;
  return data;
}
export async function deleteBook(id) {
  const { error } = await supabase.from("books").delete().eq("id", id);
  if (error) throw error;
}
