// Hand-authored to match every table/function added across
// supabase/migrations/*.sql (23 files, as of 20260725240000). This is a
// stand-in for a real `supabase gen types typescript` output — no live
// Supabase project has been connected in this environment to generate
// one against. It intentionally follows the exact shape Supabase's CLI
// produces (Tables/Row/Insert/Update, Functions, Enums) so swapping it
// for a real generated file later is a drop-in replacement, not a rewrite.
//
// Once you have a live project:
//   npx supabase gen types typescript --project-id <project-id> > src/types/database.ts
// and delete this comment block.
//
// Insert/Update optionality follows Supabase's convention: a column is
// optional on Insert if it's nullable OR has a database default; Update
// makes every column optional.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      businesses: {
        Row: {
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
          category: Database["public"]["Enums"]["business_category"];
          is_active: boolean;
          is_suspended: boolean;
          suspended_at: string | null;
          suspended_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          slug: string;
          description?: string | null;
          whatsapp_number: string;
          logo_path?: string | null;
          banner_path?: string | null;
          theme_color?: string;
          currency?: string;
          category?: Database["public"]["Enums"]["business_category"];
          is_active?: boolean;
          is_suspended?: boolean;
          suspended_at?: string | null;
          suspended_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          whatsapp_number?: string;
          logo_path?: string | null;
          banner_path?: string | null;
          theme_color?: string;
          currency?: string;
          category?: Database["public"]["Enums"]["business_category"];
          is_active?: boolean;
          is_suspended?: boolean;
          suspended_at?: string | null;
          suspended_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      business_settings: {
        Row: {
          business_id: string;
          business_hours: Json;
          order_number_prefix: string;
          whatsapp_message_template: string;
          min_order_amount: number | null;
          delivery_fee: number;
          social_links: Json;
          auto_confirm_orders: boolean;
          notify_email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          business_id: string;
          business_hours?: Json;
          order_number_prefix?: string;
          whatsapp_message_template?: string;
          min_order_amount?: number | null;
          delivery_fee?: number;
          social_links?: Json;
          auto_confirm_orders?: boolean;
          notify_email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          business_id?: string;
          business_hours?: Json;
          order_number_prefix?: string;
          whatsapp_message_template?: string;
          min_order_amount?: number | null;
          delivery_fee?: number;
          social_links?: Json;
          auto_confirm_orders?: boolean;
          notify_email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          slug: string;
          image_path: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          slug: string;
          image_path?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          name?: string;
          slug?: string;
          image_path?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          business_id: string;
          category_id: string | null;
          name: string;
          slug: string;
          description: string | null;
          price: number;
          is_available: boolean;
          is_featured: boolean;
          status: Database["public"]["Enums"]["product_status"];
          sort_order: number;
          view_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          category_id?: string | null;
          name: string;
          slug: string;
          description?: string | null;
          price: number;
          is_available?: boolean;
          is_featured?: boolean;
          status?: Database["public"]["Enums"]["product_status"];
          sort_order?: number;
          view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          category_id?: string | null;
          name?: string;
          slug?: string;
          description?: string | null;
          price?: number;
          is_available?: boolean;
          is_featured?: boolean;
          status?: Database["public"]["Enums"]["product_status"];
          sort_order?: number;
          view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          business_id: string;
          storage_path: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          business_id: string;
          storage_path: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          business_id?: string;
          storage_path?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      product_options: {
        Row: {
          id: string;
          product_id: string;
          business_id: string;
          name: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          business_id: string;
          name: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          business_id?: string;
          name?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_options_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      product_option_values: {
        Row: {
          id: string;
          option_id: string;
          business_id: string;
          value: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          option_id: string;
          business_id: string;
          value: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          option_id?: string;
          business_id?: string;
          value?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_option_values_option_id_fkey";
            columns: ["option_id"];
            isOneToOne: false;
            referencedRelation: "product_options";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          id: string;
          order_number: number;
          business_id: string;
          status: "pending" | "confirmed" | "completed" | "cancelled";
          customer_name: string;
          customer_phone: string;
          customer_address: string | null;
          notes: string | null;
          currency: string;
          delivery_fee: number;
          total_amount: number;
          whatsapp_sent_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number?: number;
          business_id: string;
          status?: "pending" | "confirmed" | "completed" | "cancelled";
          customer_name: string;
          customer_phone: string;
          customer_address?: string | null;
          notes?: string | null;
          currency?: string;
          delivery_fee?: number;
          total_amount?: number;
          whatsapp_sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: number;
          business_id?: string;
          status?: "pending" | "confirmed" | "completed" | "cancelled";
          customer_name?: string;
          customer_phone?: string;
          customer_address?: string | null;
          notes?: string | null;
          currency?: string;
          delivery_fee?: number;
          total_amount?: number;
          whatsapp_sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          business_id: string;
          product_id: string | null;
          product_name: string;
          unit_price: number;
          quantity: number;
          subtotal: number;
          selected_options: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          business_id: string;
          product_id?: string | null;
          product_name: string;
          unit_price: number;
          quantity: number;
          subtotal?: number;
          selected_options?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          business_id?: string;
          product_id?: string | null;
          product_name?: string;
          unit_price?: number;
          quantity?: number;
          subtotal?: number;
          selected_options?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      order_status_history: {
        Row: {
          id: string;
          order_id: string;
          business_id: string;
          status: "pending" | "confirmed" | "completed" | "cancelled";
          changed_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          business_id: string;
          status: "pending" | "confirmed" | "completed" | "cancelled";
          changed_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          business_id?: string;
          status?: "pending" | "confirmed" | "completed" | "cancelled";
          changed_at?: string;
        };
        Relationships: [];
      };
      business_subscriptions: {
        Row: {
          business_id: string;
          plan: "starter" | "growth" | "pro";
          status: "active" | "trialing" | "past_due" | "cancelled";
          provider: "none" | "stripe" | "local" | "paystack";
          provider_customer_id: string | null;
          provider_subscription_id: string | null;
          paystack_email_token: string | null;
          billing_interval: "monthly" | "yearly";
          billing_mode: "recurring" | "manual";
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          business_id: string;
          plan?: "starter" | "growth" | "pro";
          status?: "active" | "trialing" | "past_due" | "cancelled";
          provider?: "none" | "stripe" | "local" | "paystack";
          provider_customer_id?: string | null;
          provider_subscription_id?: string | null;
          paystack_email_token?: string | null;
          billing_interval?: "monthly" | "yearly";
          billing_mode?: "recurring" | "manual";
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          business_id?: string;
          plan?: "starter" | "growth" | "pro";
          status?: "active" | "trialing" | "past_due" | "cancelled";
          provider?: "none" | "stripe" | "local" | "paystack";
          provider_customer_id?: string | null;
          provider_subscription_id?: string | null;
          paystack_email_token?: string | null;
          billing_interval?: "monthly" | "yearly";
          billing_mode?: "recurring" | "manual";
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      plan_limits: {
        Row: {
          plan: "starter" | "growth" | "pro";
          monthly_price: number;
          yearly_price: number;
          max_products: number | null;
          max_categories: number | null;
          has_full_analytics: boolean;
          has_custom_branding: boolean;
          paystack_plan_code: string | null;
          paystack_yearly_plan_code: string | null;
        };
        Insert: {
          plan: "starter" | "growth" | "pro";
          monthly_price: number;
          yearly_price: number;
          max_products?: number | null;
          max_categories?: number | null;
          has_full_analytics?: boolean;
          has_custom_branding?: boolean;
          paystack_plan_code?: string | null;
          paystack_yearly_plan_code?: string | null;
        };
        Update: {
          plan?: "starter" | "growth" | "pro";
          monthly_price?: number;
          yearly_price?: number;
          max_products?: number | null;
          max_categories?: number | null;
          has_full_analytics?: boolean;
          has_custom_branding?: boolean;
          paystack_plan_code?: string | null;
          paystack_yearly_plan_code?: string | null;
        };
        Relationships: [];
      };
      admin_users: {
        Row: {
          user_id: string;
          granted_at: string;
        };
        Insert: {
          user_id: string;
          granted_at?: string;
        };
        Update: {
          user_id?: string;
          granted_at?: string;
        };
        Relationships: [];
      };
      feature_flags: {
        Row: {
          key: string;
          label: string;
          description: string | null;
          is_enabled: boolean;
          updated_at: string;
        };
        Insert: {
          key: string;
          label: string;
          description?: string | null;
          is_enabled?: boolean;
          updated_at?: string;
        };
        Update: {
          key?: string;
          label?: string;
          description?: string | null;
          is_enabled?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      admin_audit_log: {
        Row: {
          id: string;
          admin_id: string | null;
          action: string;
          target_table: string;
          target_id: string | null;
          detail: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_id?: string | null;
          action: string;
          target_table: string;
          target_id?: string | null;
          detail?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_id?: string | null;
          action?: string;
          target_table?: string;
          target_id?: string | null;
          detail?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_super_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      increment_product_view: {
        Args: { p_product_id: string };
        Returns: undefined;
      };
      place_order: {
        Args: {
          p_business_id: string;
          p_customer_name: string;
          p_customer_phone: string;
          p_customer_address: string | null;
          p_notes: string | null;
          p_items: Json;
        };
        Returns: {
          order_id: string;
          order_number: number;
          subtotal: number;
          delivery_fee: number;
          total_amount: number;
        }[];
      };
      generate_unique_business_slug: {
        Args: { base: string };
        Returns: string;
      };
      generate_unique_product_slug: {
        Args: { p_business_id: string; p_base: string };
        Returns: string;
      };
      generate_unique_category_slug: {
        Args: { p_business_id: string; p_base: string };
        Returns: string;
      };
      cancel_subscription: {
        Args: Record<string, never>;
        Returns: undefined;
      };
      resume_subscription: {
        Args: Record<string, never>;
        Returns: undefined;
      };
    };
    Enums: {
      product_status: "draft" | "active" | "archived";
      business_category:
        | "fashion_apparel"
        | "food_beverage"
        | "beauty_cosmetics"
        | "electronics"
        | "home_living"
        | "jewelry_accessories"
        | "health_wellness"
        | "other";
    };
  };
}
