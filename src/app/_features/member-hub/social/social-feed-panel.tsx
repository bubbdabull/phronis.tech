"use client";

import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { SocialCompose } from "@/_features/member-hub/social/social-compose";
import { SocialPostCard } from "@/_features/member-hub/social/social-post-card";
import type { FeedPost, MemberLite } from "@/_lib/member-social-types";

type Props = {
  busy: boolean;
  authHeaders: () => Promise<HeadersInit>;
  onBusyChange: (v: boolean) => void;
  refreshKey?: number;
};

export function SocialFeedPanel({ busy, authHeaders, onBusyChange, refreshKey = 0 }: Props) {
  const [me, setMe] = useState<MemberLite | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const loadFeed = useCallback(async () => {
    setErr(null);
    setLoading(true);
    try {
      const h = await authHeaders();
      const res = await fetch("/api/members/social/feed?limit=25", { headers: h });
      const json = (await res.json()) as { ok?: boolean; posts?: FeedPost[]; me?: MemberLite; error?: string };
      if (!res.ok || !json.ok) {
        setErr(json.error ?? "Could not load feed");
        return;
      }
      if (json.me) setMe(json.me);
      setPosts(json.posts ?? []);
    } catch {
      setErr("Network error");
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    void loadFeed();
  }, [loadFeed, refreshKey]);

  const createPost = async (body: string, visibility: "public" | "friends") => {
    onBusyChange(true);
    setErr(null);
    try {
      const h = await authHeaders();
      const res = await fetch("/api/members/social/feed", {
        method: "POST",
        headers: h,
        body: JSON.stringify({ body, visibility }),
      });
      const json = (await res.json()) as { ok?: boolean; post?: FeedPost; error?: string };
      if (!res.ok || !json.ok || !json.post) {
        setErr(json.error ?? "Could not post");
        return;
      }
      setPosts((p) => [json.post!, ...p]);
    } catch {
      setErr("Network error");
    } finally {
      onBusyChange(false);
    }
  };

  const onLikeChange = (postId: string, liked: boolean, likeCount: number) => {
    setPosts((list) => list.map((p) => (p.id === postId ? { ...p, liked_by_me: liked, like_count: likeCount } : p)));
  };

  return (
    <div className="space-y-4">
      {me ? <SocialCompose me={me} busy={busy} onPost={createPost} /> : null}

      {err ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200/90">{err}</p>
      ) : null}

      {loading && posts.length === 0 ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-phronis-teal" />
        </div>
      ) : null}

      {!loading && posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-black/20 px-6 py-12 text-center">
          <p className="text-sm font-medium text-phronis-foreground">Your feed is quiet</p>
          <p className="mt-2 text-xs leading-relaxed text-phronis-muted">
            Post an update above, add friends from Discover, or set visibility to Everyone so all members can see your posts.
          </p>
        </div>
      ) : null}

      <div className="space-y-4">
        {posts.map((post) => (
          <SocialPostCard key={post.id} post={post} busy={busy} authHeaders={authHeaders} onLikeChange={onLikeChange} />
        ))}
      </div>
    </div>
  );
}
