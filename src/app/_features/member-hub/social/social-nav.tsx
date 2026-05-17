"use client";

import { Compass, Home, MessageSquare, Users } from "lucide-react";

import { cn } from "@/_lib/utils";

export type SocialTab = "home" | "friends" | "messages" | "discover";

type Item = { id: SocialTab; label: string; icon: typeof Home };

const ITEMS: Item[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "friends", label: "Friends", icon: Users },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "discover", label: "Discover", icon: Compass },
];

type Props = {
  active: SocialTab;
  incomingCount: number;
  onChange: (tab: SocialTab) => void;
  className?: string;
};

export function SocialNav({ active, incomingCount, onChange, className }: Props) {
  return (
    <nav className={cn("space-y-1", className)} aria-label="Social">
      <p className="mb-3 px-3 text-lg font-bold tracking-tight text-phronis-foreground">Social</p>
      {ITEMS.map(({ id, label, icon: Icon }) => {
        const isActive = active === id;
        const badge = id === "friends" && incomingCount > 0 ? incomingCount : 0;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors",
              isActive
                ? "bg-phronis-teal/15 text-phronis-teal"
                : "text-phronis-muted hover:bg-white/5 hover:text-phronis-foreground",
            )}
          >
            <Icon className="h-5 w-5 shrink-0" aria-hidden />
            <span className="flex-1">{label}</span>
            {badge > 0 ? (
              <span className="min-w-[1.25rem] rounded-full bg-phronis-teal px-1.5 py-0.5 text-center text-[10px] font-bold text-phronis-void">
                {badge > 9 ? "9+" : badge}
              </span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}

export function SocialMobileNav({ active, incomingCount, onChange }: Omit<Props, "className">) {
  return (
    <div className="flex gap-1 overflow-x-auto rounded-xl border border-white/10 bg-black/30 p-1 scrollbar-none">
      {ITEMS.map(({ id, label, icon: Icon }) => {
        const isActive = active === id;
        const badge = id === "friends" && incomingCount > 0;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={cn(
              "relative flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors sm:text-sm",
              isActive ? "bg-white/12 text-phronis-teal" : "text-phronis-muted hover:bg-white/5 hover:text-phronis-foreground",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {label}
            {badge ? <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-phronis-teal" aria-hidden /> : null}
          </button>
        );
      })}
    </div>
  );
}

