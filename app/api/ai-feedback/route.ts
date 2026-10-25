import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { detectChanges, mockDetect } from "@/lib/ai";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!url || !anon || !token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await createClient(url, anon, { auth: { persistSession: false } }).auth.getUser(token);
  if (error || !data.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!rateLimit(`ai:${data.user.id}`, 20, 60_000)) return NextResponse.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });

  const body = await req.json().catch(() => ({}));
  const message = body?.message;
  const transcript = typeof body?.transcript === "string" ? body.transcript.slice(0, 5000) : undefined;
  if (typeof message !== "string" || !message.trim() || message.length > 5000)
    return NextResponse.json({ error: "Invalid message" }, { status: 400 });
  try {
    return NextResponse.json(await detectChanges(message, transcript));
  } catch {
    return NextResponse.json({ changes: mockDetect([message, transcript].filter(Boolean).join("\n")), source: "mock" });
  }
}
