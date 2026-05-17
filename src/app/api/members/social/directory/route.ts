import { NextResponse } from "next/server";

import { requireMember } from "@/_lib/member-auth";

const SELECT = "id, username, display_name, avatar_url, membership_tier" as const;

type MemberRow = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  membership_tier: string | null;
};

function sortByDisplay(a: MemberRow, b: MemberRow) {
  const an = (a.display_name || a.username || "").toLowerCase();
  const bn = (b.display_name || b.username || "").toLowerCase();
  return an.localeCompare(bn);
}

/** Public-ish directory for finding other members (L2: auth + service role). Search uses separate ilike filters (no raw `.or()` patterns). */
export async function GET(request: Request) {
  const auth = await requireMember(request, { l3Route: "members_social_directory", l3Kind: "read" });
  if (auth instanceof NextResponse) return auth;

  const { supabase, member } = auth;
  const url = new URL(request.url);
  const qRaw = (url.searchParams.get("q") ?? "").trim().slice(0, 80);
  const tier = (url.searchParams.get("tier") ?? "").trim().toUpperCase();
  const esc = qRaw.replace(/%/g, "").replace(/_/g, "");

  const tierOk = tier === "L1" || tier === "L2" || tier === "L3" ? tier : null;

  const base = () => {
    let q = supabase.from("members").select(SELECT).neq("id", member.id);
    if (tierOk) {
      q = q.eq("membership_tier", tierOk);
    }
    return q;
  };

  let merged: MemberRow[] = [];

  if (esc.length >= 2) {
    const pat = `%${esc}%`;
    const [uRes, dRes] = await Promise.all([
      base().ilike("username", pat).order("display_name", { ascending: true }).limit(50),
      base().ilike("display_name", pat).order("display_name", { ascending: true }).limit(50),
    ]);
    if (uRes.error || dRes.error) {
      return NextResponse.json({ ok: false, error: "database_error" }, { status: 500 });
    }
    const map = new Map<string, MemberRow>();
    for (const row of [...(uRes.data ?? []), ...(dRes.data ?? [])] as MemberRow[]) {
      map.set(row.id, row);
    }
    merged = [...map.values()].sort(sortByDisplay).slice(0, 50);
  } else {
    const { data, error } = await base().order("display_name", { ascending: true }).limit(50);
    if (error) {
      return NextResponse.json({ ok: false, error: "database_error" }, { status: 500 });
    }
    merged = (data ?? []) as MemberRow[];
  }

  return NextResponse.json({ ok: true, members: merged });
}
