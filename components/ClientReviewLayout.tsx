import { ReactNode } from "react";
import { badge } from "@/lib/types";

// Public layout: no dashboard links, no editor navigation.
export default function ClientReviewLayout({ title, status, children }: { title?: string; status?: string; children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-white/10 px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3">
          <span className="text-sm font-semibold tracking-tight text-zinc-400">ClientOS · Review</span>
          {title && <h1 className="break-words text-lg font-semibold tracking-tight">{title}</h1>}
          {status && <span className={`rounded-full px-2.5 py-1 text-xs ${badge[status] ?? ""}`}>{status.replace("_", " ")}</span>}
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-4 sm:p-8">{children}</main>
    </div>
  );
}
