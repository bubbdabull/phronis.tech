import type { Metadata } from "next";

import { DeskSectionPlaceholder } from "@/_features/member-desk/desk-section-placeholder";

export const metadata: Metadata = {
  title: "Admin",
  description: "Operator tools — roles, moderation, announcements.",
  robots: { index: false, follow: false },
};

export default function DeskAdminPage() {
  return (
    <div className="space-y-4">
      <DeskSectionPlaceholder
        title="Admin panel (gated)"
        accent="amber"
        bullets={[
          "Gate routes with member_admin_roles (service role lookup after Privy auth).",
          "Ban flow: flag members + disconnect sessions; log to admin_audit_log.",
          "Feature tokens / narratives; schedule announcements; analytics dashboard.",
        ]}
      />
      <p className="text-xs text-phronis-muted">
        No role check in this scaffold—add server verification before exposing destructive tools.
      </p>
    </div>
  );
}
