import Link from "next/link";
import {
  MessageCircle, Mic, LayoutDashboard, Clock, RefreshCw, BadgeCheck, ChevronRight, ChevronDown,
  Link2, ListChecks, Sparkles, ShieldCheck, Lock, Check, Upload, MessagesSquare,
} from "lucide-react";
import Reveal from "@/components/Reveal";

const pill = "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[15px] font-medium transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0b]";
const primary = `${pill} bg-white text-black hover:bg-zinc-200 hover:scale-[1.03]`;
const ghost = `${pill} border border-white/15 text-zinc-100 hover:bg-white/10`;
const h2 = "text-4xl font-semibold tracking-[-0.03em] sm:text-5xl lg:text-6xl";
const glass = "rounded-[28px] border border-white/10 bg-white/[0.03] backdrop-blur transition duration-500 hover:border-white/20 hover:bg-white/[0.05]";

const flow = [
  { icon: MessageCircle, label: "WhatsApp" }, { icon: Mic, label: "Voice Notes" }, { icon: LayoutDashboard, label: "ClientOS", hot: true },
  { icon: Clock, label: "Timestamped Feedback" }, { icon: RefreshCw, label: "Revision" }, { icon: BadgeCheck, label: "Approval" },
];
const faqs = [
  ["Does my client need an account?", "No. You send one private link. Your client watches, comments on exact seconds, requests changes and approves, all without signing up."],
  ["Is my footage private?", "Yes. Videos live in a private bucket and are only shown through short-lived links tied to that one project. Your dashboard is protected by row-level security, so only you can see your data."],
  ["How do revision limits work?", "Set a limit per project, like 2. ClientOS counts every change request and shows when the limit is reached, so scope creep is visible. Nothing is charged automatically."],
  ["Can I share big videos?", "Yes. Upload up to 50 MB directly, or paste an unlisted YouTube link for bigger videos. Timestamped comments, revisions and approval work the same way."],
  ["Does it understand Hinglish feedback?", "Yes. Paste a message like “27 sec pe text white kar dena” and AI Feedback turns it into timestamped tasks."],
  ["When can I take payments?", "Payment tracking is in the product today. Online payments through Razorpay and Stripe come next."],
];

export default function Home() {
  return (
    <div className="relative">
      <nav aria-label="Main" className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#0a0a0b]/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
          <Link href="/" className="text-[17px] font-semibold tracking-tight">ClientOS</Link>
          <div className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
            {["how-it-works:How it works", "features:Features", "pricing:Pricing", "faq:FAQ"].map((x) => { const [id, l] = x.split(":"); return <a key={id} href={`#${id}`} className="transition hover:text-white">{l}</a>; })}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-zinc-300 transition hover:text-white">Log in</Link>
            <Link href="/signup" className="rounded-full bg-white px-4 py-1.5 text-sm font-medium text-black transition hover:bg-zinc-200">Start Free</Link>
          </div>
        </div>
      </nav>

      <header className="relative overflow-hidden px-5 pb-24 pt-36 text-center sm:pt-44">
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-[620px] w-[900px] max-w-[160vw] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.28),transparent_65%)]" />
        <Reveal>
          <p className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-zinc-300"><Sparkles size={14} className="text-indigo-300" /> Built for freelance video editors</p>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="mx-auto max-w-4xl bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-5xl font-semibold leading-[1.05] tracking-[-0.04em] text-transparent sm:text-7xl lg:text-8xl">Stop managing clients across WhatsApp.</h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400 sm:text-xl">Feedback, revisions and approvals — one workspace built for video editors.</p>
        </Reveal>
        <Reveal delay={240} className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link href="/signup" className={primary}>Start Free</Link>
          <a href="#preview" className={ghost}>Watch Demo</a>
        </Reveal>

        <Reveal delay={320} className="mx-auto mt-20 max-w-6xl">
          <ol aria-label="Workflow" className="flex flex-wrap items-center justify-center gap-3 lg:flex-nowrap">
            {flow.map((f, i) => (
              <li key={f.label} className="flex items-center gap-3">
                {i > 0 && <ChevronRight aria-hidden size={18} className="hidden text-zinc-600 lg:block" />}
                <div className={`flex w-[150px] flex-col items-center gap-2 rounded-3xl border px-4 py-5 text-sm transition duration-500 hover:-translate-y-1 ${f.hot ? "border-indigo-400/40 bg-indigo-500/10 text-white shadow-[0_0_60px_-10px_rgba(99,102,241,0.6)]" : "border-white/10 bg-white/[0.03] text-zinc-300"}`}>
                  <f.icon size={22} className={f.hot ? "text-indigo-300" : "text-zinc-400"} />
                  {f.label}
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
      </header>

      <section aria-labelledby="problem" className="px-5 py-28">
        <div className="mx-auto max-w-5xl">
          <Reveal><p className="mb-4 text-sm font-medium uppercase tracking-widest text-indigo-300">The problem</p></Reveal>
          <Reveal delay={60}><h2 id="problem" className={h2}>Feedback lives everywhere.<br /><span className="text-zinc-500">Except where you edit.</span></h2></Reveal>
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {[["Voice notes on repeat", "Replaying a 3-minute note ten times to find one change."], ["“27 sec pe” gets lost", "Timestamps buried between memes and good-mornings."], ["Endless unpaid revisions", "No limit, no record, no clear “this is final”."]].map(([t, d], i) => (
              <Reveal key={t} delay={i * 100}><div className={`${glass} h-full p-7`}><h3 className="text-xl font-semibold tracking-tight">{t}</h3><p className="mt-2 text-zinc-400">{d}</p></div></Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" aria-labelledby="how" className="scroll-mt-20 px-5 py-28">
        <div className="mx-auto max-w-5xl">
          <Reveal><h2 id="how" className={h2}>Three steps.<br /><span className="text-zinc-500">Zero chaos.</span></h2></Reveal>
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {[[Upload, "Upload & share", "Upload your cut and send one private review link."], [MessagesSquare, "Client comments on the timeline", "They click the exact second and tell you what to fix. No account needed."], [BadgeCheck, "Approve & get paid", "One click final approval, locked with a timestamp."]].map(([I, t, d], i) => {
              const Icon = I as typeof Upload;
              return (
                <Reveal key={t as string} delay={i * 100}>
                  <div className={`${glass} h-full p-7`}>
                    <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-300"><Icon size={20} /></span>
                    <p className="text-sm text-zinc-500">Step {i + 1}</p>
                    <h3 className="mt-1 text-xl font-semibold tracking-tight">{t as string}</h3>
                    <p className="mt-2 text-zinc-400">{d as string}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section id="features" aria-labelledby="feat" className="scroll-mt-20 px-5 py-28">
        <div className="mx-auto max-w-6xl">
          <Reveal><h2 id="feat" className={h2}>Everything you need.<br /><span className="text-zinc-500">Nothing you don&rsquo;t.</span></h2></Reveal>
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {[
              [Clock, "Timestamped comments", "Click the timeline, comment on the exact frame. Resolve, edit and track every note.", "md:col-span-2"],
              [Link2, "Public review links", "Clients review without signing up.", ""],
              [RefreshCw, "Revision tracking", "See 2 / 2 at a glance. “Revision limit reached.” when it is.", ""],
              [ListChecks, "Comments become tasks", "One click turns feedback into a Todo, In Progress, Done board.", ""],
              [Sparkles, "AI Feedback", "Paste a Hinglish WhatsApp message. Get timestamped tasks back.", ""],
              [Lock, "Final approval lock", "Once approved, it is locked with the time and name.", "md:col-span-2"],
              [ShieldCheck, "Secure by design", "Row-level security, private storage and signed links.", ""],
            ].map(([I, t, d, span], i) => {
              const Icon = I as typeof Clock;
              return (
                <Reveal key={t as string} delay={(i % 3) * 90} className={span as string}>
                  <div className={`${glass} h-full p-7`}>
                    <Icon size={22} className="mb-5 text-indigo-300" />
                    <h3 className="text-xl font-semibold tracking-tight">{t as string}</h3>
                    <p className="mt-2 text-zinc-400">{d as string}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section id="preview" aria-labelledby="prev" className="scroll-mt-20 px-5 py-28">
        <div className="mx-auto max-w-5xl text-center">
          <Reveal><h2 id="prev" className={h2}>Your whole business,<br /><span className="text-zinc-500">one clean dashboard.</span></h2></Reveal>
          <Reveal delay={120} className="relative mt-14">
            <div aria-hidden className="absolute inset-x-10 -top-6 bottom-0 -z-10 rounded-[40px] bg-indigo-500/20 blur-3xl" />
            <div role="img" aria-label="Preview of the ClientOS dashboard" className="overflow-hidden rounded-[28px] border border-white/10 bg-[#0e0e10] text-left shadow-2xl">
              <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3"><i className="h-3 w-3 rounded-full bg-red-400/70" /><i className="h-3 w-3 rounded-full bg-amber-400/70" /><i className="h-3 w-3 rounded-full bg-emerald-400/70" /></div>
              <div className="p-5 sm:p-8">
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {[["Active projects", "6"], ["Awaiting approval", "2"], ["Pending tasks", "11"], ["Revenue", "₹84,000"]].map(([l, v]) => (
                    <div key={l} className="rounded-2xl border border-white/10 p-4"><p className="text-xs text-zinc-500">{l}</p><p className="mt-1 text-2xl font-semibold tabular-nums">{v}</p></div>
                  ))}
                </div>
                <div className="mt-5 divide-y divide-white/5 rounded-2xl border border-white/10">
                  {[["Real estate walkthrough", "Muksh Ambani", "Approved", "text-emerald-300 bg-emerald-400/10", "₹10,000"], ["Wedding highlight reel", "Ram Singh", "Awaiting approval", "text-amber-300 bg-amber-400/10", "₹25,000"], ["Podcast shorts", "Aman Verma", "In progress", "text-indigo-300 bg-indigo-400/10", "₹8,000"]].map(([p, c, s, cls, a]) => (
                    <div key={p} className="grid grid-cols-2 items-center gap-2 px-4 py-3.5 text-sm sm:grid-cols-4"><span className="font-medium">{p}</span><span className="hidden text-zinc-400 sm:block">{c}</span><span><span className={`rounded-full px-2.5 py-1 text-xs ${cls}`}>{s}</span></span><span className="text-right tabular-nums">{a}</span></div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="pricing" aria-labelledby="price" className="scroll-mt-20 px-5 py-28">
        <div className="mx-auto max-w-6xl">
          <Reveal><h2 id="price" className={`${h2} text-center`}>Simple pricing.</h2></Reveal>
          <div className="mt-14 grid gap-4 mx-auto max-w-3xl md:grid-cols-2">
            {[
              ["Free", "₹0", "For getting started", ["5 active projects", "Public review links", "Timestamped comments", "Any currency"], false],
              ["Pro", "₹149", "About $2 a month, for working editors", ["Unlimited projects", "AI Feedback", "Revision tracking", "Priority support"], true],
            ].map(([n, p, d, items, hot], i) => (
              <Reveal key={n as string} delay={i * 100}>
                <div className={`flex h-full flex-col rounded-[28px] border p-8 ${hot ? "border-indigo-400/50 bg-indigo-500/[0.07] shadow-[0_0_80px_-20px_rgba(99,102,241,0.6)]" : "border-white/10 bg-white/[0.03]"}`}>
                  <h3 className="text-lg font-semibold">{n as string}</h3>
                  <p className="mt-1 text-sm text-zinc-400">{d as string}</p>
                  <p className="mt-6 text-5xl font-semibold tracking-tight">{p as string}<span className="text-base font-normal text-zinc-500">{p === "₹0" ? "" : " /mo"}</span></p>
                  <ul className="mt-6 flex-1 space-y-3 text-sm text-zinc-300">
                    {(items as string[]).map((x) => <li key={x} className="flex items-center gap-2"><Check size={16} className="text-indigo-300" />{x}</li>)}
                  </ul>
                  <Link href="/signup" className={`${hot ? primary : ghost} mt-8`}>Start Free</Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" aria-labelledby="faqh" className="scroll-mt-20 px-5 py-28">
        <div className="mx-auto max-w-3xl">
          <Reveal><h2 id="faqh" className={`${h2} text-center`}>Questions.</h2></Reveal>
          <div className="mt-12 divide-y divide-white/10 border-y border-white/10">
            {faqs.map(([q, a], i) => (
              <Reveal key={q} delay={i * 50}>
                <details className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-medium outline-none focus-visible:text-indigo-300 [&::-webkit-details-marker]:hidden">
                    {q}<ChevronDown size={20} className="shrink-0 text-zinc-500 transition duration-300 group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 text-zinc-400">{a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden px-5 py-32 text-center">
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[800px] max-w-[160vw] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.25),transparent_65%)]" />
        <Reveal><h2 className="mx-auto max-w-3xl bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-5xl font-semibold tracking-[-0.04em] text-transparent sm:text-6xl">From WhatsApp chaos to approved &amp; paid.</h2></Reveal>
        <Reveal delay={120} className="mt-10"><Link href="/signup" className={primary}>Start Free</Link></Reveal>
      </section>

      <footer className="border-t border-white/10 px-5 py-8 text-center text-sm text-zinc-500">© {new Date().getFullYear()} ClientOS. Built for video editors.</footer>
    </div>
  );
}
