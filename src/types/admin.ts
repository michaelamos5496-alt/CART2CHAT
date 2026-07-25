import type { Business } from "@/types/business";
import type { OrderStatus } from "@/types/order";
import type {
  SubscriptionPlan,
  SubscriptionStatus,
} from "@/types/subscription";

export interface AdminBusinessRow {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  is_suspended: boolean;
  created_at: string;
  owner_email: string;
  plan: SubscriptionPlan;
  subscription_status: SubscriptionStatus;
  product_count: number;
  order_count: number;
}

export interface AdminBusinessDetail {
  business: Business;
  ownerEmail: string;
  plan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
  productCount: number;
  orderCount: number;
  recentOrders: {
    id: string;
    order_number: number;
    status: OrderStatus;
    total_amount: number;
    currency: string;
    created_at: string;
  }[];
}

export interface RevenueByCurrency {
  currency: string;
  total: number;
}

export interface PlatformOverview {
  totalBusinesses: number;
  activeBusinesses: number;
  suspendedBusinesses: number;
  totalOrders: number;
  totalProducts: number;
  revenueByCurrency: RevenueByCurrency[];
  planDistribution: { plan: SubscriptionPlan; count: number }[];
}

export interface PlatformFeatureFlag {
  key: string;
  label: string;
  description: string | null;
  is_enabled: boolean;
  updated_at: string;
}

export interface SystemHealthCheck {
  name: string;
  status: "healthy" | "degraded" | "down";
  latencyMs: number | null;
  detail: string;
}
