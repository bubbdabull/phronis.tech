import type { ReactNode } from "react";

import { ComingSoonGate } from "@/_components/product/coming-soon-gate";

export default function DeskLayout(_props: { children: ReactNode }) {
  return <ComingSoonGate product="terminal" />;
}
