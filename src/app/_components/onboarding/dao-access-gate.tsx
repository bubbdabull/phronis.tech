"use client";

import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";

import { Button } from "@/_components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/_components/ui/card";

type GateState = "loading" | "ok" | "locked";

export function DAOAccessGate({ children }: { children: ReactNode }) {
  const { getAccessToken } = usePrivy();
  const [state, setState] = useState<GateState>("loading");
  const [detail, setDetail] = useState<{ phr: number; min: number } | null>(null);

  const check = useCallback(async () => {
    setState("loading");
    try {
      const token = await getAccessToken();
      if (!token) {
        setState("locked");
        return;
      }
      const res = await fetch("/api/dao/access", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const json = (await res.json()) as {
        ok?: boolean;
        allowed?: boolean;
        phronisBalance?: number;
        minRequired?: number;
      };
      if (json.ok && json.allowed) {
        setState("ok");
        setDetail(null);
      } else {
        setState("locked");
        setDetail({ phr: json.phronisBalance ?? 0, min: json.minRequired ?? 0 });
      }
    } catch {
      setState("locked");
    }
  }, [getAccessToken]);

  useEffect(() => {
    void check();
  }, [check]);

  if (state === "loading") {
    return (
      <div className="flex min-h-[30vh] items-center justify-center text-sm text-phronis-muted" role="status">
        Checking PHR balance…
      </div>
    );
  }

  if (state === "locked") {
    return (
      <Card className="mx-auto max-w-lg border-amber-500/25 bg-amber-500/[0.06]">
        <CardHeader>
          <CardTitle className="text-amber-100/90">DAO access locked</CardTitle>
          <CardDescription className="text-amber-100/70">
            Hold at least the configured PHR balance to open governance and treasury tools. Current balance:{" "}
            <span className="font-mono text-phronis-foreground">{detail?.phr.toLocaleString() ?? "—"}</span> · Required:{" "}
            <span className="font-mono">{detail?.min.toLocaleString() ?? "—"}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" className="border-white/20" onClick={() => void check()}>
            Refresh check
          </Button>
          <Button asChild className="bg-phronis-teal text-phronis-void hover:opacity-90">
            <Link href="/member">Go to member hub</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}
