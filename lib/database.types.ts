export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          name: string
          sitemap_url: string | null
          base_url: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          sitemap_url?: string | null
          base_url: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          sitemap_url?: string | null
          base_url?: string
          created_at?: string
          updated_at?: string
        }
      }
      pages: {
        Row: {
          id: string
          project_id: string
          url: string
          title: string
          parent_id: string | null
          order: number
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          url: string
          title: string
          parent_id?: string | null
          order: number
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          url?: string
          title?: string
          parent_id?: string | null
          order?: number
          created_at?: string
        }
      }
      test_items: {
        Row: {
          id: string
          type: 'visual' | 'functional'
          title: string
          description: string
          category: string
          created_at: string
        }
        Insert: {
          id?: string
          type: 'visual' | 'functional'
          title: string
          description: string
          category: string
          created_at?: string
        }
        Update: {
          id?: string
          type?: 'visual' | 'functional'
          title?: string
          description?: string
          category?: string
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          page_id: string
          test_item_id: string
          status: 'ok' | 'not-ok' | 'pending'
          comments: string | null
          priority: 'high' | 'medium' | 'low' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          page_id: string
          test_item_id: string
          status: 'ok' | 'not-ok' | 'pending'
          comments?: string | null
          priority?: 'high' | 'medium' | 'low' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          page_id?: string
          test_item_id?: string
          status?: 'ok' | 'not-ok' | 'pending'
          comments?: string | null
          priority?: 'high' | 'medium' | 'low' | null
          created_at?: string
          updated_at?: string
        }
      }
      issues: {
        Row: {
          id: string
          review_id: string
          section: string
          title: string
          description: string
          suggested_fix: string | null
          priority: 'high' | 'medium' | 'low'
          category: 'visual' | 'functional'
          created_at: string
        }
        Insert: {
          id?: string
          review_id: string
          section: string
          title: string
          description: string
          suggested_fix?: string | null
          priority: 'high' | 'medium' | 'low'
          category: 'visual' | 'functional'
          created_at?: string
        }
        Update: {
          id?: string
          review_id?: string
          section?: string
          title?: string
          description?: string
          suggested_fix?: string | null
          priority?: 'high' | 'medium' | 'low'
          category?: 'visual' | 'functional'
          created_at?: string
        }
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
  }
}