export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
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
      admin_requests: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          requested_at: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          requested_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          requested_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ads_landing_pages: {
        Row: {
          created_at: string
          cta_subtext: string
          cta_text: string
          headline: string
          id: string
          is_active: boolean
          meta_description: string
          meta_title: string
          page_type: string
          subheadline: string
          testimonials: Json
          trust_signals: Json
          updated_at: string
          urgency_message: string
        }
        Insert: {
          created_at?: string
          cta_subtext: string
          cta_text: string
          headline: string
          id?: string
          is_active?: boolean
          meta_description: string
          meta_title: string
          page_type: string
          subheadline: string
          testimonials?: Json
          trust_signals?: Json
          updated_at?: string
          urgency_message: string
        }
        Update: {
          created_at?: string
          cta_subtext?: string
          cta_text?: string
          headline?: string
          id?: string
          is_active?: boolean
          meta_description?: string
          meta_title?: string
          page_type?: string
          subheadline?: string
          testimonials?: Json
          trust_signals?: Json
          updated_at?: string
          urgency_message?: string
        }
        Relationships: []
      }
      ai_agent_settings: {
        Row: {
          agent_name: string
          created_at: string
          id: string
          is_enabled: boolean
          module_permissions: Json | null
          scope_config: Json | null
          updated_at: string
          vertex_config: Json | null
        }
        Insert: {
          agent_name?: string
          created_at?: string
          id?: string
          is_enabled?: boolean
          module_permissions?: Json | null
          scope_config?: Json | null
          updated_at?: string
          vertex_config?: Json | null
        }
        Update: {
          agent_name?: string
          created_at?: string
          id?: string
          is_enabled?: boolean
          module_permissions?: Json | null
          scope_config?: Json | null
          updated_at?: string
          vertex_config?: Json | null
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
      api_integrations: {
        Row: {
          access_token: string | null
          config_data: Json | null
          created_at: string
          id: string
          integration_name: string
          integration_type: string
          is_connected: boolean
          last_sync_at: string | null
          refresh_token: string | null
          token_expires_at: string | null
          updated_at: string
        }
        Insert: {
          access_token?: string | null
          config_data?: Json | null
          created_at?: string
          id?: string
          integration_name: string
          integration_type: string
          is_connected?: boolean
          last_sync_at?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string | null
          config_data?: Json | null
          created_at?: string
          id?: string
          integration_name?: string
          integration_type?: string
          is_connected?: boolean
          last_sync_at?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      app_projects: {
        Row: {
          android_link: string | null
          app_category: string
          client_name: string | null
          created_at: string | null
          description: string
          display_order: number | null
          feature_image_url: string | null
          features: Json | null
          id: string
          ios_link: string | null
          is_featured: boolean | null
          logo_url: string | null
          name: string
          screenshots: string[] | null
          status: string
          technologies: Json | null
          updated_at: string | null
          web_demo_url: string | null
        }
        Insert: {
          android_link?: string | null
          app_category: string
          client_name?: string | null
          created_at?: string | null
          description: string
          display_order?: number | null
          feature_image_url?: string | null
          features?: Json | null
          id?: string
          ios_link?: string | null
          is_featured?: boolean | null
          logo_url?: string | null
          name: string
          screenshots?: string[] | null
          status?: string
          technologies?: Json | null
          updated_at?: string | null
          web_demo_url?: string | null
        }
        Update: {
          android_link?: string | null
          app_category?: string
          client_name?: string | null
          created_at?: string | null
          description?: string
          display_order?: number | null
          feature_image_url?: string | null
          features?: Json | null
          id?: string
          ios_link?: string | null
          is_featured?: boolean | null
          logo_url?: string | null
          name?: string
          screenshots?: string[] | null
          status?: string
          technologies?: Json | null
          updated_at?: string | null
          web_demo_url?: string | null
        }
        Relationships: []
      }
      app_store_links: {
        Row: {
          created_at: string
          game_name: string
          google_play_link: string | null
          id: string
          ios_link: string | null
          is_active: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          game_name: string
          google_play_link?: string | null
          id?: string
          ios_link?: string | null
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          game_name?: string
          google_play_link?: string | null
          id?: string
          ios_link?: string | null
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
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
      blog_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          post_count: number | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          post_count?: number | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          post_count?: number | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string | null
          auto_published: boolean | null
          category_id: string | null
          content: string
          created_at: string | null
          excerpt: string | null
          featured_image_url: string | null
          id: string
          meta_description: string | null
          meta_keywords: string[] | null
          meta_title: string | null
          published_at: string | null
          read_time_minutes: number | null
          scheduled_for: string | null
          slug: string
          status: string
          tags: string[] | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          author_id?: string | null
          auto_published?: boolean | null
          category_id?: string | null
          content: string
          created_at?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          published_at?: string | null
          read_time_minutes?: number | null
          scheduled_for?: string | null
          slug: string
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          author_id?: string | null
          auto_published?: boolean | null
          category_id?: string | null
          content?: string
          created_at?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          published_at?: string | null
          read_time_minutes?: number | null
          scheduled_for?: string | null
          slug?: string
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
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
      currency_rates: {
        Row: {
          from_currency: string
          id: string
          margin: number | null
          rate: number
          to_currency: string
          updated_at: string | null
        }
        Insert: {
          from_currency: string
          id?: string
          margin?: number | null
          rate: number
          to_currency: string
          updated_at?: string | null
        }
        Update: {
          from_currency?: string
          id?: string
          margin?: number | null
          rate?: number
          to_currency?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      customer_subscriptions: {
        Row: {
          billing_cycle: string
          created_at: string
          customer_id: string
          id: string
          next_billing_date: string
          plan_id: string
          start_date: string
          status: string
          stripe_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          billing_cycle?: string
          created_at?: string
          customer_id: string
          id?: string
          next_billing_date: string
          plan_id: string
          start_date?: string
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          billing_cycle?: string
          created_at?: string
          customer_id?: string
          id?: string
          next_billing_date?: string
          plan_id?: string
          start_date?: string
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      domain_hosting_settings: {
        Row: {
          api_settings: Json | null
          auto_provisioning: boolean | null
          created_at: string
          default_nameservers: string[] | null
          domain_pricing: Json | null
          domain_registration_enabled: boolean | null
          email_templates: Json | null
          hosting_orders_enabled: boolean | null
          id: string
          updated_at: string
        }
        Insert: {
          api_settings?: Json | null
          auto_provisioning?: boolean | null
          created_at?: string
          default_nameservers?: string[] | null
          domain_pricing?: Json | null
          domain_registration_enabled?: boolean | null
          email_templates?: Json | null
          hosting_orders_enabled?: boolean | null
          id?: string
          updated_at?: string
        }
        Update: {
          api_settings?: Json | null
          auto_provisioning?: boolean | null
          created_at?: string
          default_nameservers?: string[] | null
          domain_pricing?: Json | null
          domain_registration_enabled?: boolean | null
          email_templates?: Json | null
          hosting_orders_enabled?: boolean | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      domain_registrations: {
        Row: {
          created_at: string | null
          currency: string
          customer_id: string
          domain_name: string
          enom_order_id: string | null
          expiry_date: string | null
          id: string
          id_protect: boolean | null
          nameservers: string[] | null
          order_id: string | null
          price: number
          registration_date: string | null
          status: string
          tld: string
          years: number
        }
        Insert: {
          created_at?: string | null
          currency?: string
          customer_id: string
          domain_name: string
          enom_order_id?: string | null
          expiry_date?: string | null
          id?: string
          id_protect?: boolean | null
          nameservers?: string[] | null
          order_id?: string | null
          price: number
          registration_date?: string | null
          status?: string
          tld: string
          years?: number
        }
        Update: {
          created_at?: string | null
          currency?: string
          customer_id?: string
          domain_name?: string
          enom_order_id?: string | null
          expiry_date?: string | null
          id?: string
          id_protect?: boolean | null
          nameservers?: string[] | null
          order_id?: string | null
          price?: number
          registration_date?: string | null
          status?: string
          tld?: string
          years?: number
        }
        Relationships: [
          {
            foreignKeyName: "domain_registrations_customer_fk"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "domain_registrations_order_fk"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
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
      email_templates: {
        Row: {
          body_html: string
          body_text: string | null
          category: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          is_system: boolean | null
          name: string
          subject: string
          template_type: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          body_html: string
          body_text?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name: string
          subject: string
          template_type: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          body_html?: string
          body_text?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name?: string
          subject?: string
          template_type?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      exchange_rates: {
        Row: {
          cached_at: string
          created_at: string
          expires_at: string
          from_currency: string
          id: string
          rate: number
          source: string | null
          to_currency: string
        }
        Insert: {
          cached_at?: string
          created_at?: string
          expires_at: string
          from_currency: string
          id?: string
          rate: number
          source?: string | null
          to_currency: string
        }
        Update: {
          cached_at?: string
          created_at?: string
          expires_at?: string
          from_currency?: string
          id?: string
          rate?: number
          source?: string | null
          to_currency?: string
        }
        Relationships: []
      }
      featured_content: {
        Row: {
          border_color: string | null
          created_at: string | null
          created_by: string | null
          cta_link: string
          cta_text: string
          description: string | null
          display_order: number | null
          end_date: string | null
          gradient_from: string | null
          gradient_to: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          start_date: string | null
          subtitle: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          border_color?: string | null
          created_at?: string | null
          created_by?: string | null
          cta_link: string
          cta_text: string
          description?: string | null
          display_order?: number | null
          end_date?: string | null
          gradient_from?: string | null
          gradient_to?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          start_date?: string | null
          subtitle?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          border_color?: string | null
          created_at?: string | null
          created_by?: string | null
          cta_link?: string
          cta_text?: string
          description?: string | null
          display_order?: number | null
          end_date?: string | null
          gradient_from?: string | null
          gradient_to?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          start_date?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
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
      games: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string
          display_order: number | null
          feature_image_url: string | null
          google_play_link: string | null
          id: string
          ios_link: string | null
          is_featured: boolean | null
          is_new: boolean | null
          key_point_1: string | null
          key_point_1_icon: string | null
          key_point_2: string | null
          key_point_2_icon: string | null
          key_point_3: string | null
          key_point_3_icon: string | null
          logo_url: string | null
          name: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description: string
          display_order?: number | null
          feature_image_url?: string | null
          google_play_link?: string | null
          id?: string
          ios_link?: string | null
          is_featured?: boolean | null
          is_new?: boolean | null
          key_point_1?: string | null
          key_point_1_icon?: string | null
          key_point_2?: string | null
          key_point_2_icon?: string | null
          key_point_3?: string | null
          key_point_3_icon?: string | null
          logo_url?: string | null
          name: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string
          display_order?: number | null
          feature_image_url?: string | null
          google_play_link?: string | null
          id?: string
          ios_link?: string | null
          is_featured?: boolean | null
          is_new?: boolean | null
          key_point_1?: string | null
          key_point_1_icon?: string | null
          key_point_2?: string | null
          key_point_2_icon?: string | null
          key_point_3?: string | null
          key_point_3_icon?: string | null
          logo_url?: string | null
          name?: string
          status?: string | null
          updated_at?: string | null
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
      hosting_orders: {
        Row: {
          billing_cycle: string | null
          created_at: string
          customer_id: string
          domain_name: string | null
          expires_at: string | null
          hosting_package_id: string
          hosting_price_gbp: number
          id: string
          status: string | null
          stripe_session_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          billing_cycle?: string | null
          created_at?: string
          customer_id: string
          domain_name?: string | null
          expires_at?: string | null
          hosting_package_id: string
          hosting_price_gbp: number
          id?: string
          status?: string | null
          stripe_session_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          billing_cycle?: string | null
          created_at?: string
          customer_id?: string
          domain_name?: string | null
          expires_at?: string | null
          hosting_package_id?: string
          hosting_price_gbp?: number
          id?: string
          status?: string | null
          stripe_session_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      invoice_templates: {
        Row: {
          branding: Json | null
          company_details: Json | null
          created_at: string | null
          id: string
          is_default: boolean | null
          layout_settings: Json | null
          name: string
          template_type: string
          updated_at: string | null
        }
        Insert: {
          branding?: Json | null
          company_details?: Json | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          layout_settings?: Json | null
          name: string
          template_type?: string
          updated_at?: string | null
        }
        Update: {
          branding?: Json | null
          company_details?: Json | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          layout_settings?: Json | null
          name?: string
          template_type?: string
          updated_at?: string | null
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
          tide_payment_link_url: string | null
          tide_payment_request_id: string | null
          tide_payment_status: string | null
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
          tide_payment_link_url?: string | null
          tide_payment_request_id?: string | null
          tide_payment_status?: string | null
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
          tide_payment_link_url?: string | null
          tide_payment_request_id?: string | null
          tide_payment_status?: string | null
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
      knowledge_base_articles: {
        Row: {
          category_id: string | null
          content: string
          created_at: string | null
          created_by: string
          helpful_count: number | null
          id: string
          is_published: boolean | null
          not_helpful_count: number | null
          search_keywords: string[] | null
          tags: string[] | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          category_id?: string | null
          content: string
          created_at?: string | null
          created_by: string
          helpful_count?: number | null
          id?: string
          is_published?: boolean | null
          not_helpful_count?: number | null
          search_keywords?: string[] | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          category_id?: string | null
          content?: string
          created_at?: string | null
          created_by?: string
          helpful_count?: number | null
          id?: string
          is_published?: boolean | null
          not_helpful_count?: number | null
          search_keywords?: string[] | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_base_articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "ticket_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_activities: {
        Row: {
          activity_type: string
          completed_at: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          lead_id: string
          scheduled_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          activity_type: string
          completed_at?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          lead_id: string
          scheduled_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          activity_type?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          lead_id?: string
          scheduled_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
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
          deal_value: number | null
          email: string
          expected_close_date: string | null
          id: string
          last_activity_at: string | null
          lead_score: number | null
          name: string | null
          notes: string | null
          phone: string | null
          pipeline_stage_id: string | null
          probability: number | null
          source: string | null
          updated_at: string
        }
        Insert: {
          company?: string | null
          converted_to_customer?: boolean | null
          created_at?: string
          customer_id?: string | null
          deal_value?: number | null
          email: string
          expected_close_date?: string | null
          id?: string
          last_activity_at?: string | null
          lead_score?: number | null
          name?: string | null
          notes?: string | null
          phone?: string | null
          pipeline_stage_id?: string | null
          probability?: number | null
          source?: string | null
          updated_at?: string
        }
        Update: {
          company?: string | null
          converted_to_customer?: boolean | null
          created_at?: string
          customer_id?: string | null
          deal_value?: number | null
          email?: string
          expected_close_date?: string | null
          id?: string
          last_activity_at?: string | null
          lead_score?: number | null
          name?: string | null
          notes?: string | null
          phone?: string | null
          pipeline_stage_id?: string | null
          probability?: number | null
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
          {
            foreignKeyName: "leads_pipeline_stage_id_fkey"
            columns: ["pipeline_stage_id"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
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
        Relationships: [
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      oauth_connections: {
        Row: {
          access_token_encrypted: string | null
          account_id: string | null
          created_at: string
          expires_at: string
          id: string
          meta: Json | null
          provider: string
          refresh_token_encrypted: string | null
          scope: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token_encrypted?: string | null
          account_id?: string | null
          created_at?: string
          expires_at: string
          id?: string
          meta?: Json | null
          provider: string
          refresh_token_encrypted?: string | null
          scope?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token_encrypted?: string | null
          account_id?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          meta?: Json | null
          provider?: string
          refresh_token_encrypted?: string | null
          scope?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          completed_at: string | null
          created_at: string | null
          currency: string
          customer_id: string
          id: string
          items: Json
          metadata: Json | null
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          total_amount: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          currency?: string
          customer_id: string
          id?: string
          items?: Json
          metadata?: Json | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          total_amount: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          currency?: string
          customer_id?: string
          id?: string
          items?: Json
          metadata?: Json | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_fk"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      org_billing_settings: {
        Row: {
          account_name: string
          account_number: string
          created_at: string | null
          iban: string | null
          id: string
          notes_bacs: string | null
          org_id: string
          sort_code: string
          swift_code: string | null
          updated_at: string | null
        }
        Insert: {
          account_name: string
          account_number: string
          created_at?: string | null
          iban?: string | null
          id?: string
          notes_bacs?: string | null
          org_id?: string
          sort_code: string
          swift_code?: string | null
          updated_at?: string | null
        }
        Update: {
          account_name?: string
          account_number?: string
          created_at?: string | null
          iban?: string | null
          id?: string
          notes_bacs?: string | null
          org_id?: string
          sort_code?: string
          swift_code?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      page_content: {
        Row: {
          canonical_url: string | null
          content_sections: Json[] | null
          created_at: string | null
          created_by: string | null
          cta_section: Json | null
          custom_css: string | null
          custom_scripts: string | null
          faq_items: Json[] | null
          features: Json[] | null
          hero_section: Json | null
          id: string
          is_active: boolean | null
          last_modified_by: string | null
          meta_description: string | null
          meta_keywords: string[] | null
          meta_title: string
          no_index: boolean | null
          og_description: string | null
          og_image: string | null
          og_title: string | null
          page_name: string
          page_route: string
          page_type: string
          testimonials: Json[] | null
          twitter_card_type: string | null
          updated_at: string | null
        }
        Insert: {
          canonical_url?: string | null
          content_sections?: Json[] | null
          created_at?: string | null
          created_by?: string | null
          cta_section?: Json | null
          custom_css?: string | null
          custom_scripts?: string | null
          faq_items?: Json[] | null
          features?: Json[] | null
          hero_section?: Json | null
          id?: string
          is_active?: boolean | null
          last_modified_by?: string | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title: string
          no_index?: boolean | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          page_name: string
          page_route: string
          page_type: string
          testimonials?: Json[] | null
          twitter_card_type?: string | null
          updated_at?: string | null
        }
        Update: {
          canonical_url?: string | null
          content_sections?: Json[] | null
          created_at?: string | null
          created_by?: string | null
          cta_section?: Json | null
          custom_css?: string | null
          custom_scripts?: string | null
          faq_items?: Json[] | null
          features?: Json[] | null
          hero_section?: Json | null
          id?: string
          is_active?: boolean | null
          last_modified_by?: string | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string
          no_index?: boolean | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          page_name?: string
          page_route?: string
          page_type?: string
          testimonials?: Json[] | null
          twitter_card_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pending_admin_invitations: {
        Row: {
          created_at: string
          email: string
          id: string
          invited_at: string
          invited_by: string | null
          notes: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          invited_at?: string
          invited_by?: string | null
          notes?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          invited_at?: string
          invited_by?: string | null
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      pending_domain_orders: {
        Row: {
          admin_notes: string | null
          created_at: string
          domain_name: string
          domain_price: number
          id: string
          invoice_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          tld: string
          total_estimate: number
          updated_at: string
          user_id: string
          years: number
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          domain_name: string
          domain_price: number
          id?: string
          invoice_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          tld: string
          total_estimate: number
          updated_at?: string
          user_id: string
          years?: number
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          domain_name?: string
          domain_price?: number
          id?: string
          invoice_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          tld?: string
          total_estimate?: number
          updated_at?: string
          user_id?: string
          years?: number
        }
        Relationships: [
          {
            foreignKeyName: "pending_domain_orders_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_stages: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          stage_order: number
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          stage_order: number
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          stage_order?: number
          updated_at?: string
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
          stripe_customer_id: string | null
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
          stripe_customer_id?: string | null
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
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      project_approvals: {
        Row: {
          approval_type: string
          approver_id: string
          attachments: string[] | null
          comments: string | null
          created_at: string
          deadline: string | null
          description: string | null
          id: string
          milestone_id: string | null
          project_id: string
          requested_at: string
          requested_by: string
          responded_at: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          approval_type: string
          approver_id: string
          attachments?: string[] | null
          comments?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          milestone_id?: string | null
          project_id: string
          requested_at?: string
          requested_by: string
          responded_at?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          approval_type?: string
          approver_id?: string
          attachments?: string[] | null
          comments?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          milestone_id?: string | null
          project_id?: string
          requested_at?: string
          requested_by?: string
          responded_at?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_approvals_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "project_milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_approvals_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_budgets: {
        Row: {
          actual_amount: number | null
          budgeted_amount: number
          category: string
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_fixed_cost: boolean | null
          project_id: string
          updated_at: string
        }
        Insert: {
          actual_amount?: number | null
          budgeted_amount: number
          category: string
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_fixed_cost?: boolean | null
          project_id: string
          updated_at?: string
        }
        Update: {
          actual_amount?: number | null
          budgeted_amount?: number
          category?: string
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_fixed_cost?: boolean | null
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_budgets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_change_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          description: string
          estimated_cost: number | null
          estimated_hours: number | null
          id: string
          impact_assessment: string | null
          implemented_at: string | null
          priority: string
          project_id: string
          reason: string | null
          rejection_reason: string | null
          requested_at: string
          requested_by: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          description: string
          estimated_cost?: number | null
          estimated_hours?: number | null
          id?: string
          impact_assessment?: string | null
          implemented_at?: string | null
          priority?: string
          project_id: string
          reason?: string | null
          rejection_reason?: string | null
          requested_at?: string
          requested_by: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          description?: string
          estimated_cost?: number | null
          estimated_hours?: number | null
          id?: string
          impact_assessment?: string | null
          implemented_at?: string | null
          priority?: string
          project_id?: string
          reason?: string | null
          rejection_reason?: string | null
          requested_at?: string
          requested_by?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_change_requests_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_comments: {
        Row: {
          attachments: string[] | null
          author_id: string
          content: string
          created_at: string
          edited_at: string | null
          id: string
          is_internal: boolean | null
          is_pinned: boolean | null
          mentions: string[] | null
          milestone_id: string | null
          parent_comment_id: string | null
          project_id: string
          task_id: string | null
          updated_at: string
        }
        Insert: {
          attachments?: string[] | null
          author_id: string
          content: string
          created_at?: string
          edited_at?: string | null
          id?: string
          is_internal?: boolean | null
          is_pinned?: boolean | null
          mentions?: string[] | null
          milestone_id?: string | null
          parent_comment_id?: string | null
          project_id: string
          task_id?: string | null
          updated_at?: string
        }
        Update: {
          attachments?: string[] | null
          author_id?: string
          content?: string
          created_at?: string
          edited_at?: string | null
          id?: string
          is_internal?: boolean | null
          is_pinned?: boolean | null
          mentions?: string[] | null
          milestone_id?: string | null
          parent_comment_id?: string | null
          project_id?: string
          task_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_comments_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "project_milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "project_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_comments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "project_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      project_discussions: {
        Row: {
          created_at: string | null
          id: string
          mentions: string[] | null
          message: string
          project_id: string
          reply_to: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          mentions?: string[] | null
          message: string
          project_id: string
          reply_to?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          mentions?: string[] | null
          message?: string
          project_id?: string
          reply_to?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_discussions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_discussions_reply_to_fkey"
            columns: ["reply_to"]
            isOneToOne: false
            referencedRelation: "project_discussions"
            referencedColumns: ["id"]
          },
        ]
      }
      project_milestones: {
        Row: {
          approval_required: boolean | null
          approved_at: string | null
          approved_by: string | null
          completed_at: string | null
          completion_percentage: number | null
          created_at: string
          created_by: string
          deliverables: string[] | null
          description: string | null
          due_date: string
          id: string
          is_critical: boolean | null
          project_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          approval_required?: boolean | null
          approved_at?: string | null
          approved_by?: string | null
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string
          created_by: string
          deliverables?: string[] | null
          description?: string | null
          due_date: string
          id?: string
          is_critical?: boolean | null
          project_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          approval_required?: boolean | null
          approved_at?: string | null
          approved_by?: string | null
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string
          created_by?: string
          deliverables?: string[] | null
          description?: string | null
          due_date?: string
          id?: string
          is_critical?: boolean | null
          project_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          notification_type: string
          project_id: string | null
          task_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          notification_type: string
          project_id?: string | null
          task_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          notification_type?: string
          project_id?: string | null
          task_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_notifications_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_notifications_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "project_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      project_resources: {
        Row: {
          allocation_percentage: number | null
          created_at: string
          created_by: string
          description: string | null
          end_date: string | null
          id: string
          is_critical: boolean | null
          notes: string | null
          project_id: string
          quantity: number | null
          resource_name: string
          resource_type: string
          start_date: string | null
          total_cost: number | null
          unit_cost: number | null
          updated_at: string
        }
        Insert: {
          allocation_percentage?: number | null
          created_at?: string
          created_by: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_critical?: boolean | null
          notes?: string | null
          project_id: string
          quantity?: number | null
          resource_name: string
          resource_type: string
          start_date?: string | null
          total_cost?: number | null
          unit_cost?: number | null
          updated_at?: string
        }
        Update: {
          allocation_percentage?: number | null
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_critical?: boolean | null
          notes?: string | null
          project_id?: string
          quantity?: number | null
          resource_name?: string
          resource_type?: string
          start_date?: string | null
          total_cost?: number | null
          unit_cost?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_resources_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_risks: {
        Row: {
          contingency_plan: string | null
          created_at: string
          description: string
          id: string
          identified_at: string
          identified_by: string
          impact: string
          mitigation_plan: string | null
          owner_id: string | null
          probability: string
          project_id: string
          review_date: string | null
          risk_category: string
          risk_score: number | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          contingency_plan?: string | null
          created_at?: string
          description: string
          id?: string
          identified_at?: string
          identified_by: string
          impact: string
          mitigation_plan?: string | null
          owner_id?: string | null
          probability: string
          project_id: string
          review_date?: string | null
          risk_category: string
          risk_score?: number | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          contingency_plan?: string | null
          created_at?: string
          description?: string
          id?: string
          identified_at?: string
          identified_by?: string
          impact?: string
          mitigation_plan?: string | null
          owner_id?: string | null
          probability?: string
          project_id?: string
          review_date?: string | null
          risk_category?: string
          risk_score?: number | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_risks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_task_templates: {
        Row: {
          created_at: string | null
          estimated_hours: number | null
          id: string
          is_milestone: boolean | null
          order_sequence: number | null
          project_type: string
          task_description: string | null
          task_priority: string | null
          task_status: string | null
          task_title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          estimated_hours?: number | null
          id?: string
          is_milestone?: boolean | null
          order_sequence?: number | null
          project_type: string
          task_description?: string | null
          task_priority?: string | null
          task_status?: string | null
          task_title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          estimated_hours?: number | null
          id?: string
          is_milestone?: boolean | null
          order_sequence?: number | null
          project_type?: string
          task_description?: string | null
          task_priority?: string | null
          task_status?: string | null
          task_title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      project_tasks: {
        Row: {
          actual_hours: number | null
          assigned_to: string | null
          assignee_id: string | null
          completed_at: string | null
          completion_percentage: number | null
          created_at: string
          created_by: string
          dependencies: string[] | null
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          id: string
          is_milestone: boolean | null
          is_recurring: boolean | null
          milestone_id: string | null
          parent_task_id: string | null
          position: number | null
          priority: string
          project_id: string
          recurring_pattern: Json | null
          sort_order: number | null
          start_date: string | null
          status: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          actual_hours?: number | null
          assigned_to?: string | null
          assignee_id?: string | null
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string
          created_by: string
          dependencies?: string[] | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          is_milestone?: boolean | null
          is_recurring?: boolean | null
          milestone_id?: string | null
          parent_task_id?: string | null
          position?: number | null
          priority?: string
          project_id: string
          recurring_pattern?: Json | null
          sort_order?: number | null
          start_date?: string | null
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          actual_hours?: number | null
          assigned_to?: string | null
          assignee_id?: string | null
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string
          created_by?: string
          dependencies?: string[] | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          is_milestone?: boolean | null
          is_recurring?: boolean | null
          milestone_id?: string | null
          parent_task_id?: string | null
          position?: number | null
          priority?: string
          project_id?: string
          recurring_pattern?: Json | null
          sort_order?: number | null
          start_date?: string | null
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "project_milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "project_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_team_members: {
        Row: {
          added_by: string
          can_edit_tasks: boolean | null
          can_log_time: boolean | null
          can_view_budget: boolean | null
          created_at: string
          hourly_rate: number | null
          id: string
          joined_at: string
          left_at: string | null
          notification_preferences: Json | null
          project_id: string
          role: string
          user_id: string
        }
        Insert: {
          added_by: string
          can_edit_tasks?: boolean | null
          can_log_time?: boolean | null
          can_view_budget?: boolean | null
          created_at?: string
          hourly_rate?: number | null
          id?: string
          joined_at?: string
          left_at?: string | null
          notification_preferences?: Json | null
          project_id: string
          role?: string
          user_id: string
        }
        Update: {
          added_by?: string
          can_edit_tasks?: boolean | null
          can_log_time?: boolean | null
          can_view_budget?: boolean | null
          created_at?: string
          hourly_rate?: number | null
          id?: string
          joined_at?: string
          left_at?: string | null
          notification_preferences?: Json | null
          project_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_team_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_templates: {
        Row: {
          created_at: string
          created_by: string | null
          default_budget: number | null
          description: string | null
          estimated_duration_days: number | null
          id: string
          is_active: boolean | null
          name: string
          project_type: Database["public"]["Enums"]["project_type"]
          template_data: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          default_budget?: number | null
          description?: string | null
          estimated_duration_days?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          project_type: Database["public"]["Enums"]["project_type"]
          template_data?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          default_budget?: number | null
          description?: string | null
          estimated_duration_days?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          project_type?: Database["public"]["Enums"]["project_type"]
          template_data?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      project_time_logs: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          description: string | null
          hourly_rate: number | null
          hours_logged: number
          id: string
          invoice_id: string | null
          is_approved: boolean | null
          is_billable: boolean | null
          project_id: string
          task_id: string | null
          total_cost: number | null
          updated_at: string
          user_id: string
          work_date: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          description?: string | null
          hourly_rate?: number | null
          hours_logged: number
          id?: string
          invoice_id?: string | null
          is_approved?: boolean | null
          is_billable?: boolean | null
          project_id: string
          task_id?: string | null
          total_cost?: number | null
          updated_at?: string
          user_id: string
          work_date?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          description?: string | null
          hourly_rate?: number | null
          hours_logged?: number
          id?: string
          invoice_id?: string | null
          is_approved?: boolean | null
          is_billable?: boolean | null
          project_id?: string
          task_id?: string | null
          total_cost?: number | null
          updated_at?: string
          user_id?: string
          work_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_time_logs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_time_logs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "project_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          actual_completion_date: string | null
          actual_start_date: string | null
          approval_notes: string | null
          approval_requested_at: string | null
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          budget: number | null
          client_visible: boolean | null
          completion_percentage: number | null
          created_at: string
          customer_id: string
          deadline: string | null
          description: string | null
          estimated_completion_date: string | null
          files_uploaded: string[] | null
          health_status: string | null
          hourly_rate: number | null
          id: string
          is_billable: boolean | null
          parent_project_id: string | null
          priority: string | null
          project_manager_id: string | null
          project_type: Database["public"]["Enums"]["project_type"]
          requirements: Json | null
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"]
          template_id: string | null
          title: string
          total_cost: number | null
          total_hours_logged: number | null
          updated_at: string
        }
        Insert: {
          actual_completion_date?: string | null
          actual_start_date?: string | null
          approval_notes?: string | null
          approval_requested_at?: string | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          budget?: number | null
          client_visible?: boolean | null
          completion_percentage?: number | null
          created_at?: string
          customer_id: string
          deadline?: string | null
          description?: string | null
          estimated_completion_date?: string | null
          files_uploaded?: string[] | null
          health_status?: string | null
          hourly_rate?: number | null
          id?: string
          is_billable?: boolean | null
          parent_project_id?: string | null
          priority?: string | null
          project_manager_id?: string | null
          project_type: Database["public"]["Enums"]["project_type"]
          requirements?: Json | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          template_id?: string | null
          title: string
          total_cost?: number | null
          total_hours_logged?: number | null
          updated_at?: string
        }
        Update: {
          actual_completion_date?: string | null
          actual_start_date?: string | null
          approval_notes?: string | null
          approval_requested_at?: string | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          budget?: number | null
          client_visible?: boolean | null
          completion_percentage?: number | null
          created_at?: string
          customer_id?: string
          deadline?: string | null
          description?: string | null
          estimated_completion_date?: string | null
          files_uploaded?: string[] | null
          health_status?: string | null
          hourly_rate?: number | null
          id?: string
          is_billable?: boolean | null
          parent_project_id?: string | null
          priority?: string | null
          project_manager_id?: string | null
          project_type?: Database["public"]["Enums"]["project_type"]
          requirements?: Json | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          template_id?: string | null
          title?: string
          total_cost?: number | null
          total_hours_logged?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_projects_template"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "project_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_parent_project_id_fkey"
            columns: ["parent_project_id"]
            isOneToOne: false
            referencedRelation: "projects"
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
        Relationships: [
          {
            foreignKeyName: "quotes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      service_pricing_defaults: {
        Row: {
          created_at: string
          currency: string
          default_price: number | null
          hourly_rate: number | null
          id: string
          is_active: boolean
          price_range_max: number | null
          price_range_min: number | null
          service_name: string
          service_type: string
          tide_payment_link: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          default_price?: number | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean
          price_range_max?: number | null
          price_range_min?: number | null
          service_name: string
          service_type: string
          tide_payment_link?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          default_price?: number | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean
          price_range_max?: number | null
          price_range_min?: number | null
          service_name?: string
          service_type?: string
          tide_payment_link?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sla_policies: {
        Row: {
          created_at: string | null
          first_response_hours: number
          id: string
          is_active: boolean | null
          name: string
          priority: string
          resolution_hours: number
        }
        Insert: {
          created_at?: string | null
          first_response_hours: number
          id?: string
          is_active?: boolean | null
          name: string
          priority: string
          resolution_hours: number
        }
        Update: {
          created_at?: string | null
          first_response_hours?: number
          id?: string
          is_active?: boolean | null
          name?: string
          priority?: string
          resolution_hours?: number
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          add_ons: string[] | null
          category: string
          created_at: string
          description: string
          display_order: number | null
          features: Json
          id: string
          is_active: boolean
          name: string
          price_monthly: number
          stripe_price_id_monthly: string | null
          stripe_product_id: string | null
          updated_at: string
        }
        Insert: {
          add_ons?: string[] | null
          category: string
          created_at?: string
          description: string
          display_order?: number | null
          features?: Json
          id?: string
          is_active?: boolean
          name: string
          price_monthly: number
          stripe_price_id_monthly?: string | null
          stripe_product_id?: string | null
          updated_at?: string
        }
        Update: {
          add_ons?: string[] | null
          category?: string
          created_at?: string
          description?: string
          display_order?: number | null
          features?: Json
          id?: string
          is_active?: boolean
          name?: string
          price_monthly?: number
          stripe_price_id_monthly?: string | null
          stripe_product_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      task_attachments: {
        Row: {
          created_at: string | null
          file_id: string
          id: string
          task_id: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string | null
          file_id: string
          id?: string
          task_id: string
          uploaded_by: string
        }
        Update: {
          created_at?: string | null
          file_id?: string
          id?: string
          task_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_attachments_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "file_uploads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_attachments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "project_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          mentions: string[] | null
          task_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          mentions?: string[] | null
          task_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          mentions?: string[] | null
          task_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "project_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_time_entries: {
        Row: {
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          end_time: string | null
          id: string
          is_billable: boolean | null
          start_time: string
          task_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          is_billable?: boolean | null
          start_time: string
          task_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          is_billable?: boolean | null
          start_time?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_time_entries_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "project_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_attachments: {
        Row: {
          created_at: string
          file_path: string
          file_size: number
          id: string
          mime_type: string
          original_filename: string
          ticket_id: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          file_path: string
          file_size: number
          id?: string
          mime_type: string
          original_filename: string
          ticket_id: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          file_path?: string
          file_size?: number
          id?: string
          mime_type?: string
          original_filename?: string
          ticket_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_attachments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_categories: {
        Row: {
          auto_assign_to: string | null
          color: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          sla_hours: number | null
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          auto_assign_to?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sla_hours?: number | null
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          auto_assign_to?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sla_hours?: number | null
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      ticket_internal_notes: {
        Row: {
          content: string
          created_at: string
          created_by: string
          id: string
          ticket_id: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          id?: string
          ticket_id: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_internal_notes_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_surveys: {
        Row: {
          feedback: string | null
          id: string
          rating: number | null
          submitted_at: string | null
          ticket_id: string | null
        }
        Insert: {
          feedback?: string | null
          id?: string
          rating?: number | null
          submitted_at?: string | null
          ticket_id?: string | null
        }
        Update: {
          feedback?: string | null
          id?: string
          rating?: number | null
          submitted_at?: string | null
          ticket_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_surveys_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_templates: {
        Row: {
          category_id: string | null
          created_at: string
          created_by: string
          description_template: string
          id: string
          is_active: boolean | null
          name: string
          priority: string | null
          title_template: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          created_by: string
          description_template: string
          id?: string
          is_active?: boolean | null
          name: string
          priority?: string | null
          title_template: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          created_by?: string
          description_template?: string
          id?: string
          is_active?: boolean | null
          name?: string
          priority?: string | null
          title_template?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_templates_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "ticket_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_time_logs: {
        Row: {
          billable: boolean | null
          created_at: string
          description: string | null
          hours_logged: number
          id: string
          ticket_id: string
          user_id: string
        }
        Insert: {
          billable?: boolean | null
          created_at?: string
          description?: string | null
          hours_logged: number
          id?: string
          ticket_id: string
          user_id: string
        }
        Update: {
          billable?: boolean | null
          created_at?: string
          description?: string | null
          hours_logged?: number
          id?: string
          ticket_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_time_logs_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_watchers: {
        Row: {
          added_by: string
          created_at: string
          id: string
          ticket_id: string
          user_id: string
        }
        Insert: {
          added_by: string
          created_at?: string
          id?: string
          ticket_id: string
          user_id: string
        }
        Update: {
          added_by?: string
          created_at?: string
          id?: string
          ticket_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_watchers_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          assigned_to: string | null
          category_id: string | null
          created_at: string
          customer_id: string
          description: string
          due_date: string | null
          escalated_at: string | null
          first_response_at: string | null
          id: string
          is_escalated: boolean | null
          priority: Database["public"]["Enums"]["ticket_priority"]
          project_id: string | null
          resolution_time_hours: number | null
          resolved_at: string | null
          satisfaction_feedback: string | null
          satisfaction_rating: number | null
          source: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          tags: string[] | null
          ticket_number: number | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          category_id?: string | null
          created_at?: string
          customer_id: string
          description: string
          due_date?: string | null
          escalated_at?: string | null
          first_response_at?: string | null
          id?: string
          is_escalated?: boolean | null
          priority?: Database["public"]["Enums"]["ticket_priority"]
          project_id?: string | null
          resolution_time_hours?: number | null
          resolved_at?: string | null
          satisfaction_feedback?: string | null
          satisfaction_rating?: number | null
          source?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          tags?: string[] | null
          ticket_number?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          category_id?: string | null
          created_at?: string
          customer_id?: string
          description?: string
          due_date?: string | null
          escalated_at?: string | null
          first_response_at?: string | null
          id?: string
          is_escalated?: boolean | null
          priority?: Database["public"]["Enums"]["ticket_priority"]
          project_id?: string | null
          resolution_time_hours?: number | null
          resolved_at?: string | null
          satisfaction_feedback?: string | null
          satisfaction_rating?: number | null
          source?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          tags?: string[] | null
          ticket_number?: number | null
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
            foreignKeyName: "tickets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "ticket_categories"
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
      user_roles: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      web_projects: {
        Row: {
          client_name: string | null
          created_at: string | null
          description: string
          display_order: number | null
          feature_image_url: string | null
          features: Json | null
          id: string
          is_charity: boolean | null
          is_featured: boolean | null
          logo_url: string | null
          name: string
          project_type: string
          project_url: string | null
          screenshots: string[] | null
          status: string
          technologies: Json | null
          updated_at: string | null
        }
        Insert: {
          client_name?: string | null
          created_at?: string | null
          description: string
          display_order?: number | null
          feature_image_url?: string | null
          features?: Json | null
          id?: string
          is_charity?: boolean | null
          is_featured?: boolean | null
          logo_url?: string | null
          name: string
          project_type: string
          project_url?: string | null
          screenshots?: string[] | null
          status?: string
          technologies?: Json | null
          updated_at?: string | null
        }
        Update: {
          client_name?: string | null
          created_at?: string | null
          description?: string
          display_order?: number | null
          feature_image_url?: string | null
          features?: Json | null
          id?: string
          is_charity?: boolean | null
          is_featured?: boolean | null
          logo_url?: string | null
          name?: string
          project_type?: string
          project_url?: string | null
          screenshots?: string[] | null
          status?: string
          technologies?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          processed_at: string | null
          stripe_event_id: string
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          processed_at?: string | null
          stripe_event_id: string
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          processed_at?: string | null
          stripe_event_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_project: {
        Args: {
          approval_decision: string
          approval_notes_param?: string
          project_id_param: string
        }
        Returns: boolean
      }
      calculate_project_completion: {
        Args: { project_id_param: string }
        Returns: number
      }
      calculate_project_completion_enhanced: {
        Args: { project_id_param: string }
        Returns: number
      }
      convert_lead_to_project: {
        Args: {
          estimated_budget?: number
          lead_id_param: string
          project_description?: string
          project_title: string
          project_type?: string
        }
        Returns: string
      }
      create_default_project_tasks: {
        Args: { project_id_param: string; project_type_param: string }
        Returns: undefined
      }
      create_project_request: {
        Args: {
          estimated_budget?: number
          estimated_completion_date?: string
          project_description: string
          project_title: string
          project_type_param: string
          requirements_json?: Json
        }
        Returns: string
      }
      decrypt_oauth_token: { Args: { encrypted: string }; Returns: string }
      encrypt_oauth_token: { Args: { plaintext: string }; Returns: string }
      get_oauth_access_token: {
        Args: { p_connection_id: string }
        Returns: string
      }
      get_payment_banking_details: {
        Args: never
        Returns: {
          account_name: string
          account_number: string
          iban: string
          notes_bacs: string
          sort_code: string
          swift_code: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_user: { Args: never; Returns: boolean }
      log_activity: {
        Args: {
          p_action: string
          p_actor_id: string
          p_description: string
          p_entity_id: string
          p_entity_type: string
          p_new_values?: Json
          p_old_values?: Json
          p_user_id: string
        }
        Returns: undefined
      }
      send_notification: {
        Args: {
          p_action_url?: string
          p_category?: string
          p_created_by?: string
          p_message: string
          p_related_id?: string
          p_title: string
          p_type?: string
          p_user_id: string
        }
        Returns: undefined
      }
      store_oauth_connection: {
        Args: {
          p_access_token: string
          p_account_id?: string
          p_expires_at?: string
          p_meta?: Json
          p_provider: string
          p_refresh_token?: string
          p_scope?: string
        }
        Returns: string
      }
      update_banking_details: {
        Args: {
          p_account_name: string
          p_account_number: string
          p_iban?: string
          p_notes_bacs?: string
          p_sort_code: string
          p_swift_code?: string
        }
        Returns: string
      }
      update_oauth_tokens: {
        Args: {
          p_connection_id: string
          p_new_access_token: string
          p_new_expires_at?: string
          p_new_refresh_token?: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "customer"
      domain_status:
        | "pending"
        | "registered"
        | "active"
        | "expired"
        | "cancelled"
      hosting_package_type:
        | "starter"
        | "business"
        | "professional"
        | "enterprise"
      hosting_status:
        | "pending"
        | "provisioning"
        | "active"
        | "suspended"
        | "cancelled"
      integration_type:
        | "xero"
        | "google_calendar"
        | "linkedin"
        | "twitter"
        | "unlimited_web_hosting"
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
      app_role: ["admin", "moderator", "customer"],
      domain_status: [
        "pending",
        "registered",
        "active",
        "expired",
        "cancelled",
      ],
      hosting_package_type: [
        "starter",
        "business",
        "professional",
        "enterprise",
      ],
      hosting_status: [
        "pending",
        "provisioning",
        "active",
        "suspended",
        "cancelled",
      ],
      integration_type: [
        "xero",
        "google_calendar",
        "linkedin",
        "twitter",
        "unlimited_web_hosting",
      ],
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
