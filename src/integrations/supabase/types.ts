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
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          log_type: string
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          log_type: string
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          log_type?: string
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      admin_verification_codes: {
        Row: {
          code_hash: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          code_hash: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          code_hash?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      background_settings: {
        Row: {
          background_type: string
          background_value: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          page_type: string
          updated_at: string
        }
        Insert: {
          background_type: string
          background_value: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          page_type: string
          updated_at?: string
        }
        Update: {
          background_type?: string
          background_value?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          page_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_comments: {
        Row: {
          blog_post_id: string
          content: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          blog_post_id: string
          content: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          blog_post_id?: string
          content?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_comments_blog_post_id_fkey"
            columns: ["blog_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          approval_status: string | null
          audio_url: string | null
          category: string
          content: string
          created_at: string
          excerpt: string | null
          featured_image_url: string | null
          id: string
          published: boolean
          published_at: string | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          approval_status?: string | null
          audio_url?: string | null
          category?: string
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          approval_status?: string | null
          audio_url?: string | null
          category?: string
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_views: {
        Row: {
          blog_post_id: string | null
          id: string
          session_id: string | null
          user_id: string | null
          viewed_at: string
        }
        Insert: {
          blog_post_id?: string | null
          id?: string
          session_id?: string | null
          user_id?: string | null
          viewed_at?: string
        }
        Update: {
          blog_post_id?: string | null
          id?: string
          session_id?: string | null
          user_id?: string | null
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_views_blog_post_id_fkey"
            columns: ["blog_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      business_ads: {
        Row: {
          ad_description: string
          ad_image_url: string | null
          ad_title: string
          approved_by: string | null
          business_name: string
          contact_email: string
          contact_phone: string | null
          created_at: string
          id: string
          published_at: string | null
          status: string
          updated_at: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          ad_description: string
          ad_image_url?: string | null
          ad_title: string
          approved_by?: string | null
          business_name: string
          contact_email: string
          contact_phone?: string | null
          created_at?: string
          id?: string
          published_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          ad_description?: string
          ad_image_url?: string | null
          ad_title?: string
          approved_by?: string | null
          business_name?: string
          contact_email?: string
          contact_phone?: string | null
          created_at?: string
          id?: string
          published_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          website_url?: string | null
        }
        Relationships: []
      }
      email_confirmation_tokens: {
        Row: {
          confirmed_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          token: string
          user_id: string
        }
        Insert: {
          confirmed_at?: string | null
          created_at?: string
          email: string
          expires_at: string
          id?: string
          token: string
          user_id: string
        }
        Update: {
          confirmed_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          token?: string
          user_id?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string | null
          description: string | null
          event_date: string
          external_link: string | null
          id: string
          image_url: string | null
          location: string | null
          published: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_date: string
          external_link?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          published?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_date?: string
          external_link?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          published?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      feedbacks: {
        Row: {
          content: string
          created_at: string
          id: string
          rating: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          rating?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          rating?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      hero_slides: {
        Row: {
          blog_post_id: string | null
          created_at: string
          description: string
          display_order: number | null
          id: string
          image_url: string | null
          is_for_members: boolean | null
          link_text: string | null
          link_url: string | null
          published: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          blog_post_id?: string | null
          created_at?: string
          description: string
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_for_members?: boolean | null
          link_text?: string | null
          link_url?: string | null
          published?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          blog_post_id?: string | null
          created_at?: string
          description?: string
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_for_members?: boolean | null
          link_text?: string | null
          link_url?: string | null
          published?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hero_slides_blog_post_id_fkey"
            columns: ["blog_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      lineup_cards: {
        Row: {
          created_at: string
          game_date: string
          game_time: string
          id: string
          lineup_data: Json
          location: string | null
          notes: string | null
          opponent: string
          published: boolean
          starting_pitcher: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          game_date: string
          game_time: string
          id?: string
          lineup_data?: Json
          location?: string | null
          notes?: string | null
          opponent: string
          published?: boolean
          starting_pitcher?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          game_date?: string
          game_time?: string
          id?: string
          lineup_data?: Json
          location?: string | null
          notes?: string | null
          opponent?: string
          published?: boolean
          starting_pitcher?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      live_notifications: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          link_url: string
          message: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          link_url?: string
          message: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          link_url?: string
          message?: string
          updated_at?: string
        }
        Relationships: []
      }
      live_stream_admin_updates: {
        Row: {
          admin_id: string
          created_at: string
          id: string
          live_stream_id: string
          topics: string[] | null
          updated_at: string
          welcome_message: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          id?: string
          live_stream_id: string
          topics?: string[] | null
          updated_at?: string
          welcome_message: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          id?: string
          live_stream_id?: string
          topics?: string[] | null
          updated_at?: string
          welcome_message?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_stream_admin_updates_live_stream_id_fkey"
            columns: ["live_stream_id"]
            isOneToOne: false
            referencedRelation: "live_streams"
            referencedColumns: ["id"]
          },
        ]
      }
      live_streams: {
        Row: {
          actual_end: string | null
          actual_start: string | null
          assigned_pages: string[] | null
          created_at: string
          description: string | null
          id: string
          published: boolean
          scheduled_end: string | null
          scheduled_start: string | null
          status: string
          stream_url: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          viewers_count: number | null
        }
        Insert: {
          actual_end?: string | null
          actual_start?: string | null
          assigned_pages?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          published?: boolean
          scheduled_end?: string | null
          scheduled_start?: string | null
          status: string
          stream_url: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          viewers_count?: number | null
        }
        Update: {
          actual_end?: string | null
          actual_start?: string | null
          assigned_pages?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          published?: boolean
          scheduled_end?: string | null
          scheduled_start?: string | null
          status?: string
          stream_url?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          viewers_count?: number | null
        }
        Relationships: []
      }
      mets_news_tracker: {
        Row: {
          created_at: string
          details: string
          id: string
          image_url: string
          player: string
          published: boolean
          time_ago: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          details: string
          id?: string
          image_url: string
          player: string
          published?: boolean
          time_ago?: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          details?: string
          id?: string
          image_url?: string
          player?: string
          published?: boolean
          time_ago?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          is_active: boolean | null
          subscribed_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          subscribed_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          subscribed_at?: string | null
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string
          email_enabled: boolean | null
          id: string
          notification_type: string
          push_enabled: boolean | null
          sms_enabled: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_enabled?: boolean | null
          id?: string
          notification_type: string
          push_enabled?: boolean | null
          sms_enabled?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_enabled?: boolean | null
          id?: string
          notification_type?: string
          push_enabled?: boolean | null
          sms_enabled?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      podcast_live_stream: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_live: boolean
          title: string
          updated_at: string
          vdo_ninja_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_live?: boolean
          title?: string
          updated_at?: string
          vdo_ninja_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_live?: boolean
          title?: string
          updated_at?: string
          vdo_ninja_url?: string | null
        }
        Relationships: []
      }
      podcasts: {
        Row: {
          audio_url: string
          created_at: string
          description: string | null
          duration: number | null
          id: string
          published: boolean
          published_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          audio_url: string
          created_at?: string
          description?: string | null
          duration?: number | null
          id?: string
          published?: boolean
          published_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          audio_url?: string
          created_at?: string
          description?: string | null
          duration?: number | null
          id?: string
          published?: boolean
          published_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          content: string
          created_at: string | null
          id: string
          image_url: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          email_notifications_enabled: boolean | null
          email_verified: boolean | null
          full_name: string | null
          game_notifications_enabled: boolean | null
          id: string
          phone_number: string | null
          sms_notifications_enabled: boolean | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          email_notifications_enabled?: boolean | null
          email_verified?: boolean | null
          full_name?: string | null
          game_notifications_enabled?: boolean | null
          id: string
          phone_number?: string | null
          sms_notifications_enabled?: boolean | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          email_notifications_enabled?: boolean | null
          email_verified?: boolean | null
          full_name?: string | null
          game_notifications_enabled?: boolean | null
          id?: string
          phone_number?: string | null
          sms_notifications_enabled?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      realtime_presence: {
        Row: {
          created_at: string
          current_page: string
          id: string
          is_authenticated: boolean | null
          last_seen_at: string
          page_type: string | null
          referrer_source: string | null
          session_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          current_page: string
          id?: string
          is_authenticated?: boolean | null
          last_seen_at?: string
          page_type?: string | null
          referrer_source?: string | null
          session_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          current_page?: string
          id?: string
          is_authenticated?: boolean | null
          last_seen_at?: string
          page_type?: string | null
          referrer_source?: string | null
          session_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      seo_settings: {
        Row: {
          canonical_url: string | null
          created_at: string
          description: string
          id: string
          keywords: string | null
          og_description: string | null
          og_image: string | null
          og_title: string | null
          page_name: string
          page_path: string
          robots: string | null
          title: string
          twitter_card: string | null
          updated_at: string
        }
        Insert: {
          canonical_url?: string | null
          created_at?: string
          description: string
          id?: string
          keywords?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          page_name: string
          page_path: string
          robots?: string | null
          title: string
          twitter_card?: string | null
          updated_at?: string
        }
        Update: {
          canonical_url?: string | null
          created_at?: string
          description?: string
          id?: string
          keywords?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          page_name?: string
          page_path?: string
          robots?: string | null
          title?: string
          twitter_card?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      spring_training_games: {
        Row: {
          created_at: string | null
          display_order: number | null
          game_date: string
          id: string
          opponent: string
          preview_image_url: string
          published: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          game_date: string
          id?: string
          opponent: string
          preview_image_url: string
          published?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          game_date?: string
          id?: string
          opponent?: string
          preview_image_url?: string
          published?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      stories: {
        Row: {
          created_at: string
          display_order: number | null
          duration: number | null
          id: string
          link_url: string | null
          media_type: string
          media_url: string
          published: boolean
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          duration?: number | null
          id?: string
          link_url?: string | null
          media_type: string
          media_url: string
          published?: boolean
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          duration?: number | null
          id?: string
          link_url?: string | null
          media_type?: string
          media_url?: string
          published?: boolean
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      stream_alerts: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          message: string
          stream_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          message: string
          stream_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          message?: string
          stream_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stream_alerts_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "live_streams"
            referencedColumns: ["id"]
          },
        ]
      }
      stream_health_reports: {
        Row: {
          created_at: string
          description: string
          id: string
          issue_type: string
          resolved: boolean | null
          resolved_at: string | null
          session_id: string | null
          severity: string
          stream_id: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          issue_type: string
          resolved?: boolean | null
          resolved_at?: string | null
          session_id?: string | null
          severity?: string
          stream_id?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          issue_type?: string
          resolved?: boolean | null
          resolved_at?: string | null
          session_id?: string | null
          severity?: string
          stream_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stream_health_reports_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "live_streams"
            referencedColumns: ["id"]
          },
        ]
      }
      stream_views: {
        Row: {
          id: string
          session_id: string | null
          stream_id: string | null
          user_id: string | null
          viewed_at: string
        }
        Insert: {
          id?: string
          session_id?: string | null
          stream_id?: string | null
          user_id?: string | null
          viewed_at?: string
        }
        Update: {
          id?: string
          session_id?: string | null
          stream_id?: string | null
          user_id?: string | null
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stream_views_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "live_streams"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          amount: number | null
          created_at: string | null
          currency: string | null
          end_date: string | null
          id: string
          paypal_order_id: string | null
          paypal_subscription_id: string | null
          plan_type: string
          start_date: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          end_date?: string | null
          id?: string
          paypal_order_id?: string | null
          paypal_subscription_id?: string | null
          plan_type: string
          start_date?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          end_date?: string | null
          id?: string
          paypal_order_id?: string | null
          paypal_subscription_id?: string | null
          plan_type?: string
          start_date?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      team_leaders: {
        Row: {
          category: string
          created_at: string
          id: string
          player_name: string
          stat_value: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          player_name: string
          stat_value: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          player_name?: string
          stat_value?: string
          updated_at?: string
        }
        Relationships: []
      }
      team_standings: {
        Row: {
          created_at: string
          division: string
          games_back: string
          id: string
          losses: number
          position: number
          team_name: string
          updated_at: string
          wins: number
        }
        Insert: {
          created_at?: string
          division?: string
          games_back?: string
          id?: string
          losses?: number
          position?: number
          team_name: string
          updated_at?: string
          wins?: number
        }
        Update: {
          created_at?: string
          division?: string
          games_back?: string
          id?: string
          losses?: number
          position?: number
          team_name?: string
          updated_at?: string
          wins?: number
        }
        Relationships: []
      }
      tutorial_steps: {
        Row: {
          created_at: string
          description: string
          id: string
          image_url: string | null
          is_active: boolean
          step_number: number
          target_selector: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          step_number: number
          target_selector?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          step_number?: number
          target_selector?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      tv_schedules: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_live: boolean | null
          network: string
          show_title: string
          time_slot: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_live?: boolean | null
          network: string
          show_title: string
          time_slot: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_live?: boolean | null
          network?: string
          show_title?: string
          time_slot?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_passkeys: {
        Row: {
          counter: number
          created_at: string | null
          credential_id: string
          device_name: string | null
          id: string
          last_used_at: string | null
          public_key: string
          transports: string[] | null
          user_id: string
        }
        Insert: {
          counter?: number
          created_at?: string | null
          credential_id: string
          device_name?: string | null
          id?: string
          last_used_at?: string | null
          public_key: string
          transports?: string[] | null
          user_id: string
        }
        Update: {
          counter?: number
          created_at?: string | null
          credential_id?: string
          device_name?: string | null
          id?: string
          last_used_at?: string | null
          public_key?: string
          transports?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          duration: number | null
          id: string
          published: boolean
          published_at: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_type: string
          video_url: string
          views: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          duration?: number | null
          id?: string
          published?: boolean
          published_at?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_type: string
          video_url: string
          views?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          duration?: number | null
          id?: string
          published?: boolean
          published_at?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_type?: string
          video_url?: string
          views?: number | null
        }
        Relationships: []
      }
      webauthn_challenges: {
        Row: {
          challenge: string
          created_at: string | null
          email: string | null
          expires_at: string | null
          id: string
          type: string
          user_id: string | null
        }
        Insert: {
          challenge: string
          created_at?: string | null
          email?: string | null
          expires_at?: string | null
          id?: string
          type: string
          user_id?: string | null
        }
        Update: {
          challenge?: string
          created_at?: string | null
          email?: string | null
          expires_at?: string | null
          id?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      writer_applications: {
        Row: {
          admin_notes: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          portfolio_url: string | null
          reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          portfolio_url?: string | null
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          portfolio_url?: string | null
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      business_ads_public: {
        Row: {
          ad_description: string | null
          ad_image_url: string | null
          ad_title: string | null
          business_name: string | null
          created_at: string | null
          id: string | null
          published_at: string | null
          status: string | null
          website_url: string | null
        }
        Insert: {
          ad_description?: string | null
          ad_image_url?: string | null
          ad_title?: string | null
          business_name?: string | null
          created_at?: string | null
          id?: string | null
          published_at?: string | null
          status?: string | null
          website_url?: string | null
        }
        Update: {
          ad_description?: string | null
          ad_image_url?: string | null
          ad_title?: string | null
          business_name?: string | null
          created_at?: string | null
          id?: string | null
          published_at?: string | null
          status?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      public_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      cleanup_stale_presence: { Args: never; Returns: undefined }
      get_user_subscription_safe: {
        Args: { p_user_id: string }
        Returns: {
          amount: number
          created_at: string
          currency: string
          end_date: string
          id: string
          paypal_order_id_masked: string
          paypal_subscription_id_masked: string
          plan_type: string
          start_date: string
          status: string
          updated_at: string
          user_id: string
        }[]
      }
      has_active_subscription: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_writer: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "writer"
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
      app_role: ["admin", "moderator", "user", "writer"],
    },
  },
} as const
