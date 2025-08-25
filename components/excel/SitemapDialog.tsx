'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'
import { Page } from '@/types'

interface SitemapDialogProps {
  onSitemapLoaded: (pages: Page[], baseUrl: string) => void
  children: React.ReactNode
}

// Helper function to generate default pages
function generateDefaultPages(baseUrl: string): Page[] {
  const commonPages = [
    { path: '', title: 'Home' },
    { path: 'about', title: 'About' },
    { path: 'services', title: 'Services' },
    { path: 'products', title: 'Products' },
    { path: 'contact', title: 'Contact' },
    { path: 'blog', title: 'Blog' },
    { path: 'faq', title: 'FAQ' },
    { path: 'terms', title: 'Terms' },
    { path: 'privacy', title: 'Privacy' },
    { path: 'support', title: 'Support' }
  ]
  
  return commonPages.map((page, index) => ({
    id: (index + 1).toString(),
    url: page.path ? `${baseUrl}/${page.path}` : baseUrl,
    title: page.title,
    order: index,
    createdAt: new Date()
  }))
}

export default function SitemapDialog({ onSitemapLoaded, children }: SitemapDialogProps) {
  const [open, setOpen] = useState(false)
  const [sitemapUrl, setSitemapUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sitemapUrl) return

    setIsLoading(true)
    setError('')

    try {
      const baseUrl = new URL(sitemapUrl).origin
      const url = new URL(sitemapUrl)
      
      // Check if it's a sitemap URL
      const isSitemap = url.pathname.includes('sitemap') || url.pathname.endsWith('.xml')
      
      let pages: Page[] = []
      
      if (isSitemap) {
        // Fetch and parse sitemap
        try {
          const response = await fetch(`/api/sitemap?url=${encodeURIComponent(sitemapUrl)}`)
          if (!response.ok) throw new Error('Failed to fetch sitemap')
          
          const data = await response.json()
          pages = data.pages.map((page: any, index: number) => ({
            id: (index + 1).toString(),
            url: page.url,
            title: page.title || new URL(page.url).pathname.slice(1) || 'Home',
            order: index,
            createdAt: new Date()
          }))
        } catch (fetchError) {
          console.error('Sitemap fetch error:', fetchError)
          // Fall back to manual page entry
          pages = generateDefaultPages(baseUrl)
        }
      } else {
        // Generate default pages for the website
        pages = generateDefaultPages(baseUrl)
      }

      if (pages.length === 0) {
        setError('No pages found. Please check the URL or add pages manually.')
        return
      }

      onSitemapLoaded(pages, baseUrl)
      setOpen(false)
    } catch (err) {
      setError('Invalid URL format. Please enter a valid URL.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Sitemap</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Sitemap URL or Website URL
            </label>
            <input
              type="url"
              value={sitemapUrl}
              onChange={(e) => setSitemapUrl(e.target.value)}
              placeholder="https://example.com/sitemap.xml"
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
            <p className="text-sm text-muted-foreground mt-2">
              Enter a website URL or sitemap URL to load pages for testing.
            </p>
          </div>
          
          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}
          
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Import'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}