import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Category name is required")
    .max(80, "Category name is too long"),
  isActive: z.boolean(),
});

export type CategoryInput = z.infer<typeof categorySchema>;
