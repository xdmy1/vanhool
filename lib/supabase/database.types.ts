// Minimal hand-written types for the Inter Bus schema.
// Regenerate the full version with:
//   supabase gen types typescript --project-id iqsfmofoezkdnmhbxwbn > lib/supabase/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Timestamp = string;
type UUID = string;

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: UUID;
          email: string | null;
          full_name: string | null;
          phone: string | null;
          is_admin: boolean | null;
          language: string | null;
          created_at: Timestamp | null;
          updated_at: Timestamp | null;
          odoo_partner_id: number | null;
          company: string | null;
          vat_code: string | null;
          discount_percent: number | null;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: UUID;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      products: {
        Row: {
          id: UUID;
          part_code: string | null;
          name_en: string | null;
          name_ro: string | null;
          name_ru: string | null;
          description_en: string | null;
          description_ro: string | null;
          description_ru: string | null;
          price: number | null;
          stock_quantity: number | null;
          image_url: string | null;
          sku: string | null;
          brand: string | null;
          weight: number | null;
          width: number | null;
          height: number | null;
          warranty_months: number | null;
          category_id: UUID | null;
          is_active: boolean | null;
          is_featured: boolean | null;
          slug: string | null;
          created_at: Timestamp | null;
          tecdoc_id: string | null;
          oem_codes: string[] | null;
          vehicle_compatibility: Json | null;
          tecdoc_synced_at: Timestamp | null;
          images: Json | null;
          odoo_id: number | null;
          barcode: string | null;
          odoo_synced_at: Timestamp | null;
          odoo_qty_available: number | null;
          manufacturer_id: UUID | null;
          subcategory_id: UUID | null;
          cross_references: Json | null;
          search_codes: string[] | null;
          condition: "new" | "refurbished" | "used" | null;
          storage_location: string | null;
          cost_price: number | null;
          is_promo: boolean | null;
          promo_price: number | null;
          promo_starts_at: Timestamp | null;
          promo_ends_at: Timestamp | null;
        };
        Insert: Partial<Database["public"]["Tables"]["products"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["products"]["Row"]>;
        Relationships: [
          { foreignKeyName: "products_category_id_fkey"; columns: ["category_id"]; referencedRelation: "categories"; referencedColumns: ["id"] },
          { foreignKeyName: "products_manufacturer_id_fkey"; columns: ["manufacturer_id"]; referencedRelation: "manufacturers"; referencedColumns: ["id"] },
          { foreignKeyName: "products_subcategory_id_fkey"; columns: ["subcategory_id"]; referencedRelation: "categories"; referencedColumns: ["id"] },
        ];
      };
      manufacturers: {
        Row: {
          id: UUID;
          name: string;
          slug: string;
          logo_url: string | null;
          country: string | null;
          is_active: boolean;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: Partial<Database["public"]["Tables"]["manufacturers"]["Row"]> & {
          name: string;
          slug: string;
        };
        Update: Partial<Database["public"]["Tables"]["manufacturers"]["Row"]>;
        Relationships: [];
      };
      product_vehicle_makes: {
        Row: {
          product_id: UUID;
          vehicle_make_id: UUID;
          created_at: Timestamp;
        };
        Insert: {
          product_id: UUID;
          vehicle_make_id: UUID;
          created_at?: Timestamp;
        };
        Update: Partial<Database["public"]["Tables"]["product_vehicle_makes"]["Row"]>;
        Relationships: [
          { foreignKeyName: "pvm_product_id_fkey"; columns: ["product_id"]; referencedRelation: "products"; referencedColumns: ["id"] },
          { foreignKeyName: "pvm_vehicle_make_id_fkey"; columns: ["vehicle_make_id"]; referencedRelation: "vehicle_makes"; referencedColumns: ["id"] },
        ];
      };
      categories: {
        Row: {
          id: UUID;
          name_en: string | null;
          name_ro: string | null;
          name_ru: string | null;
          slug: string | null;
          parent_id: UUID | null;
          sort_order: number | null;
          is_active: boolean | null;
          image_url: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["categories"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["categories"]["Row"]>;
        Relationships: [
          { foreignKeyName: "categories_parent_id_fkey"; columns: ["parent_id"]; referencedRelation: "categories"; referencedColumns: ["id"] },
        ];
      };
      carts: {
        Row: {
          id: UUID;
          user_id: UUID | null;
          status: string | null;
          created_at: Timestamp | null;
          updated_at: Timestamp | null;
        };
        Insert: Partial<Database["public"]["Tables"]["carts"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["carts"]["Row"]>;
        Relationships: [];
      };
      cart_items: {
        Row: {
          id: UUID;
          cart_id: UUID;
          product_id: UUID;
          quantity: number;
          unit_price: number | null;
          total_price: number | null;
          created_at: Timestamp | null;
        };
        Insert: Partial<Database["public"]["Tables"]["cart_items"]["Row"]> & {
          cart_id: UUID;
          product_id: UUID;
          quantity: number;
        };
        Update: Partial<Database["public"]["Tables"]["cart_items"]["Row"]>;
        Relationships: [
          { foreignKeyName: "cart_items_cart_id_fkey"; columns: ["cart_id"]; referencedRelation: "carts"; referencedColumns: ["id"] },
          { foreignKeyName: "cart_items_product_id_fkey"; columns: ["product_id"]; referencedRelation: "products"; referencedColumns: ["id"] },
        ];
      };
      orders: {
        Row: {
          id: UUID;
          user_id: UUID | null;
          customer_name: string | null;
          customer_email: string | null;
          customer_phone: string | null;
          customer_address: string | null;
          items: Json | null;
          subtotal: number | null;
          discount_amount: number | null;
          shipping_cost: number | null;
          total: number | null;
          status: string | null;
          payment_method: string | null;
          notes: string | null;
          invoice_id: string | null;
          invoice_url: string | null;
          created_at: Timestamp | null;
          updated_at: Timestamp | null;
          odoo_order_id: number | null;
          odoo_invoice_id: number | null;
          odoo_synced_at: Timestamp | null;
          odoo_sync_error: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["orders"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["orders"]["Row"]>;
        Relationships: [];
      };
      promocodes: {
        Row: {
          id: UUID;
          code: string;
          discount_type: "percentage" | "fixed" | string;
          discount_value: number;
          min_order_amount: number | null;
          max_uses: number | null;
          current_uses: number | null;
          is_active: boolean | null;
          updated_at: Timestamp | null;
        };
        Insert: Partial<Database["public"]["Tables"]["promocodes"]["Row"]> & {
          code: string;
          discount_type: string;
          discount_value: number;
        };
        Update: Partial<Database["public"]["Tables"]["promocodes"]["Row"]>;
        Relationships: [];
      };
      payments: {
        Row: {
          id: UUID;
          order_id: UUID | null;
          amount: number | null;
          currency: string | null;
          method: string | null;
          status: string | null;
          gateway_url: string | null;
          gateway_reference: string | null;
          created_at: Timestamp | null;
        };
        Insert: Partial<Database["public"]["Tables"]["payments"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["payments"]["Row"]>;
        Relationships: [];
      };
      contact_messages: {
        Row: {
          id: UUID;
          user_id: UUID | null;
          name: string;
          email: string;
          phone: string | null;
          subject: string | null;
          message: string;
          topic: string | null;
          status: string | null;
          created_at: Timestamp | null;
        };
        Insert: Partial<Database["public"]["Tables"]["contact_messages"]["Row"]> & {
          name: string;
          email: string;
          message: string;
        };
        Update: Partial<Database["public"]["Tables"]["contact_messages"]["Row"]>;
        Relationships: [];
      };
      odoo_sync_log: {
        Row: {
          id: UUID;
          direction: "pull" | "push" | "webhook";
          operation: string;
          entity_type: string | null;
          entity_id: string | null;
          odoo_model: string | null;
          odoo_id: number | null;
          success: boolean;
          detail: Json | null;
          duration_ms: number | null;
          created_at: Timestamp;
        };
        Insert: Partial<Database["public"]["Tables"]["odoo_sync_log"]["Row"]> & {
          direction: "pull" | "push" | "webhook";
          operation: string;
        };
        Update: Partial<Database["public"]["Tables"]["odoo_sync_log"]["Row"]>;
        Relationships: [];
      };
      tecdoc_cache: {
        Row: {
          id: UUID;
          cache_key: string;
          query_type: "part_code" | "oem" | "vehicle";
          query_value: string;
          country: string | null;
          lang: string | null;
          response: Json;
          result_count: number;
          actor_id: string | null;
          run_id: string | null;
          compute_units: number | null;
          fetched_at: Timestamp;
          expires_at: Timestamp | null;
        };
        Insert: Partial<Database["public"]["Tables"]["tecdoc_cache"]["Row"]> & {
          cache_key: string;
          query_type: "part_code" | "oem" | "vehicle";
          query_value: string;
        };
        Update: Partial<Database["public"]["Tables"]["tecdoc_cache"]["Row"]>;
        Relationships: [];
      };
      vehicle_makes: {
        Row: {
          id: UUID;
          slug: string;
          name: string;
          logo_url: string | null;
          sort_order: number;
          is_active: boolean;
          is_popular: boolean;
          tecdoc_id: number | null;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: Partial<Database["public"]["Tables"]["vehicle_makes"]["Row"]> & {
          slug: string;
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["vehicle_makes"]["Row"]>;
        Relationships: [];
      };
      vehicle_models: {
        Row: {
          id: UUID;
          make_id: UUID;
          slug: string;
          name: string;
          year_from: number | null;
          year_to: number | null;
          body_type: string | null;
          image_url: string | null;
          is_active: boolean;
          tecdoc_id: number | null;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: Partial<Database["public"]["Tables"]["vehicle_models"]["Row"]> & {
          make_id: UUID;
          slug: string;
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["vehicle_models"]["Row"]>;
        Relationships: [];
      };
      vehicle_types: {
        Row: {
          id: UUID;
          model_id: UUID;
          slug: string;
          name: string;
          power_kw: number | null;
          power_hp: number | null;
          capacity_cc: number | null;
          fuel: string | null;
          year_from: number | null;
          year_to: number | null;
          engine_code: string | null;
          body: string | null;
          drive: string | null;
          is_active: boolean;
          tecdoc_type_id: number | null;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: Partial<Database["public"]["Tables"]["vehicle_types"]["Row"]> & {
          model_id: UUID;
          slug: string;
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["vehicle_types"]["Row"]>;
        Relationships: [];
      };
      vehicle_part_link: {
        Row: {
          vehicle_type_id: UUID;
          product_id: UUID;
          created_at: Timestamp;
        };
        Insert: {
          vehicle_type_id: UUID;
          product_id: UUID;
          created_at?: Timestamp;
        };
        Update: Partial<Database["public"]["Tables"]["vehicle_part_link"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_promo_usage: {
        Args: { promo_id: UUID };
        Returns: boolean;
      };
      increment_promo_usage_by_code: {
        Args: { promo_code: string };
        Returns: boolean;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      purge_tecdoc_cache_expired: {
        Args: Record<string, never>;
        Returns: number;
      };
      set_stock_from_odoo: {
        Args: { p_odoo_id: number; p_qty: number };
        Returns: boolean;
      };
      clear_order_sync_error: {
        Args: { p_order_id: UUID };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

// Convenience aliases
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
