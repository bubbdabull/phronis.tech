import { z } from "zod";

export const tradeLogSchema = z.object({
  wallet_address: z.string().min(32).max(64),
  side: z.enum(["buy", "sell", "swap", "unknown"]).default("swap"),
  signature: z.string().max(128).optional().nullable(),
  mint_in: z.string().max(64).optional().nullable(),
  mint_out: z.string().max(64).optional().nullable(),
  amount_note: z.string().max(500).optional().nullable(),
  meta: z.record(z.unknown()).optional(),
});

export const friendRequestCreateSchema = z.object({
  to_member_id: z.string().uuid(),
});

export const friendRequestPatchSchema = z.object({
  action: z.enum(["accept", "decline", "cancel"]),
});

export const studyGroupCreateSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(2000).optional().nullable(),
});

export const groupMessageSchema = z.object({
  body: z.string().min(1).max(4000),
});

export const postCreateSchema = z.object({
  body: z.string().min(1).max(2000),
  visibility: z.enum(["public", "friends"]).default("friends"),
});

export const postCommentSchema = z.object({
  body: z.string().min(1).max(1000),
});
