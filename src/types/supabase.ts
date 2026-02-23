import type { InformationBlock, InformationStatus, InformationTheme } from "@/types/information";

export type Database = {
  public: {
    Tables: {
      subscriptions: {
        Row: {
          id: string;
          hotel_id: string;
          plan: "free" | "pro";
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
          plan?: "free" | "pro";
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
          plan?: "free" | "pro";
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
        };
        Insert: {
          id?: string;
          name: string;
          owner_user_id?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          owner_user_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      hotel_memberships: {
        Row: {
          user_id: string;
          hotel_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          hotel_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          hotel_id?: string;
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
