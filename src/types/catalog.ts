export type ProductStatus = "draft" | "active" | "archived";

export interface Category {
  id: string;
  business_id: string;
  name: string;
  slug: string;
  image_path: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoryWithProductCount extends Category {
  productCount: number;
}

export interface Product {
  id: string;
  business_id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  is_available: boolean;
  is_featured: boolean;
  status: ProductStatus;
  sort_order: number;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProductWithCategory extends Product {
  category: Pick<Category, "name"> | null;
}

export interface ProductImage {
  id: string;
  product_id: string;
  business_id: string;
  storage_path: string;
  sort_order: number;
  created_at: string;
}

export interface ProductOptionValue {
  id: string;
  option_id: string;
  business_id: string;
  value: string;
  sort_order: number;
  created_at: string;
}

export interface ProductOption {
  id: string;
  product_id: string;
  business_id: string;
  name: string;
  sort_order: number;
  created_at: string;
}

export interface ProductOptionWithValues extends ProductOption {
  values: ProductOptionValue[];
}

export interface StorefrontProduct extends Product {
  primaryImagePath: string | null;
  hasOptions: boolean;
}

export interface StorefrontProductDetail extends Product {
  category: Pick<Category, "name" | "slug"> | null;
  images: ProductImage[];
  options: ProductOptionWithValues[];
}
