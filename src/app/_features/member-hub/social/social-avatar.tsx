"use client";

import type { MemberLite } from "@/_lib/member-social-types";
import { avatarInitials } from "@/_lib/member-social-types";
import { cn } from "@/_lib/utils";

export function SocialAvatar({
  member,
  size = 40,
  className,
}: {
  member: Pick<MemberLite, "display_name" | "username" | "avatar_url">;
  size?: number;
  className?: string;
}) {
  const px = size;
  if (member.avatar_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={member.avatar_url}
        alt=""
        width={px}
        height={px}
        className={cn("shrink-0 rounded-full object-cover ring-2 ring-white/10", className)}
        style={{ width: px, height: px }}
      />
    );
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-phronis-teal/30 to-phronis-teal/10 font-semibold text-phronis-teal ring-2 ring-white/10",
        className,
      )}
      style={{ width: px, height: px, fontSize: px * 0.35 }}
      aria-hidden
    >
      {avatarInitials(member)}
    </span>
  );
}
