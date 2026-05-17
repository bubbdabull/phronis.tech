export type MemberTier = "L1" | "L2" | "L3";

export type MemberProfileRow = {
  id: string;
  privy_user_id: string;
  email: string | null;
  wallet_address: string | null;
  access_tier: MemberTier;
  dao_tier: MemberTier;
  dao_contract_address: string | null;
  metadata: Record<string, unknown>;
  synced_at: string | null;
  created_at: string;
  updated_at: string;
};
