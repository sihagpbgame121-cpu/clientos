export type ProjectStatus = "active" | "awaiting_approval" | "approved" | "archived";
export type ProjectRow = {
  id: string; name: string; price: number; currency: string; deadline: string | null;
  revision_limit: number; status: ProjectStatus; review_slug: string; created_at: string;
  clients: { name: string } | null;
};
export const STATUS_LABEL: Record<ProjectStatus, string> = {
  active: "In progress", awaiting_approval: "Awaiting approval", approved: "Approved", archived: "Archived",
};
export const money = (n: number, cur = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(n);
