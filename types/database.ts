/**
 * Database type definitions matching the schema in ARCHITECTURE.md and Supabase CLI output format.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ─── Enums ────────────────────────────────────────────────────────────────────

export type UserRole = 'user' | 'super_admin'

export type ActiveMode = 'social' | 'lost_and_found' | 'event_hub'

export type ThemeFont = 'sans' | 'serif' | 'mono'
export type ThemeColor = 'orange' | 'black' | 'emerald' | 'blue'

// ─── Metadata shapes (stored in tags.metadata JSONB) ─────────────────────────

export interface SocialMetadata {
  name: string
  bio?: string | null
  wa?: string | null
  ig?: string | null
  linkedin?: string | null
  theme_font?: ThemeFont
  theme_color?: ThemeColor
}

export interface LostAndFoundMetadata {
  owner_name: string
  item_name: string
  wa_number: string
}

export interface EventHubMetadata {
  title: string
  description: string
  link_1?: string | null
  link_2?: string | null
  link_3?: string | null
}

export type TagMetadata = Record<string, any>

// ─── Table row types ──────────────────────────────────────────────────────────

export interface UserRow {
  id: string
  email: string
  role: UserRole
  created_at: string
}

export interface TagRow {
  tag_id: string
  owner_id: string | null
  active_mode: ActiveMode
  metadata: TagMetadata
  updated_at: string
}

// ─── Supabase Database generic type ──────────────────────────────────────────

export type Database = {
  public: {
    Tables: {
      tags: {
        Row: TagRow
        Insert: {
          active_mode?: ActiveMode
          metadata?: Json
          owner_id?: string | null
          tag_id: string
          updated_at?: string
        }
        Update: {
          active_mode?: ActiveMode
          metadata?: Json
          owner_id?: string | null
          tag_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: UserRow
        Insert: {
          created_at?: string
          email: string
          id: string
          role?: UserRole
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          role?: UserRole
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
      active_mode: ActiveMode
      user_role: UserRole
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
