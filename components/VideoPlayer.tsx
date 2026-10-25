"use client";
import { RefObject } from "react";

export default function VideoPlayer({ src, videoRef, onTime, onDuration }: {
  src: string; videoRef: RefObject<HTMLVideoElement | null>;
  onTime: (t: number) => void; onDuration: (d: number) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
      <video ref={videoRef} src={src} controls playsInline preload="metadata" className="aspect-video w-full"
        onTimeUpdate={(e) => onTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => onDuration(e.currentTarget.duration)} />
    </div>
  );
}
