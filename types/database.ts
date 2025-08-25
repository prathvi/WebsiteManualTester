export interface Website {
  id: string
  name: string
  base_url: string
  sitemap_url?: string | null
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface Page {
  id: string
  website_id: string
  url: string
  title?: string | null
  parent_id?: string | null
  order_index: number
  created_at: string
  updated_at: string
}

export interface TestResult {
  id: string
  page_id: string
  test_type: string
  status: 'ok' | 'not-ok' | 'pending'
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface Issue {
  id: string
  page_id: string
  title: string
  description?: string | null
  priority?: 'low' | 'medium' | 'high' | null
  status?: 'open' | 'resolved' | 'closed' | null
  created_at: string
  updated_at: string
}