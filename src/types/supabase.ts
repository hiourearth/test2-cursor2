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
      movies: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ratings: {
        Row: {
          created_at: string | null
          id: string
          movie_id: string
          rating: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          movie_id: string
          rating: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          movie_id?: string
          rating?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movie_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          auth_user_id: string
          created_at: string | null
          id: string
          role: string
        }
        Insert: {
          auth_user_id: string
          created_at?: string | null
          id?: string
          role?: string
        }
        Update: {
          auth_user_id?: string
          created_at?: string | null
          id?: string
          role?: string
        }
        Relationships: []
      }
    }
    Views: {
      movie_stats: {
        Row: {
          average_rating: number | null
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          id: string | null
          rating_count: number | null
          title: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      rating_with_user: {
        Row: {
          created_at: string | null
          id: string | null
          movie_id: string | null
          rating: number | null
          updated_at: string | null
          user_email: string | null
          user_id: string | null
          user_role: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ratings_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movie_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profile: {
        Row: {
          auth_user_id: string | null
          created_at: string | null
          email: string | null
          id: string | null
          role: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
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

export type Movie = Database['public']['Tables']['movies']['Row']
export type MovieWithStats = Database['public']['Views']['movie_stats']['Row']
export type Rating = Database['public']['Tables']['ratings']['Row']
export type RatingInsert = Database['public']['Tables']['ratings']['Insert']
export type RatingUpdate = Database['public']['Tables']['ratings']['Update']
export type RatingWithUser = Database['public']['Views']['rating_with_user']['Row']
export type User = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']
export type UserProfile = Database['public']['Views']['user_profile']['Row'] 