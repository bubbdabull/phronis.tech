import { SEMESTER_01 } from "../semester-01";
import { lessonContent, sec, terms } from "./helpers";
import type { LessonReadContent } from "./types";

const lessonsById = Object.fromEntries(
  SEMESTER_01.modules.flatMap((m) => m.lessons).map((lesson) => [lesson.id, lesson]),
);

export const SEMESTER_01_CONTENT: Record<string, LessonReadContent> = {
  "s1-m1-l1": lessonContent(
    [
      sec(
        "Introduction",
        "Every payment system is, at bottom, a story about who owes whom. Societies solved that problem long before computers by keeping ledgers: structured records of balances, transfers, and settlement. A shopkeeper's notebook, a bank's core database, and a blockchain's replicated log are all ledgers—they differ in who can write to them, who can audit them, and what happens when two honest parties disagree about the latest state.",
        "Digital cash introduced a new failure mode. Unlike a physical coin, a file can be copied perfectly and spent twice before anyone notices. Double spending is not a bug in software alone; it is a coordination failure about which copy of a balance is authoritative. Cryptocurrency engineering is largely the art of making that coordination expensive, observable, and rule-bound without appointing a single company as the final judge—though every design still embeds trust somewhere.",
      ),
      sec(
        "Ledgers as Social Infrastructure",
        "Historically, ledgers were maintained by institutions with reputational and legal skin in the game: temples, merchants, banks, and later central banks. The ledger did not need to be public; it needed to be credible to counterparties who accepted the institution's IOUs. Settlement—the moment obligations become final—often happened on a slower cadence than messaging. You could announce a transfer instantly while true finality waited for clearing, chargebacks, or court enforcement.",
        "When we say Bitcoin is a ledger, we mean an append-only log of transactions that full nodes interpret under fixed rules. There is no account manager who can 'fix' a row by policy. Instead, validity is local: each node checks signatures, conservation of value, and script rules. Global agreement emerges from peers converging on the same chain tip under the longest-chain (most-work) rule. That shift—from trusting a named operator to trusting a protocol and an economic majority—is the core design move of Nakamoto-style systems.",
        "Neutrality here does not mean 'no politics.' It means the record's update rules are explicit and the same for every participant. Whoever controls the keys controls the spend authority; whoever controls hash power influences ordering and reorganization depth. Those are political facts expressed as engineering constraints rather than as discretionary bank policy.",
      ),
      sec(
        "Double Spending and Digital Cash",
        "Double spending in naive digital cash looks like emailing the same $10 token to two merchants. Both inboxes show a valid-looking message; neither can tell which spend the issuer will honor without asking the issuer. The traditional fix is a trusted third party (TTP): a bank or payment processor that maintains the canonical balance and rejects conflicting spends. That works operationally but recenters trust, censorship risk, and surveillance in one place.",
        "Cryptographic protocols can reduce what the TTP must do—blind signatures, Chaumian ecash, and later hash commitments—but someone still had to prevent duplication unless the community shares one timeline of events. Bitcoin's answer is to publish every attempted spend into a public race where reversing history requires redoing expensive proof-of-work faster than the honest network extends the chain. Double spending becomes an economic attack with observable odds, not a silent database edit.",
        "It is worth separating user-facing finality from protocol finality. A coffee shop may accept zero confirmations because the loss is small; a house sale waits for depth because reorgs, though rare, are real. Finality is therefore an economic concept: how much would an attacker need to spend, and how long must a merchant wait before that cost exceeds the gain?",
      ),
      sec(
        "Trusted Third Parties vs Protocol Rules",
        "'Just use a database' is a legitimate architecture when you know who operates the database and your users accept that operator's policies. Visa-scale systems optimize for throughput, reversibility, and compliance—not for censorship resistance. Public blockchains trade some of those properties for open verification: anyone can run a node and check that supply rules and signatures were honored.",
        "The comparison is not moral but architectural. A TTP model outsources dispute resolution; a protocol model externalizes disputes into markets (fees), cryptography (signatures), and incentives (mining). Neither removes trust—it relocates it. Users trust client software, hardware vendors, mempools, exchanges, and—in proof-of-work—the economic majority of miners. Mapping those trust boundaries honestly is prerequisite to good security design.",
      ),
      sec(
        "Practical Implications",
        "If you build on a ledger, ask: who can write, who can read, and who pays when writers disagree? Product teams often hide a central database behind a token; that can be fine, but it is not the same security model as Bitcoin. Merchants should price confirmation depth into risk: high-value flows need more blocks or off-chain legal recourse.",
        "For engineers, eventual consistency in off-chain or layer-two systems reintroduces the sword problem at a different layer. Your UX should say what 'confirmed' means in blocks, dollars at risk, and reversibility policy—not merely show a green checkmark.",
      ),
      sec(
        "Common Mistakes",
        "Treating 'decentralized' as synonymous with 'no trust.' Every stack has trust assumptions; the question is whether they are explicit and auditable.",
        "Assuming the newest database write is objectively correct. Without a shared rule for conflict resolution, 'last writer wins' is a policy choice that favors whoever controls the server or the clock.",
        "Confusing message delivery with settlement. Announcing a transfer is cheap; making it costly to reverse is what ledgers monetize through fees, collateral, or work.",
      ),
      sec(
        "Summary",
        "Ledgers coordinate economic reality. Double spending is the fundamental break in copyable digital value unless a single authority or a shared, costly history resolves conflicts. Bitcoin-style systems publish that history and bind reordering to proof-of-work economics. Your job as a practitioner is to name who you trust at each layer—operator, protocol, hardware, and market—and design confirmation policies that match real loss exposure.",
      ),
    ],
    terms(
      ["Ledger", "A durable record of balances and transfers used to settle obligations between parties."],
      [
        "Double spending",
        "Attempting to spend the same economic claim twice by presenting conflicting valid-looking transfers.",
      ],
      [
        "Finality",
        "The point at which reversing a transfer becomes impractical relative to the value protected—economic, not magical.",
      ],
      [
        "Trusted third party (TTP)",
        "An operator that maintains the canonical ledger and resolves conflicts by policy or law.",
      ],
      [
        "Settlement",
        "The process by which provisional transfers become binding obligations with limited practical reversal.",
      ],
      [
        "Neutrality (protocol sense)",
        "Fixed validation rules applied uniformly rather than discretionary case-by-case edits.",
      ],
    ),
    lessonsById["s1-m1-l1"],
  ),

  "s1-m1-l2": lessonContent(
    [
      sec(
        "Introduction",
        "Hash functions are the workhorses of modern cryptocurrency engineering. They compress arbitrary data into short fingerprints, tie blocks together, build Merkle trees, and power proof-of-work puzzles. Unlike encryption, hashes are one-way in practice: easy to compute forward, infeasible to invert without guessing. Understanding their security properties—and their limits—prevents entire classes of design bugs.",
        "This lesson separates three related guarantees (preimage resistance, second-preimage resistance, and collision resistance) and shows how they enable commitments: hiding a choice now while binding yourself to reveal it later. We also preview Merkle trees, which let verifiers check membership in huge datasets with only logarithmic work.",
      ),
      sec(
        "What a Cryptographic Hash Guarantees",
        "A cryptographic hash function H maps inputs of any length to fixed-size outputs. Determinism means everyone computes the same digest for the same message—essential for consensus. Preimage resistance means that given a target digest y, finding any message m with H(m)=y should be infeasible. Second-preimage resistance means that given a message m1, finding a different m2 with H(m1)=H(m2) should be infeasible. Collision resistance means finding any pair (m1,m2) with H(m1)=H(m2) should be infeasible.",
        "These properties are related but not identical. Collision resistance is the strongest in the trio for generic attacks, yet second-preimage resistance does not automatically follow from collision resistance in every formal sense—engineers still specify which game they need to win. For Bitcoin's block linking, attackers want to find alternate histories; for commitments, you primarily need binding against yourself later.",
        "The random oracle heuristic treats H as a public random function: outputs look uniform and independent until the input is revealed. Real hashes like SHA-256 are not random oracles, which is why designers avoid clever tricks that assume perfect unpredictability. Length-extension attacks on Merkle–Damgård constructions matter when you naively use H(secret||message) as a MAC—use HMAC or dedicated constructs instead.",
      ),
      sec(
        "Commitments: Hiding and Binding",
        "A commitment scheme lets Alice publish a value C now that hides her choice x until she opens it later, while preventing her from changing x after the fact. A simple pattern is C = H(x || r) with random salt r. Binding means she cannot find two openings that verify to the same C; hiding means observers cannot guess x from C without brute force if entropy is adequate.",
        "On-chain, commitments appear in taproot-style constructions, hash locks for atomic swaps, and timestamping ideas. Off-chain, they underpin fair coin toss protocols and some voting designs. The security story always asks: who generates randomness, where is C stored, and what happens if opening never arrives?",
      ),
      sec(
        "Merkle Trees and Scalable Proofs",
        "Pairwise hashing builds a binary tree whose root commits to an entire set of leaves. To prove leaf L3 is included, a prover supplies sibling hashes along the path from L3 to the root; the verifier recomputes the root with O(log n) hashes instead of downloading all leaves. Bitcoin places the Merkle root of transactions in the block header, so light clients can check inclusion given a header chain and a proof path.",
        "Merkle proofs trade bandwidth for trust in the root's context. If you trust the header chain, a valid proof means the transaction was committed in that block's body. They do not, by themselves, prove balances or script validity—that requires fuller verification. Later systems generalize the idea into state trees, Verkle trees, and polynomial commitments, but the intuition—compress many leaves into one binding root—remains constant.",
      ),
      sec(
        "Practical Implications",
        "When you see SHA-256d in Bitcoin mining, you are seeing a deliberately slow-to-find, fast-to-verify puzzle built from hashes. When you see address checksums, you are seeing truncated hash-derived redundancy to catch human transcription errors—not secrecy. Pick the hash for the threat model: proof-of-work needs ASIC-friendly repetition; commitments need collision strength; password storage needs slow KDFs like Argon2, not raw SHA-256.",
      ),
      sec(
        "Common Mistakes",
        "Hashing low-entropy secrets without salt, expecting preimage resistance to save you from dictionary attacks.",
        "Assuming Merkle proof = full node security. Proofs attest inclusion under a root; economic and consensus context still matter.",
        "Treating SHA-256 as a random oracle in protocols vulnerable to length extension or algebraic structure.",
      ),
      sec(
        "Summary",
        "Hashes provide integrity, binding, and efficient aggregation. Know which property your protocol needs, use salts and proper MACs where appropriate, and use Merkle trees when verifiers must check membership without full data. Bitcoin's block headers are a daily demonstration that a 32-byte root can anchor gigabytes of history—if everyone agrees on the same root under the same rules.",
      ),
    ],
    terms(
      ["Preimage resistance", "Given a digest, finding any input that hashes to it should be infeasible."],
      [
        "Collision resistance",
        "Finding any two distinct inputs with the same hash output should be infeasible.",
      ],
      [
        "Commitment",
        "A published value that hides data now and binds the committer to a unique opening later.",
      ],
      ["Merkle root", "The top hash of a Merkle tree that commits to an entire set of leaves."],
      [
        "Random oracle (heuristic)",
        "Modeling a hash as an ideal public random function for security arguments—use with care.",
      ],
      [
        "Length-extension attack",
        "Forging extensions to certain hash-based MACs when secret||message form is misused.",
      ],
    ),
    lessonsById["s1-m1-l2"],
  ),

  "s1-m1-l3": lessonContent(
    [
      sec(
        "Introduction",
        "Public-key cryptography gives each participant a key pair: a private key that must remain secret and a public key that can be distributed widely. Digital signatures let the holder of a private key endorse a message; anyone with the public key can verify that endorsement without learning the secret. In cryptocurrency, that pipeline often stands in for identity: possession of the signing key is treated as authorization to move funds.",
        "This lesson stays conceptual—no implementation of elliptic curve math—but you will leave able to describe sign/verify workflows, contrast symmetric vs asymmetric uses, and articulate why phishing and device theft are signature problems as much as cryptography problems.",
      ),
      sec(
        "Symmetric vs Asymmetric Workflows",
        "Symmetric cryptography uses one shared secret for both encryption and decryption (or MAC and verify). It is fast and suited to bulk data protection after keys are established. Asymmetric cryptography uses mismatched keys: what one encrypts only the other decrypts; what one signs only the other verifies. Key distribution scales better publicly—you publish verification keys—but operations are slower and key management dominates risk.",
        "Typical hybrid designs encrypt a random session key with asymmetric crypto, then use symmetric AEAD for the payload. Bitcoin transactions primarily use signatures (ECDSA historically, Schnorr in taproot contexts) to authorize spending rather than to encrypt balances—everything is public on chain. Privacy systems later reintroduce symmetric ciphers and zero-knowledge proofs on top of the same signing core.",
      ),
      sec(
        "Digital Signatures in Plain Language",
        "Signing takes a message m and private key sk, producing a signature σ. Verification takes m, σ, and public key pk, outputting accept or reject. Security goals include unforgeability (without sk, creating valid pairs is hard) and non-repudiation in business settings (signer cannot credibly deny having signed—though repudiation may still happen socially or via key compromise claims).",
        "On-chain, the 'message' is a carefully serialized transaction digest; wallets hide this behind user-friendly flows. A signature binds authorization to that exact digest—change a single output address and the signature fails. That is why UI integrity matters: malware that alters the digest before signing is indistinguishable from valid signing from the network's perspective.",
      ),
      sec(
        "Keys, Custody, and Threat Models",
        "Software keys in hot wallets are convenient and exposed to malware, clipboard attacks, and backup leaks. Hardware signers keep keys off the general-purpose CPU but still depend on what the user approves on screen. Multisig spreads risk across independent keys and policies, trading UX friction for resilience against single-device loss.",
        "'Not your keys, not your coins' is a custody statement: custodial platforms sign on your behalf under their policies, which may freeze, rehypothecate, or fail outright. Self-custody returns authorization to your keys—and returns catastrophic loss risk if you mishandle backups. Neither pole removes trust; they relocate it to code, devices, and personal discipline.",
      ),
      sec(
        "Practical Implications",
        "Treat signing ceremonies as security-critical: clear display of recipient, amount, asset, and network; confirm on a trusted screen; prefer hardware for material amounts. For organizations, define who holds which keys, how rotations work, and what happens when an employee leaves. Signatures prove key possession, not intent—legal and operational layers still matter.",
      ),
      sec(
        "Common Mistakes",
        "Equating a public key with a verified human identity without binding KYC or contractual recourse.",
        "Assuming multisig alone stops social engineering—it changes keys at risk, not gullibility.",
        "Storing seed phrases in password managers synced to cloud without modeling cloud breach threat.",
      ),
      sec(
        "Summary",
        "Public-key tools enable scalable verification of authorization. Digital signatures secure Bitcoin spends and many other protocols, but security lives in key generation, storage, and user comprehension. Phishing succeeds by tricking humans into signing the wrong message; engineering must align displays, defaults, and policies with how attackers actually operate.",
      ),
    ],
    terms(
      ["Private key", "Secret material used to produce signatures or decrypt messages meant for you."],
      ["Public key", "Published material used to verify signatures or encrypt messages to you."],
      [
        "Digital signature",
        "A proof that the holder of a private key endorsed a specific message under a defined scheme.",
      ],
      [
        "Multisig",
        "A policy requiring multiple independent signatures before a transaction is valid.",
      ],
      [
        "Non-repudiation",
        "Difficulty of credibly denying authorship after a verified signature—context-dependent in law.",
      ],
      ["Self-custody", "User control of signing keys rather than delegating signing to a custodian."],
    ),
    lessonsById["s1-m1-l3"],
  ),

  "s1-m2-l1": lessonContent(
    [
      sec(
        "Introduction",
        "Bitcoin's ledger is not a table of account balances like many bank databases. It is a set of unspent transaction outputs (UTXOs), each carrying a specific amount and locking conditions written in Bitcoin Script. Spending consumes one or more UTXOs as inputs and creates new UTXOs as outputs; value is conserved minus fees. The blockchain orders those transactions and provides evidence of which UTXO set is current under consensus rules.",
        "This model shapes privacy, parallelism, and wallet engineering differently from account-based chains like Ethereum. Neither model is universally superior—they optimize for different verification and state-transition ergonomics.",
      ),
      sec(
        "The UTXO Graph Mental Model",
        "Picture outputs as coins with labels: 'pay 0.5 BTC to pubkey hash X.' Wallets track which outputs belong to you by scanning or indexing the chain. When you pay someone, you select enough inputs to cover amount plus fee, sign unlocking scripts, and create outputs—often including change back to yourself. There is no global 'balance' field; balance is the sum of your unspent outputs.",
        "Because coins are discrete, transactions can be validated in parallel: each input references a prior output that must exist and be unspent. Double spends are local conflicts on the same outpoint. Account models instead update one nonce-protected balance row per address, which simplifies some smart contract patterns but serializes state per account.",
      ),
      sec(
        "Script at a Bird's-Eye View",
        "Bitcoin Script is a stack-based, intentionally limited language for locking and unlocking funds. Common patterns include pay-to-public-key-hash (P2PKH), pay-to-script-hash (P2SH) wrapping more complex policies, and SegWit versions that separate witness data for fee and malleability reasons. Full nodes execute script on spend—verification is cheap relative to creating proof-of-work.",
        "You do not need opcode mastery yet: understand that conditions are predicates on signatures, hashes, timelocks, and multisig thresholds. Taproot later merges key and script paths for privacy and efficiency, but the UTXO framing remains.",
      ),
      sec(
        "Blocks, Headers, and Evidence",
        "Blocks bundle transactions and commit to them via the Merkle root in the header. Headers also carry previous block hash, timestamp, difficulty target, and nonce—forming the chain miners extend. For users, confirmation depth measures how many blocks have been built on top of the block containing your transaction; deeper means more work to rewrite.",
        "Reorg depth matters economically: a coffee purchase tolerates shallow finality; a house purchase does not. Exchanges set credit thresholds by policy, not physics. Light clients lean on headers plus proofs; full nodes recompute everything—trust asymmetry we revisit in the SPV lesson.",
      ),
      sec(
        "Practical Implications",
        "Wallet software must coin-select inputs, estimate fees by vbytes, and handle change safely. Privacy suffers when you merge many small UTXOs or reuse addresses. On explorers, trace inputs backward and outputs forward to narrate a payment—practice this until direction and fees feel automatic.",
      ),
      sec(
        "Common Mistakes",
        "Assuming account-abstraction features exist natively on Bitcoin because other chains market them heavily.",
        "Ignoring change outputs and accidentally burning value to fees or unknown scripts.",
        "Treating one confirmation as equivalent for all dollar amounts and threat models.",
      ),
      sec(
        "Summary",
        "Bitcoin state is a UTXO set evolved by validated transactions. Script encodes spending policies; blocks order history and anchor work. Verification is cheap for nodes, reordering history is expensive for attackers. Design and risk policies should respect probabilistic finality and the graph nature of coins.",
      ),
    ],
    terms(
      ["UTXO", "An unspent transaction output specifying value and locking conditions."],
      ["Outpoint", "A reference to a specific output (txid + index) consumed as an input."],
      ["Coin selection", "Wallet algorithm choosing which UTXOs to fund a payment."],
      ["SegWit", "Upgrade separating witness data, changing weight/fee accounting and malleability."],
      ["Reorg", "When a competing chain tip overtakes prior blocks, undoing their transactions."],
      ["Fee rate", "Transaction fee per unit of virtual size (vbytes), competing for block space."],
    ),
    lessonsById["s1-m2-l1"],
  ),

  "s1-m2-l2": lessonContent(
    [
      sec(
        "Introduction",
        "Proof-of-work (PoW) ties block production to an expensive, verifiable lottery grounded in hash computations. Miners repeatedly hash block headers with nonces until the result falls below a difficulty target; the network adjusts difficulty so blocks arrive near a target cadence. Honest miners collectively extend the chain with the most cumulative work, making rewriting deep history require redoing that work faster than the honest majority.",
        "PoW does not solve every distributed systems problem—it buys probabilistic agreement under open participation with explicit economic costs. Energy use is the security budget expressed in physics, not merely a moral talking point.",
      ),
      sec(
        "Byzantine Failures and Open Networks",
        "In the Byzantine Generals problem, coordinated actors must agree despite traitors sending conflicting messages. Impossibility results show you cannot guarantee deterministic agreement in every asynchronous setting without assumptions. Practical public blockchains therefore mix cryptography, economic penalties, and randomness in leader election.",
        "PoW elects leaders probabilistically proportional to hashpower. Small committees in BFT-style systems (used in many permissioned or high-throughput chains) trade openness for faster finality votes among known validators. Comparing them is comparing security models: economic majority vs bonded stake vs legal identity of operators.",
      ),
      sec(
        "The PoW Puzzle and Difficulty Adjustment",
        "The puzzle is embarrassingly parallel and cheap to verify: given a header, check one hash against the target. Finding a valid nonce is hard on average; sharing rewards via pools does not change the global work requirement. Difficulty retargeting is a negative feedback loop—if blocks arrive too quickly, the target hardens; too slowly, it eases—keeping inter-block time near design goals despite changing hardware.",
        "Hashrate shocks (e.g., sudden 40% drop) slow block production until adjustment, increasing confirmation latency and potentially enabling cheaper short-range reorgs until work recovers. Users feel fees and delays before long-run economics fully rebalance.",
      ),
      sec(
        "Economics, ASICs, and Ordering Value",
        "Specialized hardware (ASICs) dominates PoW coins with simple hash functions, raising capex barriers and altering decentralization debates. Security spend roughly tracks miner revenue: block subsidies plus fees. As subsidies halve, fee markets must carry more of the budget or security margin falls—an under-discussed long-term parameter.",
        "Miners also choose transaction ordering within blocks; ordering can extract MEV-like value even in Bitcoin, previewing richer extraction on smart-contract chains. Energy externalities are real policy concerns, but neutral analysis separates grid mix, curtailed power use, measurement methodology, and security tradeoffs from slogan warfare.",
      ),
      sec(
        "Practical Implications",
        "When evaluating PoW bans or incentives, define metrics: emissions per kWh, grid stability contributions, and security cost per dollar protected. For integrators, monitor hash rate and fee markets around halvings or geopolitical shocks. Do not promise instant finality PoW cannot offer without additional layers.",
      ),
      sec(
        "Common Mistakes",
        "Claiming PoW is 'wasteful' without stating what security budget replaces it.",
        "Assuming green branding on a token equals low lifecycle energy without chain-specific data.",
        "Ignoring that lower hash rate first harms liveness and confirmation times, not necessarily theft at depth.",
      ),
      sec(
        "Summary",
        "PoW converts electricity and hardware into a probabilistic fence around history. Difficulty adjustment stabilizes block times; economics link security to subsidies and fees. Compare PoW openly to other consensus families by finality profile, openness, and cost accounting—not by slogans alone.",
      ),
    ],
    terms(
      ["Proof-of-work", "Consensus mechanism requiring costly hashes to produce blocks, cheap to verify."],
      ["Hashrate", "Aggregate computational speed searching for valid proofs across miners."],
      [
        "Difficulty target",
        "Threshold a block hash must beat; retargeted to regulate block production rate.",
      ],
      [
        "Probabilistic finality",
        "Confidence grows with confirmations but never becomes absolute in open PoW.",
      ],
      ["ASIC", "Hardware specialized for a particular PoW hash function."],
      [
        "Security budget",
        "Economic value paid to miners (subsidies + fees) securing the chain against reorgs.",
      ],
    ),
    lessonsById["s1-m2-l2"],
  ),

  "s1-m2-l3": lessonContent(
    [
      sec(
        "Introduction",
        "Not every device can download and validate the entire Bitcoin blockchain. Light clients—often mobile wallets—sync block headers and request partial data from peers or servers. Simplified Payment Verification (SPV) intuition: if you trust the header chain with the most work, a Merkle proof shows a transaction was included in a block whose header you accept. That saves bandwidth but changes the trust model.",
        "Later systems revisit the same theme: Ethereum light clients, bridges, and rollups ask what verifiers can prove with limited data versus what they must believe about operators or committees.",
      ),
      sec(
        "Full, Pruned, and Light Nodes",
        "Full nodes download blocks, validate every transaction and script, and maintain UTXO state—strongest security, highest resource cost. Pruned nodes discard old block data after validation while keeping recent state, preserving integrity without full archival history. Light clients typically store headers and rely on external proofs or servers for transaction details.",
        "The security gap is not 'dishonest math' but omitted checks: a light client may not see invalid transactions that full nodes reject, if it never executes them. It trusts that the header chain it follows was built under rules honest miners enforced—plus whatever peer served proofs did not lie by omission.",
      ),
      sec(
        "SPV Mechanics and Limits",
        "SPV users track header chains—linked hashes with difficulty—and verify Merkle branches for payments they care about. They do not independently confirm that all transactions in a block were valid; they assume miners would not have built on invalid blocks because full nodes would reject them. This holds statistically if miners are economically rational and full nodes are numerous—but it is weaker than full verification.",
        "Historical bloom filters let mobile clients query peers for relevant transactions with privacy tradeoffs; modern setups often use personal servers or wallet backends, recentralizing trust in practice. Name the concrete provider when you say 'wallet connects to the network.'",
      ),
      sec(
        "Attacks and Trust Budgets",
        "Naive light clients can be fooled if an attacker feeds a fake low-work header chain—isolated from the honest network—or withholds contradictory proofs. Honest-majority hash power protects SPV only insofar as the client actually talks to honest peers and compares work. Eclipse attacks on peer selection amplify risk.",
        "RPC providers and indexers are convenience layers with custodial flavors: they see queries, can censor responses, and may log addresses. Using them is not wrong—just be explicit that you trust their availability and honesty for whatever checks you skip locally.",
      ),
      sec(
        "Practical Implications",
        "Draw a trust stack for your setup: hardware signer, mobile app, backend, DNS, firmware updates. For high-value self-custody, pair a hardware wallet with your own full node or a minimally trusted connection. For browsing balances, acknowledge SPV-grade assurance is often enough—until it is not.",
      ),
      sec(
        "Common Mistakes",
        "Labeling a wallet 'non-custodial' while all chain data comes from a single proprietary API.",
        "Assuming header sync equals full validation of balances and scripts.",
        "Ignoring peer diversity and update integrity in threat models.",
      ),
      sec(
        "Summary",
        "Light clients economize on data by trusting work-weighted headers and supplied proofs. Full nodes anchor security for the network; SPV users free-ride on that anchor with reduced checks. Document trust assumptions anytime you outsource chain reads—and plan upgrades (your own node, multisig, confirmations) when stakes rise.",
      ),
    ],
    terms(
      ["SPV", "Verifying inclusion via headers and Merkle proofs without full transaction validation."],
      ["Header chain", "Sequence of block headers linked by hashes and cumulative work."],
      ["Merkle proof", "Sibling hashes proving a transaction is in the block's Merkle tree."],
      ["Eclipse attack", "Isolating a node from honest peers to feed false chain views."],
      [
        "RPC provider",
        "Service exposing node APIs; often trusted for data availability and correctness.",
      ],
      ["Pruned node", "Full validator that discards old blocks after confirming them to save disk."],
    ),
    lessonsById["s1-m2-l3"],
  ),

  "s1-m3-l1": lessonContent(
    [
      sec(
        "Introduction",
        "Wallet seeds—usually 12 or 24 words—encode the secret material from which hierarchical deterministic (HD) wallets derive many keys along standardized paths. Standards like BIP-39 define mnemonic encoding with checksums; BIP-32/44 define derivation trees so one backup can regenerate accounts across chains—if software agrees on the path. Convenience collides with catastrophic loss if backups leak or restoration mismatches paths.",
        "This lesson builds operational literacy: what seeds protect, how passphrases help, and why hot storage differs from cold and multisig architectures.",
      ),
      sec(
        "Entropy, Mnemonics, and Checksums",
        "BIP-39 maps encoded entropy plus checksum bits to a wordlist. The checksum means random typos often fail validation on restore—good for catching mistakes, frustrating if you transcribed poorly. Entropy must come from a cryptographic random source, not birthdays or poems; brain wallets from human-chosen phrases have been swept by attackers guessing popular lines.",
        "The mnemonic is not the private key itself but a reversible encoding of seed bytes fed into a key derivation function (PBKDF2 in BIP-39) that outputs a master secret for HD derivation. Understanding that pipeline helps you see why '25th word' passphrases act like an extra factor—different passphrase, different tree—without changing the written words.",
      ),
      sec(
        "Derivation Paths and Multi-Chain Restoration",
        "BIP-44 paths look like m/44'/coin_type'/account'/change/index, with hardened segments preventing parent leakage. Wallets must agree on coin type and account indices or they scan empty addresses while funds sit on another branch. Restoring the same seed in two apps can show different balances if path policies differ—user error, not chain theft.",
        "Passphrases (sometimes called the 25th word) add a plausible deniability layer: possession of the written list alone opens only the default wallet. They also add forgetting risk—lost passphrase means lost funds with no recovery hotline. Threat modeling decides whether passphrase denial is worth operational fragility.",
      ),
      sec(
        "Hot, Cold, Airgap, and Multisig",
        "Hot wallets keep signing keys on networked devices—fast, vulnerable to malware. Cold storage keeps keys offline; airgapped signers exchange QR or microSD to reduce exposure. Multisig requires m-of-n keys to spend, distributing risk across people, devices, and locations at UX cost. Institutions combine HSMs, policies, and audit trails; individuals mix hardware signers with paper backups.",
        "Address reuse harms privacy by linking transactions to the same pubkey hash; modern wallets generate fresh receive addresses. Change outputs should return to your own fresh addresses, not reuse external-looking labels that confuse accounting.",
      ),
      sec(
        "Practical Implications",
        "Back up on durable media, test restores on testnet or small mainnet amounts, and store copies geographically separated with tamper-evident bags where appropriate. Never photograph seeds; cameras sync to clouds. For inheritance, document locations and passphrases via legal channels, not sticky notes on monitors.",
      ),
      sec(
        "Common Mistakes",
        "Typing seeds into websites offering 'validation' or 'airdrops'—instant exfiltration.",
        "Assuming all wallets restore identically without checking derivation paths and address types.",
        "Using cloud photo backup for paper wallets 'just in case.'",
      ),
      sec(
        "Summary",
        "Seeds are root secrets for HD wallets; paths standardize key trees across apps and chains. Passphrases and multisig modulate risk but add failure modes. Treat backup and restore as practiced procedures, not one-time setup trivia—testnet drills exist to build muscle memory without risking mainnet keys in coursework.",
      ),
    ],
    terms(
      ["BIP-39", "Standard encoding entropy as mnemonic words with embedded checksum."],
      ["HD wallet", "Hierarchical deterministic keys derived from one master seed."],
      [
        "Derivation path",
        "Structured route (e.g., BIP-44) determining which child keys a wallet generates.",
      ],
      [
        "Passphrase (25th word)",
        "Optional extra secret altering the derived wallet from the same mnemonic.",
      ],
      ["Hardened derivation", "Child keys that cannot be linked back to parent public keys."],
      ["Multisig", "Spending policy requiring multiple signatures from distinct keys."],
    ),
    lessonsById["s1-m3-l1"],
  ),

  "s1-m3-l2": lessonContent(
    [
      sec(
        "Introduction",
        "Addresses are the human-facing handles for receiving cryptocurrency. They embed versioning, payload data, and checksums so wallets can catch common transcription errors. Yet humans still paste wrong strings, malware swaps clipboards, and explorers poison 'recent address' lists with look-alike strings. Transfers are irreversible for practical purposes—UX and procedure matter as much as encoding.",
        "This lesson covers what Base58Check and Bech32 solve at a high level, how QR codes help and hurt, and design patterns that reduce mis-sends without assuming perfect vigilance.",
      ),
      sec(
        "Checksums and Encoding Families",
        "Legacy Bitcoin addresses (P2PKH/P2SH) often use Base58Check: base58 encoding plus a checksum derived from double-SHA256 of the payload. Typos usually fail validation instead of sending funds into the void—though not all error patterns are caught equally. Bech32 (SegWit) addresses use a different charset and polynomial checksum designed for better error detection and case-insensitive QR use.",
        "Ethereum-style hex addresses lack the same checksum discipline unless mixed-case EIP-55 encoding is used; many chains copied formats with weaker human factors. Always show full addresses on confirmation screens for material amounts, not just first/last four characters attackers can brute-force cosmetically.",
      ),
      sec(
        "QR Codes, Clipboards, and Poisoning",
        "QR codes speed mobile transfers but inherit camera and rendering risks: malicious overlays, swapped QR stickers on posters, and apps that decode URIs with hidden parameters. Clipboard hijackers watch for copied addresses and substitute attacker-controlled ones between copy and paste—especially on Windows and Android.",
        "Address poisoning spams tiny transfers from addresses that visually resemble your frequent counterparties, hoping you copy from history or block explorers. UI that sorts by 'recent' without highlighting novelty encourages this mistake. Small canary payments to new beneficiaries, paired with out-of-band confirmation (signal call, signed message), remain low-tech mitigations enterprises still use.",
      ),
      sec(
        "Names, Layers, and What They Do Not Fix",
        "Human-readable names (ENS and analogs) map memorable strings to addresses via on-chain or resolver systems. They solve memorization, not trust: resolver compromises, expired names, and phishing domains remain. Layer-two addresses and invoices add expiry and amount fields—useful—but depend on wallet support and user comprehension.",
        "Some teams ban pasting entirely for treasury ops, forcing address book entries built from signed attestations. Others require hardware confirmation of destination hashes. The right control depends on throughput, training, and adversary model—not aesthetics.",
      ),
      sec(
        "Practical Implications",
        "Design safe-send flows: explicit network selection, amount in asset and fiat, full address display, second-factor confirmation for new recipients, and cooldowns for address-book changes. Log incidents near-misses to refine policy. Educate users that explorers are untrusted UI, not oracles.",
      ),
      sec(
        "Common Mistakes",
        "Trusting partial address matches in chat screenshots.",
        "Skipping network/asset checks when chains share similar address formats (e.g., EVM clones).",
        "Assuming ENS immunity from homoglyph phishing.",
      ),
      sec(
        "Summary",
        "Addresses bundle data and error detection; humans bundle optimism and haste. Combine technical checksums with procedural verification for new counterparties. Treat QR and clipboard as hostile channels unless hardened by wallet design and organizational policy.",
      ),
    ],
    terms(
      ["Base58Check", "Encoding format adding checksum to legacy Bitcoin addresses."],
      ["Bech32", "SegWit address format with stronger checksum and QR-friendly charset."],
      [
        "Address poisoning",
        "Spamming look-alike addresses to trick users copying from history.",
      ],
      [
        "Clipboard hijacker",
        "Malware replacing copied addresses with attacker-controlled ones.",
      ],
      ["Canary payment", "Small test transfer verifying correct recipient before large send."],
      [
        "ENS",
        "Ethereum Name Service mapping human-readable names to addresses via resolvers.",
      ],
    ),
    lessonsById["s1-m3-l2"],
  ),

  "s1-m3-l3": lessonContent(
    [
      sec(
        "Introduction",
        "Security incidents in cryptocurrency blend classic IT response with irreversible asset movement. The first hour after suspected compromise—phishing link clicked, seed photographed, SIM swapped, malware alert—should follow a rehearsed sequence: contain damage, preserve evidence, notify relevant parties, and avoid panic trades that lock in loss or tax chaos. This lesson adapts generic incident response to retail and small-business wallet scenarios.",
        "You will not become a forensic investigator overnight, but you can stop making things worse and know when to escalate.",
      ),
      sec(
        "Containment Before Eradication",
        "Containment limits ongoing loss: disconnect compromised machines from networks, revoke browser sessions and API keys on exchanges, disable SMS-based 2FA in favor of authenticator or hardware keys where possible, and pause automated trading bots. Do not wipe disks immediately if you might need logs for professionals or law enforcement—snapshot mentally what happened and photograph timelines.",
        "For seed leaks, assume funds are live on attacker timelines—migrating to fresh keys on clean hardware beats debating whether someone 'really' saw the photo. For exchange account takeovers, use official support channels listed on the exchange's own site, not DMs offering 'recovery.'",
      ),
      sec(
        "Exchange Accounts, Evidence, and Law Enforcement",
        "Exchanges can freeze accounts with sufficient notice if fraud is caught early, but timelines vary and cross-jurisdiction cases stall. Evidence that helps: transaction IDs, deposit addresses, timestamps, IP logs you legitimately possess, and comms with scammers (hashes, not public doxxing). Evidence that rarely helps alone: 'please hack this wallet' requests or blockchain 'reverse' myths.",
        "Law enforcement and banks care about fiat ramps, KYC trails, and fraud categories—not your favorite thread on tracing tools. Chain analytics firms assist enterprises with subpoenas; retail users should set expectations low and focus on rapid reporting to platforms where cash entered or exited.",
      ),
      sec(
        "Recovery, Rotation, and Communication",
        "Recovery means returning to known-good keys and processes: new seed on hardware generated in private, new email with unique password manager entries, updated withdrawal allowlists, and multisig where appropriate. Eradication removes malware, reinstalls OS from trusted media, and rotates every secret that touched the device—including Wi-Fi passwords if paranoid and justified.",
        "Public posts after incidents should avoid sharing seed words, full addresses you still use, or details that help attackers social-engineer helpers. Share indicators (phishing domain, scam contract pattern) not your remaining holdings map.",
      ),
      sec(
        "Practical Implications",
        "Maintain a one-page runbook: who to call (exchange fraud desk, lawyer, insurer), in what order, and what not to do (send 'recovery fee' crypto, grant remote desktop to 'support'). Practice on testnet backups quarterly. Separate hot spending wallets from cold savings to bound incident blast radius.",
      ),
      sec(
        "Common Mistakes",
        "Rushing funds to unknown 'recovery services' that are secondary scams.",
        "Publishing screenshots with QR seeds or API keys blurred poorly.",
        "Assuming on-chain reversibility because 'the blockchain is transparent.'",
      ),
      sec(
        "Summary",
        "Treat wallet incidents like combined cyber and treasury events: contain, document, rotate, report through official channels, and escalate to professionals for material losses. Calm procedure beats heroic guessing; prevention via hardware, multisig, and tested backups remains cheaper than any response.",
      ),
    ],
    terms(
      ["Containment", "Immediate steps to stop ongoing unauthorized access or transfers."],
      ["Eradication", "Removing attacker persistence (malware, backdoors) from systems."],
      [
        "Allowlist",
        "Exchange feature permitting withdrawals only to pre-approved addresses after delay.",
      ],
      [
        "SIM swap",
        "Attacker porting phone number to intercept SMS 2FA and reset accounts.",
      ],
      [
        "Chain analytics",
        "Tracing flows on ledger for investigations—often enterprise/government mediated.",
      ],
      ["Runbook", "Ordered checklist executed during incidents to reduce panic errors."],
    ),
    lessonsById["s1-m3-l3"],
  ),
};
