import { NextResponse } from "next/server";
import { detectChanges } from "@/lib/ai";

export async function POST(req: Request) {
  const { message, transcript } = await req.json().catch(() => ({}));
  if (typeof message !== "string" || !message.trim() || message.length > 5000)
    return NextResponse.json({ error: "Invalid message" }, { status: 400 });
  return NextResponse.json(await detectChanges(message, transcript));
}
