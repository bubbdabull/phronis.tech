import type { ReactNode } from "react";

import { TerminalMemberShell } from "@/_features/member-hub/terminal-member-shell";

export default function MemberHubLayout({ children }: { children: ReactNode }) {
  return <TerminalMemberShell>{children}</TerminalMemberShell>;
}
