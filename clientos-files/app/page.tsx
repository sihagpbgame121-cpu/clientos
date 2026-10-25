import Link from "next/link";
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">Stop managing clients across WhatsApp.</h1>
      <p className="text-zinc-400">Landing page coming in Part 3.</p>
      <div className="flex gap-3">
        <Link href="/signup" className="rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-medium">Start Free</Link>
        <Link href="/login" className="rounded-xl border border-white/10 px-4 py-2.5 text-sm">Log in</Link>
      </div>
    </main>
  );
}
