export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string | null
          details: Json | null
          entity_id: string
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string | null
          details?: Json | null
          entity_id: string
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string
          entity_type?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bets: {
        Row: {
          amount: number
          chosen_number: string
          created_at: string | null
          game_round_id: string
          id: string
          potential_win: number
          profile_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          chosen_number: string
          created_at?: string | null
          game_round_id: string
          id?: string
          potential_win: number
          profile_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          chosen_number?: string
          created_at?: string | null
          game_round_id?: string
          id?: string
          potential_win?: number
          profile_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bets_game_round_id_fkey"
            columns: ["game_round_id"]
            isOneToOne: false
            referencedRelation: "game_rounds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bets_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      game_rounds: {
        Row: {
          created_at: string | null
          created_by: string
          end_time: string
          id: string
          result: string | null
          start_time: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          end_time: string
          id?: string
          result?: string | null
          start_time: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          end_time?: string
          id?: string
          result?: string | null
          start_time?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_rounds_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          profile_id: string
          reference_id: string | null
          title: string
          type: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          profile_id: string
          reference_id?: string | null
          title: string
          type: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          profile_id?: string
          reference_id?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_requests: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          id: string
          notes: string | null
          payment_details: Json | null
          payment_method: string
          profile_id: string
          proof_url: string | null
          status: string
          type: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_details?: Json | null
          payment_method: string
          profile_id: string
          proof_url?: string | null
          status?: string
          type: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_details?: Json | null
          payment_method?: string
          profile_id?: string
          proof_url?: string | null
          status?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_requests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          balance: number | null
          created_at: string | null
          display_name: string | null
          email: string | null
          id: string
          is_admin: boolean | null
          is_blocked: boolean | null
          notification_settings: Json | null
          phone_number: string | null
          referral_code: string | null
          referred_by: string | null
          telegram_id: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          balance?: number | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id: string
          is_admin?: boolean | null
          is_blocked?: boolean | null
          notification_settings?: Json | null
          phone_number?: string | null
          referral_code?: string | null
          referred_by?: string | null
          telegram_id?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          balance?: number | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          is_admin?: boolean | null
          is_blocked?: boolean | null
          notification_settings?: Json | null
          phone_number?: string | null
          referral_code?: string | null
          referred_by?: string | null
          telegram_id?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_referred_by"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string | null
          id: string
          referred_id: string
          referrer_id: string
          reward_amount: number | null
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          referred_id: string
          referrer_id: string
          reward_amount?: number | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          referred_id?: string
          referrer_id?: string
          reward_amount?: number | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          payment_request_id: string | null
          profile_id: string
          reference_id: string | null
          status: string
          type: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          payment_request_id?: string | null
          profile_id: string
          reference_id?: string | null
          status?: string
          type: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          payment_request_id?: string | null
          profile_id?: string
          reference_id?: string | null
          status?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_payment_request_id_fkey"
            columns: ["payment_request_id"]
            isOneToOne: false
            referencedRelation: "payment_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_payment_request: {
        Args: {
          p_request_id: string
          p_admin_id: string
          p_notes?: string
        }
        Returns: boolean
      }
      create_game_round: {
        Args: {
          start_time: string
          end_time: string
          created_by: string
        }
        Returns: string
      }
      create_notification: {
        Args: {
          p_profile_id: string
          p_title: string
          p_content: string
          p_type: string
          p_reference_id?: string
        }
        Returns: string
      }
      create_payment_request: {
        Args: {
          p_profile_id: string
          p_amount: number
          p_type: string
          p_payment_method: string
          p_payment_details?: Json
        }
        Returns: string
      }
      get_admin_dashboard_summary: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_admin_metrics: {
        Args: {
          p_start_date?: string
          p_end_date?: string
          p_interval?: string
        }
        Returns: {
          time_period: string
          new_users: number
          active_games: number
          total_bets: number
          total_bet_amount: number
          total_deposits: number
          total_withdrawals: number
          revenue: number
        }[]
      }
      get_admin_transaction_history: {
        Args: {
          p_type?: string
          p_start_date?: string
          p_end_date?: string
          p_status?: string
          p_page_number?: number
          p_page_size?: number
        }
        Returns: {
          id: string
          profile_id: string
          amount: number
          type: string
          status: string
          reference_id: string
          payment_request_id: string
          description: string
          created_at: string
          updated_at: string
          username: string
          display_name: string
          total_count: number
        }[]
      }
      get_admin_transaction_summary: {
        Args: {
          p_start_date?: string
          p_end_date?: string
        }
        Returns: {
          total_deposit: number
          total_withdrawal: number
          total_bet: number
          total_win: number
          total_referral_reward: number
          system_profit: number
          total_users_count: number
          active_users_count: number
        }[]
      }
      get_bet_statistics_for_game: {
        Args: {
          p_game_round_id: string
        }
        Returns: {
          total_bets: number
          winning_bets: number
          total_bet_amount: number
          total_win_amount: number
        }[]
      }
      get_game_rounds: {
        Args: {
          status_filter?: string
          from_date?: string
          to_date?: string
          page_number?: number
          page_size?: number
        }
        Returns: {
          id: string
          start_time: string
          end_time: string
          result: string
          status: string
          created_by: string
          created_at: string
          updated_at: string
          total_count: number
        }[]
      }
      get_transaction_history: {
        Args: {
          p_profile_id: string
          p_type?: string
          p_start_date?: string
          p_end_date?: string
          p_status?: string
          p_page_number?: number
          p_page_size?: number
        }
        Returns: {
          id: string
          profile_id: string
          amount: number
          type: string
          status: string
          reference_id: string
          payment_request_id: string
          description: string
          created_at: string
          updated_at: string
          total_count: number
        }[]
      }
      get_transaction_summary: {
        Args: {
          p_profile_id: string
          p_start_date?: string
          p_end_date?: string
        }
        Returns: {
          total_deposit: number
          total_withdrawal: number
          total_bet: number
          total_win: number
          total_referral_reward: number
          net_balance: number
        }[]
      }
      get_unread_notification_count: {
        Args: {
          p_profile_id: string
        }
        Returns: number
      }
      get_user_admin_stats: {
        Args: {
          p_user_id: string
        }
        Returns: Json
      }
      get_user_bets: {
        Args: {
          p_profile_id: string
          p_game_round_id?: string
          p_status?: string
          p_page_number?: number
          p_page_size?: number
        }
        Returns: {
          id: string
          profile_id: string
          game_round_id: string
          chosen_number: string
          amount: number
          potential_win: number
          status: string
          created_at: string
          updated_at: string
          game_status: string
          game_result: string
          total_count: number
        }[]
      }
      get_user_notifications: {
        Args: {
          p_profile_id: string
          p_page_number?: number
          p_page_size?: number
          p_type?: string
          p_is_read?: boolean
        }
        Returns: {
          id: string
          profile_id: string
          title: string
          content: string
          type: string
          is_read: boolean
          reference_id: string
          created_at: string
          total_count: number
        }[]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      mark_all_notifications_read: {
        Args: {
          p_profile_id: string
        }
        Returns: boolean
      }
      mark_notification_read: {
        Args: {
          p_notification_id: string
          p_profile_id: string
        }
        Returns: boolean
      }
      place_bet: {
        Args: {
          p_profile_id: string
          p_game_round_id: string
          p_chosen_number: string
          p_amount: number
        }
        Returns: string
      }
      register_new_user: {
        Args: {
          email: string
          password: string
          referral_code?: string
        }
        Returns: string
      }
      reject_payment_request: {
        Args: {
          p_request_id: string
          p_admin_id: string
          p_notes?: string
        }
        Returns: boolean
      }
      update_game_round_status: {
        Args: {
          game_round_id: string
          new_status: string
          game_result?: string
        }
        Returns: {
          created_at: string | null
          created_by: string
          end_time: string
          id: string
          result: string | null
          start_time: string
          status: string
          updated_at: string | null
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
