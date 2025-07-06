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
      aktivitas_aruskas: {
        Row: {
          created_at: string | null
          jenis: Database["public"]["Enums"]["jenis_aktivitas"]
          kode_rek: string
          subjenis: Database["public"]["Enums"]["subjenis_aktivitas"]
        }
        Insert: {
          created_at?: string | null
          jenis?: Database["public"]["Enums"]["jenis_aktivitas"]
          kode_rek: string
          subjenis?: Database["public"]["Enums"]["subjenis_aktivitas"]
        }
        Update: {
          created_at?: string | null
          jenis?: Database["public"]["Enums"]["jenis_aktivitas"]
          kode_rek?: string
          subjenis?: Database["public"]["Enums"]["subjenis_aktivitas"]
        }
        Relationships: [
          {
            foreignKeyName: "aktivitas_aruskas_kode_rek_fkey"
            columns: ["kode_rek"]
            isOneToOne: true
            referencedRelation: "m_rekening"
            referencedColumns: ["kode_rek"]
          },
        ]
      }
      anggaran: {
        Row: {
          at_create: string | null
          kode_rek: string
          last_update: string | null
          tahun: number
          tanda: Database["public"]["Enums"]["validasi_enum"]
          total: number
          usernya: string | null
          validasi_realisasi:
            | Database["public"]["Enums"]["validasi_enum"]
            | null
        }
        Insert: {
          at_create?: string | null
          kode_rek: string
          last_update?: string | null
          tahun: number
          tanda?: Database["public"]["Enums"]["validasi_enum"]
          total?: number
          usernya?: string | null
          validasi_realisasi?:
            | Database["public"]["Enums"]["validasi_enum"]
            | null
        }
        Update: {
          at_create?: string | null
          kode_rek?: string
          last_update?: string | null
          tahun?: number
          tanda?: Database["public"]["Enums"]["validasi_enum"]
          total?: number
          usernya?: string | null
          validasi_realisasi?:
            | Database["public"]["Enums"]["validasi_enum"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "anggaran_kode_rek_fkey"
            columns: ["kode_rek"]
            isOneToOne: false
            referencedRelation: "m_rekening"
            referencedColumns: ["kode_rek"]
          },
        ]
      }
      divisi: {
        Row: {
          created_at: string | null
          id_div: string
          nama_div: string
        }
        Insert: {
          created_at?: string | null
          id_div: string
          nama_div: string
        }
        Update: {
          created_at?: string | null
          id_div?: string
          nama_div?: string
        }
        Relationships: []
      }
      hak_akses: {
        Row: {
          id_mod: number
          no_: number | null
          no_id: number
        }
        Insert: {
          id_mod?: number
          no_?: number | null
          no_id?: number
        }
        Update: {
          id_mod?: number
          no_?: number | null
          no_id?: number
        }
        Relationships: []
      }
      jurnal: {
        Row: {
          at_create: string | null
          debit: number | null
          deskripsi: string | null
          kode: string
          kode_rek: string
          kredit: number | null
          tanda_lo: Database["public"]["Enums"]["validasi_enum"] | null
          tanggal: string | null
          usernya: string | null
        }
        Insert: {
          at_create?: string | null
          debit?: number | null
          deskripsi?: string | null
          kode: string
          kode_rek: string
          kredit?: number | null
          tanda_lo?: Database["public"]["Enums"]["validasi_enum"] | null
          tanggal?: string | null
          usernya?: string | null
        }
        Update: {
          at_create?: string | null
          debit?: number | null
          deskripsi?: string | null
          kode?: string
          kode_rek?: string
          kredit?: number | null
          tanda_lo?: Database["public"]["Enums"]["validasi_enum"] | null
          tanggal?: string | null
          usernya?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jurnal_kode_fkey"
            columns: ["kode"]
            isOneToOne: false
            referencedRelation: "jurnalumum"
            referencedColumns: ["id_ju"]
          },
          {
            foreignKeyName: "jurnal_kode_rek_fkey"
            columns: ["kode_rek"]
            isOneToOne: false
            referencedRelation: "m_rekening"
            referencedColumns: ["kode_rek"]
          },
        ]
      }
      jurnal_jenis: {
        Row: {
          created_at: string | null
          id_jj: string
          is_default: Database["public"]["Enums"]["validasi_enum"] | null
          nm_jj: string
        }
        Insert: {
          created_at?: string | null
          id_jj: string
          is_default?: Database["public"]["Enums"]["validasi_enum"] | null
          nm_jj: string
        }
        Update: {
          created_at?: string | null
          id_jj?: string
          is_default?: Database["public"]["Enums"]["validasi_enum"] | null
          nm_jj?: string
        }
        Relationships: []
      }
      jurnalumum: {
        Row: {
          at_create: string | null
          id_div: string
          id_jj: string
          id_ju: string
          is_mutasi: Database["public"]["Enums"]["validasi_enum"] | null
          last_update: string | null
          mark_cetak: number | null
          tanggal: string | null
          usernya: string | null
        }
        Insert: {
          at_create?: string | null
          id_div?: string
          id_jj?: string
          id_ju: string
          is_mutasi?: Database["public"]["Enums"]["validasi_enum"] | null
          last_update?: string | null
          mark_cetak?: number | null
          tanggal?: string | null
          usernya?: string | null
        }
        Update: {
          at_create?: string | null
          id_div?: string
          id_jj?: string
          id_ju?: string
          is_mutasi?: Database["public"]["Enums"]["validasi_enum"] | null
          last_update?: string | null
          mark_cetak?: number | null
          tanggal?: string | null
          usernya?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jurnalumum_id_div_fkey"
            columns: ["id_div"]
            isOneToOne: false
            referencedRelation: "divisi"
            referencedColumns: ["id_div"]
          },
          {
            foreignKeyName: "jurnalumum_id_jj_fkey"
            columns: ["id_jj"]
            isOneToOne: false
            referencedRelation: "jurnal_jenis"
            referencedColumns: ["id_jj"]
          },
        ]
      }
      jurnalumum_kasbank: {
        Row: {
          keterangan: string | null
          kode: string
          rek_dari: string
          rek_tujuan: string
        }
        Insert: {
          keterangan?: string | null
          kode: string
          rek_dari: string
          rek_tujuan: string
        }
        Update: {
          keterangan?: string | null
          kode?: string
          rek_dari?: string
          rek_tujuan?: string
        }
        Relationships: [
          {
            foreignKeyName: "jurnalumum_kasbank_kode_fkey"
            columns: ["kode"]
            isOneToOne: true
            referencedRelation: "jurnalumum"
            referencedColumns: ["id_ju"]
          },
          {
            foreignKeyName: "jurnalumum_kasbank_rek_dari_fkey"
            columns: ["rek_dari"]
            isOneToOne: false
            referencedRelation: "m_rekening"
            referencedColumns: ["kode_rek"]
          },
          {
            foreignKeyName: "jurnalumum_kasbank_rek_tujuan_fkey"
            columns: ["rek_tujuan"]
            isOneToOne: false
            referencedRelation: "m_rekening"
            referencedColumns: ["kode_rek"]
          },
        ]
      }
      kaskeluar: {
        Row: {
          at_create: string | null
          bagian_seksi: string | null
          id_div: string
          id_kk: string
          keterangan: string | null
          kode_rek: string | null
          last_update: string | null
          mark_cetak: number | null
          no_cek: string | null
          penerima: string | null
          tanggal: string | null
          total: number | null
          usernya: string | null
        }
        Insert: {
          at_create?: string | null
          bagian_seksi?: string | null
          id_div?: string
          id_kk: string
          keterangan?: string | null
          kode_rek?: string | null
          last_update?: string | null
          mark_cetak?: number | null
          no_cek?: string | null
          penerima?: string | null
          tanggal?: string | null
          total?: number | null
          usernya?: string | null
        }
        Update: {
          at_create?: string | null
          bagian_seksi?: string | null
          id_div?: string
          id_kk?: string
          keterangan?: string | null
          kode_rek?: string | null
          last_update?: string | null
          mark_cetak?: number | null
          no_cek?: string | null
          penerima?: string | null
          tanggal?: string | null
          total?: number | null
          usernya?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kaskeluar_id_div_fkey"
            columns: ["id_div"]
            isOneToOne: false
            referencedRelation: "divisi"
            referencedColumns: ["id_div"]
          },
          {
            foreignKeyName: "kaskeluar_kode_rek_fkey"
            columns: ["kode_rek"]
            isOneToOne: false
            referencedRelation: "m_rekening"
            referencedColumns: ["kode_rek"]
          },
        ]
      }
      kaskeluar_jurnal: {
        Row: {
          at_create: string | null
          debit: number | null
          deskripsi: string | null
          kode: string
          kode_rek: string
          kredit: number | null
          rek_lra: string | null
          tanggal: string | null
          usernya: string | null
        }
        Insert: {
          at_create?: string | null
          debit?: number | null
          deskripsi?: string | null
          kode: string
          kode_rek: string
          kredit?: number | null
          rek_lra?: string | null
          tanggal?: string | null
          usernya?: string | null
        }
        Update: {
          at_create?: string | null
          debit?: number | null
          deskripsi?: string | null
          kode?: string
          kode_rek?: string
          kredit?: number | null
          rek_lra?: string | null
          tanggal?: string | null
          usernya?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kaskeluar_jurnal_kode_fkey"
            columns: ["kode"]
            isOneToOne: false
            referencedRelation: "kaskeluar"
            referencedColumns: ["id_kk"]
          },
          {
            foreignKeyName: "kaskeluar_jurnal_kode_rek_fkey"
            columns: ["kode_rek"]
            isOneToOne: false
            referencedRelation: "m_rekening"
            referencedColumns: ["kode_rek"]
          },
        ]
      }
      kasmasuk: {
        Row: {
          at_create: string | null
          id_div: string | null
          id_km: string
          keterangan: string | null
          kode_rek: string
          last_update: string | null
          mark_cetak: number | null
          no_cek: string | null
          pembayar: string | null
          tanggal: string | null
          total: number | null
          usernya: string | null
        }
        Insert: {
          at_create?: string | null
          id_div?: string | null
          id_km: string
          keterangan?: string | null
          kode_rek: string
          last_update?: string | null
          mark_cetak?: number | null
          no_cek?: string | null
          pembayar?: string | null
          tanggal?: string | null
          total?: number | null
          usernya?: string | null
        }
        Update: {
          at_create?: string | null
          id_div?: string | null
          id_km?: string
          keterangan?: string | null
          kode_rek?: string
          last_update?: string | null
          mark_cetak?: number | null
          no_cek?: string | null
          pembayar?: string | null
          tanggal?: string | null
          total?: number | null
          usernya?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kasmasuk_id_div_fkey"
            columns: ["id_div"]
            isOneToOne: false
            referencedRelation: "divisi"
            referencedColumns: ["id_div"]
          },
          {
            foreignKeyName: "kasmasuk_kode_rek_fkey"
            columns: ["kode_rek"]
            isOneToOne: false
            referencedRelation: "m_rekening"
            referencedColumns: ["kode_rek"]
          },
        ]
      }
      kasmasuk_jurnal: {
        Row: {
          at_create: string | null
          debit: number | null
          deskripsi: string | null
          kode: string
          kode_rek: string
          kredit: number | null
          rek_lra: string | null
          tanggal: string | null
          usernya: string | null
        }
        Insert: {
          at_create?: string | null
          debit?: number | null
          deskripsi?: string | null
          kode: string
          kode_rek: string
          kredit?: number | null
          rek_lra?: string | null
          tanggal?: string | null
          usernya?: string | null
        }
        Update: {
          at_create?: string | null
          debit?: number | null
          deskripsi?: string | null
          kode?: string
          kode_rek?: string
          kredit?: number | null
          rek_lra?: string | null
          tanggal?: string | null
          usernya?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kasmasuk_jurnal_kode_fkey"
            columns: ["kode"]
            isOneToOne: false
            referencedRelation: "kasmasuk"
            referencedColumns: ["id_km"]
          },
          {
            foreignKeyName: "kasmasuk_jurnal_kode_rek_fkey"
            columns: ["kode_rek"]
            isOneToOne: false
            referencedRelation: "m_rekening"
            referencedColumns: ["kode_rek"]
          },
        ]
      }
      lra: {
        Row: {
          at_create: string | null
          debit: number | null
          deskripsi: string | null
          kode: string
          kode_rek: string
          kredit: number | null
          rek_kas: string
          tanggal: string | null
          usernya: string | null
        }
        Insert: {
          at_create?: string | null
          debit?: number | null
          deskripsi?: string | null
          kode: string
          kode_rek: string
          kredit?: number | null
          rek_kas?: string
          tanggal?: string | null
          usernya?: string | null
        }
        Update: {
          at_create?: string | null
          debit?: number | null
          deskripsi?: string | null
          kode?: string
          kode_rek?: string
          kredit?: number | null
          rek_kas?: string
          tanggal?: string | null
          usernya?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lra_kode_rek_fkey"
            columns: ["kode_rek"]
            isOneToOne: false
            referencedRelation: "m_rekening"
            referencedColumns: ["kode_rek"]
          },
        ]
      }
      m_rekening: {
        Row: {
          created_at: string | null
          id_div: string
          jenis_rek: Database["public"]["Enums"]["jenis_rekening"] | null
          k_level: Database["public"]["Enums"]["level_rekening"] | null
          kode_rek: string
          level: number | null
          nama_rek: string | null
          rek_induk: string | null
          saldo: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id_div?: string
          jenis_rek?: Database["public"]["Enums"]["jenis_rekening"] | null
          k_level?: Database["public"]["Enums"]["level_rekening"] | null
          kode_rek: string
          level?: number | null
          nama_rek?: string | null
          rek_induk?: string | null
          saldo?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id_div?: string
          jenis_rek?: Database["public"]["Enums"]["jenis_rekening"] | null
          k_level?: Database["public"]["Enums"]["level_rekening"] | null
          kode_rek?: string
          level?: number | null
          nama_rek?: string | null
          rek_induk?: string | null
          saldo?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "m_rekening_id_div_fkey"
            columns: ["id_div"]
            isOneToOne: false
            referencedRelation: "divisi"
            referencedColumns: ["id_div"]
          },
          {
            foreignKeyName: "m_rekening_rek_induk_fkey"
            columns: ["rek_induk"]
            isOneToOne: false
            referencedRelation: "m_rekening"
            referencedColumns: ["kode_rek"]
          },
        ]
      }
      modul_jenis: {
        Row: {
          dok_sumber: Database["public"]["Enums"]["validasi_enum"] | null
          id_mod: number
          nm_mod: string | null
          tb_join: string | null
          tb_jurnal: string | null
          tb_where: string | null
        }
        Insert: {
          dok_sumber?: Database["public"]["Enums"]["validasi_enum"] | null
          id_mod: number
          nm_mod?: string | null
          tb_join?: string | null
          tb_jurnal?: string | null
          tb_where?: string | null
        }
        Update: {
          dok_sumber?: Database["public"]["Enums"]["validasi_enum"] | null
          id_mod?: number
          nm_mod?: string | null
          tb_join?: string | null
          tb_jurnal?: string | null
          tb_where?: string | null
        }
        Relationships: []
      }
      modul_lain: {
        Row: {
          id_mod: number
          nm_mod: string | null
          no_: number | null
          urutnya: number | null
        }
        Insert: {
          id_mod?: number
          nm_mod?: string | null
          no_?: number | null
          urutnya?: number | null
        }
        Update: {
          id_mod?: number
          nm_mod?: string | null
          no_?: number | null
          urutnya?: number | null
        }
        Relationships: []
      }
      modul_laporan: {
        Row: {
          id_mod: number
          nm_mod: string | null
          no_: number | null
          urutnya: number | null
        }
        Insert: {
          id_mod?: number
          nm_mod?: string | null
          no_?: number | null
          urutnya?: number | null
        }
        Update: {
          id_mod?: number
          nm_mod?: string | null
          no_?: number | null
          urutnya?: number | null
        }
        Relationships: []
      }
      modul_master: {
        Row: {
          id_mod: number
          nm_mod: string | null
          no_: number | null
          urutnya: number | null
        }
        Insert: {
          id_mod?: number
          nm_mod?: string | null
          no_?: number | null
          urutnya?: number | null
        }
        Update: {
          id_mod?: number
          nm_mod?: string | null
          no_?: number | null
          urutnya?: number | null
        }
        Relationships: []
      }
      modul_pembelian: {
        Row: {
          id_mod: number
          nm_mod: string | null
          no_: number | null
          urutnya: number | null
        }
        Insert: {
          id_mod?: number
          nm_mod?: string | null
          no_?: number | null
          urutnya?: number | null
        }
        Update: {
          id_mod?: number
          nm_mod?: string | null
          no_?: number | null
          urutnya?: number | null
        }
        Relationships: []
      }
      pages: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          page_name: string
          page_path: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          page_name: string
          page_path: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          page_name?: string
          page_path?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_page_permissions: {
        Row: {
          can_create: boolean | null
          can_delete: boolean | null
          can_edit: boolean | null
          can_export: boolean | null
          can_view: boolean | null
          description: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          page_name: string
          page_path: string
          user_id: string
        }
        Insert: {
          can_create?: boolean | null
          can_delete?: boolean | null
          can_edit?: boolean | null
          can_export?: boolean | null
          can_view?: boolean | null
          description?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          page_name: string
          page_path: string
          user_id: string
        }
        Update: {
          can_create?: boolean | null
          can_delete?: boolean | null
          can_edit?: boolean | null
          can_export?: boolean | null
          can_view?: boolean | null
          description?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          page_name?: string
          page_path?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_page_permissions: {
        Args: { _user_id: string }
        Returns: {
          page_path: string
          page_name: string
          can_view: boolean
          can_create: boolean
          can_edit: boolean
          can_delete: boolean
          can_export: boolean
          description: string
        }[]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      grant_default_permissions: {
        Args: { _user_id: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      user_has_page_permission: {
        Args: {
          _user_id: string
          _page_path: string
          _permission_type?: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "superadmin" | "admin" | "pengguna"
      jenis_aktivitas: "OPERASI" | "INVESTASI" | "PENDANAAN" | "KAS"
      jenis_rekening: "NERACA" | "LRA" | "LO"
      level_rekening:
        | "Induk"
        | "Detail Kas"
        | "Detail Bk"
        | "Detail"
        | "Sendiri"
      subjenis_aktivitas: "PENYESUAIAN" | "PERUBAHAN" | "LAIN"
      validasi_enum: "Y" | "N"
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
    Enums: {
      app_role: ["superadmin", "admin", "pengguna"],
      jenis_aktivitas: ["OPERASI", "INVESTASI", "PENDANAAN", "KAS"],
      jenis_rekening: ["NERACA", "LRA", "LO"],
      level_rekening: ["Induk", "Detail Kas", "Detail Bk", "Detail", "Sendiri"],
      subjenis_aktivitas: ["PENYESUAIAN", "PERUBAHAN", "LAIN"],
      validasi_enum: ["Y", "N"],
    },
  },
} as const
