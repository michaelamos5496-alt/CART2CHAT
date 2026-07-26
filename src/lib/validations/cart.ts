import { z } from "zod";

export const checkoutSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(120, "Name is too long"),
  customerPhone: z
    .string()
    .trim()
    // Mirrors the DB check constraint on orders.customer_phone exactly
    // (^\+?[0-9\s-]{7,20}$) — validating here means a bad phone number
    // gets a normal inline form error instead of a raw Postgres
    // "violates check constraint" message surfacing after submit.
    .regex(
      /^\+?[0-9\s-]{7,20}$/,
      "Use only digits, spaces, and hyphens (e.g. +1 555-123-4567)",
    ),
  customerAddress: z
    .string()
    .trim()
    .max(300, "Address is too long")
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .trim()
    .max(500, "Notes are too long")
    .optional()
    .or(z.literal("")),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
