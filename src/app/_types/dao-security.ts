/**
 * DAO **security** architecture layer (on-chain / off-chain / application).
 * Not the same as product **membership** tier (`L1` | `L2` | `L3` on `members.membership_tier`).
 *
 * @see docs/DAO_SECURITY_LAYERS_L1_L2_L3.md
 * @see docs/MEMBER_SECTION_SECURITY_L1_L2_L3.md — member UI + member APIs
 */
export type DaoSecurityLayer = "L1" | "L2" | "L3";
