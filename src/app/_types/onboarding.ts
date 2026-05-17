export type MembershipTier = "L1" | "L2" | "L3";

export type MemberRow = {
  id: string;
  privy_id: string;
  wallet_address: string | null;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  /** Contact email; also mirrored from Privy when user links email there. */
  email: string | null;
  website: string | null;
  x_link: string | null;
  discord_link: string | null;
  membership_tier: MembershipTier;
  onboarding_step: string;
  wallet_funded: boolean;
  created_at: string;
  updated_at: string;
};

export type WalletRow = {
  id: string;
  member_id: string;
  wallet_address: string;
  sol_balance: string;
  phronis_balance: string;
  usdc_balance: string;
  /** Auto-discovered SPL tokens (mint → balance + optional symbol/name/logo). */
  spl_balances?: Record<string, unknown> | null;
  updated_at: string;
};

export type TransactionRow = {
  id: string;
  wallet_address: string;
  signature: string;
  type: string;
  token: string | null;
  amount: string | null;
  status: string;
  created_at: string;
};
