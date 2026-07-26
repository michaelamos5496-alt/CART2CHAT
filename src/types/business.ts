export const BUSINESS_CATEGORIES = [
  "fashion_apparel",
  "food_beverage",
  "beauty_cosmetics",
  "electronics",
  "home_living",
  "jewelry_accessories",
  "health_wellness",
  "other",
] as const;

export type BusinessCategory = (typeof BUSINESS_CATEGORIES)[number];

export const BUSINESS_CATEGORY_LABELS: Record<BusinessCategory, string> = {
  fashion_apparel: "Fashion & apparel",
  food_beverage: "Food & beverage",
  beauty_cosmetics: "Beauty & cosmetics",
  electronics: "Electronics",
  home_living: "Home & living",
  jewelry_accessories: "Jewelry & accessories",
  health_wellness: "Health & wellness",
  other: "Other",
};

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  whatsapp_number: string;
  logo_path: string | null;
  banner_path: string | null;
  theme_color: string;
  currency: string;
  category: BusinessCategory;
  is_active: boolean;
  is_suspended: boolean;
  suspended_at: string | null;
  suspended_reason: string | null;
  created_at: string;
  updated_at: string;
}
