'use client'

import { useState } from 'react'
import { Page } from '@/types'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PageTestStatus {
  pageId: string
  loading: 'ok' | 'not-ok' | 'pending'
  images: 'ok' | 'not-ok' | 'pending'
  colors: 'ok' | 'not-ok' | 'pending'
  fonts: 'ok' | 'not-ok' | 'pending'
  layout: 'ok' | 'not-ok' | 'pending'
  navigation: 'ok' | 'not-ok' | 'pending'
  forms: 'ok' | 'not-ok' | 'pending'
  buttons: 'ok' | 'not-ok' | 'pending'
  overall: 'ok' | 'not-ok' | 'pending'
}

interface PageGridProps {
  pages: Page[]
  selectedPage: Page | null
  onPageSelect: (page: Page) => void
  issuesPerPage?: Record<string, number>
  pageStatuses?: Record<string, PageTestStatus>
}

export default function PageGrid({ pages, selectedPage, onPageSelect, issuesPerPage = {}, pageStatuses = {} }: PageGridProps) {
  const [selectedCell, setSelectedCell] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  const totalPages = Math.ceil(pages.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentPages = pages.slice(startIndex, startIndex + itemsPerPage)

  const columns = [
    { key: 'order', header: '#', width: 'w-12' },
    { key: 'title', header: 'Page Title', width: 'w-48' },
    { key: 'url', header: 'URL', width: 'w-64' },
    { key: 'loading', header: 'Loading', width: 'w-20' },
    { key: 'images', header: 'Images', width: 'w-20' },
    { key: 'colors', header: 'Colors', width: 'w-20' },
    { key: 'fonts', header: 'Fonts', width: 'w-20' },
    { key: 'layout', header: 'Layout', width: 'w-20' },
    { key: 'navigation', header: 'Navigation', width: 'w-24' },
    { key: 'status', header: 'Overall', width: 'w-24' },
    { key: 'issues', header: 'Issues', width: 'w-20' }
  ]

  const handleCellClick = (pageId: string, columnKey: string) => {
    setSelectedCell(`${pageId}-${columnKey}`)
    const page = pages.find(p => p.id === pageId)
    if (page) {
      onPageSelect(page)
    }
  }

  const getCellValue = (page: Page, columnKey: string) => {
    const pageStatus = pageStatuses[page.id]
    
    switch (columnKey) {
      case 'order':
        return page.order + 1
      case 'title':
        return page.title
      case 'url':
        return page.url
      case 'loading':
        return getStatusIcon(pageStatus?.loading || 'pending')
      case 'images':
        return getStatusIcon(pageStatus?.images || 'pending')
      case 'colors':
        return getStatusIcon(pageStatus?.colors || 'pending')
      case 'fonts':
        return getStatusIcon(pageStatus?.fonts || 'pending')
      case 'layout':
        return getStatusIcon(pageStatus?.layout || 'pending')
      case 'navigation':
        return getStatusIcon(pageStatus?.navigation || 'pending')
      case 'status':
        return getOverallStatus(pageStatus?.overall || 'pending')
      case 'issues':
        return issuesPerPage[page.id] || 0
      default:
        return ''
    }
  }
  
  const getStatusIcon = (status: 'ok' | 'not-ok' | 'pending') => {
    switch (status) {
      case 'ok':
        return '✓'
      case 'not-ok':
        return '✗'
      case 'pending':
      default:
        return '-'
    }
  }
  
  const getOverallStatus = (status: 'ok' | 'not-ok' | 'pending') => {
    switch (status) {
      case 'ok':
        return 'OK'
      case 'not-ok':
        return 'NOT OK'
      case 'pending':
      default:
        return 'Pending'
    }
  }
  
  const getCellStatusClass = (pageId: string, columnKey: string) => {
    const status = pageStatuses[pageId]
    if (!status) return ''
    
    const testColumns = ['loading', 'images', 'colors', 'fonts', 'layout', 'navigation']
    
    if (testColumns.includes(columnKey)) {
      const value = status[columnKey as keyof PageTestStatus]
      if (value === 'ok') return 'text-green-600'
      if (value === 'not-ok') return 'text-red-600'
    }
    
    if (columnKey === 'status') {
      if (status.overall === 'ok') return 'text-green-600 font-semibold'
      if (status.overall === 'not-ok') return 'text-red-600 font-semibold'
    }
    
    return ''
  }

  return (
    <div className="excel-grid">
      {/* Header Row */}
      <div className="excel-row">
        {columns.map((column) => (
          <div
            key={column.key}
            className={`excel-cell excel-header ${column.width}`}
          >
            {column.header}
          </div>
        ))}
      </div>

      {/* Data Rows */}
      {currentPages.map((page) => (
        <div
          key={page.id}
          className={`excel-row ${
            selectedPage?.id === page.id ? 'bg-accent/50' : ''
          }`}
        >
          {columns.map((column) => (
            <div
              key={`${page.id}-${column.key}`}
              className={`excel-cell ${column.width} ${
                selectedCell === `${page.id}-${column.key}` ? 'excel-selected' : ''
              } cursor-pointer hover:bg-accent/30 ${
                getCellStatusClass(page.id, column.key)
              }`}
              onClick={() => handleCellClick(page.id, column.key)}
            >
              {getCellValue(page, column.key)}
            </div>
          ))}
        </div>
      ))}

      {/* Empty state */}
      {pages.length === 0 && (
        <div className="excel-row">
          <div className="excel-cell w-full text-center text-muted-foreground py-8">
            No pages loaded. Import a sitemap to get started.
          </div>
        </div>
      )}

      {/* Pagination */}
      {pages.length > itemsPerPage && (
        <div className="excel-row bg-muted">
          <div className="excel-cell w-full flex items-center justify-between p-2">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, pages.length)} of {pages.length} pages
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}