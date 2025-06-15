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
      members: {
        Row: {
          "Full Name": string | null
          inserted_at: string
          "Last Check-in Date/Time": string | null
          "Member's ID": string
          "Membership End Date": string | null
          "membership-type": string | null
          "Payment Status ": string | null
          phone: string | null
          "Total Visits": number | null
          updated_at: string
        }
        Insert: {
          "Full Name"?: string | null
          inserted_at?: string
          "Last Check-in Date/Time"?: string | null
          "Member's ID": string
          "Membership End Date"?: string | null
          "membership-type"?: string | null
          "Payment Status "?: string | null
          phone?: string | null
          "Total Visits"?: number | null
          updated_at?: string
        }
        Update: {
          "Full Name"?: string | null
          inserted_at?: string
          "Last Check-in Date/Time"?: string | null
          "Member's ID"?: string
          "Membership End Date"?: string | null
          "membership-type"?: string | null
          "Payment Status "?: string | null
          phone?: string | null
          "Total Visits"?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      test_members: {
        Row: {
          collect_amount_paid_conditional: number | null
          full_name: string | null
          inserted_at: string
          last_visit: string | null
          member_id: string
          membership_end_date: string | null
          membership_start_date: string | null
          membership_type: string | null
          payment_status: string | null
          phone: string | null
          referrer_id: string | null
          total_visits: number | null
          updated_at: string
          whatsapp_consent: string | null
        }
        Insert: {
          collect_amount_paid_conditional?: number | null
          full_name?: string | null
          inserted_at?: string
          last_visit?: string | null
          member_id: string
          membership_end_date?: string | null
          membership_start_date?: string | null
          membership_type?: string | null
          payment_status?: string | null
          phone?: string | null
          referrer_id?: string | null
          total_visits?: number | null
          updated_at?: string
          whatsapp_consent?: string | null
        }
        Update: {
          collect_amount_paid_conditional?: number | null
          full_name?: string | null
          inserted_at?: string
          last_visit?: string | null
          member_id?: string
          membership_end_date?: string | null
          membership_start_date?: string | null
          membership_type?: string | null
          payment_status?: string | null
          phone?: string | null
          referrer_id?: string | null
          total_visits?: number | null
          updated_at?: string
          whatsapp_consent?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
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
