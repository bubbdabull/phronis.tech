"use client";

import { Suspense } from "react";

import { MemberAuthPanel } from "@/_components/auth/member-auth-panel";
import { MemberAuthCard } from "@/_components/auth/member-auth-card";
import type { MemberAuthMode } from "@/_lib/auth/member-auth-constants";

type Props = {
  initialMode?: MemberAuthMode;
  errorMessage?: string;
};

function MembersAuthSectionInner({ initialMode, errorMessage }: Props) {
  return (
    <MemberAuthCard
      title="Get started"
      description="Join with your name and email, or sign in if you already have an account. When you're done, you'll land in your member hub."
    >
      <MemberAuthPanel initialMode={initialMode} errorMessage={errorMessage} />
    </MemberAuthCard>
  );
}

export function MembersAuthSection(props: Props) {
  return (
    <Suspense
      fallback={
        <MemberAuthCard title="Get started" description="Loading sign-in…">
          <p className="text-sm text-phronis-muted">Loading…</p>
        </MemberAuthCard>
      }
    >
      <MembersAuthSectionInner {...props} />
    </Suspense>
  );
}
