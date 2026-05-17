import { z } from "zod";

export const memberProfileUpdateSchema = z.object({
  username: z.string().max(32).optional().nullable(),
  display_name: z.string().max(80).optional().nullable(),
  bio: z.string().max(2000).optional().nullable(),
  avatar_url: z.string().max(2048).optional().nullable(),
  /** Contact email for wallet-only accounts; use null or "" to clear. */
  email: z
    .union([z.string().trim().max(320).email(), z.literal(""), z.null()])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "" || v === null ? null : v)),
});

export type MemberProfileUpdate = z.infer<typeof memberProfileUpdateSchema>;
