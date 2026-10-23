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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      backup_log: {
        Row: {
          aantal_records: number | null
          bestand: string | null
          geslaagd: boolean
          id: string
          toelichting: string | null
          uitgevoerd_op: string
        }
        Insert: {
          aantal_records?: number | null
          bestand?: string | null
          geslaagd: boolean
          id?: string
          toelichting?: string | null
          uitgevoerd_op?: string
        }
        Update: {
          aantal_records?: number | null
          bestand?: string | null
          geslaagd?: boolean
          id?: string
          toelichting?: string | null
          uitgevoerd_op?: string
        }
        Relationships: []
      }
      beveiligingsscans: {
        Row: {
          commit: string
          id: string
          release: string
          samenvatting: string | null
          scanners: string[]
          uitgevoerd_op: string
          waarschuwingen: Json
        }
        Insert: {
          commit?: string
          id?: string
          release?: string
          samenvatting?: string | null
          scanners?: string[]
          uitgevoerd_op?: string
          waarschuwingen?: Json
        }
        Update: {
          commit?: string
          id?: string
          release?: string
          samenvatting?: string | null
          scanners?: string[]
          uitgevoerd_op?: string
          waarschuwingen?: Json
        }
        Relationships: []
      }
      cloud_bridge_nonces: {
        Row: {
          created_at: string
          nonce: string
        }
        Insert: {
          created_at?: string
          nonce: string
        }
        Update: {
          created_at?: string
          nonce?: string
        }
        Relationships: []
      }
      contact_berichten: {
        Row: {
          bericht: string
          created_at: string
          email: string
          id: string
          ip_hash: string | null
          naam: string
          onderwerp: string
          user_agent: string | null
        }
        Insert: {
          bericht: string
          created_at?: string
          email: string
          id?: string
          ip_hash?: string | null
          naam: string
          onderwerp: string
          user_agent?: string | null
        }
        Update: {
          bericht?: string
          created_at?: string
          email?: string
          id?: string
          ip_hash?: string | null
          naam?: string
          onderwerp?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      contact_rate_limit: {
        Row: {
          aantal: number
          ip_hash: string
          window_start: string
        }
        Insert: {
          aantal?: number
          ip_hash: string
          window_start?: string
        }
        Update: {
          aantal?: number
          ip_hash?: string
          window_start?: string
        }
        Relationships: []
      }
      databronnen: {
        Row: {
          created_at: string
          id: string
          laatst_gecontroleerd: string | null
          laatst_gewijzigd: string | null
          naam: string
          peildatum: string | null
          sleutel: string
          status: string
          url: string
          vingerafdruk: string | null
          volgorde: number
        }
        Insert: {
          created_at?: string
          id?: string
          laatst_gecontroleerd?: string | null
          laatst_gewijzigd?: string | null
          naam: string
          peildatum?: string | null
          sleutel: string
          status?: string
          url: string
          vingerafdruk?: string | null
          volgorde?: number
        }
        Update: {
          created_at?: string
          id?: string
          laatst_gecontroleerd?: string | null
          laatst_gewijzigd?: string | null
          naam?: string
          peildatum?: string | null
          sleutel?: string
          status?: string
          url?: string
          vingerafdruk?: string | null
          volgorde?: number
        }
        Relationships: []
      }
      datacontrole_log: {
        Row: {
          bron_sleutel: string
          detail: Json | null
          id: string
          resultaat: string
          uitgevoerd_op: string
        }
        Insert: {
          bron_sleutel: string
          detail?: Json | null
          id?: string
          resultaat: string
          uitgevoerd_op?: string
        }
        Update: {
          bron_sleutel?: string
          detail?: Json | null
          id?: string
          resultaat?: string
          uitgevoerd_op?: string
        }
        Relationships: []
      }
      datastatus: {
        Row: {
          id: number
          laatst_bijgewerkt: string
          laatste_controle: string | null
          lock_tot: string | null
          peildatum: string
          updated_at: string
          wijziging_gevonden: boolean
        }
        Insert: {
          id: number
          laatst_bijgewerkt: string
          laatste_controle?: string | null
          lock_tot?: string | null
          peildatum: string
          updated_at?: string
          wijziging_gevonden?: boolean
        }
        Update: {
          id?: number
          laatst_bijgewerkt?: string
          laatste_controle?: string | null
          lock_tot?: string | null
          peildatum?: string
          updated_at?: string
          wijziging_gevonden?: boolean
        }
        Relationships: []
      }
      fotoscan_cache: {
        Row: {
          created_at: string
          hash: string
          resultaat: Json
          soort: string
          taal: string
        }
        Insert: {
          created_at?: string
          hash: string
          resultaat: Json
          soort: string
          taal: string
        }
        Update: {
          created_at?: string
          hash?: string
          resultaat?: Json
          soort?: string
          taal?: string
        }
        Relationships: []
      }
      interne_sleutels: {
        Row: {
          naam: string
          waarde: string
        }
        Insert: {
          naam: string
          waarde: string
        }
        Update: {
          naam?: string
          waarde?: string
        }
        Relationships: []
      }
      onderzoek_deelnames: {
        Row: {
          created_at: string
          deelnamenummer: string
          gegevens: Json
          gemeld_op: string | null
          id: string
          ip_hash: string | null
          rapport: string
          status: string
          taal: string
        }
        Insert: {
          created_at?: string
          deelnamenummer: string
          gegevens?: Json
          gemeld_op?: string | null
          id?: string
          ip_hash?: string | null
          rapport: string
          status?: string
          taal?: string
        }
        Update: {
          created_at?: string
          deelnamenummer?: string
          gegevens?: Json
          gemeld_op?: string | null
          id?: string
          ip_hash?: string | null
          rapport?: string
          status?: string
          taal?: string
        }
        Relationships: []
      }
      privacy_verzoeken: {
        Row: {
          afgehandeld_op: string | null
          bericht: string
          contact_referentie: string | null
          created_at: string
          email: string
          id: string
          ip_hash: string | null
          naam: string
          soort: string
          status: string
          taal: string
          updated_at: string
          verzoeknummer: string
        }
        Insert: {
          afgehandeld_op?: string | null
          bericht: string
          contact_referentie?: string | null
          created_at?: string
          email: string
          id?: string
          ip_hash?: string | null
          naam: string
          soort?: string
          status?: string
          taal?: string
          updated_at?: string
          verzoeknummer: string
        }
        Update: {
          afgehandeld_op?: string | null
          bericht?: string
          contact_referentie?: string | null
          created_at?: string
          email?: string
          id?: string
          ip_hash?: string | null
          naam?: string
          soort?: string
          status?: string
          taal?: string
          updated_at?: string
          verzoeknummer?: string
        }
        Relationships: []
      }
      provincie_cijfers: {
        Row: {
          bijgewerkt_op: string
          bron: string | null
          habitat_factor: number
          inwoners: number | null
          klasse_bron: string | null
          meldingen: number | null
          meldingen_per_100k: number | null
          periode: string | null
          provincie_id: string
          risk: number | null
          tbe_gevallen: number
          tbe_per_100k: number | null
          tekenbeet_aantal: number | null
        }
        Insert: {
          bijgewerkt_op?: string
          bron?: string | null
          habitat_factor?: number
          inwoners?: number | null
          klasse_bron?: string | null
          meldingen?: number | null
          meldingen_per_100k?: number | null
          periode?: string | null
          provincie_id: string
          risk?: number | null
          tbe_gevallen?: number
          tbe_per_100k?: number | null
          tekenbeet_aantal?: number | null
        }
        Update: {
          bijgewerkt_op?: string
          bron?: string | null
          habitat_factor?: number
          inwoners?: number | null
          klasse_bron?: string | null
          meldingen?: number | null
          meldingen_per_100k?: number | null
          periode?: string | null
          provincie_id?: string
          risk?: number | null
          tbe_gevallen?: number
          tbe_per_100k?: number | null
          tekenbeet_aantal?: number | null
        }
        Relationships: []
      }
      tbe_jaarcijfers: {
        Row: {
          bijgewerkt_op: string
          bron: string | null
          jaar: number
          meldingen: number
          periode: string | null
        }
        Insert: {
          bijgewerkt_op?: string
          bron?: string | null
          jaar: number
          meldingen: number
          periode?: string | null
        }
        Update: {
          bijgewerkt_op?: string
          bron?: string | null
          jaar?: number
          meldingen?: number
          periode?: string | null
        }
        Relationships: []
      }
      tbe_provincie_historie: {
        Row: {
          bijgewerkt_op: string
          bron: string | null
          jaar: number
          meldingen: number | null
          provincie_id: string
          tbe_gevallen: number
        }
        Insert: {
          bijgewerkt_op?: string
          bron?: string | null
          jaar: number
          meldingen?: number | null
          provincie_id: string
          tbe_gevallen?: number
        }
        Update: {
          bijgewerkt_op?: string
          bron?: string | null
          jaar?: number
          meldingen?: number | null
          provincie_id?: string
          tbe_gevallen?: number
        }
        Relationships: []
      }
      tekenactiviteit_maand: {
        Row: {
          aandeel_pct: number | null
          bijgewerkt_op: string
          bron: string | null
          jaar: number | null
          maand: number
          meldingen: number | null
          niveau: number
        }
        Insert: {
          aandeel_pct?: number | null
          bijgewerkt_op?: string
          bron?: string | null
          jaar?: number | null
          maand: number
          meldingen?: number | null
          niveau: number
        }
        Update: {
          aandeel_pct?: number | null
          bijgewerkt_op?: string
          bron?: string | null
          jaar?: number | null
          maand?: number
          meldingen?: number | null
          niveau?: number
        }
        Relationships: []
      }
      tekenbeet_registraties: {
        Row: {
          created_at: string
          gegevens: Json
          id: string
          ip_hash: string | null
          overzicht: string
          registratienummer: string
          taal: string
        }
        Insert: {
          created_at?: string
          gegevens?: Json
          id?: string
          ip_hash?: string | null
          overzicht: string
          registratienummer: string
          taal?: string
        }
        Update: {
          created_at?: string
          gegevens?: Json
          id?: string
          ip_hash?: string | null
          overzicht?: string
          registratienummer?: string
          taal?: string
        }
        Relationships: []
      }
      tekenbeet_tellingen: {
        Row: {
          bron: string
          created_at: string
          datum: string
          id: string
          jaar: number
          maand: number
          plaats: string | null
          provincie_id: string | null
          soort: string | null
        }
        Insert: {
          bron?: string
          created_at?: string
          datum?: string
          id?: string
          jaar?: number
          maand?: number
          plaats?: string | null
          provincie_id?: string | null
          soort?: string | null
        }
        Update: {
          bron?: string
          created_at?: string
          datum?: string
          id?: string
          jaar?: number
          maand?: number
          plaats?: string | null
          provincie_id?: string | null
          soort?: string | null
        }
        Relationships: []
      }
      tekenradar_cijfers: {
        Row: {
          bijgewerkt_op: string
          bron: string | null
          jaar: number
          meldingen: number
          per_maand: Json
          periode: string | null
          verandering_pct: number | null
        }
        Insert: {
          bijgewerkt_op?: string
          bron?: string | null
          jaar: number
          meldingen: number
          per_maand?: Json
          periode?: string | null
          verandering_pct?: number | null
        }
        Update: {
          bijgewerkt_op?: string
          bron?: string | null
          jaar?: number
          meldingen?: number
          per_maand?: Json
          periode?: string | null
          verandering_pct?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      ziekte_cijfers: {
        Row: {
          actief: boolean
          bijgewerkt_op: string
          bron: string | null
          bron_url: string | null
          naam: string | null
          pct: string
          pct_noot: string | null
          periode: string | null
          risk: Json
          volgorde: number
          ziekte_id: string
        }
        Insert: {
          actief?: boolean
          bijgewerkt_op?: string
          bron?: string | null
          bron_url?: string | null
          naam?: string | null
          pct: string
          pct_noot?: string | null
          periode?: string | null
          risk?: Json
          volgorde?: number
          ziekte_id: string
        }
        Update: {
          actief?: boolean
          bijgewerkt_op?: string
          bron?: string | null
          bron_url?: string | null
          naam?: string | null
          pct?: string
          pct_noot?: string | null
          periode?: string | null
          risk?: Json
          volgorde?: number
          ziekte_id?: string
        }
        Relationships: []
      }
      ziekte_provincie_meldingen: {
        Row: {
          bijgewerkt_op: string
          bron: string | null
          geschat: boolean
          jaar: number
          meldingen: number
          provincie_id: string
          ziekte_id: string
        }
        Insert: {
          bijgewerkt_op?: string
          bron?: string | null
          geschat?: boolean
          jaar?: number
          meldingen?: number
          provincie_id: string
          ziekte_id: string
        }
        Update: {
          bijgewerkt_op?: string
          bron?: string | null
          geschat?: boolean
          jaar?: number
          meldingen?: number
          provincie_id?: string
          ziekte_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      beveiligingscontrole: { Args: never; Returns: Json }
      claim_cloud_bridge_request: {
        Args: { request_nonce: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      opschonen_fotoscan_cache: { Args: never; Returns: undefined }
      opschonen_oude_gegevens: { Args: never; Returns: undefined }
      publieke_backuplog: {
        Args: never
        Returns: {
          aantal_records: number
          bestand: string
          geslaagd: boolean
          id: string
          toelichting: string
          uitgevoerd_op: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
