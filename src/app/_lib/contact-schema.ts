import { z } from "zod";

export const leadFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(80, "Name must be 80 characters or fewer."),
  email: z.string().trim().email("Enter a valid email address."),
  organization: z
    .string()
    .trim()
    .min(2, "Organization is required.")
    .max(120, "Organization must be 120 characters or fewer."),
  role: z
    .string()
    .trim()
    .min(2, "Role / title is required.")
    .max(80, "Role must be 80 characters or fewer."),
  message: z
    .string()
    .trim()
    .min(40, "Add a bit more detail so we can reply usefully (at least 40 characters).")
    .max(4000, "Message must be 4,000 characters or fewer."),
});

export type LeadFormValues = z.infer<typeof leadFormSchema>;
