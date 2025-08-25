'use client'

import { useState } from 'react'
import { Page } from '@/types'

interface SitemapInputProps {
  onSitemapLoaded: (pages: Page[], baseUrl: string) => void
}

export default function SitemapInput({ onSitemapLoaded }: SitemapInputProps) {
  const [sitemapUrl, setSitemapUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sitemapUrl) return

    setIsLoading(true)
    setError('')

    try {
      // For now, we'll simulate sitemap parsing with manual page creation
      // In a real implementation, you'd fetch and parse the sitemap XML
      const baseUrl = new URL(sitemapUrl).origin
      
      // Simulate pages from sitemap
      const simulatedPages: Page[] = [
        {
          id: '1',
          url: `${baseUrl}/`,
          title: 'Home Page',
          order: 0,
          createdAt: new Date()
        },
        {
          id: '2',
          url: `${baseUrl}/about`,
          title: 'About Us',
          order: 1,
          createdAt: new Date()
        },
        {
          id: '3',
          url: `${baseUrl}/services`,
          title: 'Services',
          order: 2,
          createdAt: new Date()
        },
        {
          id: '4',
          url: `${baseUrl}/contact`,
          title: 'Contact',
          order: 3,
          createdAt: new Date()
        }
      ]

      onSitemapLoaded(simulatedPages, baseUrl)
    } catch (err) {
      setError('Invalid URL format. Please enter a valid URL.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-4">
        <input
          type="url"
          value={sitemapUrl}
          onChange={(e) => setSitemapUrl(e.target.value)}
          placeholder="Enter sitemap URL or website URL"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Loading...' : 'Load Sitemap'}
        </button>
      </form>
      
      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}
      
      <div className="text-sm text-gray-600">
        <p>Enter a website URL or sitemap URL to load pages for testing.</p>
        <p>Example: https://example.com/sitemap.xml or https://example.com</p>
      </div>
    </div>
  )
}