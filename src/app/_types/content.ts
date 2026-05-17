export interface NavLink {
  readonly id: string;
  readonly label: string;
  readonly href: string;
}

export type ServiceAccent = "electric" | "teal" | "violet" | "slate" | "amber";

export interface ServiceItem {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly stack: readonly string[];
  readonly accent: ServiceAccent;
}

export interface TrustHighlight {
  readonly id: string;
  readonly title: string;
  readonly description: string;
}

export interface ComparisonRow {
  readonly id: string;
  /** Speculative or reach-first launch habit contrasted with Phronis (left column). */
  readonly conventional: string;
  readonly phronis: string;
}

export interface ProcessStep {
  readonly id: string;
  readonly order: string;
  readonly title: string;
  readonly description: string;
}

export interface IdealClientItem {
  readonly id: string;
  readonly title: string;
  readonly description: string;
}
