'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Website, Page as DbPage } from '@/types/database'

interface WebsiteContextType {
  currentWebsite: Website | null
  setCurrentWebsite: (website: Website | null) => void
  pages: DbPage[]
  setPages: (pages: DbPage[]) => void
  refreshPages: () => Promise<void>
  loading: boolean
}

const WebsiteContext = createContext<WebsiteContextType | undefined>(undefined)

export function WebsiteProvider({ children }: { children: ReactNode }) {
  const [currentWebsite, setCurrentWebsite] = useState<Website | null>(null)
  const [pages, setPages] = useState<DbPage[]>([])
  const [loading, setLoading] = useState(false)
  
  const supabase = createClient()

  const refreshPages = async () => {
    if (!currentWebsite) {
      setPages([])
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('website_id', currentWebsite.id)
        .order('order_index', { ascending: true })

      if (error) throw error
      setPages(data || [])
    } catch (error) {
      console.error('Failed to fetch pages:', error)
      setPages([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshPages()
  }, [currentWebsite?.id])

  return (
    <WebsiteContext.Provider 
      value={{ 
        currentWebsite, 
        setCurrentWebsite, 
        pages, 
        setPages,
        refreshPages,
        loading 
      }}
    >
      {children}
    </WebsiteContext.Provider>
  )
}

export function useWebsite() {
  const context = useContext(WebsiteContext)
  if (context === undefined) {
    throw new Error('useWebsite must be used within a WebsiteProvider')
  }
  return context
}