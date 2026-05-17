"use client";

import { SignInModule } from "@/_components/auth/sign-in-module";

type Props = {
  redirectTo: string;
  errorMessage: string;
  successMessage: string;
};

/** @deprecated Use `SignInModule` — thin wrapper for `/sign-in` page. */
export function ConnectWalletGate({ redirectTo, errorMessage, successMessage }: Props) {
  return (
    <>
      <SignInModule redirectTo={redirectTo} errorMessage={errorMessage} />
      {successMessage ? (
        <p className="mt-4 whitespace-pre-line text-center text-sm text-phronis-teal">{successMessage}</p>
      ) : null}
    </>
  );
}
