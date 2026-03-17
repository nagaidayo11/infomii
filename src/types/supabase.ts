import type { InformationBlock, InformationStatus, InformationTheme } from "@/types/information";

export type Database = {
  public: {
    Tables: {
      subscriptions: {
        Row: {
          id: string;
          hotel_id: string;
          plan: "free" | "pro" | "business";
          status: "trialing" | "active" | "past_due" | "canceled";
          max_published_pages: number;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          stripe_price_id: string | null;
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          hotel_id: string;
          plan?: "free" | "pro" | "business";
          status?: "trialing" | "active" | "past_due" | "canceled";
          max_published_pages?: number;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          stripe_price_id?: string | null;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          hotel_id?: string;
          plan?: "free" | "pro" | "business";
          status?: "trialing" | "active" | "past_due" | "canceled";
          max_published_pages?: number;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          stripe_price_id?: string | null;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      hotels: {
        Row: {
          id: string;
          name: string;
          owner_user_id: string | null;
          created_at: string;
          custom_domain: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          owner_user_id?: string | null;
          created_at?: string;
          custom_domain?: string | null;
        };
        Update: {
          name?: string;
          owner_user_id?: string | null;
          created_at?: string;
          custom_domain?: string | null;
        };
        Relationships: [];
      };
      hotel_memberships: {
        Row: {
          user_id: string;
          hotel_id: string;
          role: "editor" | "viewer";
          created_at: string;
        };
        Insert: {
          user_id: string;
          hotel_id: string;
          role?: "editor" | "viewer";
          created_at?: string;
        };
        Update: {
          user_id?: string;
          hotel_id?: string;
          role?: "editor" | "viewer";
          created_at?: string;
        };
        Relationships: [];
      };
      informations: {
        Row: {
          id: string;
          hotel_id: string | null;
          title: string;
          body: string;
          images: string[];
          content_blocks: InformationBlock[];
          theme: InformationTheme;
          status: InformationStatus;
          publish_at: string | null;
          unpublish_at: string | null;
          slug: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          hotel_id?: string | null;
          title: string;
          body?: string;
          images?: string[];
          content_blocks?: InformationBlock[];
          theme?: InformationTheme;
          status?: InformationStatus;
          publish_at?: string | null;
          unpublish_at?: string | null;
          slug: string;
          updated_at?: string;
        };
        Update: {
          hotel_id?: string | null;
          title?: string;
          body?: string;
          images?: string[];
          content_blocks?: InformationBlock[];
          theme?: InformationTheme;
          status?: InformationStatus;
          publish_at?: string | null;
          unpublish_at?: string | null;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      hotel_invites: {
        Row: {
          id: string;
          hotel_id: string;
          code: string;
          created_by_user_id: string;
          is_active: boolean;
          consumed_by_user_id: string | null;
          consumed_at: string | null;
          expires_at: string | null;
          created_at: string;
          role: "editor" | "viewer";
        };
        Insert: {
          id?: string;
          hotel_id: string;
          code: string;
          created_by_user_id: string;
          is_active?: boolean;
          consumed_by_user_id?: string | null;
          consumed_at?: string | null;
          expires_at?: string | null;
          created_at?: string;
          role?: "editor" | "viewer";
        };
        Update: {
          hotel_id?: string;
          code?: string;
          created_by_user_id?: string;
          is_active?: boolean;
          consumed_by_user_id?: string | null;
          consumed_at?: string | null;
          expires_at?: string | null;
          created_at?: string;
          role?: "editor" | "viewer";
        };
        Relationships: [];
      };
      information_views: {
        Row: {
          id: string;
          information_id: string;
          hotel_id: string;
          slug: string;
          source: string;
          referrer: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          information_id: string;
          hotel_id: string;
          slug: string;
          source?: string;
          referrer?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          information_id?: string;
          hotel_id?: string;
          slug?: string;
          source?: string;
          referrer?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      page_views: {
        Row: {
          id: string;
          page_id: string;
          country: string;
          language: string;
          viewed_at: string;
          device: string;
        };
        Insert: {
          id?: string;
          page_id: string;
          country?: string;
          language?: string;
          viewed_at?: string;
          device?: string;
        };
        Update: {
          page_id?: string;
          country?: string;
          language?: string;
          viewed_at?: string;
          device?: string;
        };
        Relationships: [];
      };
      pages: {
        Row: { id: string; hotel_id: string; title: string; slug: string; created_at: string };
        Insert: { id?: string; hotel_id: string; title: string; slug: string; created_at?: string };
        Update: { hotel_id?: string; title?: string; slug?: string; created_at?: string };
        Relationships: [];
      };
      cards: {
        Row: { id: string; page_id: string; type: string; content: Record<string, unknown>; order: number; created_at: string };
        Insert: { id?: string; page_id: string; type: string; content?: Record<string, unknown>; order?: number; created_at?: string };
        Update: { page_id?: string; type?: string; content?: Record<string, unknown>; order?: number; created_at?: string };
        Relationships: [];
      };
      templates: {
        Row: { id: string; name: string; description: string; preview_image: string; cards: unknown; created_at: string; category: string | null };
        Insert: { id?: string; name: string; description?: string; preview_image?: string; cards?: unknown; created_at?: string; category?: string | null };
        Update: { name?: string; description?: string; preview_image?: string; cards?: unknown; created_at?: string; category?: string | null };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          hotel_id: string;
          actor_user_id: string | null;
          action: string;
          target_type: string | null;
          target_id: string | null;
          message: string;
          metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          hotel_id: string;
          actor_user_id?: string | null;
          action: string;
          target_type?: string | null;
          target_id?: string | null;
          message: string;
          metadata?: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          hotel_id?: string;
          actor_user_id?: string | null;
          action?: string;
          target_type?: string | null;
          target_id?: string | null;
          message?: string;
          metadata?: Record<string, unknown>;
          created_at?: string;
        };
        Relationships: [];
      };
      saas_editor_pages: {
        Row: {
          id: string;
          title: string;
          slug: string | null;
          user_id: string | null;
          blocks: unknown;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title?: string;
          slug?: string | null;
          user_id?: string | null;
          blocks?: unknown;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          slug?: string | null;
          user_id?: string | null;
          blocks?: unknown;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      ensure_hotel_subscription: {
        Args: { target_hotel_id: string };
        Returns: string;
      };
      redeem_hotel_invite: {
        Args: { input_code: string };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
