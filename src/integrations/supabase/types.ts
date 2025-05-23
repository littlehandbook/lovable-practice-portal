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
      tbl_audit_log: {
        Row: {
          action: string
          details: Json | null
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string | null
          therapist_id: string | null
          timestamp: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string | null
          therapist_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string | null
          therapist_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tbl_audit_log_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "tbl_therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      tbl_audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json | null
          entity: string
          entity_id: string
          id: string
          tenant_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          entity: string
          entity_id: string
          id?: string
          tenant_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          entity?: string
          entity_id?: string
          id?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tbl_audit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tbl_tenant_registry"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      tbl_billing: {
        Row: {
          amount: number
          client_id: string
          created_at: string
          id: string
          status: string
          tenant_id: string | null
        }
        Insert: {
          amount: number
          client_id: string
          created_at?: string
          id?: string
          status?: string
          tenant_id?: string | null
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string
          id?: string
          status?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tbl_billing_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tbl_tenant_registry"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      tbl_branding: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          logo_url: string | null
          primary_color: string | null
          secondary_color: string | null
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      tbl_client_goals: {
        Row: {
          client_id: string
          created_at: string
          created_by: string
          emotional_mental: string | null
          environmental: string | null
          financial: string | null
          id: string
          intellectual_occupational: string | null
          physical: string | null
          social_relational: string | null
          spiritual: string | null
          tenant_id: string
          updated_at: string
          updated_by: string
        }
        Insert: {
          client_id: string
          created_at?: string
          created_by: string
          emotional_mental?: string | null
          environmental?: string | null
          financial?: string | null
          id?: string
          intellectual_occupational?: string | null
          physical?: string | null
          social_relational?: string | null
          spiritual?: string | null
          tenant_id: string
          updated_at?: string
          updated_by: string
        }
        Update: {
          client_id?: string
          created_at?: string
          created_by?: string
          emotional_mental?: string | null
          environmental?: string | null
          financial?: string | null
          id?: string
          intellectual_occupational?: string | null
          physical?: string | null
          social_relational?: string | null
          spiritual?: string | null
          tenant_id?: string
          updated_at?: string
          updated_by?: string
        }
        Relationships: []
      }
      tbl_config_audit: {
        Row: {
          audit_id: string
          change_hash: string
          created_at: string
          key: string
          new_value: Json
          old_value: Json | null
          tenant_id: string
          user_id: string
        }
        Insert: {
          audit_id?: string
          change_hash: string
          created_at?: string
          key: string
          new_value: Json
          old_value?: Json | null
          tenant_id: string
          user_id: string
        }
        Update: {
          audit_id?: string
          change_hash?: string
          created_at?: string
          key?: string
          new_value?: Json
          old_value?: Json | null
          tenant_id?: string
          user_id?: string
        }
        Relationships: []
      }
      tbl_configurations: {
        Row: {
          key: string
          tenant_id: string
          type: string
          updated_at: string
          updated_by: string
          value: Json
          version: number
        }
        Insert: {
          key: string
          tenant_id: string
          type?: string
          updated_at?: string
          updated_by: string
          value: Json
          version?: number
        }
        Update: {
          key?: string
          tenant_id?: string
          type?: string
          updated_at?: string
          updated_by?: string
          value?: Json
          version?: number
        }
        Relationships: []
      }
      tbl_tenant_registry: {
        Row: {
          created_at: string
          practice_name: string
          status: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          practice_name: string
          status?: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          practice_name?: string
          status?: string
          tenant_id?: string
        }
        Relationships: []
      }
      tbl_therapists: {
        Row: {
          created_at: string | null
          email: string
          email_verified: boolean | null
          email_verified_at: string | null
          full_name: string
          id: string
          is_active: boolean | null
          license_number: string | null
          phone: string | null
          practice_name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          email_verified?: boolean | null
          email_verified_at?: string | null
          full_name: string
          id: string
          is_active?: boolean | null
          license_number?: string | null
          phone?: string | null
          practice_name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          email_verified?: boolean | null
          email_verified_at?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          license_number?: string | null
          phone?: string | null
          practice_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      dblink: {
        Args: { "": string }
        Returns: Record<string, unknown>[]
      }
      dblink_cancel_query: {
        Args: { "": string }
        Returns: string
      }
      dblink_close: {
        Args: { "": string }
        Returns: string
      }
      dblink_connect: {
        Args: { "": string }
        Returns: string
      }
      dblink_connect_u: {
        Args: { "": string }
        Returns: string
      }
      dblink_current_query: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      dblink_disconnect: {
        Args: Record<PropertyKey, never> | { "": string }
        Returns: string
      }
      dblink_error_message: {
        Args: { "": string }
        Returns: string
      }
      dblink_exec: {
        Args: { "": string }
        Returns: string
      }
      dblink_fdw_validator: {
        Args: { options: string[]; catalog: unknown }
        Returns: undefined
      }
      dblink_get_connections: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      dblink_get_notify: {
        Args: Record<PropertyKey, never> | { conname: string }
        Returns: Record<string, unknown>[]
      }
      dblink_get_pkey: {
        Args: { "": string }
        Returns: Database["public"]["CompositeTypes"]["dblink_pkey_results"][]
      }
      dblink_get_result: {
        Args: { "": string }
        Returns: Record<string, unknown>[]
      }
      dblink_is_busy: {
        Args: { "": string }
        Returns: number
      }
      purge_old_audit_logs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      refresh_billing_summary: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      sp_audit_login: {
        Args: {
          p_therapist_id: string
          p_action: string
          p_ip_address?: unknown
          p_user_agent?: string
        }
        Returns: undefined
      }
      sp_audit_registration: {
        Args: { p_therapist_id: string; p_details?: Json }
        Returns: undefined
      }
      sp_create_tenant_database: {
        Args: { p_practice_name: string }
        Returns: string
      }
      sp_get_branding: {
        Args: { p_tenant_id: string }
        Returns: {
          logo_url: string
          primary_color: string
          secondary_color: string
          practice_name: string
        }[]
      }
      sp_get_client_goals: {
        Args: { p_client_id: string; p_tenant_id: string }
        Returns: {
          emotional_mental: string
          physical: string
          social_relational: string
          spiritual: string
          environmental: string
          intellectual_occupational: string
          financial: string
        }[]
      }
      sp_get_config: {
        Args: { p_tenant: string }
        Returns: {
          key: string
          value: Json
          type: string
          version: number
          updated_at: string
          updated_by: string
        }[]
      }
      sp_get_therapist_by_email: {
        Args: { p_email: string }
        Returns: {
          id: string
          email: string
          full_name: string
          practice_name: string
          is_active: boolean
          email_verified: boolean
        }[]
      }
      sp_register_therapist: {
        Args: {
          p_auth_id: string
          p_email: string
          p_full_name: string
          p_practice_name?: string
          p_license_number?: string
        }
        Returns: string
      }
      sp_update_config: {
        Args: { p_tenant: string; p_key: string; p_value: Json; p_user: string }
        Returns: undefined
      }
      sp_upsert_branding: {
        Args: {
          p_tenant_id: string
          p_logo_url: string
          p_primary_color: string
          p_secondary_color: string
          p_practice_name: string
          p_user_id: string
        }
        Returns: undefined
      }
      sp_upsert_client_goals: {
        Args: {
          p_client_id: string
          p_tenant_id: string
          p_emotional_mental: string
          p_physical: string
          p_social_relational: string
          p_spiritual: string
          p_environmental: string
          p_intellectual_occupational: string
          p_financial: string
          p_user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      dblink_pkey_results: {
        position: number | null
        colname: string | null
      }
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
