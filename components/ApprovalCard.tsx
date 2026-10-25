import { ApprovalRow } from "@/lib/types";
import { card } from "@/lib/ui";

export default function ApprovalCard({ approval }: { approval: ApprovalRow | null }) {
  return (
    <div className={`${card} p-5`}>
      <p className="text-sm text-zinc-400">Final approval</p>
      {approval ? (
        <>
          <p className="mt-1 text-lg font-semibold text-emerald-300">Approved</p>
          <p className="mt-1 text-sm text-zinc-400">By {approval.approved_by} on {new Date(approval.approved_at).toLocaleString("en-IN")}</p>
          <p className="mt-2 text-xs text-zinc-500">Locked. No more comments or changes.</p>
        </>
      ) : (
        <p className="mt-1 text-lg font-semibold text-zinc-300">Not approved yet</p>
      )}
    </div>
  );
}
