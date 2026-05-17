"use client";

import { Heart, MessageCircle, MoreHorizontal, Share2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { SocialAvatar } from "@/_features/member-hub/social/social-avatar";
import { Button } from "@/_components/ui/button";
import type { FeedComment, FeedPost } from "@/_lib/member-social-types";
import { memberHandle, memberLabel, timeAgo } from "@/_lib/member-social-types";
import { cn } from "@/_lib/utils";

type Props = {
  post: FeedPost;
  busy: boolean;
  authHeaders: () => Promise<HeadersInit>;
  onLikeChange: (postId: string, liked: boolean, likeCount: number) => void;
};

export function SocialPostCard({ post, busy, authHeaders, onLikeChange }: Props) {
  const [local, setLocal] = useState(post);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [commentDraft, setCommentDraft] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    setLocal(post);
  }, [post]);

  const toggleLike = useCallback(async () => {
    try {
      const h = await authHeaders();
      const res = await fetch(`/api/members/social/feed/${local.id}/like`, { method: "POST", headers: h });
      const json = (await res.json()) as { ok?: boolean; liked?: boolean };
      if (!res.ok || !json.ok) return;
      const liked = Boolean(json.liked);
      const likeCount = Math.max(0, local.like_count + (liked ? 1 : -1));
      setLocal((p) => ({ ...p, liked_by_me: liked, like_count: likeCount }));
      onLikeChange(local.id, liked, likeCount);
    } catch {
      /* ignore */
    }
  }, [authHeaders, local.id, local.like_count, onLikeChange]);

  const loadComments = useCallback(async () => {
    setLoadingComments(true);
    try {
      const h = await authHeaders();
      const res = await fetch(`/api/members/social/feed/${local.id}/comments`, { headers: h });
      const json = (await res.json()) as { ok?: boolean; comments?: FeedComment[] };
      if (res.ok && json.ok) setComments(json.comments ?? []);
    } finally {
      setLoadingComments(false);
    }
  }, [authHeaders, local.id]);

  const openComments = () => {
    const next = !showComments;
    setShowComments(next);
    if (next && comments.length === 0) void loadComments();
  };

  const submitComment = async () => {
    const text = commentDraft.trim();
    if (!text) return;
    try {
      const h = await authHeaders();
      const res = await fetch(`/api/members/social/feed/${local.id}/comments`, {
        method: "POST",
        headers: h,
        body: JSON.stringify({ body: text }),
      });
      const json = (await res.json()) as { ok?: boolean; comment?: FeedComment };
      if (!res.ok || !json.ok || !json.comment) return;
      setComments((c) => [...c, json.comment!]);
      setCommentDraft("");
      setLocal((p) => ({ ...p, comment_count: p.comment_count + 1 }));
    } catch {
      /* ignore */
    }
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
      <header className="flex items-start gap-3 px-4 pt-4 sm:px-5">
        <SocialAvatar member={local.author} size={44} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-phronis-foreground">{memberLabel(local.author)}</p>
          <p className="truncate text-xs text-phronis-muted">
            {memberHandle(local.author)} · {timeAgo(local.created_at)}
            {local.visibility === "public" ? " · Public" : " · Friends"}
          </p>
        </div>
        <button type="button" className="rounded-full p-1.5 text-phronis-muted hover:bg-white/10" aria-label="More">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </header>

      <p className="whitespace-pre-wrap px-4 py-3 text-sm leading-relaxed text-phronis-foreground sm:px-5">{local.body}</p>

      {(local.like_count > 0 || local.comment_count > 0) && (
        <div className="flex items-center justify-between border-t border-white/5 px-4 py-2 text-xs text-phronis-muted sm:px-5">
          <span>{local.like_count > 0 ? `${local.like_count} like${local.like_count === 1 ? "" : "s"}` : ""}</span>
          <span>{local.comment_count > 0 ? `${local.comment_count} comment${local.comment_count === 1 ? "" : "s"}` : ""}</span>
        </div>
      )}

      <div className="grid grid-cols-3 border-t border-white/10">
        <button
          type="button"
          disabled={busy}
          onClick={() => void toggleLike()}
          className={cn(
            "flex items-center justify-center gap-2 py-3 text-xs font-medium transition hover:bg-white/5",
            local.liked_by_me ? "text-rose-400" : "text-phronis-muted",
          )}
        >
          <Heart className={cn("h-4 w-4", local.liked_by_me && "fill-current")} />
          Like
        </button>
        <button
          type="button"
          onClick={openComments}
          className="flex items-center justify-center gap-2 py-3 text-xs font-medium text-phronis-muted transition hover:bg-white/5"
        >
          <MessageCircle className="h-4 w-4" />
          Comment
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-2 py-3 text-xs font-medium text-phronis-muted transition hover:bg-white/5"
          onClick={() => void navigator.clipboard?.writeText(`${window.location.origin}/member/social`)}
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>
      </div>

      {showComments ? (
        <div className="border-t border-white/10 bg-black/40 px-4 py-3 sm:px-5">
          {loadingComments ? (
            <p className="py-2 text-center text-xs text-phronis-muted">Loading comments…</p>
          ) : (
            <ul className="space-y-3">
              {comments.map((c) => (
                <li key={c.id} className="flex gap-2">
                  <SocialAvatar member={c.author} size={32} />
                  <div className="min-w-0 flex-1 rounded-2xl bg-white/[0.06] px-3 py-2">
                    <p className="text-xs font-semibold text-phronis-foreground">{memberLabel(c.author)}</p>
                    <p className="mt-0.5 text-sm text-phronis-foreground/90">{c.body}</p>
                    <p className="mt-1 text-[10px] text-phronis-muted">{timeAgo(c.created_at)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 flex gap-2">
            <input
              value={commentDraft}
              onChange={(e) => setCommentDraft(e.target.value)}
              placeholder="Write a comment…"
              className="min-w-0 flex-1 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm outline-none focus:border-phronis-teal/40"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void submitComment();
                }
              }}
            />
            <Button type="button" size="sm" className="rounded-full bg-phronis-teal text-phronis-void" disabled={!commentDraft.trim()} onClick={() => void submitComment()}>
              Reply
            </Button>
          </div>
        </div>
      ) : null}
    </article>
  );
}
