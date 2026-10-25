export type ProjectStatus = "active" | "awaiting_approval" | "approved" | "archived";
export type ProjectRow = {
  id: string; name: string; price: number; currency: string; deadline: string | null;
  revision_limit: number; status: ProjectStatus; review_slug: string; created_at: string;
  clients: { name: string } | null;
};
export type VideoRow = { id: string; project_id: string; version: number; storage_path: string | null; source: "upload" | "youtube"; youtube_id: string | null; created_at: string };
export type PlayerHandle = { seek: (t: number) => void };
export type CommentRow = {
  id: string; project_id: string; video_id: string; user_id: string | null; author_name: string;
  timestamp_sec: number; body: string; status: "open" | "resolved"; created_at: string;
};
export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskRow = {
  id: string; project_id: string; comment_id: string | null; title: string; description: string | null;
  timestamp_sec: number | null; status: TaskStatus; created_at: string;
};
export type RevisionRow = { id: string; project_id: string; note: string | null; created_at: string };
export type ApprovalRow = { id: string; project_id: string; approved_by: string; approved_at: string };
export type PaymentRow = { id: string; project_id: string; amount: number; currency: string; status: "pending" | "paid" | "failed" };

export const CURRENCIES: { code: string; name: string }[] = [
  ["INR","Indian Rupee"],["PKR","Pakistani Rupee"],["BDT","Bangladeshi Taka"],["NPR","Nepalese Rupee"],["LKR","Sri Lankan Rupee"],
  ["USD","US Dollar"],["EUR","Euro"],["GBP","British Pound"],["AED","UAE Dirham"],["SAR","Saudi Riyal"],["QAR","Qatari Riyal"],
  ["KWD","Kuwaiti Dinar"],["OMR","Omani Rial"],["BHD","Bahraini Dinar"],["CAD","Canadian Dollar"],["AUD","Australian Dollar"],
  ["NZD","New Zealand Dollar"],["SGD","Singapore Dollar"],["MYR","Malaysian Ringgit"],["IDR","Indonesian Rupiah"],["PHP","Philippine Peso"],
  ["THB","Thai Baht"],["VND","Vietnamese Dong"],["CNY","Chinese Yuan"],["JPY","Japanese Yen"],["KRW","South Korean Won"],
  ["TRY","Turkish Lira"],["ZAR","South African Rand"],["NGN","Nigerian Naira"],["KES","Kenyan Shilling"],["EGP","Egyptian Pound"],
  ["BRL","Brazilian Real"],["MXN","Mexican Peso"],["CHF","Swiss Franc"],["SEK","Swedish Krona"],["NOK","Norwegian Krone"],["DKK","Danish Krone"],
].map(([code, name]) => ({ code, name }));

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  active: "In progress", awaiting_approval: "Awaiting approval", approved: "Approved", archived: "Archived",
};
export const badge: Record<string, string> = {
  active: "bg-indigo-400/10 text-indigo-300", awaiting_approval: "bg-amber-400/10 text-amber-300",
  approved: "bg-emerald-400/10 text-emerald-300", archived: "bg-zinc-400/10 text-zinc-400",
};
export const money = (n: number, cur = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(n);
export const fmtTime = (s: number) => {
  if (!Number.isFinite(s)) return "0:00";
  const m = Math.floor(s / 60), r = Math.floor(s % 60);
  return `${m}:${String(r).padStart(2, "0")}`;
};
