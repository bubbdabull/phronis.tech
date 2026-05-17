"use client";

import { usePrivy } from "@privy-io/react-auth";
import { RefreshCw, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { SocialAvatar } from "@/_features/member-hub/social/social-avatar";
import { SocialFeedPanel } from "@/_features/member-hub/social/social-feed-panel";
import { SocialMobileNav, SocialNav, type SocialTab } from "@/_features/member-hub/social/social-nav";
import { SocialSidebar } from "@/_features/member-hub/social/social-sidebar";
import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import { Label } from "@/_components/ui/label";
import { Textarea } from "@/_components/ui/textarea";
import type { MemberLite } from "@/_lib/member-social-types";
import { memberHandle, memberLabel } from "@/_lib/member-social-types";
import { cn } from "@/_lib/utils";

type FriendReq = {
  id: string;
  from_member_id: string;
  to_member_id: string;
  status: string;
  created_at: string;
  from?: MemberLite | null;
  to?: MemberLite | null;
};

type GroupRow = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  membership?: { role: string; joined_at: string } | null;
};

type ChatMsg = {
  id: string;
  member_id: string;
  body: string;
  created_at: string;
  authorLabel?: string;
};

type FriendsView = "connections" | "requests";

const TAB_TITLES: Record<SocialTab, string> = {
  home: "Home",
  friends: "Friends",
  messages: "Messages",
  discover: "Discover",
};

export function MemberSocialHub() {
  const { getAccessToken } = usePrivy();
  const [tab, setTab] = useState<SocialTab>("home");
  const [friendsView, setFriendsView] = useState<FriendsView>("connections");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [feedRefresh, setFeedRefresh] = useState(0);

  const authHeaders = useCallback(async () => {
    const bearer = await getAccessToken();
    if (!bearer) throw new Error("missing_token");
    return { Authorization: `Bearer ${bearer}`, "Content-Type": "application/json" } as const;
  }, [getAccessToken]);

  const [q, setQ] = useState("");
  const [tier, setTier] = useState("");
  const [directory, setDirectory] = useState<MemberLite[]>([]);

  const loadDirectory = useCallback(async () => {
    setErr(null);
    try {
      const h = await authHeaders();
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (tier) params.set("tier", tier);
      const res = await fetch(`/api/members/social/directory?${params}`, { headers: h });
      const json = (await res.json()) as { ok?: boolean; members?: MemberLite[]; error?: string };
      if (!res.ok || !json.ok) {
        setErr(json.error ?? "Could not load directory");
        return;
      }
      setDirectory(json.members ?? []);
    } catch {
      setErr("Network error");
    }
  }, [authHeaders, q, tier]);

  const [friends, setFriends] = useState<MemberLite[]>([]);
  const loadFriends = useCallback(async () => {
    setErr(null);
    try {
      const h = await authHeaders();
      const res = await fetch("/api/members/social/friends", { headers: h });
      const json = (await res.json()) as { ok?: boolean; friends?: MemberLite[]; error?: string };
      if (!res.ok || !json.ok) {
        setErr(json.error ?? "Could not load friends");
        return;
      }
      setFriends(json.friends ?? []);
    } catch {
      setErr("Network error");
    }
  }, [authHeaders]);

  const [incoming, setIncoming] = useState<FriendReq[]>([]);
  const [outgoing, setOutgoing] = useState<FriendReq[]>([]);
  const loadRequests = useCallback(async () => {
    setErr(null);
    try {
      const h = await authHeaders();
      const res = await fetch("/api/members/social/requests", { headers: h });
      const json = (await res.json()) as { ok?: boolean; incoming?: FriendReq[]; outgoing?: FriendReq[]; error?: string };
      if (!res.ok || !json.ok) {
        setErr(json.error ?? "Could not load requests");
        return;
      }
      setIncoming(json.incoming ?? []);
      setOutgoing(json.outgoing ?? []);
    } catch {
      setErr("Network error");
    }
  }, [authHeaders]);

  const [groups, setGroups] = useState<GroupRow[]>([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [joinId, setJoinId] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [draft, setDraft] = useState("");

  const loadGroups = useCallback(async () => {
    setErr(null);
    try {
      const h = await authHeaders();
      const res = await fetch("/api/members/social/groups", { headers: h });
      const json = (await res.json()) as { ok?: boolean; groups?: GroupRow[]; error?: string };
      if (!res.ok || !json.ok) {
        setErr(json.error ?? "Could not load rooms");
        return;
      }
      setGroups(json.groups ?? []);
    } catch {
      setErr("Network error");
    }
  }, [authHeaders]);

  const loadMessages = useCallback(
    async (groupId: string) => {
      setErr(null);
      try {
        const h = await authHeaders();
        const res = await fetch(`/api/members/social/groups/${groupId}/messages?limit=40`, { headers: h });
        const json = (await res.json()) as { ok?: boolean; messages?: ChatMsg[]; error?: string };
        if (!res.ok || !json.ok) {
          setErr(json.error ?? "Could not load messages");
          return;
        }
        setMessages([...(json.messages ?? [])].reverse());
      } catch {
        setErr("Network error");
      }
    },
    [authHeaders],
  );

  useEffect(() => {
    void loadFriends();
    void loadRequests();
    const params = new URLSearchParams();
    params.set("limit", "12");
    void (async () => {
      try {
        const h = await authHeaders();
        const res = await fetch(`/api/members/social/directory?${params}`, { headers: h });
        const json = (await res.json()) as { ok?: boolean; members?: MemberLite[] };
        if (res.ok && json.ok) setDirectory(json.members ?? []);
      } catch {
        /* sidebar suggestions are optional */
      }
    })();
  }, [authHeaders, loadFriends, loadRequests]);

  useEffect(() => {
    if (tab === "discover") void loadDirectory();
    if (tab === "friends") {
      void loadFriends();
      void loadRequests();
    }
    if (tab === "messages") void loadGroups();
  }, [tab, loadDirectory, loadFriends, loadRequests, loadGroups]);

  useEffect(() => {
    if (selectedGroupId) void loadMessages(selectedGroupId);
  }, [selectedGroupId, loadMessages]);

  const friendIds = useMemo(() => new Set(friends.map((f) => f.id)), [friends]);
  const suggestions = useMemo(() => directory.filter((m) => !friendIds.has(m.id)).slice(0, 8), [directory, friendIds]);

  const sendFriend = async (to_member_id: string) => {
    setBusy(true);
    setErr(null);
    try {
      const h = await authHeaders();
      const res = await fetch("/api/members/social/requests", { method: "POST", headers: h, body: JSON.stringify({ to_member_id }) });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setErr(json.error ?? "Request failed");
        return;
      }
      await loadRequests();
      setTab("friends");
      setFriendsView("requests");
    } catch {
      setErr("Network error");
    } finally {
      setBusy(false);
    }
  };

  const patchRequest = async (id: string, action: "accept" | "decline" | "cancel") => {
    setBusy(true);
    setErr(null);
    try {
      const h = await authHeaders();
      const res = await fetch(`/api/members/social/requests/${id}`, {
        method: "PATCH",
        headers: h,
        body: JSON.stringify({ action }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setErr(json.error ?? "Update failed");
        return;
      }
      await loadRequests();
      await loadFriends();
    } catch {
      setErr("Network error");
    } finally {
      setBusy(false);
    }
  };

  const createGroup = async () => {
    if (!newGroupName.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      const h = await authHeaders();
      const res = await fetch("/api/members/social/groups", {
        method: "POST",
        headers: h,
        body: JSON.stringify({ name: newGroupName.trim(), description: newGroupDesc.trim() || null }),
      });
      const json = (await res.json()) as { ok?: boolean; group?: GroupRow; error?: string };
      if (!res.ok || !json.ok) {
        setErr(json.error ?? "Create failed");
        return;
      }
      setNewGroupName("");
      setNewGroupDesc("");
      await loadGroups();
      if (json.group?.id) setSelectedGroupId(json.group.id);
    } catch {
      setErr("Network error");
    } finally {
      setBusy(false);
    }
  };

  const joinGroup = async () => {
    const id = joinId.trim();
    if (!id) return;
    setBusy(true);
    setErr(null);
    try {
      const h = await authHeaders();
      const res = await fetch(`/api/members/social/groups/${id}/join`, { method: "POST", headers: h });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setErr(json.error ?? "Join failed");
        return;
      }
      setJoinId("");
      await loadGroups();
      setSelectedGroupId(id);
    } catch {
      setErr("Network error");
    } finally {
      setBusy(false);
    }
  };

  const sendMessage = async () => {
    if (!selectedGroupId || !draft.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      const h = await authHeaders();
      const res = await fetch(`/api/members/social/groups/${selectedGroupId}/messages`, {
        method: "POST",
        headers: h,
        body: JSON.stringify({ body: draft.trim() }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setErr(json.error ?? "Send failed");
        return;
      }
      setDraft("");
      await loadMessages(selectedGroupId);
    } catch {
      setErr("Network error");
    } finally {
      setBusy(false);
    }
  };

  const selectedGroup = groups.find((g) => g.id === selectedGroupId);

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-4 xl:hidden">
        <SocialMobileNav active={tab} incomingCount={incoming.length} onChange={setTab} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)_280px]">
        <SocialNav
          active={tab}
          incomingCount={incoming.length}
          onChange={setTab}
          className="sticky top-20 hidden self-start xl:block"
        />

        <main className="min-w-0 space-y-4">
          <header className="sticky top-0 z-10 -mx-1 border-b border-white/10 bg-phronis-void/90 px-1 py-3 backdrop-blur-md">
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-xl font-bold text-phronis-foreground">{TAB_TITLES[tab]}</h1>
              {tab === "home" ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-phronis-muted"
                  onClick={() => setFeedRefresh((k) => k + 1)}
                >
                  <RefreshCw className="mr-1.5 h-4 w-4" />
                  Refresh
                </Button>
              ) : null}
            </div>
          </header>

          {err ? (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200/90" role="alert">
              {err}
            </p>
          ) : null}

          {tab === "home" ? (
            <SocialFeedPanel busy={busy} authHeaders={authHeaders} onBusyChange={setBusy} refreshKey={feedRefresh} />
          ) : null}

          {tab === "discover" ? (
            <section className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="relative flex-1 space-y-1.5">
                    <Label htmlFor="dir-q" className="text-phronis-muted">
                      Search members
                    </Label>
                    <Search className="pointer-events-none absolute left-3 top-[2.15rem] h-4 w-4 text-phronis-muted" aria-hidden />
                    <Input
                      id="dir-q"
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") void loadDirectory();
                      }}
                      placeholder="Username or display name"
                      className="border-white/15 bg-black/30 pl-9"
                    />
                  </div>
                  <div className="w-full space-y-1.5 sm:w-32">
                    <Label htmlFor="dir-tier">Tier</Label>
                    <select
                      id="dir-tier"
                      value={tier}
                      onChange={(e) => setTier(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-white/15 bg-black/30 px-3 text-sm text-phronis-foreground"
                    >
                      <option value="">Any</option>
                      <option value="L1">L1</option>
                      <option value="L2">L2</option>
                      <option value="L3">L3</option>
                    </select>
                  </div>
                  <Button type="button" variant="secondary" className="border-white/15 bg-white/5" onClick={() => void loadDirectory()} disabled={busy}>
                    Search
                  </Button>
                </div>
              </div>

              <ul className="space-y-2">
                {directory.length === 0 ? (
                  <li className="rounded-2xl border border-dashed border-white/15 px-6 py-12 text-center text-sm text-phronis-muted">
                    No members found — try another search or clear filters.
                  </li>
                ) : (
                  directory.map((m) => (
                    <li
                      key={m.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 sm:px-5"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <SocialAvatar member={m} size={48} />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-phronis-foreground">{memberLabel(m)}</p>
                          <p className="truncate text-xs text-phronis-muted">
                            {memberHandle(m)}
                            {m.membership_tier ? ` · ${m.membership_tier}` : ""}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        className="rounded-full bg-phronis-teal font-semibold text-phronis-void hover:opacity-90"
                        disabled={busy || friendIds.has(m.id)}
                        onClick={() => void sendFriend(m.id)}
                      >
                        {friendIds.has(m.id) ? "Friends" : "Add friend"}
                      </Button>
                    </li>
                  ))
                )}
              </ul>
            </section>
          ) : null}

          {tab === "friends" ? (
            <section className="space-y-4">
              <div className="flex gap-1 rounded-xl border border-white/10 bg-black/25 p-1">
                {(
                  [
                    { id: "connections" as const, label: "Connections" },
                    { id: "requests" as const, label: `Requests${incoming.length ? ` (${incoming.length})` : ""}` },
                  ] as const
                ).map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setFriendsView(v.id)}
                    className={cn(
                      "flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:text-sm",
                      friendsView === v.id ? "bg-white/12 text-phronis-teal" : "text-phronis-muted hover:bg-white/5",
                    )}
                  >
                    {v.label}
                  </button>
                ))}
              </div>

              {friendsView === "connections" ? (
                <ul className="space-y-2">
                  {friends.length === 0 ? (
                    <li className="rounded-2xl border border-dashed border-white/15 px-6 py-12 text-center text-sm text-phronis-muted">
                      No connections yet — find people in Discover.
                    </li>
                  ) : (
                    friends.map((m) => (
                      <li key={m.id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                        <SocialAvatar member={m} size={48} />
                        <div className="min-w-0">
                          <p className="font-semibold text-phronis-foreground">{memberLabel(m)}</p>
                          <p className="text-xs text-phronis-muted">{memberHandle(m)}</p>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <h2 className="text-sm font-semibold text-phronis-foreground">Incoming</h2>
                    <div className="mt-3 space-y-2">
                      {incoming.length === 0 ? (
                        <p className="text-sm text-phronis-muted">No pending requests.</p>
                      ) : (
                        incoming.map((r) => (
                          <div key={r.id} className="flex flex-col gap-2 rounded-xl border border-white/10 p-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2">
                              {r.from ? <SocialAvatar member={r.from} size={36} /> : null}
                              <span className="text-sm">{r.from ? memberLabel(r.from) : r.from_member_id}</span>
                            </div>
                            <div className="flex gap-2">
                              <Button type="button" size="sm" className="rounded-full bg-phronis-teal text-phronis-void" disabled={busy} onClick={() => void patchRequest(r.id, "accept")}>
                                Accept
                              </Button>
                              <Button type="button" size="sm" variant="outline" className="rounded-full border-white/15" disabled={busy} onClick={() => void patchRequest(r.id, "decline")}>
                                Decline
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <h2 className="text-sm font-semibold text-phronis-foreground">Sent</h2>
                    <div className="mt-3 space-y-2">
                      {outgoing.length === 0 ? (
                        <p className="text-sm text-phronis-muted">No outgoing invites.</p>
                      ) : (
                        outgoing.map((r) => (
                          <div key={r.id} className="flex flex-col gap-2 rounded-xl border border-white/10 p-3 sm:flex-row sm:items-center sm:justify-between">
                            <span className="text-sm">→ {r.to ? memberLabel(r.to) : r.to_member_id}</span>
                            <Button type="button" size="sm" variant="outline" className="rounded-full border-white/15" disabled={busy} onClick={() => void patchRequest(r.id, "cancel")}>
                              Cancel
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </section>
          ) : null}

          {tab === "messages" ? (
            <div className="grid gap-4 lg:grid-cols-[minmax(0,280px)_1fr]">
              <div className="space-y-4 rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="space-y-2">
                  <Label>New study room</Label>
                  <Input value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} className="border-white/15 bg-black/40" placeholder="SOL fundamentals crew" />
                  <Textarea value={newGroupDesc} onChange={(e) => setNewGroupDesc(e.target.value)} className="border-white/15 bg-black/40" placeholder="Optional description" rows={2} />
                  <Button type="button" className="w-full rounded-full" disabled={busy || !newGroupName.trim()} onClick={() => void createGroup()}>
                    Create room
                  </Button>
                </div>
                <div className="space-y-2 border-t border-white/10 pt-4">
                  <Label>Join with ID</Label>
                  <div className="flex gap-2">
                    <Input value={joinId} onChange={(e) => setJoinId(e.target.value)} className="border-white/15 bg-black/40 font-mono text-xs" placeholder="uuid…" />
                    <Button type="button" variant="secondary" className="shrink-0 border-white/15" disabled={busy || !joinId.trim()} onClick={() => void joinGroup()}>
                      Join
                    </Button>
                  </div>
                </div>
                <ul className="max-h-[320px] space-y-1 overflow-y-auto">
                  {groups.map((g) => (
                    <li key={g.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedGroupId(g.id)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/5",
                          selectedGroupId === g.id && "bg-phronis-teal/15",
                        )}
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-phronis-teal">
                          {g.name.slice(0, 1).toUpperCase()}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">{g.name}</span>
                          <span className="block truncate text-[11px] text-phronis-muted">{g.membership?.role === "owner" ? "Owner" : "Member"}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex min-h-[420px] flex-col rounded-2xl border border-white/10 bg-black/30">
                <div className="border-b border-white/10 px-4 py-3">
                  <p className="font-semibold text-phronis-foreground">{selectedGroup?.name ?? "Select a room"}</p>
                  <p className="text-xs text-phronis-muted">{selectedGroup ? "Study room chat" : "Pick a room from the list"}</p>
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
                  {messages.length === 0 ? (
                    <p className="py-8 text-center text-sm text-phronis-muted">No messages yet — say hello.</p>
                  ) : (
                    messages.map((m) => (
                      <div key={m.id} className="flex gap-2">
                        <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-phronis-teal">
                          {(m.authorLabel ?? "M").slice(0, 1)}
                        </span>
                        <div className="min-w-0 flex-1 rounded-2xl bg-white/[0.06] px-3 py-2">
                          <p className="text-xs font-semibold text-phronis-teal/90">{m.authorLabel ?? "Member"}</p>
                          <p className="mt-0.5 whitespace-pre-wrap text-sm text-phronis-foreground">{m.body}</p>
                          <p className="mt-1 text-[10px] text-phronis-muted">{new Date(m.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="border-t border-white/10 p-4">
                  <div className="flex gap-2">
                    <input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="Message the room…"
                      disabled={!selectedGroupId}
                      className="min-w-0 flex-1 rounded-full border border-white/10 bg-black/40 px-4 py-2.5 text-sm outline-none focus:border-phronis-teal/40 disabled:opacity-50"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          void sendMessage();
                        }
                      }}
                    />
                    <Button type="button" className="rounded-full bg-phronis-teal text-phronis-void" disabled={busy || !selectedGroupId || !draft.trim()} onClick={() => void sendMessage()}>
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </main>

        <SocialSidebar
          friends={friends}
          suggestions={suggestions}
          incomingCount={incoming.length}
          busy={busy}
          onTabChange={setTab}
          onAddFriend={(id) => void sendFriend(id)}
          className="sticky top-20 hidden self-start xl:block"
        />
      </div>

      {tab === "home" && incoming.length > 0 ? (
        <div className="mt-4 xl:hidden">
          <SocialSidebar
            friends={friends}
            suggestions={suggestions}
            incomingCount={incoming.length}
            busy={busy}
            onTabChange={setTab}
            onAddFriend={(id) => void sendFriend(id)}
          />
        </div>
      ) : null}
    </div>
  );
}
