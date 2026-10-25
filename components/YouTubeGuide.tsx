export default function YouTubeGuide() {
  return (
    <details className="group mt-5 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <summary className="cursor-pointer list-none text-sm font-medium outline-none focus-visible:text-indigo-300 [&::-webkit-details-marker]:hidden">
        How to use YouTube for big videos <span className="text-zinc-500">(free, any size)</span>
      </summary>
      <div className="mt-5 grid gap-6 text-sm text-zinc-300 md:grid-cols-2">
        <div>
          <h3 className="mb-2 font-semibold text-zinc-100">For you (the editor)</h3>
          <ol className="list-decimal space-y-2 pl-5 marker:text-zinc-500">
            <li>Open <b>studio.youtube.com</b>, click <b>Create → Upload videos</b> and pick your file.</li>
            <li>Under <b>Visibility</b> choose <b>Unlisted</b>. Never Public. Wait until processing finishes.</li>
            <li>Click <b>Share</b> and copy the link.</li>
            <li>Paste it in the box above and click <b>Add YouTube link</b>.</li>
            <li>Send your client the <b>Client review link</b> from the Overview tab.</li>
          </ol>
        </div>
        <div>
          <h3 className="mb-2 font-semibold text-zinc-100">What your client sees</h3>
          <ul className="list-disc space-y-2 pl-5 marker:text-zinc-500">
            <li>They open your ClientOS link. No account needed.</li>
            <li>Your video plays right there in the YouTube player.</li>
            <li>They click the timeline to comment on an exact second, request changes, or approve.</li>
            <li>They can tap <b>Open on YouTube</b> to watch full screen.</li>
          </ul>
          <p className="mt-3 rounded-lg bg-amber-400/10 p-3 text-xs text-amber-300">Unlisted means anyone with the link can watch. For confidential footage, upload the file directly instead.</p>
        </div>
      </div>
    </details>
  );
}
