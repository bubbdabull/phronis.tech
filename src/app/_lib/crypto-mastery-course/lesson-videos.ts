/**
 * Curated lecture videos — one unique, topic-matched URL per lesson and module overview.
 * Verified via oEmbed (see scripts/verify-academy-videos.mjs).
 */

const V = {
  // Semester 1 — foundations
  blockchainIntro: "https://www.youtube.com/watch?v=kHybf1aC-jE",
  bitcoinDeep: "https://www.youtube.com/watch?v=bBC-nXj3Ng4",
  bitcoinIntro: "https://www.youtube.com/watch?v=l1si5ZWLgy0",
  bitcoinComputerphile: "https://www.youtube.com/watch?v=qcuc3rgwZAE",
  hashSha: "https://www.youtube.com/watch?v=DMtFhACPnTY",
  hashSecurity: "https://www.youtube.com/watch?v=b4b8ktEV4Bg",
  publicKey: "https://www.youtube.com/watch?v=GSIDS_lvRv4",
  rsa: "https://www.youtube.com/watch?v=JD72Ry60eP4",
  merkle: "https://www.youtube.com/watch?v=jBrTNJ17lA0",
  seedPhrase: "https://www.youtube.com/watch?v=vi4cPN_4VPc",
  cryptoSafety: "https://www.youtube.com/watch?v=7JFeMBIVtvQ",
  phishing: "https://www.youtube.com/watch?v=00bUOCnRuv0",

  // Semester 2 — Ethereum & Solana
  vitalikEth: "https://www.youtube.com/watch?v=TDGq4aeevgY",
  evm: "https://www.youtube.com/watch?v=sTOcqS4msoU",
  gas: "https://www.youtube.com/watch?v=Yh8cHUB-KoU",
  eth2: "https://www.youtube.com/watch?v=ctzGr58_jeI",
  graphIndexer: "https://www.youtube.com/watch?v=7gC7xJ_98r8",
  smartContracts: "https://www.youtube.com/watch?v=PLgawr4pbqE",
  smartContractsSchool: "https://www.youtube.com/watch?v=fv3MhEJo4sE",
  solidityBasics: "https://www.youtube.com/watch?v=5dcRMHUhA20",
  reentrancy: "https://www.youtube.com/watch?v=3T1t2ginfTg",
  reentrancyHack: "https://www.youtube.com/watch?v=hIOoM9KO3fw",
  erc20: "https://www.youtube.com/watch?v=cqZhNzZoMh8",
  layer2: "https://www.youtube.com/watch?v=BgCgauWVTs0",
  rollups: "https://www.youtube.com/watch?v=7pWxCklcNsU",
  bridges: "https://www.youtube.com/watch?v=HZcTLxzbm7Y",
  thorchain: "https://www.youtube.com/watch?v=dNDh-mPboPc",
  chainsOverview: "https://www.youtube.com/watch?v=yubzJw0uiE4",
  solanaShort: "https://www.youtube.com/watch?v=GZ-bYOCMfmE",
  solanaDoc: "https://www.youtube.com/watch?v=RtzZsJHUL9o",

  // Semester 3 — assets & markets
  tokenomics: "https://www.youtube.com/watch?v=e-8yjmsshFg",
  nfts: "https://www.youtube.com/watch?v=Xdkkux6OxfM",
  nftMetadata: "https://www.youtube.com/watch?v=6xp3OfKiBCc",
  nftIpfs: "https://www.youtube.com/watch?v=1f7GvvOIe6Y",
  stablecoinRun: "https://www.youtube.com/watch?v=HUokre-szPg",
  daoIntro: "https://www.youtube.com/watch?v=KHm0uUPqmVE",
  quadraticFunding: "https://www.youtube.com/watch?v=hEHv-dE4xl8",
  multisigSafe: "https://www.youtube.com/watch?v=TWMW32APiHY",
  gnosisSafe: "https://www.youtube.com/watch?v=y9zNmlzg8AI",
  orderBook: "https://www.youtube.com/watch?v=72rrMeMCMFU",
  ammWhy: "https://www.youtube.com/watch?v=U8J0zAkrQ0s",
  marketManipulation: "https://www.youtube.com/watch?v=YxsEbILNGGM",
  defiFuture: "https://www.youtube.com/watch?v=H-O3r2YMWJ4",
  scamPi: "https://www.youtube.com/watch?v=wHjuX20y82c",
  scams2025: "https://www.youtube.com/watch?v=cC-jh1PJeHw",
  washTrading: "https://www.youtube.com/watch?v=7zED2nwq0Vk",
  mev: "https://www.youtube.com/watch?v=zSc1_1kk-VI",
  cexDex: "https://www.youtube.com/watch?v=zzqtYu5_u5k",
  defiHistory: "https://www.youtube.com/watch?v=qFBYB4W2tqU",
  yieldFarming: "https://www.youtube.com/watch?v=ClnnLI1SClA",
  wrappedBtc: "https://www.youtube.com/watch?v=iExly7FGKAQ",

  // Semester 4 — DeFi depth
  liquidityPools: "https://www.youtube.com/watch?v=cizLhxSKrAc",
  impermanentLoss: "https://www.youtube.com/watch?v=8XJ1MSTEuU0",
  uniswapV3: "https://www.youtube.com/watch?v=Ehm-OYBmlPM",
  lending: "https://www.youtube.com/watch?v=aTp9er6S73M",
  aave: "https://www.youtube.com/watch?v=WwE3lUq51gQ",
  oracles: "https://www.youtube.com/watch?v=ZJfkNzyO7-U",
  oraclesCompare: "https://www.youtube.com/watch?v=jaUufwQfjfU",
  composability: "https://www.youtube.com/watch?v=MnsjUZo7RRI",
  defiOverview: "https://www.youtube.com/watch?v=k9HYC0EJU6E",
  auditIntro: "https://www.youtube.com/watch?v=ylP44hSbI1o",
  auditHowTo: "https://www.youtube.com/watch?v=VAumxFQOU0o",

  // Semester 5 — security
  secureWallet: "https://www.youtube.com/watch?v=kGDwzjqdcLg",
  reentrancySolidity: "https://www.youtube.com/watch?v=5BYg79J4fC0",
  privacyTornado: "https://www.youtube.com/watch?v=z_cRicXX1jI",
  vitalikNeutrality: "https://www.youtube.com/watch?v=GUhDXUA4mfQ",
  restakingPanel: "https://www.youtube.com/watch?v=aP9f_1v9Ulc",

  // Semester 6 — research & careers
  researchCs: "https://www.youtube.com/watch?v=foflxVMuF6A",
  researchScientific: "https://www.youtube.com/watch?v=jrjz0QyvON8",
  researchMl: "https://www.youtube.com/watch?v=BCY9nzXGTWc",
  presentation: "https://www.youtube.com/watch?v=Unzc731iCUY",
  vitalikRoadmap: "https://www.youtube.com/watch?v=BWvThjrjTmw",
  web3Career: "https://www.youtube.com/watch?v=gyMwXuJrbJQ",
  blockchain101: "https://www.youtube.com/watch?v=Qe-3FUxThso",
  researchPapers: "https://www.youtube.com/watch?v=WVv2jWXW0K4",
} as const;

/** Module overview — unique per section, aligned to module title. */
export const MODULE_VIDEO_URLS: Readonly<Record<string, string>> = {
  "s1-m1": V.blockchainIntro,
  "s1-m2": V.bitcoinDeep,
  "s1-m3": V.seedPhrase,
  "s2-m1": V.vitalikEth,
  "s2-m2": V.smartContracts,
  "s2-m3": V.layer2,
  "s2-m4": V.solanaDoc,
  "s3-m1": V.tokenomics,
  "s3-m2": V.daoIntro,
  "s3-m3": V.cexDex,
  "s3-m4": V.scams2025,
  "s3-m5": V.mev,
  "s3-m6": V.defiHistory,
  "s4-m1": V.liquidityPools,
  "s4-m2": V.lending,
  "s4-m3": V.stablecoinRun,
  "s5-m1": V.secureWallet,
  "s5-m2": V.auditIntro,
  "s5-m3": V.vitalikNeutrality,
  "s6-m1": V.researchCs,
  "s6-m2": V.presentation,
  "s6-m3": V.web3Career,
};

/** One unique video per class — matched to lesson title/topic. */
export const LESSON_VIDEO_URLS: Readonly<Record<string, string>> = {
  "s1-m1-l1": V.bitcoinDeep,
  "s1-m1-l2": V.hashSha,
  "s1-m1-l3": V.publicKey,
  "s1-m2-l1": V.bitcoinIntro,
  "s1-m2-l2": V.bitcoinComputerphile,
  "s1-m2-l3": V.merkle,
  "s1-m3-l1": V.seedPhrase,
  "s1-m3-l2": V.rsa,
  "s1-m3-l3": V.cryptoSafety,
  "s2-m1-l1": V.evm,
  "s2-m1-l2": V.gas,
  "s2-m1-l3": V.graphIndexer,
  "s2-m2-l1": V.smartContractsSchool,
  "s2-m2-l2": V.reentrancy,
  "s2-m2-l3": V.erc20,
  "s2-m3-l1": V.rollups,
  "s2-m3-l2": V.bridges,
  "s2-m3-l3": V.thorchain,
  "s2-m4-l1": V.chainsOverview,
  "s2-m4-l2": V.solanaShort,
  "s2-m4-l3": V.solanaDoc,
  "s3-m1-l1": V.tokenomics,
  "s3-m1-l2": V.nfts,
  "s3-m1-l3": V.stablecoinRun,
  "s3-m2-l1": V.quadraticFunding,
  "s3-m2-l2": V.multisigSafe,
  "s3-m2-l3": V.gnosisSafe,
  "s3-m3-l1": V.orderBook,
  "s3-m3-l2": V.ammWhy,
  "s3-m3-l3": V.defiFuture,
  "s3-m4-l1": V.scamPi,
  "s3-m4-l2": V.nftMetadata,
  "s3-m4-l3": V.washTrading,
  "s3-m5-l1": V.marketManipulation,
  "s3-m5-l2": V.mev,
  "s3-m5-l3": V.eth2,
  "s3-m6-l1": V.cexDex,
  "s3-m6-l2": V.defiHistory,
  "s3-m6-l3": V.wrappedBtc,
  "s4-m1-l1": V.liquidityPools,
  "s4-m1-l2": V.impermanentLoss,
  "s4-m1-l3": V.uniswapV3,
  "s4-m2-l1": V.lending,
  "s4-m2-l2": V.aave,
  "s4-m2-l3": V.oraclesCompare,
  "s4-m3-l1": V.composability,
  "s4-m3-l2": V.auditIntro,
  "s4-m3-l3": V.defiOverview,
  "s5-m1-l1": V.secureWallet,
  "s5-m1-l2": V.phishing,
  "s5-m1-l3": V.gnosisSafe,
  "s5-m2-l1": V.auditIntro,
  "s5-m2-l2": V.reentrancySolidity,
  "s5-m2-l3": V.auditHowTo,
  "s5-m3-l1": V.restakingPanel,
  "s5-m3-l2": V.privacyTornado,
  "s5-m3-l3": V.restakingPanel,
  "s6-m1-l1": V.researchCs,
  "s6-m1-l2": V.researchScientific,
  "s6-m1-l3": V.researchMl,
  "s6-m2-l1": V.presentation,
  "s6-m2-l2": V.scams2025,
  "s6-m2-l3": V.vitalikRoadmap,
  "s6-m3-l1": V.web3Career,
  "s6-m3-l2": V.blockchain101,
  "s6-m3-l3": V.researchPapers,
};

export function youtubeEmbedId(url: string | undefined | null): string | null {
  if (!url?.trim()) return null;
  const u = url.trim();
  const short = u.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (short) return short[1];
  const watch = u.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watch) return watch[1];
  const embed = u.match(/embed\/([a-zA-Z0-9_-]{11})/);
  if (embed) return embed[1];
  return null;
}

export function resolveLessonVideoUrl(lessonId: string, inline?: string): string | null {
  return inline?.trim() || LESSON_VIDEO_URLS[lessonId] || null;
}

export function resolveModuleVideoUrl(moduleId: string): string | null {
  return MODULE_VIDEO_URLS[moduleId] ?? null;
}

/** True when module overview would repeat a lesson embed in the same section. */
export function moduleVideoDuplicatesLesson(
  moduleVideoUrl: string | null,
  lessons: readonly { videoUrl: string | null }[],
): boolean {
  if (!moduleVideoUrl) return false;
  const modId = youtubeEmbedId(moduleVideoUrl);
  if (!modId) return false;
  return lessons.some((l) => youtubeEmbedId(l.videoUrl) === modId);
}
