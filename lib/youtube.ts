// Returns the 11-character YouTube video id from common link formats, or null.
export function parseYouTubeId(input: string): string | null {
  try {
    const u = new URL(input.trim());
    const host = u.hostname.replace(/^(www|m)\./, "");
    let id: string | null = null;
    if (host === "youtu.be") id = u.pathname.slice(1).split("/")[0];
    else if (host === "youtube.com" || host === "youtube-nocookie.com") {
      if (u.pathname === "/watch") id = u.searchParams.get("v");
      else id = u.pathname.match(/^\/(embed|shorts|live|v)\/([^/?]+)/)?.[2] ?? null;
    }
    return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
  } catch { return null; }
}
