"use client";

import { JoinModule } from "@/_components/auth/join-module";

type Props = {
  redirectTo: string;
  errorMessage: string;
};

/** @deprecated Use `JoinModule` — thin wrapper for `/join` page. */
export function JoinPhronisGate({ redirectTo, errorMessage }: Props) {
  return <JoinModule redirectTo={redirectTo} errorMessage={errorMessage} />;
}
