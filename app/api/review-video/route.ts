import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit, ipOf } from "@/lib/rateLimit";

// Returns a short-lived signed URL for the latest video of ONE project, found by its public slug.
export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("slug") ?? "";
  if (!rateLimit(`rv:${ipOf(req)}`, 60, 60_000)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) return NextResponse.json({ error: "Server is missing SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 });
  if (!/^[a-f0-9]{8,64}$/.test(slug)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const admin = createClient(url, service, { auth: { persistSession: false } });
  const { data: p } = await admin.from("projects").select("id").eq("review_slug", slug).maybeSingle();
  if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { data: v } = await admin.from("videos").select("storage_path").eq("project_id", p.id)
    .order("version", { ascending: false }).limit(1).maybeSingle();
  if (!v || !v.storage_path) return NextResponse.json({ error: "No video" }, { status: 404 });
  const { data, error } = await admin.storage.from("videos").createSignedUrl(v.storage_path, 3600);
  if (error) return NextResponse.json({ error: "Could not sign video" }, { status: 500 });
  return NextResponse.json({ url: data.signedUrl });
}
