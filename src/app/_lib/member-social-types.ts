export type MemberLite = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  membership_tier: string | null;
};

export type FeedPost = {
  id: string;
  member_id: string;
  body: string;
  visibility: "public" | "friends";
  created_at: string;
  author: MemberLite;
  like_count: number;
  comment_count: number;
  liked_by_me: boolean;
};

export type FeedComment = {
  id: string;
  post_id: string;
  member_id: string;
  body: string;
  created_at: string;
  author: MemberLite;
};

export function memberLabel(m: Pick<MemberLite, "display_name" | "username">): string {
  return (m.display_name || m.username || "Member").trim() || "Member";
}

export function memberHandle(m: Pick<MemberLite, "username" | "id">): string {
  return m.username ? `@${m.username}` : `@${m.id.slice(0, 8)}`;
}

export function avatarInitials(m: Pick<MemberLite, "display_name" | "username">): string {
  const label = memberLabel(m);
  const parts = label.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return label.slice(0, 2).toUpperCase();
}

export function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
