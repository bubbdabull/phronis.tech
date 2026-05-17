import { SEMESTER_05 } from "../semester-05";
import { lessonContent, sec, terms } from "./helpers";
import type { LessonReadContent } from "./types";

const lessonsById = Object.fromEntries(
  SEMESTER_05.modules.flatMap((m) => m.lessons).map((lesson) => [lesson.id, lesson]),
);

export const SEMESTER_05_CONTENT: Record<string, LessonReadContent> = {
  "s5-m1-l1": lessonContent(
    [
      sec(
        "Introduction",
        "Cryptocurrency security begins where keys are born and ends where they are destroyed. The lifecycle—generation, storage, use, rotation, destruction—maps directly to loss events: weak entropy, photographed seeds, unrotated multisig after employee departure, and 'recovery' scams targeting panicked users.",
        "This lesson enumerates cold vs hot threats, walks a basic 2-of-3 multisig rotation without moving funds to attacker-controlled addresses, and explains why screenshots of seed phrases are catastrophic.",
      ),
      sec(
        "Generation, Entropy, and Storage Models",
        "Keys must come from cryptographically secure random sources—hardware wallets and reputable software use OS CSPRNG with user entropy mixing where appropriate. Brain wallets and dice rituals fail when humans introduce bias. Air-gapped signing reduces malware exposure but shifts trust to QR/SD card transport and display integrity.",
        "Hot wallets trade convenience for exposure to clipboard malware, browser extensions, and cloud-synced backups. Cold storage trades latency for resilience. Passphrases (BIP39 extension words) add plausible deniability and second-factor material but are lost as often as seeds when undocumented.",
      ),
      sec(
        "Multisig, Shamir, and Rotation",
        "Multisig requires m-of-n independent keys to authorize spends—loss of one key does not mean loss of funds if thresholds are designed well. Rotation without downtime: generate new quorum, create parallel multisig, migrate funds with test transaction, deprecate old keys ceremonially. Shamir secret sharing splits one seed into shards; losing m shards loses funds—different tradeoff than multisig policy separation.",
        "Multisig does not stop phishing if all signers approve the same malicious transaction. It does not stop collusion at threshold. Organizational ceremonies should include witness logs, hardware from diverse vendors, and geographic distribution when threat model warrants.",
      ),
      sec(
        "Destruction, Legal Meaning, and Supply Chain",
        "Destruction means secure wipe of digital copies and physical destruction of paper/metal backups no longer needed—recoverable trash is not destroyed. Legally, 'lost keys' may mean inaccessible assets without bankruptcy clarity—jurisdictions differ on whether lost crypto is abandoned property.",
        "Hardware wallet supply chain risks include tampered devices, fake support sites, and pre-seeded devices. Buy from manufacturers, verify packaging, initialize yourself. Cloud backup of seeds is acceptable only when threat model includes local theft but not cloud breach—and users understand provider subpoena risk.",
      ),
      sec(
        "Practical Implications",
        "Write household recovery plans on testnet first—no real seeds in coursework. Document who holds which key, rotation calendar, and forbidden practices (photos, email, Discord DMs). Use separate hot spending vs cold savings wallets to bound blast radius.",
      ),
      sec(
        "Summary",
        "Key lifecycle discipline beats gadget worship. Multisig and Shamir solve different problems; rotation is a procedure, not a button. Screenshots and cloud seeds are common catastrophic failures—design processes assuming humans err.",
      ),
    ],
    terms(
      ["Seed phrase", "Human-readable backup encoding wallet keys; equivalent to private key material."],
      ["Multisig", "Policy requiring multiple independent signatures to authorize spends."],
      ["Shamir sharing", "Splitting secret material into shards with threshold reconstruction."],
      ["Air gap", "Isolating signing devices from networked attack surfaces."],
      ["Key rotation", "Replacing cryptographic keys on schedule or after compromise suspicion."],
    ),
    lessonsById["s5-m1-l1"],
  ),

  "s5-m1-l2": lessonContent(
    [
      sec(
        "Introduction",
        "Users lose funds more often to deception and malware than to broken elliptic curves. Phishing clones sites, address poisoning exploits explorer UI habits, malicious token approvals drain wallets, and clipboard malware swaps destinations between copy and paste.",
        "You will teach calldata reading at 'danger colors' level—knowing what approvals and permits do—explain address poisoning, and list wallet vendor trust assumptions including simulation limits.",
      ),
      sec(
        "Approvals, Permits, and Malicious Contracts",
        "ERC-20 approvals let contracts spend your tokens up to a limit. Infinite approvals persist until revoked—one compromised dApp can drain years of allowances. Permit2 and EIP-2612 permits sign off-chain messages authorizing spends—faster UX, same trust in displayed spender and amount.",
        "Malicious sites request approvals to worthless tokens first, then escalate. Wallets color-code risk but users click through. Calldata education: approve(spender, amount), transferFrom, setApprovalForAll on NFTs—each maps to different loss modes.",
      ),
      sec(
        "Address Poisoning and Social Engineering",
        "Attackers send dust from addresses visually similar to your frequent counterparties—hoping you copy from transaction history. Block explorers and wallets that truncate addresses worsen this. Fake support DMs, airdrop sites, and 'sync your wallet' forms harvest seeds—no legitimate service asks for seed words online.",
        "Browser extensions see every page you visit; compromised extensions inject scripts into banking and crypto sites alike. Transaction simulation can lie if the wallet does not cryptographically bind the preview to the transaction hash submitted—malware can show benign simulation while signing drain tx.",
      ),
      sec(
        "Blind Signing and Human-Readable Limits",
        "Hardware wallets may sign opaque hashes if dApps do not provide clear signing payloads—blind signing on smart contract chains is a known gap. Wallets add domain binding, address books, and warnings, but expert users disable warnings for speed—policy must resist that drift.",
        "Red team tabletops reveal detection time and process gaps: who verifies URLs, who approves new counterparties, whether treasury uses hardware for all material moves. Blame processes, not individuals, in after-action reports.",
      ),
      sec(
        "Practical Implications",
        "Run phishing tabletop exercises. Default limited approvals; maintain revoke.cash hygiene. Train users to verify domains, use address books, and never share seeds. Document wallet vendor assumptions (telemetry, RPC, simulation source).",
      ),
      sec(
        "Summary",
        "Phishing and approvals dominate retail loss. Poisoning exploits UI; simulation is not proof. Organizational policy and hardware discipline beat hoping users read every hex byte.",
      ),
    ],
    terms(
      ["Token approval", "Permission for a contract to spend tokens—persistent risk if excessive."],
      ["Address poisoning", "Dust from look-alike addresses to trick history-based copying."],
      ["Permit2", "Shared approval layer reducing gas but centralizing spender trust."],
      ["Blind signing", "Approving transactions without human-readable effect preview."],
      ["Transaction simulation", "RPC-based preview of balance changes—trust-dependent."],
    ),
    lessonsById["s5-m1-l2"],
  ),

  "s5-m1-l3": lessonContent(
    [
      sec(
        "Introduction",
        "Teams operating crypto treasuries, CI/CD for contracts, and customer-facing wallets need operational security beyond personal hardware habits. Secrets sprawl in Slack, on-call without runbooks, and signing keys in GitHub Actions have caused nine-figure incidents.",
        "Draft secrets policies, explain why chat is not a vault, and outline incident comms templates that prevent panic leaks.",
      ),
      sec(
        "Secrets Management and CI/CD",
        "Use dedicated secret managers (Vault, cloud KMS, 1Password for teams) with rotation, audit logs, and least privilege. CI pipelines that deploy contracts or publish frontends hold private keys and API tokens—compromise equals immediate fund risk or supply-chain malware to users.",
        "Separate duties: engineers who write code should not unilaterally control production keys. Use hardware or cloud HSM signers for deployments; require multisig for treasury moves. If a CI secret leaks, first move is revoke and rotate—all dependent systems in parallel, not sequential debate.",
      ),
      sec(
        "On-Call, Runbooks, and War Rooms",
        "Runbooks for suspected hot wallet compromise: isolate machines, pause automated bots, notify exchanges, preserve logs, assign single external spokesperson, legal hold on evidence. Define chain-specific pause contacts and upgrade multisig signers availability.",
        "War room roles: incident commander, comms lead, technical investigator, legal liaison. SOC2-style controls optional but useful vocabulary for investors—map policies to actual crypto threats, not checkbox theater.",
      ),
      sec(
        "Vendor Compromise and Comms Holds",
        "Third-party RPC, analytics, npm packages, and wallet SDKs are supply-chain vectors. Pin dependencies, verify checksums, monitor typosquat releases. External comms during incidents: factual, no victim-blaming, no seed requests, no promises of recovery—coordinate with counsel before admitting fault or naming attackers prematurely.",
        "Slack is not a vault—treat pasted seeds, private keys, and customer PII as toxic waste with deletion policies. On-call phones should use hardware 2FA, not SMS, for org accounts.",
      ),
      sec(
        "Practical Implications",
        "Create a 0–60 minute hot wallet compromise checklist. Store runbooks offline. Quarterly drill: CI secret leak scenario. Define who speaks publicly before Friday 6pm incidents.",
      ),
      sec(
        "Summary",
        "Team OpSec is secrets hygiene, runbooks, and rehearsed incident roles. CI/CD keys are production crown jewels. Comms discipline prevents double disasters after technical breaches.",
      ),
    ],
    terms(
      ["Secrets manager", "System storing credentials with access control, audit, and rotation."],
      ["Runbook", "Step-by-step incident procedure reducing panic decisions."],
      ["War room", "Coordinated response team with defined roles during crises."],
      ["Supply-chain attack", "Compromise via dependency or vendor rather than direct breach."],
      ["Evidence preservation", "Maintaining logs and artifacts before remediation destroys forensics."],
    ),
    lessonsById["s5-m1-l3"],
  ),

  "s5-m2-l1": lessonContent(
    [
      sec(
        "Introduction",
        "Smart contract audit reports are time-bounded, scope-bounded opinions—not warranties. Executives and users misread 'no critical findings' as 'safe forever.' Engineers must parse severity, scope exclusions, diff coverage, and residual risk.",
        "You will explain scope pitfalls, rewrite findings in plain English, and list what clean reports still do not guarantee.",
      ),
      sec(
        "Scope, Severity, and Coverage Gaps",
        "Scope lists repositories, commit hashes, and sometimes explicit exclusions (libraries, frontends, off-chain bots). Out-of-scope components can harbor the fatal bug. Severity taxonomies rank exploitability and impact—informational issues may document centralization or oracle trust worth board attention.",
        "Diff audits review changes since last audit; full audits cost more time. Formal verification proves properties against models—valuable when specs match reality, expensive when specs lag code. Continuous review (bot monitoring, invariant tests) complements point-in-time audits.",
      ),
      sec(
        "What Reports Do Not Say",
        "Auditors do not run your deployment pipeline, monitor production keys, or guarantee economic attacks are out of scope. Composability with external protocols introduces risk outside audit boundary. Upgrades after audit invalidate conclusions unless re-audited or diff-reviewed.",
        "Bug bar economics: firms balance thoroughness vs deadlines; teams balance audit spend vs shipping. Residual risk acceptance should be signed by leadership, not implied.",
      ),
      sec(
        "Board Communication",
        "Executive summaries name scope limits, unresolved informational themes, upgrade keys, and monitoring plans. Five questions for engineers: What changed since audit? Who holds admin keys? What invariants are monitored on-chain? What is max TVL at risk day one? What incident budget exists?",
        "Avoid 'we are safe' language—prefer 'known risks within scope X, mitigations Y, residual Z.'",
      ),
      sec(
        "Practical Implications",
        "Practice summarizing a public audit for a non-technical audience. Maintain internal risk register linking findings to fixes and deferred items. Schedule diff review before every upgrade.",
      ),
      sec(
        "Summary",
        "Audits are snapshots of scoped code under stated assumptions. Severity and scope sections are the story—conclusions are not eternal. Pair audits with monitoring, incident budget, and honest executive framing.",
      ),
    ],
    terms(
      ["Audit scope", "Defined code, commits, and components included in review."],
      ["Severity", "Rated impact and likelihood category for a reported issue."],
      ["Diff audit", "Review limited to changes since prior audited state."],
      ["Formal verification", "Mathematical proof that code meets a spec within a model."],
      ["Residual risk", "Remaining exposure after mitigations and accepted findings."],
    ),
    lessonsById["s5-m2-l1"],
  ),

  "s5-m2-l2": lessonContent(
    [
      sec(
        "Introduction",
        "Vulnerability classes recur across protocols: access control failures, business logic bugs, oracle manipulation, decimal mismatches, and time-based edge cases. Pattern recognition helps readers of postmortems and auditors—not exploit certification.",
        "Cluster historical bugs into taxonomy, separate access control from input validation, and discuss responsible disclosure norms.",
      ),
      sec(
        "Access Control and Logic Bugs",
        "Access control bugs let unauthorized callers invoke admin functions—missing onlyOwner modifiers, initializer not called, proxy storage collisions. Input validation bugs accept out-of-range values but still require caller authorization—confusing them mis-prioritizes fixes.",
        "Business logic bugs satisfy code paths but violate economic intent—e.g., borrowing without sufficient collateral due to rounding, or reward inflation via flash loans. Economic exploits may be 'working as coded' with disastrous outcomes.",
      ),
      sec(
        "Oracle, Decimal, and Time",
        "Oracle bugs include trusting single-source feeds, wrong decimals in price feeds, and stale prices during volatility. Decimal bugs multiply amounts by 10^n wrong—classic when bridging tokens with different decimals. Time bugs exploit timestamp dependence, reward accrual windows, and epoch boundaries.",
        "SWC registry categories help flashcard study; invariant testing encodes properties like 'total supplied ≥ total borrowed' or 'user collateral ≥ debt value at liquidation threshold.' Symbolic execution tools explore paths—brochure depth suffices for managers.",
      ),
      sec(
        "Disclosure and When Bugs Are Features",
        "Responsible disclosure coordinates fix deployment before public detail—compressed on immutable chains. Partial fixes complicate bounty payouts; duplicates need clear rules. Sometimes governance labels a bug a feature if fixing harms incumbent users—politics, not math.",
        "Write invariants for a toy lending spec: ten properties mixing safety and economics, noting which are expensive to check on-chain continuously.",
      ),
      sec(
        "Practical Implications",
        "Maintain internal taxonomy of past incidents in your stack's category. Prioritize access control and oracle modules in review checklists. Engage whitehats early with clear scope.",
      ),
      sec(
        "Summary",
        "Most exploits rhyme with known classes. Access control protects who can act; logic protects intended economics. Oracles, decimals, and time dominate DeFi incident stories—invariants and monitoring catch regressions audits miss.",
      ),
    ],
    terms(
      ["Access control", "Restrictions on which accounts may call sensitive functions."],
      ["Business logic bug", "Code paths that violate intended protocol economics."],
      ["Invariant", "Property that must always hold; used in tests and monitoring."],
      ["Oracle manipulation", "Distorting on-chain price inputs to extract value."],
      ["Responsible disclosure", "Coordinated private report before public vulnerability details."],
    ),
    lessonsById["s5-m2-l2"],
  ),

  "s5-m2-l3": lessonContent(
    [
      sec(
        "Introduction",
        "Bug bounties align external researchers with defender incentives—if scope, severity matrix, and payout mechanics are clear. Safe harbor language attempts legal protection for good-faith research but varies by jurisdiction and must not be mistaken for immunity.",
        "Draft bounty boundaries, explain safe harbor limits, and simulate a triage severity call under time pressure.",
      ),
      sec(
        "Scope, Out-of-Scope, and Triage",
        "Scope defines assets in play: contracts, web apps, mobile apps, hardware. Out-of-scope commonly includes third-party dependencies, social engineering, physical attacks, and denial-of-service—read Immunefi and HackerOne templates for patterns. Triage flow: intake → reproduce → severity → fix timeline → payout → disclosure.",
        "Partial fixes pay reduced rewards; duplicates split per policy primacy rules. KYC for payouts trades pseudonymity for compliance—researchers in high-risk regions should know upfront.",
      ),
      sec(
        "Safe Harbor and Legal Gray Zones",
        "Safe harbor statements promise not to pursue CFAA-style claims if rules followed—they do not bind all prosecutors or civil litigants. War rooms need legal before public attribution or threatening researchers. Whitehat rescue moves—using exploit to return funds—require explicit authorization in policy to avoid 'unauthorized access' narratives.",
        "Cap rewards reflect budget realism, not insult—uncapped programs attract attention but need funding certainty. Severity matrix should map exploit scenarios to dollar ranges with examples.",
      ),
      sec(
        "Policy Drafting for Bridges and L2s",
        "Hypothetical L2 bridge bounty first page: in-scope contracts, forbidden mainnet testing rules, prohibition on user fund theft even with proof, coordinated disclosure timeline, and out-of-scope for validator set attacks unless explicitly included. Flowchart helps triagers more than prose alone.",
        "Primacy disputes arise when two reports overlap—publish tie-break rules. Post-mortem bounty increases after incidents signal budget, not necessarily maturity.",
      ),
      sec(
        "Practical Implications",
        "Draft a one-page bounty policy with clear out-of-scope and severity table. Run tabletop triage on a sample report. Coordinate with counsel before marketing safe harbor.",
      ),
      sec(
        "Summary",
        "Bounties work when scope and payouts are credible. Safe harbor helps but is not law. Triage discipline and legal coordination matter as much as dollar caps.",
      ),
    ],
    terms(
      ["Bug bounty", "Program paying for valid vulnerability reports within published rules."],
      ["Safe harbor", "Policy limiting legal action against compliant security researchers."],
      ["Severity matrix", "Table mapping exploit impact to payout tiers."],
      ["Out-of-scope", "Assets or attack types excluded from bounty eligibility."],
      ["Coordinated disclosure", "Timed release of details after fix deployment."],
    ),
    lessonsById["s5-m2-l3"],
  ),

  "s5-m3-l1": lessonContent(
    [
      sec(
        "Introduction",
        "Maximal extractable value (MEV) is profit from ordering, including, or excluding transactions within blocks—sandwiches, liquidations, arbitrage, and censorship. Post-merge Ethereum split block production into proposers, builders, relays, and searchers under proposer-builder separation (PBS) intuition.",
        "Draw the MEV flow diagram, explain sandwich attacks at intuition level, and discuss censorship pressures on relays and OFAs (order flow auctions).",
      ),
      sec(
        "Searchers, Builders, Relays, Validators",
        "Searchers monitor mempools and chain state, submitting bundles with explicit payment to builders. Builders assemble blocks maximizing value; relays attest to block validity and fairness properties before validators sign. Trust shifts from public mempool ordering to builder-relay relationships—centralization tradeoffs vary by implementation.",
        "Sandwich: frontrun user swap, let user trade at worse price, backrun to capture spread—user pays via worse execution. Private mempools and Flashbots Protect route txs away from public gossip—reduces some sandwiches, concentrates trust in operator.",
      ),
      sec(
        "PBS, OFAs, and App-Layer Mitigations",
        "PBS separates proposing from building so validators earn MEV without running sophisticated infra—also creates gatekeepers. Order flow auctions sell exclusive rights to user transactions to highest bidder—may improve price for wallets but entrench intermediaries.",
        "Apps mitigate with slippage limits, batch auctions, CoW-style solvers, and user education. SUAVE-like futures aim to decentralize block building markets—brochure awareness suffices; evaluate claims skeptically.",
      ),
      sec(
        "Censorship and Time-Bandits",
        "Relays may censor transactions violating OFAC lists—policy choice with neutrality implications. Time-bandit attacks (reorg attempts) are rarer post-merge but history informs L2 sequencer trust. Community memos on OFA partners should list user welfare, centralization path, and fallback if relay fails.",
        "Private mempool is not silver bullet: users trust operator, may pay hidden fees, and lose transparency benefits of public mempools.",
      ),
      sec(
        "Practical Implications",
        "Write a two-page MEV policy memo for a DEX considering exclusive flow. Define decision criteria: user execution quality, decentralization, legal exposure, vendor lock-in.",
      ),
      sec(
        "Summary",
        "MEV is structural to public ordering games. PBS and private relays relocate trust. Apps and wallets must set user expectations; governance must confront censorship and centralization externalities.",
      ),
    ],
    terms(
      ["MEV", "Value capturable by controlling transaction inclusion and ordering."],
      ["Proposer-builder separation", "Splitting block proposal from profitable block construction."],
      ["Sandwich attack", "Frontrun and backrun around a victim swap to extract spread."],
      ["Private mempool", "Channel submitting txs outside public gossip to builders."],
      ["Order flow auction", "Market selling exclusive rights to process user transactions."],
    ),
    lessonsById["s5-m3-l1"],
  ),

  "s5-m3-l2": lessonContent(
    [
      sec(
        "Introduction",
        "Privacy on public blockchains is a spectrum—not a toggle. Transparency aids auditability; it also enables surveillance, fingerprinting, and selective enforcement. Zero-knowledge proofs compress verification; they do not automatically imply anonymity for users.",
        "Separate anonymity sets from zk proofs, discuss wallet fingerprinting, and frame compliance tensions without laundering how-tos.",
      ),
      sec(
        "Anonymity Sets, Mixers, and ZK",
        "Anonymity set size measures how many users could have produced a given transaction pattern—small sets deanonymize via heuristics. Mixers and privacy pools increase set size but face regulatory scrutiny and smart contract risk. zkSNARKs prove statements without revealing witnesses—useful for scaling and selective disclosure, distinct from 'private money' for all users.",
        "Account-based chains leak graph structure via nonce patterns, token dust, and timing. UTXO chains offer different privacy tradeoffs; neither fixes metadata at application layer.",
      ),
      sec(
        "Fingerprinting and Case Study Lessons",
        "Wallet fingerprinting combines RPC usage, gas habits, device telemetry, and ENS names. Tornado Cash enforcement illustrated that code deployment and frontend operation have legal exposure separate from user privacy needs—facts for study, not endorsement of any illegal use.",
        "Compliance-by-design attempts selective disclosure: prove source of funds to auditor without public broadcast. Hard problems: who issues credentials, what prevents forgery, how to help donors without enabling obvious laundering.",
      ),
      sec(
        "Design Sketch for Donation Privacy",
        "Threat model: donor wants public cause support without doxxing wealth; attacker wants to launder via same pool. Mitigations might include rate limits, allowlisted recipients, membership proofs with revocation, and honest limits section—no feature eliminates motivated adversary with global liquidity.",
        "Privacy breaks when users reuse addresses, bridge KYC'd funds into pools, or leak off-chain identities via memos.",
      ),
      sec(
        "Practical Implications",
        "Document privacy claims accurately in product copy. Engage counsel before shipping privacy features. Teach users metadata hygiene separate from zk marketing.",
      ),
      sec(
        "Summary",
        "Privacy is multidimensional: cryptography, graph analysis, and law. ZK ≠ anonymity. Design honestly about limits; avoid enabling laundering while recognizing legitimate privacy needs.",
      ),
    ],
    terms(
      ["Anonymity set", "Population of indistinguishable users for a given transaction pattern."],
      ["zkSNARK", "Proof system hiding witness data while verifying statements succinctly."],
      ["Wallet fingerprinting", "Linking addresses and behavior via metadata heuristics."],
      ["Compliance-by-design", "Embedding policy checks while offering selective disclosure."],
      ["Privacy pool", "Smart contract pooling funds to increase transaction ambiguity."],
    ),
    lessonsById["s5-m3-l2"],
  ),

  "s5-m3-l3": lessonContent(
    [
      sec(
        "Introduction",
        "Credible neutrality asks protocols to implement fixed rules without privileging specific people—an ideal, not a measurable constant. Every parameter advantages someone over five years: fee recipients, governance quorum, token distribution, and upgrade keys.",
        "Define credible neutrality, show how 'neutral' rules still distribute power, and argue for client diversity with evidence.",
      ),
      sec(
        "Neutrality vs Politics Embedded in Code",
        "Ethereum's rough consensus and 'move fast' culture coexist with emergency forks in history—social layer overrides pure client rules rarely but memorably. Stablecoin freezes, OFAC filters on relays, and DAO bailouts are political outcomes expressed technically.",
        "Neutral fee markets prioritize highest payer; rich users get inclusion—neutral rule, unequal outcome. Governance minimalism tries to reduce on-chain votes to essentials; low participation enables capture by insiders and foundations.",
      ),
      sec(
        "Client Diversity and Emergency Ethics",
        "Client diversity reduces risk that one bug or censorship patch tanks the network—measure by client share on nodes and validators. Supermajority on one client is systemic risk. Evidence: past client bugs caused temporary forks and missed slots.",
        "Emergency forks and pauses trade user protection for precedent—communities should debate before crisis. Public goods funding (protocol grants, retro funding) shapes who builds—another political allocation disguised as neutrality.",
      ),
      sec(
        "Neutrality Audit Exercise",
        "Pick one live parameter—liquidation bonus, sequencer fee, token vote quorum—and analyze who it advantages over five years with counterproposals. Avoid ad hominem; focus on mechanism and incentives.",
        "Governance capture resistance includes time delays, veto powers, and transparency—but also risks paralysis. Neutrality cannot be measured perfectly; document tradeoffs instead.",
      ),
      sec(
        "Practical Implications",
        "Run neutrality audits on your protocol's top three parameters. Support multi-client ecosystems if operating infrastructure. Publish upgrade key holders and timelines.",
      ),
      sec(
        "Summary",
        "Credible neutrality is aspirational discipline, not a badge. Rules are neutral; outcomes are not. Client diversity and honest governance documentation beat decentralization theater.",
      ),
    ],
    terms(
      ["Credible neutrality", "Protocol design avoiding discretionary favoritism toward specific parties."],
      ["Client diversity", "Distribution of node/validator software implementations reducing correlated failure."],
      ["Governance capture", "Control of on-chain or social governance by concentrated insiders."],
      ["Emergency fork", "Community-coordinated chain rule change responding to extreme events."],
      ["Governance minimalism", "Limiting on-chain governance scope to reduce politicized parameters."],
    ),
    lessonsById["s5-m3-l3"],
  ),
};
