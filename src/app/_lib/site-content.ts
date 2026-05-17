import type {
  ComparisonRow,
  IdealClientItem,
  NavLink,
  ProcessStep,
  ServiceItem,
  TrustHighlight,
} from "@/_types/content";

export const SITE: Readonly<{
  name: string;
  legalName: string;
  tagline: string;
  description: string;
  url: string;
  contactEmail: string;
}> = {
  name: "Phronis",
  legalName: "Phronis Inc.",
  tagline:
    "We design and build software for companies that want to use blockchain—apps, automated rules, and operations your team can understand.",
  description:
    "Phronis Inc. delivers product design, applications, and on-network (“blockchain”) logic for businesses. We work with your legal and security stakeholders. We are a technology vendor, not an investment or trading service, and we do not hold customer money for trading.",
  url: "https://phronis.tech",
  contactEmail: "contact@phronis.tech",
};

/** Official community links (footer, support, etc.). */
export const SITE_SOCIAL_LINKS: readonly { id: string; label: string; href: string }[] = [
  { id: "social-x", label: "X", href: "https://x.com/PhronisInc" },
  { id: "social-discord", label: "Discord", href: "https://discord.gg/R3JjB4SDpM" },
  { id: "social-whatsapp", label: "WhatsApp", href: "https://api.whatsapp.com/message/VHE46DLMNE5DC1" },
] as const;

/** Geographic and client posture — use in hero, trust, and metadata-aligned copy. */
export const GEOGRAPHIC_POSITIONING: string =
  "We work with companies in the U.S. and internationally—mostly remote, with scheduled overlap for reviews and launches.";

/**
 * Primary navigation — Business vs Members; contact lives on the business page.
 */
export const NAV_LINKS: readonly NavLink[] = [
  { id: "nav-business", label: "Business", href: "/business" },
  { id: "nav-members", label: "Members", href: "/members" },
  { id: "nav-contact", label: "Contact", href: "/business#contact" },
] as const;

/** Homepage + business page anchors (footer). */
export const FOOTER_HOME_ANCHORS: readonly NavLink[] = [
  { id: "foot-services", label: "Services", href: "/business#services" },
  { id: "foot-trust", label: "How we work", href: "/business#trust" },
  { id: "foot-diff", label: "Why Phronis", href: "/business#differentiation" },
  { id: "foot-process", label: "Process", href: "/business#process" },
  { id: "foot-members", label: "Member hub", href: "/members" },
  { id: "foot-contact", label: "Contact", href: "/business#contact" },
] as const;

export const SERVICES_SECTION = {
  title: "What we can help with",
  description:
    "You can hire us for one piece of the puzzle or for an end-to-end build. Either way you get plain-language specs, visible progress, and documentation finance and risk teams can follow—even if they are new to blockchain.",
} as const;

export const TRUST_SECTION = {
  kicker: "How we work",
  title: "Design, code, and blockchain stay in sync",
  intro:
    "Many initiatives struggle when designers, app developers, and the on-network rules drift apart. We plan as one team so what customers see matches what the system actually allows—shared checklists for design, software, and release.",
  systemIntegrity:
    "You receive diagrams, test plans, notes on environments, and a history of changes. We are not a law firm or an audit firm—we organize facts so yours can review faster.",
} as const;

export const TRUST_HIGHLIGHTS: readonly TrustHighlight[] = [
  {
    id: "trust-product-design",
    title: "Product design & customer experience",
    description:
      "Layouts, components, and flows for web and mobile—including clear screens for logins, confirmations, and errors so end users are not left guessing.",
  },
  {
    id: "trust-smart-contracts",
    title: "Automated rules on the network",
    description:
      "The programs that enforce ownership, limits, and releases of digital items—built with testing and change control so behavior is predictable.",
  },
  {
    id: "trust-software-ops",
    title: "Apps, data, and day-to-day operations",
    description:
      "Back-office software, dashboards, alerts, and update routines so going live is rehearsed and keeping the system healthy is routine—not a scramble.",
  },
] as const;

export const SERVICES: readonly ServiceItem[] = [
  {
    id: "svc-web3-design",
    title: "Product & website design",
    description:
      "Customer-facing screens and marketing pages that look credible and are easy to use—including flows for signing in, confirming actions, and recovering from mistakes.",
    stack: [
      "Reusable components aligned with your brand",
      "Clear wording for confirmations and errors (no insider jargon)",
      "Layouts that work on phones first, then desktop",
    ],
    accent: "electric",
  },
  {
    id: "svc-smart-contracts",
    title: "Automated rules on the blockchain",
    description:
      "The programs that enforce who can create, move, or freeze digital items—written, tested, and released with the same discipline as any critical business software.",
    stack: [
      "Peer review and automated checks before anything reaches production",
      "Separate test and live environments so changes are deliberate",
      "Plain-English summaries alongside technical details for stakeholders",
    ],
    accent: "teal",
  },
  {
    id: "svc-token-deploy",
    title: "Digital assets & supply controls",
    description:
      "Launching or managing a digital asset your program defines—schedules, caps, recipient lists, and simple reporting so finance can reconcile what exists on the network.",
    stack: [
      "Tables of who can do what, written for non-developers",
      "Tools for distributions, claims, or allocations with an audit trail",
      "Dashboards for balances and activity after launch",
    ],
    accent: "violet",
  },
  {
    id: "svc-dapp-fullstack",
    title: "Customer apps & internal tools",
    description:
      "Modern web applications and back-office panels: sign-in, permissions, queues for background work, and the day-to-day screens operators use to run the business.",
    stack: [
      "Shared definitions between what users see and what the server enforces",
      "Role-based access for staff, partners, and reviewers",
      "Gradual rollouts for higher-risk changes",
    ],
    accent: "slate",
  },
  {
    id: "svc-integrations",
    title: "Logins, wallets, and partner connections",
    description:
      "Hooking your product up to identity providers, hardware keys, hosted wallet services, or custodians—always with clear error handling and logging your security team can review.",
    stack: [
      "Security review of how keys and sessions are handled",
      "Support for more than one network when your roadmap requires it",
      "Mobile-friendly screens for approvals on the go",
    ],
    accent: "amber",
  },
  {
    id: "svc-data-indexing",
    title: "Reports, dashboards, and data feeds",
    description:
      "Turning raw network activity into numbers and charts your product and finance teams can trust—exports, alerts, and APIs to other systems you already use.",
    stack: [
      "Rebuilds and checks so numbers stay accurate if the network reorganizes",
      "Alerts when feeds fall behind or error rates spike",
      "Signed notifications to treasury or accounting systems when needed",
    ],
    accent: "electric",
  },
  {
    id: "svc-security-launch",
    title: "Testing & launch rehearsals",
    description:
      "Structured reviews, dependency checks, practice launches in a sandbox, and optional coordination with outside auditors you select before opening to the public.",
    stack: [
      "Workshops that map where value moves and what could go wrong",
      "Checklists for key handoffs, pauses, and emergency stops",
      "Status pages and communication templates for launch week",
    ],
    accent: "teal",
  },
  {
    id: "svc-sustain",
    title: "Ongoing updates & support",
    description:
      "After launch: planned upgrades, bug fixes within agreed windows, incident response, and small changes to rules or parameters with change control your governance expects.",
    stack: [
      "Regular planning with your product and engineering leads",
      "Written runbooks for upgrades and common incidents",
      "Capacity planning when traffic or new networks enter the picture",
    ],
    accent: "violet",
  },
] as const;

export const DIFFERENTIATION_ROWS: readonly ComparisonRow[] = [
  {
    id: "cmp-01",
    conventional: "Pretty screens that do not match what the system actually allows",
    phronis:
      "Design and engineering review together so customer promises stay inside real limits and costs",
  },
  {
    id: "cmp-02",
    conventional: "One overloaded developer juggling everything at once",
    phronis:
      "Small senior teams for interface, on-network rules, and infrastructure—with one shared release plan",
  },
  {
    id: "cmp-03",
    conventional: "Big launch day, then confusion when something breaks later",
    phronis:
      "Monitoring, written procedures, and scheduled updates so day-two operations feel like a mature product company",
  },
] as const;

export const PROCESS_STEPS: readonly ProcessStep[] = [
  {
    id: "proc-01",
    order: "01",
    title: "Discovery & written plan",
    description:
      "We learn who the users are, what “success” means, and any constraints from legal, finance, or security. You get a short written proposal—with options—before heavy build work starts.",
  },
  {
    id: "proc-02",
    order: "02",
    title: "Design the experience",
    description:
      "Wireframes through polished UI and written interaction notes so builders are not guessing. Payment, login, and confirmation flows are treated as first-class, not an afterthought.",
  },
  {
    id: "proc-03",
    order: "03",
    title: "Build the on-network rules",
    description:
      "Implement and test the automated rules that live on the blockchain, aligned with who is allowed to move value or change settings. Promotion to live is scripted and repeatable.",
  },
  {
    id: "proc-04",
    order: "04",
    title: "Build the applications & connections",
    description:
      "Customer apps, internal tools, and integrations to partners or data vendors—with clear responsibilities when a dependency fails.",
  },
  {
    id: "proc-05",
    order: "05",
    title: "Quality checks & dress rehearsal",
    description:
      "Practice in a test environment, fix issues, and loop in outside reviewers if you want an extra set of eyes on sensitive areas.",
  },
  {
    id: "proc-06",
    order: "06",
    title: "Go live & handoff (or stay on retainer)",
    description:
      "Controlled production launch, monitoring, and a package so your staff can operate—or an ongoing agreement for us to keep shipping improvements.",
  },
] as const;

export const IDEAL_CLIENTS: readonly IdealClientItem[] = [
  {
    id: "ideal-01",
    title: "Startups shipping a new digital product",
    description:
      "You need speed but also a story investors and partners can trust—clear specs, visible milestones, and demos that match reality.",
  },
  {
    id: "ideal-02",
    title: "Established companies testing blockchain",
    description:
      "You have procurement, security, and legal habits already; you need a vendor who speaks normal business language and respects your process.",
  },
  {
    id: "ideal-03",
    title: "Teams that launched and need to grow safely",
    description:
      "You have live users and need new features, extra networks, or a cleaner experience without stopping the business.",
  },
  {
    id: "ideal-04",
    title: "Agencies that need a specialist partner",
    description:
      "You want senior help for part of a build—clear milestones, readable repos, and documentation your client can keep.",
  },
] as const;
