export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          description: string
          entity_id: string
          entity_type: string
          id: string
          new_values: Json | null
          old_values: Json | null
          user_id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          description: string
          entity_id: string
          entity_type: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          user_id: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          description?: string
          entity_id?: string
          entity_type?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      ai_conversations: {
        Row: {
          ai_response: string | null
          conversation_data: Json
          created_at: string
          customer_id: string | null
          human_intervention: boolean | null
          id: string
          ticket_id: string | null
        }
        Insert: {
          ai_response?: string | null
          conversation_data: Json
          created_at?: string
          customer_id?: string | null
          human_intervention?: boolean | null
          id?: string
          ticket_id?: string | null
        }
        Update: {
          ai_response?: string | null
          conversation_data?: Json
          created_at?: string
          customer_id?: string | null
          human_intervention?: boolean | null
          id?: string
          ticket_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_conversations_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      availability_settings: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_available: boolean
          setting_type: string
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_available?: boolean
          setting_type: string
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_available?: boolean
          setting_type?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: []
      }
      blocked_dates: {
        Row: {
          created_at: string
          date: string
          end_time: string | null
          id: string
          is_full_day: boolean
          reason: string | null
          start_time: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          end_time?: string | null
          id?: string
          is_full_day?: boolean
          reason?: string | null
          start_time?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          end_time?: string | null
          id?: string
          is_full_day?: boolean
          reason?: string | null
          start_time?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      call_bookings: {
        Row: {
          calendly_event_id: string | null
          completed: boolean | null
          created_at: string
          customer_id: string | null
          duration_minutes: number | null
          email: string
          id: string
          lead_id: string | null
          meeting_link: string | null
          name: string
          notes: string | null
          phone: string | null
          scheduled_at: string
        }
        Insert: {
          calendly_event_id?: string | null
          completed?: boolean | null
          created_at?: string
          customer_id?: string | null
          duration_minutes?: number | null
          email: string
          id?: string
          lead_id?: string | null
          meeting_link?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          scheduled_at: string
        }
        Update: {
          calendly_event_id?: string | null
          completed?: boolean | null
          created_at?: string
          customer_id?: string | null
          duration_minutes?: number | null
          email?: string
          id?: string
          lead_id?: string | null
          meeting_link?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          scheduled_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_bookings_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      email_logs: {
        Row: {
          ai_generated: boolean | null
          content: string | null
          customer_id: string | null
          email_type: string | null
          id: string
          recipient_email: string
          sent_at: string
          subject: string
        }
        Insert: {
          ai_generated?: boolean | null
          content?: string | null
          customer_id?: string | null
          email_type?: string | null
          id?: string
          recipient_email: string
          sent_at?: string
          subject: string
        }
        Update: {
          ai_generated?: boolean | null
          content?: string | null
          customer_id?: string | null
          email_type?: string | null
          id?: string
          recipient_email?: string
          sent_at?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      file_uploads: {
        Row: {
          entity_id: string | null
          entity_type: string | null
          file_path: string
          file_size: number
          filename: string
          id: string
          mime_type: string
          original_filename: string
          updated_at: string
          uploaded_at: string
          user_id: string | null
        }
        Insert: {
          entity_id?: string | null
          entity_type?: string | null
          file_path: string
          file_size: number
          filename: string
          id?: string
          mime_type: string
          original_filename: string
          updated_at?: string
          uploaded_at?: string
          user_id?: string | null
        }
        Update: {
          entity_id?: string | null
          entity_type?: string | null
          file_path?: string
          file_size?: number
          filename?: string
          id?: string
          mime_type?: string
          original_filename?: string
          updated_at?: string
          uploaded_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      hashtag_suggestions: {
        Row: {
          category: string | null
          created_at: string
          hashtag: string
          id: string
          last_used_at: string | null
          platform: string
          trending_score: number | null
          updated_at: string
          usage_count: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          hashtag: string
          id?: string
          last_used_at?: string | null
          platform: string
          trending_score?: number | null
          updated_at?: string
          usage_count?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          hashtag?: string
          id?: string
          last_used_at?: string | null
          platform?: string
          trending_score?: number | null
          updated_at?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          created_at: string
          customer_id: string
          due_date: string | null
          id: string
          invoice_number: string
          paid_at: string | null
          project_id: string | null
          status: Database["public"]["Enums"]["payment_status"]
          stripe_payment_intent_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          customer_id: string
          due_date?: string | null
          id?: string
          invoice_number: string
          paid_at?: string | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_payment_intent_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          customer_id?: string
          due_date?: string | null
          id?: string
          invoice_number?: string
          paid_at?: string | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_payment_intent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          company: string | null
          converted_to_customer: boolean | null
          created_at: string
          customer_id: string | null
          email: string
          id: string
          lead_score: number | null
          name: string | null
          notes: string | null
          phone: string | null
          source: string | null
          updated_at: string
        }
        Insert: {
          company?: string | null
          converted_to_customer?: boolean | null
          created_at?: string
          customer_id?: string | null
          email: string
          id?: string
          lead_score?: number | null
          name?: string | null
          notes?: string | null
          phone?: string | null
          source?: string | null
          updated_at?: string
        }
        Update: {
          company?: string | null
          converted_to_customer?: boolean | null
          created_at?: string
          customer_id?: string | null
          email?: string
          id?: string
          lead_score?: number | null
          name?: string | null
          notes?: string | null
          phone?: string | null
          source?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read: boolean
          recipient_id: string
          related_id: string | null
          related_type: string | null
          sender_id: string
          subject: string | null
          type: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read?: boolean
          recipient_id: string
          related_id?: string | null
          related_type?: string | null
          sender_id: string
          subject?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read?: boolean
          recipient_id?: string
          related_id?: string | null
          related_type?: string | null
          sender_id?: string
          subject?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          category: string
          created_at: string
          created_by: string | null
          id: string
          message: string
          read: boolean
          related_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          id?: string
          message: string
          read?: boolean
          related_id?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          id?: string
          message?: string
          read?: boolean
          related_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string
          email: string
          email_notifications: boolean | null
          first_name: string | null
          id: string
          last_name: string | null
          notification_preferences: Json | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          email: string
          email_notifications?: boolean | null
          first_name?: string | null
          id: string
          last_name?: string | null
          notification_preferences?: Json | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          email?: string
          email_notifications?: boolean | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          notification_preferences?: Json | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          actual_completion_date: string | null
          budget: number | null
          created_at: string
          customer_id: string
          description: string | null
          estimated_completion_date: string | null
          files_uploaded: string[] | null
          id: string
          project_type: Database["public"]["Enums"]["project_type"]
          requirements: Json | null
          status: Database["public"]["Enums"]["project_status"]
          title: string
          updated_at: string
        }
        Insert: {
          actual_completion_date?: string | null
          budget?: number | null
          created_at?: string
          customer_id: string
          description?: string | null
          estimated_completion_date?: string | null
          files_uploaded?: string[] | null
          id?: string
          project_type: Database["public"]["Enums"]["project_type"]
          requirements?: Json | null
          status?: Database["public"]["Enums"]["project_status"]
          title: string
          updated_at?: string
        }
        Update: {
          actual_completion_date?: string | null
          budget?: number | null
          created_at?: string
          customer_id?: string
          description?: string | null
          estimated_completion_date?: string | null
          files_uploaded?: string[] | null
          id?: string
          project_type?: Database["public"]["Enums"]["project_type"]
          requirements?: Json | null
          status?: Database["public"]["Enums"]["project_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          amount: number
          created_at: string
          customer_id: string
          description: string | null
          due_date: string | null
          id: string
          project_id: string | null
          quote_number: string
          status: string
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          customer_id: string
          description?: string | null
          due_date?: string | null
          id?: string
          project_id?: string | null
          quote_number: string
          status?: string
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          customer_id?: string
          description?: string | null
          due_date?: string | null
          id?: string
          project_id?: string | null
          quote_number?: string
          status?: string
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      social_accounts: {
        Row: {
          access_token: string
          account_display_name: string | null
          account_id: string
          account_username: string
          created_at: string
          follower_count: number | null
          following_count: number | null
          id: string
          is_active: boolean | null
          last_synced_at: string | null
          platform: string
          profile_image_url: string | null
          refresh_token: string | null
          token_expires_at: string | null
          updated_at: string
        }
        Insert: {
          access_token: string
          account_display_name?: string | null
          account_id: string
          account_username: string
          created_at?: string
          follower_count?: number | null
          following_count?: number | null
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          platform: string
          profile_image_url?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string
          account_display_name?: string | null
          account_id?: string
          account_username?: string
          created_at?: string
          follower_count?: number | null
          following_count?: number | null
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          platform?: string
          profile_image_url?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      social_media_metrics: {
        Row: {
          account_id: string
          clicks: number | null
          comments: number | null
          created_at: string
          id: string
          impressions: number | null
          likes: number | null
          metric_date: string
          post_id: string | null
          reach: number | null
          shares: number | null
          views: number | null
        }
        Insert: {
          account_id: string
          clicks?: number | null
          comments?: number | null
          created_at?: string
          id?: string
          impressions?: number | null
          likes?: number | null
          metric_date?: string
          post_id?: string | null
          reach?: number | null
          shares?: number | null
          views?: number | null
        }
        Update: {
          account_id?: string
          clicks?: number | null
          comments?: number | null
          created_at?: string
          id?: string
          impressions?: number | null
          likes?: number | null
          metric_date?: string
          post_id?: string | null
          reach?: number | null
          shares?: number | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "social_media_metrics_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "social_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_media_metrics_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      social_media_settings: {
        Row: {
          can_create_posts: boolean | null
          can_delete_posts: boolean | null
          can_manage_accounts: boolean | null
          can_schedule_posts: boolean | null
          can_view: boolean | null
          can_view_analytics: boolean | null
          created_at: string
          id: string
          notification_preferences: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          can_create_posts?: boolean | null
          can_delete_posts?: boolean | null
          can_manage_accounts?: boolean | null
          can_schedule_posts?: boolean | null
          can_view?: boolean | null
          can_view_analytics?: boolean | null
          created_at?: string
          id?: string
          notification_preferences?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          can_create_posts?: boolean | null
          can_delete_posts?: boolean | null
          can_manage_accounts?: boolean | null
          can_schedule_posts?: boolean | null
          can_view?: boolean | null
          can_view_analytics?: boolean | null
          created_at?: string
          id?: string
          notification_preferences?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_media_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      social_posts: {
        Row: {
          account_id: string | null
          ai_generated: boolean | null
          character_count: number | null
          content: string
          created_at: string
          engagement_comments: number | null
          engagement_likes: number | null
          engagement_shares: number | null
          engagement_views: number | null
          error_message: string | null
          hashtags: string[] | null
          id: string
          media_type: string | null
          media_urls: string[] | null
          platform: string
          post_id: string | null
          post_url: string | null
          posted_at: string | null
          retry_count: number | null
          scheduled_for: string | null
        }
        Insert: {
          account_id?: string | null
          ai_generated?: boolean | null
          character_count?: number | null
          content: string
          created_at?: string
          engagement_comments?: number | null
          engagement_likes?: number | null
          engagement_shares?: number | null
          engagement_views?: number | null
          error_message?: string | null
          hashtags?: string[] | null
          id?: string
          media_type?: string | null
          media_urls?: string[] | null
          platform: string
          post_id?: string | null
          post_url?: string | null
          posted_at?: string | null
          retry_count?: number | null
          scheduled_for?: string | null
        }
        Update: {
          account_id?: string | null
          ai_generated?: boolean | null
          character_count?: number | null
          content?: string
          created_at?: string
          engagement_comments?: number | null
          engagement_likes?: number | null
          engagement_shares?: number | null
          engagement_views?: number | null
          error_message?: string | null
          hashtags?: string[] | null
          id?: string
          media_type?: string | null
          media_urls?: string[] | null
          platform?: string
          post_id?: string | null
          post_url?: string | null
          posted_at?: string | null
          retry_count?: number | null
          scheduled_for?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_social_posts_account"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "social_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          assigned_to: string | null
          created_at: string
          customer_id: string
          description: string
          id: string
          priority: Database["public"]["Enums"]["ticket_priority"]
          project_id: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          customer_id: string
          description: string
          id?: string
          priority?: Database["public"]["Enums"]["ticket_priority"]
          project_id?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          customer_id?: string
          description?: string
          id?: string
          priority?: Database["public"]["Enums"]["ticket_priority"]
          project_id?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string
          email_notifications: boolean | null
          id: string
          language: string | null
          push_notifications: boolean | null
          theme: string | null
          timezone: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email_notifications?: boolean | null
          id?: string
          language?: string | null
          push_notifications?: boolean | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email_notifications?: boolean | null
          id?: string
          language?: string | null
          push_notifications?: boolean | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_activity: {
        Args: {
          p_user_id: string
          p_actor_id: string
          p_action: string
          p_entity_type: string
          p_entity_id: string
          p_description: string
          p_old_values?: Json
          p_new_values?: Json
        }
        Returns: undefined
      }
      send_notification: {
        Args: {
          p_user_id: string
          p_title: string
          p_message: string
          p_type?: string
          p_category?: string
          p_related_id?: string
          p_created_by?: string
          p_action_url?: string
        }
        Returns: undefined
      }
    }
    Enums: {
      payment_status: "pending" | "paid" | "failed" | "refunded"
      project_status:
        | "pending"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "on_hold"
      project_type: "game" | "app" | "web"
      ticket_priority: "low" | "medium" | "high" | "urgent"
      ticket_status: "open" | "in_progress" | "resolved" | "closed"
      user_role: "customer" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      payment_status: ["pending", "paid", "failed", "refunded"],
      project_status: [
        "pending",
        "in_progress",
        "completed",
        "cancelled",
        "on_hold",
      ],
      project_type: ["game", "app", "web"],
      ticket_priority: ["low", "medium", "high", "urgent"],
      ticket_status: ["open", "in_progress", "resolved", "closed"],
      user_role: ["customer", "admin"],
    },
  },
} as const
