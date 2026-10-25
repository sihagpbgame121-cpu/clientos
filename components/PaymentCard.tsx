"use client";
import { PaymentRow, money } from "@/lib/types";
import { card, btn, btnGhost } from "@/lib/ui";

export default function PaymentCard({ amount, currency, payment, onCreate, onPaid }: {
  amount: number; currency: string; payment: PaymentRow | null; onCreate: () => void; onPaid: () => void;
}) {
  const status = payment?.status ?? "not invoiced";
  return (
    <div className={`${card} max-w-xl p-6`}>
      <p className="mb-4 rounded-lg bg-amber-400/10 px-3 py-2 text-xs text-amber-300">Mock payment. No real money moves. Razorpay/Stripe comes later.</p>
      <div className="grid grid-cols-2 gap-4">
        <div><p className="text-sm text-zinc-400">Total amount</p><p className="mt-1 text-2xl font-semibold tabular-nums">{money(amount, currency)}</p></div>
        <div><p className="text-sm text-zinc-400">Payment status</p>
          <p className={`mt-1 text-2xl font-semibold capitalize ${status === "paid" ? "text-emerald-300" : "text-zinc-200"}`}>{status}</p></div>
      </div>
      <div className="mt-6 flex gap-2">
        {!payment && <button className={btn} onClick={onCreate}>Create invoice (mock)</button>}
        {payment?.status === "pending" && <button className={btn} onClick={onPaid}>Mark as paid (mock)</button>}
        {payment?.status === "paid" && <span className={`${btnGhost} cursor-default`}>Paid</span>}
      </div>
    </div>
  );
}
