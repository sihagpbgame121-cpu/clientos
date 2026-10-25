"use client";
import { useEffect, useState, FormEvent } from "react";
import { X } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { useToast } from "./Toast";
import { input, btn, btnGhost } from "@/lib/ui";

export default function CreateProjectModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") || "").trim();
    const clientName = String(f.get("client") || "").trim();
    const price = Number(f.get("price") || 0);
    const currency = String(f.get("currency"));
    const deadline = String(f.get("deadline") || "") || null;
    const revision_limit = Number(f.get("revision_limit") || 0);
    const errs: Record<string, string> = {};
    if (!name) errs.name = "Required";
    if (!clientName) errs.client = "Required";
    if (!(price >= 0)) errs.price = "Enter a valid price";
    if (!Number.isInteger(revision_limit) || revision_limit < 0) errs.revision_limit = "Whole number, 0 or more";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      const sb = getSupabase();
      const { data: u } = await sb.auth.getUser();
      if (!u.user) throw new Error("Please log in again");
      let { data: client } = await sb.from("clients").select("id").eq("name", clientName).maybeSingle();
      if (!client) {
        const ins = await sb.from("clients").insert({ user_id: u.user.id, name: clientName }).select("id").single();
        if (ins.error) throw ins.error;
        client = ins.data;
      }
      const { error } = await sb.from("projects").insert({
        user_id: u.user.id, client_id: client!.id, name, price, currency, deadline, revision_limit,
      });
      if (error) throw error;
      toast("Project created");
      onCreated();
      onClose();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not create project", "err");
    } finally {
      setLoading(false);
    }
  }

  const err = (k: string) => errors[k] && <p className="mt-1 text-xs text-red-400">{errors[k]}</p>;
  const label = "mb-1.5 block text-sm text-zinc-300";
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <form role="dialog" aria-modal="true" aria-labelledby="np-title" noValidate onSubmit={onSubmit}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-t-2xl border border-white/10 bg-[#101012] p-6 sm:rounded-2xl">
        <div className="flex items-center justify-between">
          <h2 id="np-title" className="text-lg font-semibold">New project</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1 text-zinc-400 hover:bg-white/5"><X size={18} /></button>
        </div>
        <div><label className={label} htmlFor="name">Project name</label><input id="name" name="name" autoFocus className={input} />{err("name")}</div>
        <div><label className={label} htmlFor="client">Client</label><input id="client" name="client" className={input} />{err("client")}</div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={label} htmlFor="price">Price</label><input id="price" name="price" type="number" min="0" step="any" defaultValue={0} className={input} />{err("price")}</div>
          <div><label className={label} htmlFor="currency">Currency</label>
            <select id="currency" name="currency" className={input} defaultValue="INR">
              {["INR", "USD", "EUR", "GBP", "AED"].map((c) => <option key={c} className="bg-zinc-900">{c}</option>)}
            </select></div>
          <div><label className={label} htmlFor="deadline">Deadline</label><input id="deadline" name="deadline" type="date" className={input} /></div>
          <div><label className={label} htmlFor="revision_limit">Revision limit</label><input id="revision_limit" name="revision_limit" type="number" min="0" defaultValue={2} className={input} />{err("revision_limit")}</div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className={btnGhost}>Cancel</button>
          <button className={btn} disabled={loading}>{loading ? "Creating…" : "Create project"}</button>
        </div>
      </form>
    </div>
  );
}
