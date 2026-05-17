import { SEMESTER_06 } from "../semester-06";
import { lessonContent, sec, terms } from "./helpers";
import type { LessonReadContent } from "./types";

const lessonsById = Object.fromEntries(
  SEMESTER_06.modules.flatMap((m) => m.lessons).map((lesson) => [lesson.id, lesson]),
);

export const SEMESTER_06_CONTENT: Record<string, LessonReadContent> = {
  "s6-m1-l1": lessonContent(
    [
      sec(
        "Introduction",
        "Crypto and systems research papers are not marketing decks—they state problems, adversary models, theorems or benchmarks, and limits. Reading discipline separates durable ideas from hype: extract definitions, assumptions, and the gap between proved statements and shipped code.",
        "You will summarize papers in five sentences, list explicit and implicit assumptions, and explain why asymptotics mislead when constants dominate production.",
      ),
      sec(
        "Problem, Model, Result, Limits, Artifact",
        "Five-sentence summary template: (1) What problem? (2) What adversary and network model? (3) What is the main result or scheme? (4) What assumptions and costs? (5) What did authors not measure or implement? Crypto papers emphasize definitions first; systems papers emphasize workloads and failure modes—both need threat model discipline.",
        "Theorem vs implementation gap: a proof about an idealized protocol does not guarantee the Rust crate matches the spec. Trusted setup ceremonies for zkSNARKs, parameter generation, and side-channel free hardware are external to the PDF.",
      ),
      sec(
        "Assumptions and Benchmark Gaming",
        "Implicit assumptions include honest majority, synchronous network, rational profit-maximizing attackers, or absence of governance. Challenge each: does your deployment satisfy it? Benchmark gaming uses favorable hardware, omitted cold starts, or cherry-picked workloads—read setup sections skeptically.",
        "Proof systems zoo at brochure depth: SNARKs, STARKs, bulletproofs differ in trusted setup, proof size, prover time, and quantum resistance story. Know which property your product actually needs—privacy, succinctness, or both.",
      ),
      sec(
        "Annotated Bibliography Practice",
        "Pick a narrow topic (bridge security, MEV, oracle design) and cluster five serious papers or reports. Note conflicts: different adversary models yield opposite design advice. Mix venues—academic, industry labs, independent postmortems.",
        "Ask after each read: What would falsify this claim? What data would I need to reproduce the table? Who funded the work and what scope was excluded?",
      ),
      sec(
        "Practical Implications",
        "Build annotated bibliographies before designing capstones. Use five-sentence summaries in team reading groups. Flag asymptotic wins that hide 100× constant factors relevant at your scale.",
      ),
      sec(
        "Summary",
        "Paper literacy is threat-model literacy. Summarize rigorously, extract assumptions, separate theorems from repos, and read benchmarks as arguments—not truth. Cluster literature to see disagreements clearly.",
      ),
    ],
    terms(
      ["Threat model", "Explicit description of adversary powers and environment assumptions."],
      ["Trusted setup", "Ceremony generating parameters for some proof systems; compromise breaks soundness."],
      ["Theorem–implementation gap", "Difference between proved ideal protocol and deployed code."],
      ["Benchmark gaming", "Selective reporting making performance look better than holistic reality."],
      ["Adversary model", "Capabilities attributed to attackers in security proofs or analysis."],
    ),
    lessonsById["s6-m1-l1"],
  ),

  "s6-m1-l2": lessonContent(
    [
      sec(
        "Introduction",
        "On-chain data feels objective because it is public, but analysis inherits labeling heuristics, survivorship bias, and privacy ethics. Reproducibility means sharing queries, versioned datasets, and preregistered hypotheses—not screenshotting a Dune chart.",
        "List biases in dashboards, explain event decoding hazards, and propose preregistration for a simple public-data study.",
      ),
      sec(
        "Labels, Heuristics, and Survivorship",
        "Address labels ('Binance hot wallet') are often crowd-sourced heuristics with error rates. Mislabel propagates through every downstream chart. Survivorship bias appears when analyzing tokens that still exist—dead scams vanish from portfolios. Sybil actors inflate user counts and airdrop farming metrics.",
        "Event decoding requires correct ABIs; proxy upgrades change interfaces silently. Decimal mistakes recreate classic billion-dollar fiction on charts.",
      ),
      sec(
        "Preregistration and Ethics",
        "Preregister hypothesis, data sources, filters, success metrics, and stopping rules before peeking at results—reduces p-hacking analogs on-chain where many hypotheses can be tested cheaply. Ethical note: chain data can be pseudonymous PII when linked to real identities via exchanges or NFT profile pictures.",
        "When is chain data PII? When linkage to a person is practical. Responsible publishing aggregates or delays detail. Counterparties in trades have privacy interests even if addresses look random.",
      ),
      sec(
        "Failure Modes in Public Studies",
        "Expected failure modes: RPC incomplete archives, chain reorganizations affecting early blocks, MEV distorting 'user' trade prices, and seasonality around token launches. Document them in prereg appendices.",
        "Open data ethics: credit dataset curators, note license, avoid enabling harassment via doxxing dashboards.",
      ),
      sec(
        "Practical Implications",
        "Write a one-page prereg for a question answerable with public data. Version control SQL or notebook queries. Peer-run reproduction before citing numbers in capstone reports.",
      ),
      sec(
        "Summary",
        "Public data is not automatically science. Labels lie politely; survival bias flatters. Preregister, reproduce, and treat privacy and decoding hazards as first-class methods problems.",
      ),
    ],
    terms(
      ["Survivorship bias", "Analyzing only entities that lasted, omitting failed or delisted cases."],
      ["Heuristic label", "Best-guess address classification, often uncertain or outdated."],
      ["Preregistration", "Documenting analysis plan before viewing outcomes to limit bias."],
      ["Event decoding", "Parsing logs with ABIs; fragile across proxies and upgrades."],
      ["p-hacking", "Testing many hypotheses until one appears significant by chance."],
    ),
    lessonsById["s6-m1-l2"],
  ),

  "s6-m1-l3": lessonContent(
    [
      sec(
        "Introduction",
        "Zero-knowledge proofs let a prover convince a verifier that a statement is true without revealing why—while zkSNARKs also compress proofs to bytes verifiable quickly. 'ZK rollup' naming confuses newcomers because rollups use proofs for validity of execution, not necessarily privacy for users.",
        "Separate zero-knowledge from succinctness, explain verifier vs prover cost intuition, and name where trusted setup still appears in production systems.",
      ),
      sec(
        "What zk Proofs Buy You",
        "A zk proof attests that a computation was performed correctly on hidden or public inputs—examples include valid state transition, balance conservation inside a rollup, or membership in a set. Zero-knowledge specifically means the proof leaks no information beyond statement truth; many rollups use SNARKs for succinctness while transaction data remains public on L1 for data availability.",
        "Verifier work is tiny (milliseconds, kilobytes); prover work is heavy (seconds to minutes, large RAM). Asymptotics matter at scale—proving every Ethereum block naively is expensive; batching and specialized hardware help. Soundness bugs let false proofs pass—catastrophic for bridges and rollups.",
      ),
      sec(
        "SNARK vs STARK and Trusted Setup",
        "zkSNARKs often require trusted setup ceremonies generating structured reference strings—if toxic waste leaks, soundness breaks. STARKs avoid trusted setup with larger proofs and different assumptions—trade space and cost profiles. Bulletproofs and other families fill niches—brochure depth means knowing who to call, not implementing curves.",
        "Trusted setup operational security: multi-party computation, destroy toxic waste narratives, and monitor for parameter reuse across incompatible systems. Hardware acceleration (GPUs, ASICs) shifts who can afford to prove—centralization risk for prover marketplaces.",
      ),
      sec(
        "Rollups, Data Availability, and Privacy Limits",
        "ZK rollups post state roots and proofs to L1; users need data availability to withdraw if sequencer fails—ZK does not remove DA requirements. Validium-style designs move data off-chain with different trust. Privacy pools and zk transfers are optional layers—not implied by 'ZK L2' marketing.",
        "Common myths: ZK does not imply private balances by default; ZK does not eliminate sequencer liveness trust on L2s; ZK does not mean no bugs—verify circuits, bridges, and upgrade keys separately.",
      ),
      sec(
        "Practical Implications",
        "Write an 800-word explainer for a skeptical backend engineer: correct myths, glossary, further reading. Stop at math you can explain aloud. When evaluating vendors, ask prover decentralization, setup ceremony participation, and soundness audit scope.",
      ),
      sec(
        "Summary",
        "ZK is a proof technology with distinct privacy, succinctness, and cost dimensions. Trusted setup and prover economics remain production concerns. Rollups prove execution; privacy and DA are separate design choices.",
      ),
    ],
    terms(
      ["Zero-knowledge", "Proof revealing no information beyond validity of a statement."],
      ["Succinct proof", "Short, fast-to-verify proof of large computation."],
      ["Trusted setup", "Ceremony generating SNARK parameters; compromise breaks soundness."],
      ["Data availability", "Requirement that transaction data needed to reconstruct state is published."],
      ["Soundness", "Property that false statements cannot produce accepting proofs."],
    ),
    lessonsById["s6-m1-l3"],
  ),

  "s6-m2-l1": lessonContent(
    [
      sec(
        "Introduction",
        "Capstones fail when they are vague enthusiasm projects—'study DeFi security'—instead of falsifiable questions with artifacts and evaluation plans. Scope defines what you will build, break, or measure; ethics defines who could be harmed; milestones keep you honest across weeks.",
        "Write a one-pager with success metrics, stakeholders, harms, and weekly checkpoints suitable for peer review.",
      ),
      sec(
        "Build, Break, and Measure Tracks",
        "Build track: ship a tool, integration, or educational artifact with users or reproducible demos. Break track: structured review, fuzzing campaign, or incident reconstruction with novel synthesis—not reposting known exploits. Measure track: preregistered on-chain study or benchmark with shared queries.",
        "Advisor matching: align mentor expertise with track. IRB-like self-check: human subjects, doxxing risk, live mainnet tests affecting third parties—all may require pivot to testnet or synthetic data.",
      ),
      sec(
        "Success Metrics and Abandon Criteria",
        "Success metrics must be observable: merged PR, reproduced table, detection rate on labeled set, survey N from defined cohort. Avoid 'raised awareness.' Abandon criteria precommit: if data unavailable by week 4, if ethics block emerges, if scope explodes—pivot documented, not silent.",
        "Stakeholders include users, open-source maintainers, your future employer audience, and people harmed if you publish sloppy exploit details. Risk section is mandatory, not appendix filler.",
      ),
      sec(
        "Peer Review and Milestones",
        "Weekly milestones: literature locked, prototype, evaluation, write-up draft, defense dry run. Peer review responses should show what changed in scope and why—not defensive rhetoric.",
        "Measurable outcomes impress defense committees; science fair vibes come from demos without evaluation or claims without limits.",
      ),
      sec(
        "Practical Implications",
        "Submit proposal v0 to cohort early. Revise after structured peer feedback. Keep one-page format readable by non-specialists.",
      ),
      sec(
        "Summary",
        "Capstone quality is scope discipline. Pick a track, define metrics and abandon triggers, document harms, and iterate proposals with peers before building.",
      ),
    ],
    terms(
      ["Falsifiable claim", "Statement testable with defined evidence that could prove it wrong."],
      ["Capstone artifact", "Deliverable object—code, dataset, report—demonstrating completed work."],
      ["Abandon criteria", "Precommitted conditions triggering scope change or project stop."],
      ["IRB-like review", "Self-assessment for research ethics on human or sensitive data."],
      ["Success metric", "Observable quantity determining whether the project succeeded."],
    ),
    lessonsById["s6-m2-l1"],
  ),

  "s6-m2-l2": lessonContent(
    [
      sec(
        "Introduction",
        "Disclosure timelines balance user protection, researcher safety, and legal exposure—compressed on immutable chains where 'patch later' still leaves bytecode live. Whitehat moves need explicit authorization; Twitter threads often harm users by tipping attackers or inducing panic sells.",
        "Draft disclosure email templates, explain partial-fix bounty complications, and list comms mistakes from past incidents.",
      ),
      sec(
        "Coordinated Disclosure on Immutable Systems",
        "Classic CERT flow: report privately, vendor confirms, fix deployed, then public detail. On-chain, upgrades may require timelocks, multisig signers on vacation, or immutable contracts with no fix—only pause or migration. Silent patches help users who monitor repos; they hurt if attackers discover first without coordination.",
        "Partial fixes pay reduced bounties and may leave live exploitable bytecode at old addresses—users must be told which contracts are unsafe. Bridge incidents need chain-specific messaging: freeze vs pause vs deprecate language matters.",
      ),
      sec(
        "Comms Simulation: Friday 6pm",
        "Tabletop: critical bug Friday before holiday—roles assign internal alert, legal contact, single external spokesperson, customer support hold script. Messages factual, no victim blaming, no seed requests. Internal: transaction hashes, affected contracts, estimated exposure, mitigation ETA.",
        "External: what users should do (revoke approvals, pause deposits), what not to do (install unverified 'patch' wallets). Community panic dynamics move markets—timing and accuracy reduce harm.",
      ),
      sec(
        "Legal Counsel Boundary",
        "Engineers should not give legal advice or name criminals prematurely. Counsel guides safe harbor, law enforcement contact, and regulatory notifications. Immutable chains do not eliminate duty of care for frontends and operators with jurisdiction.",
        "Silent patch ethical when active exploitation is unlikely and users can upgrade quickly—but document decision. Who needs to know first: internal security, leadership, counsel, then users—order beats virality.",
      ),
      sec(
        "Practical Implications",
        "Maintain disclosure templates and contact trees. Run holiday-week tabletops. Define freeze vs pause vocabulary before incidents.",
      ),
      sec(
        "Summary",
        "Disclosure is operational and legal, not heroic tweeting. Immutable code lengthens fix paths; comms discipline prevents second waves of loss. Counsel belongs in the loop early.",
      ),
    ],
    terms(
      ["Coordinated disclosure", "Timed release of vulnerability details after mitigation planning."],
      ["Silent patch", "Fix deployed without public announcement—ethical tradeoffs depend on context."],
      ["Partial fix", "Incomplete remediation leaving some attack surface exploitable."],
      ["Pause vs freeze", "Protocol stop of actions; terminology affects user understanding."],
      ["Whitehat rescue", "Authorized use of exploit techniques to return funds or secure systems."],
    ),
    lessonsById["s6-m2-l2"],
  ),

  "s6-m2-l3": lessonContent(
    [
      sec(
        "Introduction",
        "The same capstone result needs two tellings: depth for engineers (methods, limits, reproducibility) and decision framing for executives (risk, cost, recommendation). Presentation skill converts months of work into trust—or overselling that destroys credibility in Q&A.",
        "Build a 10-slide core deck with appendix discipline, practice a 3-minute elevator version, and use structured peer feedback.",
      ),
      sec(
        "Story Arc and Slide Discipline",
        "Arc: stakes → method → result → limits → next steps. Stakes why anyone should care; method enough to believe; result with numbers; limits honest; next steps actionable. Appendix holds extra proofs, SQL, threat model tables—never trap busy audiences in 40-slide main decks.",
        "Visualizing risk: scenarios, not single points—best/base/worst. Hostile Q&A prep: list ten nasty questions and answers; 'I don't know, here's how we'd find out' beats bluffing.",
      ),
      sec(
        "Dual Audiences",
        "Engineer version names invariants, tools, commit hashes, and failure cases. Executive version: decision, exposure, cost, timeline, owner. Same project, different nouns—do not dumb down methods in engineer rooms or drown executives in opcode tables.",
        "Three-minute elevator: one sentence problem, one sentence approach, one sentence result, one sentence limit. Record practice runs; peer rubric scores clarity, timing, and unknowns slide presence.",
      ),
      sec(
        "Dry Run and Revision",
        "12-minute dry run plus Q&A surfaces pacing failures and jargon walls. Revision list prioritized: fix factual errors before aesthetic slide tweaks. End without overselling—audiences remember overclaims.",
        "What belongs appendix-only: long tables, extra charts, alternative abandoned approaches, full parameter lists.",
      ),
      sec(
        "Practical Implications",
        "Record dry run; apply rubric scores. Build appendix before main deck to avoid cramming. Practice hostile Q&A weekly before defense.",
      ),
      sec(
        "Summary",
        "Presentations are filtered knowledge. Core deck tells a story; appendix holds proof. Dual audiences and honest limits build lasting credibility.",
      ),
    ],
    terms(
      ["Appendix discipline", "Keeping detail available without bloating the main narrative slide path."],
      ["Elevator pitch", "Short verbal summary for non-specialists under severe time limits."],
      ["Hostile Q&A", "Anticipated challenging questions testing claims and limits."],
      ["Story arc", "Structured narrative flow maintaining audience orientation."],
      ["Limits slide", "Explicit unknowns and weaknesses—signals intellectual honesty."],
    ),
    lessonsById["s6-m2-l3"],
  ),

  "s6-m3-l1": lessonContent(
    [
      sec(
        "Introduction",
        "Crypto careers span protocol engineering, security research, data analytics, product, policy, and academia—adjacent skills overlap but daily artifacts differ. Credential inflation (pay-to-learn certificates) competes with signal from reproducible work: audits shadowed, repos merged, clear writing.",
        "Map three roles' daily work and failure modes; propose a six-month post-course learning plan with measurable outputs.",
      ),
      sec(
        "Role Artifacts and Failure Modes",
        "Protocol engineer: specs, PRs, testnets, incident postmortems—failure modes include upgrade key negligence and spec drift. Security: reviews, fuzzing, monitoring rules—failure modes include audit theater and missed economic bugs. Data: pipelines, labels, preregistered studies—failure modes include heuristic lies and privacy slips.",
        "Product: user research, risk copy, ship tradeoffs—failure modes include misleading 'decentralized' marketing. Policy: memos, comment letters, compliance mapping—failure modes include pretending law is code. Research: papers, benchmarks—failure modes include non-reproducible claims.",
      ),
      sec(
        "Learning Plans and Signal",
        "Six-month PDP: quarterly goals tied to outputs—e.g., two merged OSS PRs, one public postmortem analysis, one capstone defense—not hours watched. Mentor questions list: what did you ship, what broke, what would you redo?",
        "Performative learning is conference swag without depth; depth signals include teaching others, reproducible artifacts, and peer respect. Rest and recovery belong in plans—burnout is a career-ending bug.",
      ),
      sec(
        "Credentials vs Portfolio",
        "Job descriptions keyword-stuff buzzwords; extract actual needs by reading five org types (L1, DeFi, security firm, data shop, policy NGO). Open-source portfolio ethics: do not claim others' work; document your slice. Conference vs deep work: balance intentional networking with maker weeks.",
        "Credential inflation: expensive certificates with low filtering power—use if employer requests, not as substitute for work samples.",
      ),
      sec(
        "Practical Implications",
        "Write a personal development plan with quarterly measurable outputs and mentor outreach templates. Compare three roles honestly against your temperament.",
      ),
      sec(
        "Summary",
        "Careers are portfolios of artifacts, not titles. Map roles to daily work, plan outputs not vibes, and treat credentials skeptically unless they gate a specific employer.",
      ),
    ],
    terms(
      ["Protocol engineer", "Builder of consensus, clients, or on-chain contract systems."],
      ["Performative learning", "Visibility activities without durable skill or artifact growth."],
      ["Personal development plan", "Structured goals with timelines and measurable outputs."],
      ["Credential inflation", "Proliferation of low-signal certificates masking shallow skill."],
      ["Portfolio signal", "Demonstrated work samples trusted by hiring teams."],
    ),
    lessonsById["s6-m3-l1"],
  ),

  "s6-m3-l2": lessonContent(
    [
      sec(
        "Introduction",
        "Open source sustains crypto infrastructure but exploits unpaid labor narratives—maintainer burnout, toxic expectations, and grant dependence without employment protections. Contributing well means bounded scope, clear communication, and respect for governance norms.",
        "Compare grants vs employment, explain maintainer burnout risks, and draft a contribution agreement checklist.",
      ),
      sec(
        "Grants, Employment, and Power Dynamics",
        "Grants offer flexibility and public goods alignment; employment offers stability and deeper access. Maintainer capture occurs when one employer funds most committers—roadmap skew. CLA vs DCO: contributor license agreements assign IP; developer certificate of origin attests licenseability without assignment—prefer DCO for community trust when possible.",
        "Security expectations on volunteers: projects should not assume volunteers run 24/7 incident response—define boundaries. Sponsorship ethics: disclose funders influencing roadmap.",
      ),
      sec(
        "Bounded Contributions",
        "Pick one repo; propose issue or design doc with timeline you can hit—two-week fix beats abandoned mega-refactor. Mentor outreach template: context, proposed change, availability, ask for pointer—not 'tell me what to do.'",
        "Unpaid labor is harmful when it replaces paid roles or demands crisis response without support. Sustainable OSS needs institutions funding maintenance, not hero narratives.",
      ),
      sec(
        "Contribution Checklist",
        "Checklist: read CONTRIBUTING, license, code of conduct, issue triage norms; fork workflow; test instructions; agree on review SLA; no drive-by refactors; document public communication channel. Exit plan if scope creeps.",
        "FOSS governance essays highlight benevolent dictator vs council models—know who decides merges before debating architecture.",
      ),
      sec(
        "Practical Implications",
        "Draft a bounded contribution plan with mentor email template. If grant-seeking, tie proposal to measurable maintainer outcomes, not vague ecosystem health.",
      ),
      sec(
        "Summary",
        "Contribute with boundaries and governance awareness. Grants and jobs trade freedom for stability; maintainers deserve funding and realistic expectations. DCO, scope discipline, and anti-capture matter.",
      ),
    ],
    terms(
      ["Maintainer burnout", "Exhaustion from unpaid on-call expectations and support load."],
      ["CLA", "Contributor License Agreement often assigning IP to project owner."],
      ["DCO", "Developer Certificate of Origin attesting right to contribute under project license."],
      ["Maintainer capture", "Roadmap control by concentrated sponsors or employers."],
      ["Bounded contribution", "Explicitly scoped OSS work with timeline and communication plan."],
    ),
    lessonsById["s6-m3-l2"],
  ),

  "s6-m3-l3": lessonContent(
    [
      sec(
        "Introduction",
        "Capstone defense integrates artifact, write-up, presentation, and retrospective—proving what you demonstrated versus what you narrated. Limitations sections are mandatory intellectual honesty; peers testing repro steps catch sloppy science.",
        "Prepare for timed Q&A, README-quality documentation, and a 500+ word retrospective on what you would redo.",
      ),
      sec(
        "Defense Rubric and Q&A",
        "Defense rubric typically weights: question clarity, method soundness, results substantiation, limits honesty, communication. Twenty-minute presentation plus fifteen-minute Q&A—practice pacing. Distinguish proved vs hypothesized vs anecdotal in answers.",
        "Archiving reproducible environments: pin dependencies, container or nix flake, commit hashes, and data snapshot IDs. Long-term maintenance expectations: who keeps CI green after course ends?",
      ),
      sec(
        "Documentation and Portfolio Packaging",
        "README-quality means stranger can run core path in documented time. Final report PDF or repo includes threat model, ethics, evaluation, and limitations—not only screenshots. Portfolio packaging: link defense slides, demo video, and blog summary for employers without overselling.",
        "Peer repro: classmate follows your steps unaided; failures update docs before final grade. Retrospective covers wrong turns, scope cuts, and skills gained—not victory lap only.",
      ),
      sec(
        "Retrospective and Unknowns",
        "Retrospective prompts: What did you prove vs narrate? What remains dangerously unknown? What would you redo with eight more weeks? Unknowns slide in presentation prevents defensive Q&A surprises.",
        "Honest limitations build trust; hiding them invites expert demolition in questions.",
      ),
      sec(
        "Practical Implications",
        "Complete peer repro week before defense. Write retrospective before final slides to inject humility. Archive env and data with licenses noted.",
      ),
      sec(
        "Summary",
        "Defense is proof under questioning. Package artifacts for strangers and employers. Retrospectives and limitations separate professionals from promoters.",
      ),
    ],
    terms(
      ["Capstone defense", "Timed presentation and examination of final project work."],
      ["Reproducible environment", "Pinned tooling allowing others to rerun your results."],
      ["Limitations section", "Explicit statement of what the project did not establish."],
      ["Retrospective", "Post-hoc analysis of process, mistakes, and lessons learned."],
      ["Peer reproduction", "Independent rerun of your procedure by a classmate."],
    ),
    lessonsById["s6-m3-l3"],
  ),
};
