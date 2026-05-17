"use client";

import { useState } from "react";
import { ExternalLink, Play } from "lucide-react";

import { youtubeEmbedId } from "@/_lib/crypto-mastery-course/lesson-videos";

export function LessonVideoPlayer({ videoUrl, title }: { videoUrl: string; title: string }) {
  const embedId = youtubeEmbedId(videoUrl);
  const [embedFailed, setEmbedFailed] = useState(false);

  if (!embedId || embedFailed) {
    return (
      <div className="rounded-xl border border-white/10 bg-black/40 p-4">
        {embedFailed ? (
          <p className="mb-3 text-sm text-phronis-muted">
            This lecture cannot be embedded here. Watch it on YouTube instead.
          </p>
        ) : null}
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-phronis-teal/30 bg-phronis-teal/10 px-4 py-2 text-sm font-medium text-phronis-teal hover:bg-phronis-teal/15"
        >
          <Play className="h-4 w-4" aria-hidden />
          Watch lecture on YouTube
          <ExternalLink className="h-3.5 w-3.5 opacity-70" aria-hidden />
        </a>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-black/40">
      <div className="aspect-video w-full">
        <iframe
          title={`${title} — lecture video`}
          src={`https://www.youtube-nocookie.com/embed/${embedId}`}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          onError={() => setEmbedFailed(true)}
        />
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-white/10 px-3 py-2 text-[11px] text-phronis-muted">
        <span>Lecture video</span>
        <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="text-phronis-teal hover:underline">
          Open on YouTube
        </a>
      </div>
    </div>
  );
}
