import { z } from "zod";

export const PRODUCT_STATUSES = ["draft", "active", "archived"] as const;

export const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Product name is required")
    .max(120, "Product name is too long"),
  description: z
    .string()
    .trim()
    .max(2000, "Description is too long")
    .optional()
    .or(z.literal("")),
  price: z
    .number()
    .min(0, "Price must be 0 or more")
    .max(1_000_000, "Price is too large")
    .refine(
      (value) => Number.isInteger(Math.round(value * 100)),
      "Price can have at most 2 decimal places",
    ),
  categoryId: z.string().uuid().nullable(),
  isFeatured: z.boolean(),
  isAvailable: z.boolean(),
  status: z.enum(PRODUCT_STATUSES),
});

export type ProductInput = z.infer<typeof productSchema>;
