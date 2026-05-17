import type { ReactNode } from "react";

import { DashboardShell } from "@/_components/dashboard/dashboard-shell";
import { ProtectedRoute } from "@/_components/onboarding/protected-route";

export default function DashboardGroupLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <DashboardShell>{children}</DashboardShell>
    </ProtectedRoute>
  );
}
