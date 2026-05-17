import { z } from "zod";

export const memberSupportRequestSchema = z.object({
  requestType: z.enum(["manual_onboarding", "assisted_funding", "other"]),
  message: z.string().trim().min(10, "Please add a few more details (at least 10 characters).").max(4000),
  /** Solana deposit address (included when member row not synced yet). */
  walletAddress: z.string().trim().max(64).optional().nullable(),
  /** Optional override when member has no email on file. */
  contactEmail: z
    .union([z.string().trim().max(320).email(), z.literal(""), z.null()])
    .optional()
    .transform((v) => (v === undefined || v === "" || v === null ? null : v)),
});

export type MemberSupportRequest = z.infer<typeof memberSupportRequestSchema>;
