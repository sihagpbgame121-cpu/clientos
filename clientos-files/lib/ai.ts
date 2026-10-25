export type DetectedChange = { timestamp: number; title: string; description: string };
export type AIResult = { changes: DetectedChange[]; source: "openai" | "mock" };

// Mock: finds "<n> sec" or "mm:ss" and takes the following clause as the change.
export function mockDetect(text: string): DetectedChange[] {
  const out: DetectedChange[] = [];
  const re = /(?:(\d{1,2}):(\d{2})|(\d{1,4})\s*(?:sec(?:ond)?s?|s\b)?)\s*(?:pe|at|par|me)?\s*([^,.\n]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const ts = m[1] ? Number(m[1]) * 60 + Number(m[2]) : Number(m[3]);
    const rest = (m[4] || "").trim();
    if (!rest || Number.isNaN(ts)) continue;
    out.push({ timestamp: ts, title: rest.charAt(0).toUpperCase() + rest.slice(1, 60), description: rest });
  }
  return out;
}

export async function detectChanges(text: string, transcript?: string): Promise<AIResult> {
  const input = [text, transcript].filter(Boolean).join("\n");
  const key = process.env.OPENAI_API_KEY;
  if (!key) return { changes: mockDetect(input), source: "mock" };
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: 'Extract video edit requests (English/Hinglish). Reply ONLY JSON: {"changes":[{"timestamp":seconds,"title":string,"description":string}]}' },
        { role: "user", content: input },
      ],
    }),
  });
  if (!res.ok) return { changes: mockDetect(input), source: "mock" };
  const data = await res.json();
  const parsed = JSON.parse(data.choices[0].message.content);
  return { changes: parsed.changes ?? [], source: "openai" };
}
