import { supabase } from "../lib/supabase";

export async function requestBook(bookId) {
  const { data, error } = await supabase.rpc("request_book", { p_book_id: bookId });
  if (error) throw error;
  return data;
}
export async function myBorrowRequests() {
  const { data, error } = await supabase.from("borrow_requests")
    .select("*, books(title,author,category)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
export async function returnBook(id) {
  const { data, error } = await supabase.rpc("return_book", { p_request_id: id });
  if (error) throw error;
  return data;
}
export async function allBorrowRequests(status = "All") {
  let q = supabase.from("borrow_requests")
    .select("*, books(title,author), profiles!borrow_requests_student_id_fkey(full_name,email,student_id)")
    .order("created_at", { ascending: false });
  if (status !== "All") q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}
export async function approveRequest(id) {
  const { data, error } = await supabase.rpc("approve_borrow_request", { p_request_id: id });
  if (error) throw error;
  return data;
}
export async function rejectRequest(id) {
  const { data, error } = await supabase.rpc("reject_borrow_request", { p_request_id: id });
  if (error) throw error;
  return data;
}
