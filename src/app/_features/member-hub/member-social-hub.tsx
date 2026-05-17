"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/_components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/_components/ui/card";
import { Input } from "@/_components/ui/input";
import { Label } from "@/_components/ui/label";
import { Textarea } from "@/_components/ui/textarea";
import { cn } from "@/_lib/utils";

type Tab = "directory" | "friends" | "inbox" | "rooms";

type MemberLite = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  membership_tier: string | null;
};

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

export function MemberSocialHub() {
  const { getAccessToken } = usePrivy();
  const [tab, setTab] = useState<Tab>("directory");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
        setErr(json.error ?? "load_failed");
        return;
      }
      setDirectory(json.members ?? []);
    } catch {
      setErr("network");
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
        setErr(json.error ?? "load_failed");
        return;
      }
      setFriends(json.friends ?? []);
    } catch {
      setErr("network");
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
        setErr(json.error ?? "load_failed");
        return;
      }
      setIncoming(json.incoming ?? []);
      setOutgoing(json.outgoing ?? []);
    } catch {
      setErr("network");
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
        setErr(json.error ?? "load_failed");
        return;
      }
      setGroups(json.groups ?? []);
    } catch {
      setErr("network");
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
          setErr(json.error ?? "load_failed");
          return;
        }
        setMessages([...(json.messages ?? [])].reverse());
      } catch {
        setErr("network");
      }
    },
    [authHeaders],
  );

  useEffect(() => {
    if (tab === "directory") void loadDirectory();
    if (tab === "friends") void loadFriends();
    if (tab === "inbox") void loadRequests();
    if (tab === "rooms") void loadGroups();
  }, [tab, loadDirectory, loadFriends, loadRequests, loadGroups]);

  useEffect(() => {
    if (selectedGroupId) void loadMessages(selectedGroupId);
  }, [selectedGroupId, loadMessages]);

  const label = useCallback((m: MemberLite) => (m.display_name || m.username || "Member").trim() || "Member", []);

  const sendFriend = async (to_member_id: string) => {
    setBusy(true);
    setErr(null);
    try {
      const h = await authHeaders();
      const res = await fetch("/api/members/social/requests", { method: "POST", headers: h, body: JSON.stringify({ to_member_id }) });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setErr(json.error ?? "request_failed");
        return;
      }
      await loadRequests();
      setTab("inbox");
    } catch {
      setErr("network");
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
        setErr(json.error ?? "update_failed");
        return;
      }
      await loadRequests();
      await loadFriends();
    } catch {
      setErr("network");
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
        setErr(json.error ?? "create_failed");
        return;
      }
      setNewGroupName("");
      setNewGroupDesc("");
      await loadGroups();
      if (json.group?.id) {
        setSelectedGroupId(json.group.id);
      }
    } catch {
      setErr("network");
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
        setErr(json.error ?? "join_failed");
        return;
      }
      setJoinId("");
      await loadGroups();
      setSelectedGroupId(id);
    } catch {
      setErr("network");
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
        setErr(json.error ?? "send_failed");
        return;
      }
      setDraft("");
      await loadMessages(selectedGroupId);
    } catch {
      setErr("network");
    } finally {
      setBusy(false);
    }
  };

  const tabs = useMemo(
    () =>
      [
        { id: "directory" as const, label: "Find people" },
        { id: "friends" as const, label: "Friends" },
        { id: "inbox" as const, label: "Requests" },
        { id: "rooms" as const, label: "Study rooms" },
      ] as const,
    [],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1 rounded-xl border border-white/10 bg-black/25 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:text-sm",
              tab === t.id ? "bg-white/12 text-phronis-teal" : "text-phronis-muted hover:bg-white/5 hover:text-phronis-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {err ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200/90" role="alert">
          {err}
        </p>
      ) : null}

      {tab === "directory" ? (
        <Card className="border-white/10 bg-black/20">
          <CardHeader>
            <CardTitle className="text-base">Directory</CardTitle>
            <CardDescription>Search by username or display name. Tier filter is the product tier (not security L1–L3).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="dir-q">Search</Label>
                <Input id="dir-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. solana_handle" className="border-white/15 bg-black/30" />
              </div>
              <div className="w-full space-y-1.5 sm:w-36">
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
            <ul className="divide-y divide-white/10 rounded-lg border border-white/10">
              {directory.length === 0 ? (
                <li className="px-3 py-6 text-center text-sm text-phronis-muted">No members yet — try a shorter query or clear the tier filter.</li>
              ) : (
                directory.map((m) => (
                  <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-3 text-sm">
                    <div>
                      <p className="font-medium text-phronis-foreground">{label(m)}</p>
                      <p className="text-xs text-phronis-muted">
                        {m.username ? `@${m.username}` : m.id.slice(0, 8)}
                        {m.membership_tier ? ` · tier ${m.membership_tier}` : ""}
                      </p>
                    </div>
                    <Button type="button" size="sm" variant="outline" className="border-white/15" disabled={busy} onClick={() => void sendFriend(m.id)}>
                      Add friend
                    </Button>
                  </li>
                ))
              )}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      {tab === "friends" ? (
        <Card className="border-white/10 bg-black/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Friends</CardTitle>
              <CardDescription>Accepted connections — great for study accountability.</CardDescription>
            </div>
            <Button type="button" size="sm" variant="ghost" className="text-phronis-teal" onClick={() => void loadFriends()} disabled={busy}>
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-white/10 rounded-lg border border-white/10">
              {friends.length === 0 ? (
                <li className="px-3 py-6 text-center text-sm text-phronis-muted">No friends yet — send a request from the directory.</li>
              ) : (
                friends.map((m) => (
                  <li key={m.id} className="px-3 py-3 text-sm">
                    <p className="font-medium">{label(m)}</p>
                    <p className="text-xs text-phronis-muted">{m.username ? `@${m.username}` : m.id}</p>
                  </li>
                ))
              )}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      {tab === "inbox" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-white/10 bg-black/20">
            <CardHeader>
              <CardTitle className="text-base">Incoming</CardTitle>
              <CardDescription>Accept or decline — cancel is only on outgoing.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {incoming.length === 0 ? (
                <p className="text-sm text-phronis-muted">You&apos;re all caught up.</p>
              ) : (
                incoming.map((r) => (
                  <div key={r.id} className="flex flex-col gap-2 rounded-lg border border-white/10 p-3 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm">{r.from ? label(r.from as MemberLite) : r.from_member_id}</span>
                    <div className="flex gap-2">
                      <Button type="button" size="sm" className="bg-phronis-teal text-black hover:bg-phronis-teal/90" disabled={busy} onClick={() => void patchRequest(r.id, "accept")}>
                        Accept
                      </Button>
                      <Button type="button" size="sm" variant="outline" className="border-white/15" disabled={busy} onClick={() => void patchRequest(r.id, "decline")}>
                        Decline
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-black/20">
            <CardHeader>
              <CardTitle className="text-base">Outgoing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {outgoing.length === 0 ? (
                <p className="text-sm text-phronis-muted">No pending invites.</p>
              ) : (
                outgoing.map((r) => (
                  <div key={r.id} className="flex flex-col gap-2 rounded-lg border border-white/10 p-3 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm">→ {r.to ? label(r.to as MemberLite) : r.to_member_id}</span>
                    <Button type="button" size="sm" variant="outline" className="border-white/15" disabled={busy} onClick={() => void patchRequest(r.id, "cancel")}>
                      Cancel
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}

      {tab === "rooms" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-white/10 bg-black/20">
            <CardHeader>
              <CardTitle className="text-base">Your rooms</CardTitle>
              <CardDescription>Create a space or paste a group UUID someone shared.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>New room name</Label>
                <Input value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} className="border-white/15 bg-black/30" placeholder="SOL fundamentals crew" />
                <Textarea value={newGroupDesc} onChange={(e) => setNewGroupDesc(e.target.value)} className="border-white/15 bg-black/30" placeholder="Optional description" rows={2} />
                <Button type="button" disabled={busy || !newGroupName.trim()} onClick={() => void createGroup()}>
                  Create room
                </Button>
              </div>
              <div className="space-y-2 border-t border-white/10 pt-4">
                <Label>Join with group id</Label>
                <div className="flex gap-2">
                  <Input value={joinId} onChange={(e) => setJoinId(e.target.value)} className="border-white/15 bg-black/30 font-mono text-xs" placeholder="uuid…" />
                  <Button type="button" variant="secondary" className="border-white/15" disabled={busy || !joinId.trim()} onClick={() => void joinGroup()}>
                    Join
                  </Button>
                </div>
              </div>
              <ul className="divide-y divide-white/10 rounded-lg border border-white/10">
                {groups.map((g) => (
                  <li key={g.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedGroupId(g.id)}
                      className={cn(
                        "flex w-full flex-col items-start px-3 py-3 text-left text-sm transition-colors hover:bg-white/5",
                        selectedGroupId === g.id && "bg-white/8",
                      )}
                    >
                      <span className="font-medium">{g.name}</span>
                      <span className="text-xs text-phronis-muted">
                        {g.membership?.role === "owner" ? "Owner" : "Member"} · {g.id.slice(0, 8)}…
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-black/20">
            <CardHeader>
              <CardTitle className="text-base">Room chat</CardTitle>
              <CardDescription>{selectedGroupId ? `Group ${selectedGroupId.slice(0, 8)}…` : "Select a room"}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="max-h-[420px] space-y-2 overflow-y-auto rounded-lg border border-white/10 bg-black/40 p-3 font-mono text-xs">
                {messages.length === 0 ? (
                  <p className="text-phronis-muted">No messages yet.</p>
                ) : (
                  messages.map((m) => (
                    <div key={m.id} className="border-b border-white/5 pb-2 last:border-0">
                      <span className="text-phronis-teal/90">{m.authorLabel ?? "Member"}</span>
                      <span className="text-phronis-muted"> · {new Date(m.created_at).toLocaleString()}</span>
                      <p className="mt-1 whitespace-pre-wrap text-phronis-foreground">{m.body}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="space-y-2">
                <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} className="border-white/15 bg-black/30" placeholder="Drop a study prompt or trade thesis…" disabled={!selectedGroupId} />
                <Button type="button" disabled={busy || !selectedGroupId || !draft.trim()} onClick={() => void sendMessage()}>
                  Send
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
