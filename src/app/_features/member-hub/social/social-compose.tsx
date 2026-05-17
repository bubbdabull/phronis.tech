"use client";

import { Image, Loader2 } from "lucide-react";
import { useState } from "react";

import { SocialAvatar } from "@/_features/member-hub/social/social-avatar";
import { Button } from "@/_components/ui/button";
import type { MemberLite } from "@/_lib/member-social-types";
import { cn } from "@/_lib/utils";

type Props = {
  me: MemberLite;
  busy: boolean;
  onPost: (body: string, visibility: "public" | "friends") => Promise<void>;
};

export function SocialCompose({ me, busy, onPost }: Props) {
  const [body, setBody] = useState("");
  const [visibility, setVisibility] = useState<"public" | "friends">("friends");

  const submit = async () => {
    const text = body.trim();
    if (!text) return;
    await onPost(text, visibility);
    setBody("");
  };

  const remaining = 2000 - body.length;

  return (
    <article className="rounded-2xl border border-white/10 bg-black/30 shadow-sm">
      <div className="border-b border-white/10 px-4 py-3 sm:px-5">
        <p className="text-sm font-semibold text-phronis-foreground">Create post</p>
      </div>
      <div className="flex gap-3 p-4 sm:p-5">
        <SocialAvatar member={me} size={44} />
        <div className="min-w-0 flex-1 space-y-3">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value.slice(0, 2000))}
            rows={3}
            placeholder="What's on your mind?"
            className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm leading-relaxed text-phronis-foreground outline-none placeholder:text-phronis-muted/70 focus:border-phronis-teal/40"
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as "public" | "friends")}
                className="h-8 rounded-lg border border-white/10 bg-black/40 px-2 text-xs text-phronis-muted"
              >
                <option value="friends">Friends</option>
                <option value="public">Everyone</option>
              </select>
              <span className="text-[11px] text-phronis-muted">{remaining} left</span>
            </div>
            <Button
              type="button"
              size="sm"
              disabled={busy || !body.trim()}
              className="rounded-full bg-phronis-teal px-5 font-semibold text-phronis-void hover:opacity-90"
              onClick={() => void submit()}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post"}
            </Button>
          </div>
        </div>
      </div>
      <div className="flex border-t border-white/10 px-2 py-1 text-phronis-muted">
        <button type="button" className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-medium hover:bg-white/5" disabled>
          <Image className="h-4 w-4" aria-hidden />
          Photo
          <span className="text-[10px] text-phronis-muted/60">(soon)</span>
        </button>
      </div>
    </article>
  );
}
