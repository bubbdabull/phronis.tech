import type { SupabaseClient } from "@supabase/supabase-js";

import type { FeedPost, MemberLite } from "@/_lib/member-social-types";

export async function friendIdsForMember(supabase: SupabaseClient, memberId: string): Promise<string[]> {
  const { data: rows } = await supabase
    .from("friendships")
    .select("member_a_id, member_b_id")
    .or(`member_a_id.eq.${memberId},member_b_id.eq.${memberId}`);

  return (rows ?? []).map((r) => (r.member_a_id === memberId ? r.member_b_id : r.member_a_id));
}

export async function enrichPosts(
  supabase: SupabaseClient,
  posts: { id: string; member_id: string; body: string; visibility: string; created_at: string }[],
  viewerMemberId: string,
): Promise<FeedPost[]> {
  if (!posts.length) return [];

  const postIds = posts.map((p) => p.id);
  const authorIds = [...new Set(posts.map((p) => p.member_id))];

  const [{ data: authors }, { data: likes }, { data: comments }, { data: myLikes }] = await Promise.all([
    supabase.from("members").select("id, username, display_name, avatar_url, membership_tier").in("id", authorIds),
    supabase.from("social_post_likes").select("post_id").in("post_id", postIds),
    supabase.from("social_post_comments").select("post_id").in("post_id", postIds),
    supabase.from("social_post_likes").select("post_id").eq("member_id", viewerMemberId).in("post_id", postIds),
  ]);

  const authorMap = new Map((authors ?? []).map((a) => [a.id, a as MemberLite]));
  const likeCounts = new Map<string, number>();
  for (const l of likes ?? []) {
    likeCounts.set(l.post_id as string, (likeCounts.get(l.post_id as string) ?? 0) + 1);
  }
  const commentCounts = new Map<string, number>();
  for (const c of comments ?? []) {
    commentCounts.set(c.post_id as string, (commentCounts.get(c.post_id as string) ?? 0) + 1);
  }
  const likedSet = new Set((myLikes ?? []).map((l) => l.post_id as string));

  return posts.map((p) => ({
    id: p.id,
    member_id: p.member_id,
    body: p.body,
    visibility: p.visibility as "public" | "friends",
    created_at: p.created_at,
    author: authorMap.get(p.member_id) ?? {
      id: p.member_id,
      username: null,
      display_name: null,
      avatar_url: null,
      membership_tier: null,
    },
    like_count: likeCounts.get(p.id) ?? 0,
    comment_count: commentCounts.get(p.id) ?? 0,
    liked_by_me: likedSet.has(p.id),
  }));
}
