import { z } from "zod";

export const joinDetailsSchema = z.object({
  display_name: z.string().trim().min(1, "Name is required").max(80),
  email: z.string().trim().email("Enter a valid email"),
});

export const signInEmailSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
});

export const emailOtpSchema = z.object({
  code: z
    .string()
    .trim()
    .min(6, "Enter the 6-digit code")
    .max(8)
    .regex(/^\d+$/, "Code must be numbers only"),
});

export type JoinDetails = z.infer<typeof joinDetailsSchema>;
export type SignInEmail = z.infer<typeof signInEmailSchema>;
