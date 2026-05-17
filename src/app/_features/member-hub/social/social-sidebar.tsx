"use client";

import { UserPlus } from "lucide-react";

import { SocialAvatar } from "@/_features/member-hub/social/social-avatar";
import type { SocialTab } from "@/_features/member-hub/social/social-nav";
import { Button } from "@/_components/ui/button";
import type { MemberLite } from "@/_lib/member-social-types";
import { memberHandle, memberLabel } from "@/_lib/member-social-types";
import { cn } from "@/_lib/utils";

type Props = {
  friends: MemberLite[];
  suggestions: MemberLite[];
  incomingCount: number;
  busy: boolean;
  onTabChange: (tab: SocialTab) => void;
  onAddFriend: (memberId: string) => void;
  className?: string;
};

export function SocialSidebar({
  friends,
  suggestions,
  incomingCount,
  busy,
  onTabChange,
  onAddFriend,
  className,
}: Props) {
  return (
    <aside className={cn("space-y-4", className)}>
      {incomingCount > 0 ? (
        <div className="rounded-2xl border border-phronis-teal/25 bg-phronis-teal/10 p-4">
          <p className="text-sm font-semibold text-phronis-foreground">
            {incomingCount} friend request{incomingCount === 1 ? "" : "s"}
          </p>
          <p className="mt-1 text-xs text-phronis-muted">Review and accept from your network.</p>
          <Button
            type="button"
            size="sm"
            className="mt-3 w-full rounded-full bg-phronis-teal font-semibold text-phronis-void hover:opacity-90"
            onClick={() => onTabChange("friends")}
          >
            View requests
          </Button>
        </div>
      ) : null}

      <section className="rounded-2xl border border-white/10 bg-black/25 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-phronis-foreground">Your friends</h3>
          <button type="button" className="text-xs font-medium text-phronis-teal hover:underline" onClick={() => onTabChange("friends")}>
            See all
          </button>
        </div>
        {friends.length === 0 ? (
          <p className="mt-3 text-xs leading-relaxed text-phronis-muted">Add people from Discover to fill your feed with friend-only posts.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {friends.slice(0, 6).map((m) => (
              <li key={m.id} className="flex items-center gap-2.5">
                <SocialAvatar member={m} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-phronis-foreground">{memberLabel(m)}</p>
                  <p className="truncate text-[11px] text-phronis-muted">{memberHandle(m)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {suggestions.length > 0 ? (
        <section className="rounded-2xl border border-white/10 bg-black/25 p-4">
          <h3 className="text-sm font-semibold text-phronis-foreground">People you may know</h3>
          <ul className="mt-3 space-y-3">
            {suggestions.slice(0, 4).map((m) => (
              <li key={m.id} className="flex items-center gap-2.5">
                <SocialAvatar member={m} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-phronis-foreground">{memberLabel(m)}</p>
                  <p className="truncate text-[11px] text-phronis-muted">{memberHandle(m)}</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 shrink-0 rounded-full border-white/15 px-2.5"
                  disabled={busy}
                  onClick={() => onAddFriend(m.id)}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                </Button>
              </li>
            ))}
          </ul>
          <button type="button" className="mt-3 w-full text-center text-xs font-medium text-phronis-teal hover:underline" onClick={() => onTabChange("discover")}>
            Browse directory
          </button>
        </section>
      ) : null}
    </aside>
  );
}
