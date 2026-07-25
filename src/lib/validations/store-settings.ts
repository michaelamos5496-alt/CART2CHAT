import { z } from "zod";

export const CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "NGN",
  "KES",
  "GHS",
  "ZAR",
  "INR",
] as const;

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const dayHoursSchema = z
  .object({
    closed: z.boolean(),
    open: z.string(),
    close: z.string(),
  })
  .refine(
    (day) =>
      day.closed ||
      (TIME_PATTERN.test(day.open) && TIME_PATTERN.test(day.close)),
    { message: "Enter a valid open and close time" },
  );

const businessHoursSchema = z.object({
  monday: dayHoursSchema,
  tuesday: dayHoursSchema,
  wednesday: dayHoursSchema,
  thursday: dayHoursSchema,
  friday: dayHoursSchema,
  saturday: dayHoursSchema,
  sunday: dayHoursSchema,
});

const urlOrEmpty = z
  .string()
  .trim()
  .url("Enter a valid URL")
  .optional()
  .or(z.literal(""));

const socialLinksSchema = z.object({
  instagram: urlOrEmpty,
  facebook: urlOrEmpty,
  tiktok: urlOrEmpty,
  twitter: urlOrEmpty,
  website: urlOrEmpty,
});

export const storeSettingsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Business name is required")
    .max(120, "Business name is too long"),
  description: z
    .string()
    .trim()
    .max(500, "Description is too long")
    .optional()
    .or(z.literal("")),
  whatsappNumber: z
    .string()
    .trim()
    .regex(/^\+[1-9]\d{6,14}$/, "Use international format, e.g. +15551234567"),
  themeColor: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Enter a valid hex color, e.g. #16A34A"),
  currency: z.enum(CURRENCIES),
  deliveryFee: z
    .number()
    .min(0, "Delivery fee must be 0 or more")
    .max(1_000_000, "Delivery fee is too large")
    .refine(
      (value) => Number.isInteger(Math.round(value * 100)),
      "Delivery fee can have at most 2 decimal places",
    ),
  businessHours: businessHoursSchema,
  socialLinks: socialLinksSchema,
});

export type StoreSettingsInput = z.infer<typeof storeSettingsSchema>;
