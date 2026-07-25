import { z } from "zod";

export const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .max(120, "Name is too long")
    .optional()
    .or(z.literal("")),
});

export type ProfileInput = z.infer<typeof profileSchema>;
