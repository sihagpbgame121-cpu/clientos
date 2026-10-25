"use client";
import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { useToast } from "./Toast";
import { input, btn } from "@/lib/ui";

type Mode = "login" | "signup" | "forgot";
const COPY = {
  login: { title: "Welcome back", cta: "Log in" },
  signup: { title: "Create your workspace", cta: "Start Free" },
  forgot: { title: "Reset your password", cta: "Send reset link" },
};

export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") || "").trim();
    const password = String(f.get("password") || "");
    const name = String(f.get("name") || "").trim();
    const errs: Record<string, string> = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = "Enter a valid email";
    if (mode !== "forgot" && password.length < 8) errs.password = "At least 8 characters";
    if (mode === "signup" && !name) errs.name = "Enter your name";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      const sb = getSupabase();
      if (mode === "login") {
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/dashboard");
      } else if (mode === "signup") {
        const { data, error } = await sb.auth.signUp({ email, password, options: { data: { full_name: name } } });
        if (error) throw error;
        if (data.session) router.push("/dashboard");
        else toast("Account created. Check your email to confirm, then log in.");
      } else {
        const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/login` });
        if (error) throw error;
        toast("Reset link sent. Check your inbox.");
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : "Something went wrong", "err");
    } finally {
      setLoading(false);
    }
  }

  const field = (id: string, label: string, type: string, auto: string) => (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm text-zinc-300">{label}</label>
      <input id={id} name={id} type={type} autoComplete={auto} className={input}
        aria-invalid={!!errors[id]} aria-describedby={errors[id] ? `${id}-err` : undefined} />
      {errors[id] && <p id={`${id}-err`} className="mt-1 text-xs text-red-400">{errors[id]}</p>}
    </div>
  );

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 block text-center text-lg font-semibold tracking-tight">ClientOS</Link>
        <form onSubmit={onSubmit} noValidate className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <h1 className="text-xl font-semibold tracking-tight">{COPY[mode].title}</h1>
          {mode === "signup" && field("name", "Full name", "text", "name")}
          {field("email", "Email", "email", "email")}
          {mode !== "forgot" && field("password", "Password", "password", mode === "login" ? "current-password" : "new-password")}
          <button className={`${btn} w-full`} disabled={loading}>{loading ? "Please wait…" : COPY[mode].cta}</button>
        </form>
        <p className="mt-5 text-center text-sm text-zinc-400">
          {mode === "login" && <>New here? <Link className="text-indigo-300 hover:underline" href="/signup">Sign up</Link> · <Link className="text-indigo-300 hover:underline" href="/forgot-password">Forgot password?</Link></>}
          {mode !== "login" && <>Back to <Link className="text-indigo-300 hover:underline" href="/login">log in</Link></>}
        </p>
      </div>
    </main>
  );
}
