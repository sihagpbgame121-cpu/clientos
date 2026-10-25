"use client";
import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard, LogOut } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { btnGhost } from "@/lib/ui";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sb = getSupabase();
    sb.auth.getSession().then(({ data }) => (data.session ? setReady(true) : router.replace("/login")));
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => { if (!s) router.replace("/login"); });
    return () => sub.subscription.unsubscribe();
  }, [router]);

  async function signOut() { await getSupabase().auth.signOut(); router.replace("/login"); }

  if (!ready) return <div className="flex min-h-screen items-center justify-center text-sm text-zinc-500">Loading…</div>;
  return (
    <div className="min-h-screen md:grid md:grid-cols-[220px_1fr]">
      <aside className="hidden border-r border-white/10 p-4 md:flex md:flex-col md:justify-between">
        <div>
          <Link href="/dashboard" className="mb-6 block px-2 text-lg font-semibold tracking-tight">ClientOS</Link>
          <nav aria-label="Main">
            <Link href="/dashboard" className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm">
              <LayoutDashboard size={16} /> Dashboard
            </Link>
          </nav>
        </div>
        <button onClick={signOut} className={btnGhost}><LogOut size={16} /> Sign out</button>
      </aside>
      <div className="min-w-0">
        <header className="flex items-center justify-between border-b border-white/10 px-4 py-3 md:hidden">
          <span className="font-semibold">ClientOS</span>
          <button onClick={signOut} aria-label="Sign out" className={btnGhost}><LogOut size={16} /></button>
        </header>
        <main className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
